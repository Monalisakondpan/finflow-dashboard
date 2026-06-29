const express = require('express')
const router  = express.Router()
const Groq    = require('groq-sdk')

const { guardrailsMiddleware } = require('../mcp/guardrails')

const Transaction = require('../models/Transaction')
const Budget      = require('../models/Budget')
const Goal        = require('../models/Goal')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── MCP-style tool definitions (Groq tool calling) ────
const FINFLOW_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_expenses',
      description: 'Get user expenses broken down by category for a given month',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Month in YYYY-MM format. Defaults to current month.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_budget_status',
      description: 'Get all budget categories with spent vs limit and over-budget flags',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Month in YYYY-MM format.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_financial_health',
      description: 'Get overall financial health score, savings rate, income, expenses, and goals progress',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Month in YYYY-MM format.' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_income_vs_expenses_trend',
      description: 'Get income vs expenses trend over last N months',
      parameters: {
        type: 'object',
        properties: {
          months: { type: 'number', description: 'Number of months to look back (default 6).' },
        },
        required: [],
      },
    },
  },
]

// ── Tool execution ─────────────────────────────────────
async function executeTool (toolName, args, userId) {
  const month = args.month || new Date().toISOString().substring(0, 7)

  switch (toolName) {
    case 'get_expenses': {
      const txns     = await Transaction.find({ userId, month }).lean()
      const expenses = txns.filter(t => t.amount < 0)
      const byCategory = {}
      expenses.forEach(t => {
        byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount)
      })
      return {
        month,
        totalExpenses: expenses.reduce((s, t) => s + Math.abs(t.amount), 0),
        byCategory,
        recentTransactions: expenses.slice(-5).map(t => ({
          name: t.name, amount: Math.abs(t.amount), category: t.category, date: t.date,
        })),
      }
    }

    case 'get_budget_status': {
      const budgets = await Budget.find({ userId, month }).lean()
      return budgets.map(b => ({
        name: b.name, spent: b.spent, limit: b.limit,
        remaining: b.limit - b.spent,
        overBudget: b.spent > b.limit,
        usagePercent: Math.round((b.spent / b.limit) * 100),
      }))
    }

    case 'get_financial_health': {
      const txns    = await Transaction.find({ userId, month }).lean()
      const budgets = await Budget.find({ userId, month }).lean()
      const goals   = await Goal.find({ userId }).lean()
      const allTxns = await Transaction.find({ userId }).lean()

      const income   = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
      const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
      const savings  = income - expenses
      const savingsRate    = income > 0 ? parseFloat(((savings / income) * 100).toFixed(1)) : 0
      const totalBalance   = allTxns.reduce((s, t) => s + t.amount, 0)
      const overBudget     = budgets.filter(b => b.spent > b.limit)

      let healthScore = 50
      if (savingsRate >= 20) healthScore += 10
      if (savingsRate >= 35) healthScore += 10
      if (savingsRate >= 50) healthScore += 5
      if (totalBalance > 100000) healthScore += 10
      if (totalBalance > 250000) healthScore += 5
      healthScore -= overBudget.length * 5
      healthScore = Math.max(0, Math.min(100, healthScore))

      return {
        month, income: Math.round(income), expenses: Math.round(expenses),
        savings: Math.round(savings), savingsRate, totalBalance: Math.round(totalBalance),
        healthScore, overBudgetCategories: overBudget.map(b => b.name),
        goals: goals.map(g => ({
          name: g.name, target: g.target, saved: g.saved,
          progress: Math.round((g.saved / g.target) * 100),
        })),
      }
    }

    case 'get_income_vs_expenses_trend': {
      const n = args.months || 6
      const result = []
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const m = d.toISOString().substring(0, 7)
        const txns     = await Transaction.find({ userId, month: m }).lean()
        const income   = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
        const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
        result.push({ month: m, income: Math.round(income), expenses: Math.round(expenses) })
      }
      return result
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

// ── POST /api/chat ────────────────────────────────────
router.post('/', guardrailsMiddleware, async (req, res) => {
  try {
    const { messages } = req.body
    const userId = req.user._id

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' })
    }

    const now = new Date()
    const todayStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    const currentMonth = now.toISOString().substring(0, 7) // YYYY-MM

    const systemPrompt = `You are a friendly, insightful AI Financial Advisor embedded in the FinFlow personal finance dashboard.

Today's date is ${todayStr}. The current month is ${currentMonth}.
NEVER state a different year or month than this. If you mention a date, use the real one above.

You have access to tools that fetch the user's live financial data from the database.
ALWAYS call a tool first before answering — never guess numbers.

The user's name is: ${req.user.name}

Rules:
- Always call at least one tool to get real data before responding
- Reference actual numbers (rupees) from the tool results
- Flag over-budget categories clearly  
- Suggest concrete next steps based on data
- Be concise (3-5 sentences max)
- Never give generic advice`

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    let finalReply = null
    let toolsUsed  = []

    // Agentic loop — up to 4 rounds. Force a text answer on the final round.
    for (let round = 0; round < 4; round++) {
      const isLastRound = round === 3

      const response = await groq.chat.completions.create({
        model:       'openai/gpt-oss-120b',
        messages:    conversationMessages,
        tools:       FINFLOW_TOOLS,
        // On the last round, force a plain text answer (no tool calls allowed)
        tool_choice: isLastRound ? 'none' : 'auto',
        max_tokens:  1024,
        temperature: 0.5,
      })

      const msg = response.choices[0].message

      // No tool calls -> this is the final text answer
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        finalReply = msg.content
        break
      }

      // Model wants to use tools -> run them and feed results back
      conversationMessages.push({
        role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls,
      })

      for (const toolCall of msg.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}')
        toolsUsed.push(toolName)

        let toolResult
        try {
          toolResult = await executeTool(toolName, toolArgs, userId)
        } catch (err) {
          toolResult = { error: err.message }
        }

        conversationMessages.push({
          role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult),
        })
      }
    }

    if (!finalReply) {
      finalReply = "I looked at your data but couldn't put together a reply. Try adding some transactions, then ask again."
    }

    res.json({ reply: finalReply, toolsUsed, blocked: false })

  } catch (err) {
    console.error('Chat error:', err.message)
    if (err.status === 401) return res.status(401).json({ error: 'Invalid Groq API key.' })
    res.status(500).json({ error: 'AI service error: ' + err.message })
  }
})

module.exports = router