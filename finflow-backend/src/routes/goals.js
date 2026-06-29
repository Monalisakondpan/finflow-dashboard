const express = require('express')
const router  = express.Router()
const Goal    = require('../models/Goal')

// GET all goals for logged in user
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json(goals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create goal
router.post('/', async (req, res) => {
  try {
    const { name, target, saved, icon, color } = req.body
    if (!name || !target) {
      return res.status(400).json({ error: 'name and target are required' })
    }
    const goal = await Goal.create({
      userId: req.user._id,
      name, target, saved: saved || 0, icon, color
    })
    res.status(201).json(goal)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT update goal
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    )
    if (!goal) return res.status(404).json({ error: 'Not found' })
    res.json(goal)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE goal
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!goal) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Goal deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router