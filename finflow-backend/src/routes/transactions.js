const express     = require('express')
const router      = express.Router()
const Transaction = require('../models/Transaction')

// GET all transactions for logged in user
router.get('/', async (req, res) => {
  try {
    const { month, category } = req.query
    const filter = { userId: req.user._id }
    if (month)    filter.month    = month
    if (category) filter.category = category

    const txs = await Transaction.find(filter).sort({ createdAt: -1 })
    res.json(txs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single transaction
router.get('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id })
    if (!tx) return res.status(404).json({ error: 'Not found' })
    res.json(tx)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create transaction
router.post('/', async (req, res) => {
  try {
    const { name, amount, category, type, icon, date, notes } = req.body
    if (!name || amount === undefined || !type || !date) {
      return res.status(400).json({ error: 'name, amount, type and date are required' })
    }
    const tx = await Transaction.create({
      userId: req.user._id,
      name, amount, category, type, icon, date, notes
    })
    res.status(201).json(tx)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!tx) return res.status(404).json({ error: 'Not found' })
    res.json(tx)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!tx) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Transaction deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router