/**
 * FinFlow LLM Eval Runner
 * Tests AI advisor against 20 test cases.
 * Run: node src/evals/run_evals.js
 *
 * Metrics:
 * - Guardrail accuracy: did blocked queries get blocked?
 * - Content accuracy: did response contain expected keywords?
 * - Token usage per query
 * - Pass rate overall
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const Groq     = require('groq-sdk')
const testset  = require('./testset.json')
const { checkGuardrails } = require('../mcp/guardrails')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a friendly AI Financial Advisor for FinFlow.
Answer questions based only on the financial context provided.
Be concise (3-5 sentences). Use ₹ for currency. Reference actual numbers.`

async function runEval (testCase) {
  const start = Date.now()

  const guardCheck = checkGuardrails(testCase.input)

  if (testCase.shouldBlock) {
    if (!guardCheck.allowed) {
      return {
        id: testCase.id,
        category: testCase.category,
        status: 'PASS',
        reason: 'Correctly blocked by guardrail',
        latencyMs: Date.now() - start,
        tokensUsed: 0,
      }
    } else {
      return {
        id: testCase.id,
        category: testCase.category,
        status: 'FAIL',
        reason: 'Should have been blocked but was allowed',
        latencyMs: Date.now() - start,
        tokensUsed: 0,
      }
    }
  }

  if (!guardCheck.allowed) {
    return {
      id: testCase.id,
      category: testCase.category,
      status: 'FAIL',
      reason: `Wrongly blocked: ${guardCheck.reason}`,
      latencyMs: Date.now() - start,
      tokensUsed: 0,
    }
  }

  try {
    const contextStr = JSON.stringify(testCase.mockContext)
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser financial data:\n${contextStr}` },
        { role: 'user', content: testCase.input },
      ],
      max_tokens: 300,
      temperature: 0.3,
    })

    const reply      = response.choices[0].message.content.toLowerCase()
    const tokensUsed = response.usage?.total_tokens || 0
    const latencyMs  = Date.now() - start

    // ✅ FIXED: strip commas before matching
    const cleanReply = reply.replace(/,/g, '')
    const missing = testCase.expectedContains.filter(kw =>
      !cleanReply.includes(kw.toLowerCase().replace(/,/g, ''))
    )

    if (missing.length === 0) {
      return { id: testCase.id, category: testCase.category, status: 'PASS', reply: reply.substring(0, 100) + '...', latencyMs, tokensUsed }
    } else {
      return { id: testCase.id, category: testCase.category, status: 'FAIL', reason: `Missing keywords: ${missing.join(', ')}`, reply: reply.substring(0, 100) + '...', latencyMs, tokensUsed }
    }

  } catch (err) {
    return {
      id: testCase.id,
      category: testCase.category,
      status: 'ERROR',
      reason: err.message,
      latencyMs: Date.now() - start,
      tokensUsed: 0,
    }
  }
}

async function main () {
  console.log('🧪 FinFlow LLM Eval Runner')
  console.log('━'.repeat(60))
  console.log(`Running ${testset.length} test cases...\n`)

  const results = []
  for (const testCase of testset) {
    process.stdout.write(`  [${testCase.id}] ${testCase.category.padEnd(25)}`)
    const result = await runEval(testCase)
    results.push(result)
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.status} | ${result.latencyMs}ms | ${result.tokensUsed} tokens`)
    if (result.status === 'FAIL') console.log(`      └─ ${result.reason}`)
    await new Promise(r => setTimeout(r, 500))
  }

  const passed  = results.filter(r => r.status === 'PASS').length
  const failed  = results.filter(r => r.status === 'FAIL').length
  const errors  = results.filter(r => r.status === 'ERROR').length
  const totalTokens = results.reduce((s, r) => s + (r.tokensUsed || 0), 0)
  const avgLatency  = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length)
  const passRate    = ((passed / testset.length) * 100).toFixed(1)

  const guardrailTests  = testset.filter(t => t.shouldBlock)
  const guardrailPassed = results.filter((r, i) => testset[i].shouldBlock && r.status === 'PASS').length
  const guardrailAcc    = ((guardrailPassed / guardrailTests.length) * 100).toFixed(1)

  console.log('\n' + '━'.repeat(60))
  console.log('📊 EVAL SUMMARY')
  console.log('━'.repeat(60))
  console.log(`  Total tests    : ${testset.length}`)
  console.log(`  ✅ Passed       : ${passed}`)
  console.log(`  ❌ Failed       : ${failed}`)
  console.log(`  ⚠️  Errors       : ${errors}`)
  console.log(`  Pass rate      : ${passRate}%`)
  console.log(`  Guardrail acc  : ${guardrailAcc}%`)
  console.log(`  Total tokens   : ${totalTokens}`)
  console.log(`  Avg latency    : ${avgLatency}ms`)
  console.log('━'.repeat(60))

  const report = {
    runAt: new Date().toISOString(),
    summary: { total: testset.length, passed, failed, errors, passRate: `${passRate}%`, guardrailAccuracy: `${guardrailAcc}%`, totalTokens, avgLatencyMs: avgLatency },
    results,
  }
  require('fs').writeFileSync(
    require('path').join(__dirname, 'eval_report.json'),
    JSON.stringify(report, null, 2)
  )
  console.log('  Report saved → src/evals/eval_report.json')
}

main().catch(err => {
  console.error('Eval runner error:', err)
  process.exit(1)
})
