const express     = require('express')
const router      = express.Router()
const Transaction = require('../models/Transaction')
const Budget      = require('../models/Budget')

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user._id
    const month  = req.query.month || new Date().toISOString().substring(0, 7)

    const transactions = await Transaction.find({ userId, month })

    // Income = all positive amounts
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    // Expenses = sum of absolute negative amounts
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const savings     = income - expenses
    const savingsRate = income > 0
      ? parseFloat(((savings / income) * 100).toFixed(1))
      : 0

    // Total balance — sum of ALL transactions for this user
    const allTx        = await Transaction.find({ userId })
    const totalBalance = allTx.reduce((sum, t) => sum + t.amount, 0)

    // Spending by category
    const spendingByCategory = {}
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        spendingByCategory[t.category] =
          (spendingByCategory[t.category] || 0) + Math.abs(t.amount)
      })

    // Budget usage
    const budgets = await Budget.find({ userId, month })

    // Health score
    let healthScore = 50
    if (savingsRate >= 20)  healthScore += 10
    if (savingsRate >= 35)  healthScore += 10
    if (savingsRate >= 50)  healthScore += 5
    if (totalBalance > 100000) healthScore += 10
    if (totalBalance > 250000) healthScore += 5
    const overBudgetCount = budgets.filter(b => b.spent > b.limit).length
    healthScore -= overBudgetCount * 5
    healthScore = Math.max(0, Math.min(100, healthScore))

    res.json({
      month,
      totalBalance: Math.round(totalBalance),
      income:       Math.round(income),
      expenses:     Math.round(expenses),
      savings:      Math.round(savings),
      savingsRate,
      healthScore,
      spendingByCategory,
      transactionCount: transactions.length,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router