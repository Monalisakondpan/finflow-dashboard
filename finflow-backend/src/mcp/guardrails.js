const ALLOWED_CASUAL = [
  'okay','ok','thanks','thank you','got it','sure','great','nice','cool',
  'yes','no','hello','hi','hey','alright','perfect','awesome','understood',
  'noted','sounds good','make sense','makes sense','go ahead','please',
]

// Finance-related keywords whitelist
const FINANCE_KEYWORDS = [
  'spend','spent','expense','income','budget','saving','save','money',
  'transaction','balance','goal','invest','debt','loan','salary','pay',
  'credit','debit','cost','price','afford','financial','finance','rupee',
  '₹','cash','bill','emi','tax','profit','loss','wealth','fund','stock',
  'mutual','insurance','rent','food','shopping','transport','health',
  'subscription','entertain','category','month','trend','report','summary',
  'how much','how many','what is my','am i','should i','can i','analyse',
  'analyze','tip','advice','suggest','recommend','improve','reduce','increase',
]

// Injection / jailbreak patterns
const INJECTION_PATTERNS = [
  /ignore (previous|above|all) instructions/i,
  /you are now/i,
  /forget (you are|your role|all previous)/i,
  /act as (a different|an? (?!financial|finance))/i,
  /disregard (your|all)/i,
  /jailbreak/i,
  /pretend (you are|to be)/i,
  /system prompt/i,
]

/**
 * Returns { allowed: boolean, reason: string }
 */
function checkGuardrails (userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return { allowed: false, reason: 'Empty message.' }
  }

  const lower = userMessage.toLowerCase().trim()

  // Always allow short casual replies
  const isCasual = ALLOWED_CASUAL.some(w => lower === w || lower.startsWith(w + ' ') || lower.endsWith(' ' + w))
  if (isCasual) {
    return { allowed: true, reason: null }
  }

  // Check injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        allowed: false,
        reason: 'I can only help with your personal finance questions. Please ask something about your spending, budget, or savings.',
      }
    }
  }

  // Check topic relevance (any finance keyword present = allowed)
  const isFinanceTopic = FINANCE_KEYWORDS.some(kw => lower.includes(kw))
  if (!isFinanceTopic) {
    return {
      allowed: false,
      reason: "I'm your FinFlow Financial Advisor — I can only answer questions about your finances, budget, expenses, and savings. Try asking about your spending or budget status!",
    }
  }

  return { allowed: true, reason: null }
}

/**
 * Express middleware — blocks non-finance queries before hitting Groq
 */
function guardrailsMiddleware (req, res, next) {
  const messages = req.body.messages || []
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')

  if (!lastUserMsg) return next()

  const check = checkGuardrails(lastUserMsg.content)
  if (!check.allowed) {
    return res.status(200).json({
      reply: check.reason,
      blocked: true,
    })
  }

  // Token budget guard — rough estimate (4 chars ≈ 1 token)
  const contextStr = JSON.stringify(req.body.context || '')
  const estimatedTokens = contextStr.length / 4
  if (estimatedTokens > 3000) {
    req.body.context = contextStr.substring(0, 12000)
  }

  next()
}

module.exports = { guardrailsMiddleware, checkGuardrails }