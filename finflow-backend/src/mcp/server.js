/**
 * FinFlow MCP Server
 * Exposes MongoDB financial data as MCP tools.
 * Run: node src/mcp/server.js
 * Communicates via stdio (standard MCP transport).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const { Server }   = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js')

const mongoose    = require('mongoose')
const Transaction = require('../models/Transaction')
const Budget      = require('../models/Budget')
const Goal        = require('../models/Goal')

// ── Connect DB ────────────────────────────────────────
async function connectDB () {
  await mongoose.connect(process.env.MONGO_URI)
  console.error('[MCP] MongoDB connected')
}

// ── Tool handlers ─────────────────────────────────────

async function getExpenses ({ userId, month }) {
  const m = month || new Date().toISOString().substring(0, 7)
  const txns = await Transaction.find({ userId, month: m }).lean()
  const expenses = txns.filter(t => t.amount < 0)
  const byCategory = {}
  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount)
  })
  return {
    month: m,
    totalExpenses: expenses.reduce((s, t) => s + Math.abs(t.amount), 0),
    byCategory,
    transactions: expenses.map(t => ({
      name: t.name, amount: Math.abs(t.amount), category: t.category, date: t.date,
    })),
  }
}

async function getBudgetStatus ({ userId, month }) {
  const m = month || new Date().toISOString().substring(0, 7)
  const budgets = await Budget.find({ userId, month: m }).lean()
  return budgets.map(b => ({
    name: b.name,
    spent: b.spent,
    limit: b.limit,
    remaining: b.limit - b.spent,
    overBudget: b.spent > b.limit,
    usagePercent: Math.round((b.spent / b.limit) * 100),
  }))
}

async function getFinancialHealth ({ userId, month }) {
  const m = month || new Date().toISOString().substring(0, 7)
  const txns    = await Transaction.find({ userId, month: m }).lean()
  const budgets = await Budget.find({ userId, month: m }).lean()
  const goals   = await Goal.find({ userId }).lean()

  const income   = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  const savings  = income - expenses
  const savingsRate = income > 0 ? parseFloat(((savings / income) * 100).toFixed(1)) : 0

  const allTxns      = await Transaction.find({ userId }).lean()
  const totalBalance = allTxns.reduce((s, t) => s + t.amount, 0)

  const overBudget = budgets.filter(b => b.spent > b.limit)

  let healthScore = 50
  if (savingsRate >= 20) healthScore += 10
  if (savingsRate >= 35) healthScore += 10
  if (savingsRate >= 50) healthScore += 5
  if (totalBalance > 100000) healthScore += 10
  if (totalBalance > 250000) healthScore += 5
  healthScore -= overBudget.length * 5
  healthScore = Math.max(0, Math.min(100, healthScore))

  return {
    month: m,
    income: Math.round(income),
    expenses: Math.round(expenses),
    savings: Math.round(savings),
    savingsRate,
    totalBalance: Math.round(totalBalance),
    healthScore,
    overBudgetCategories: overBudget.map(b => b.name),
    goals: goals.map(g => ({
      name: g.name,
      target: g.target,
      saved: g.saved,
      progress: Math.round((g.saved / g.target) * 100),
    })),
  }
}

async function getIncomeVsExpensesTrend ({ userId, months = 6 }) {
  const result = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const m = d.toISOString().substring(0, 7)
    const txns = await Transaction.find({ userId, month: m }).lean()
    const income   = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
    const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
    result.push({ month: m, income: Math.round(income), expenses: Math.round(expenses) })
  }
  return result
}

// ── MCP Server setup ──────────────────────────────────

const server = new Server(
  { name: 'finflow-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_expenses',
      description: 'Get user expenses broken down by category for a given month',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'MongoDB user ID' },
          month:  { type: 'string', description: 'Month in YYYY-MM format. Defaults to current month.' },
        },
        required: ['userId'],
      },
    },
    {
      name: 'get_budget_status',
      description: 'Get all budget categories with spent vs limit and over-budget flags',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'MongoDB user ID' },
          month:  { type: 'string', description: 'Month in YYYY-MM format. Defaults to current month.' },
        },
        required: ['userId'],
      },
    },
    {
      name: 'get_financial_health',
      description: 'Get overall financial health score, savings rate, income, expenses, goals progress',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'MongoDB user ID' },
          month:  { type: 'string', description: 'Month in YYYY-MM format. Defaults to current month.' },
        },
        required: ['userId'],
      },
    },
    {
      name: 'get_income_vs_expenses_trend',
      description: 'Get income vs expenses trend over last N months',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'MongoDB user ID' },
          months: { type: 'number', description: 'Number of months to look back. Default 6.' },
        },
        required: ['userId'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    let result
    switch (name) {
      case 'get_expenses':
        result = await getExpenses(args); break
      case 'get_budget_status':
        result = await getBudgetStatus(args); break
      case 'get_financial_health':
        result = await getFinancialHealth(args); break
      case 'get_income_vs_expenses_trend':
        result = await getIncomeVsExpensesTrend(args); break
      default:
        throw new Error(`Unknown tool: ${name}`)
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    }
  }
})

// ── Start ─────────────────────────────────────────────
async function main () {
  await connectDB()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[MCP] FinFlow MCP Server running via stdio')
}

main().catch(err => {
  console.error('[MCP] Fatal:', err)
  process.exit(1)
})
