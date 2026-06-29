const express = require('express')
const router  = express.Router()
const Budget  = require('../models/Budget')
const { sendBudgetAlertEmail } = require('../config/email')

async function triggerBudgetAlert (budget, user) {
  const usagePercent = Math.round((budget.spent / budget.limit) * 100)
  if (usagePercent < 80) return // Only alert at 80%+

  try {
    await sendBudgetAlertEmail(
      user.name,
      user.email,
      budget.name,
      budget.spent,
      budget.limit
    )
    console.log(`[alert] Budget email sent: ${budget.name} at ${usagePercent}%`)
  } catch (err) {
    // Non-blocking — don't fail the request if email is down
    console.error('[alert] Budget email failed:', err.message)
  }
}

// GET all budgets for logged in user
router.get('/', async (req, res) => {
  try {
    const { month } = req.query
    const filter = { userId: req.user._id }
    if (month) filter.month = month
    const budgets = await Budget.find(filter).sort({ createdAt: 1 })
    res.json(budgets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create budget
router.post('/', async (req, res) => {
  try {
    const { name, spent, limit, color, month } = req.body
    if (!name || !limit) {
      return res.status(400).json({ error: 'name and limit are required' })
    }
    const budget = await Budget.create({
      userId: req.user._id,
      name, spent: spent || 0, limit, color, month,
    })
    // Fire alert if initial spent already over threshold
    await triggerBudgetAlert(budget, req.user)
    res.status(201).json(budget)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT update budget — fires alert when spent updated
router.put('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!budget) return res.status(404).json({ error: 'Not found' })

    // Fire alert if threshold hit after update
    await triggerBudgetAlert(budget, req.user)

    res.json(budget)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id, userId: req.user._id,
    })
    if (!budget) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Budget deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router