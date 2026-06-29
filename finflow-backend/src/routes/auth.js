const express   = require('express')
const router    = express.Router()
const jwt       = require('jsonwebtoken')
const crypto    = require('crypto')
const User      = require('../models/User')
const { sendWelcomeEmail, sendPasswordResetEmail, sendAccountDeletionEmail } = require('../config/email')

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Check password strength. Returns an error message string, or null if OK.
function validatePassword(password) {
  if (!password || password.length < 8)
    return 'Password must be at least 8 characters long'
  if (!/[a-z]/.test(password))
    return 'Password must include at least one lowercase letter'
  if (!/[A-Z]/.test(password))
    return 'Password must include at least one uppercase letter'
  if (!/[0-9]/.test(password))
    return 'Password must include at least one number'
  return null
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, avatar } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' })
    const pwdError = validatePassword(password)
    if (pwdError) return res.status(400).json({ error: pwdError })
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: 'Email already registered' })
    const user  = await User.create({ name, email, password, gender: gender || 'other', avatar: avatar || 'f1' })
    const token = generateToken(user._id)
    sendWelcomeEmail(name, email)
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, gender: user.gender, avatar: user.avatar }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' })
    const token = generateToken(user._id)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, gender: user.gender, avatar: user.avatar }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const user = await User.findOne({ email })
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })
    // Raw token goes in the email; only its HASH is stored in the DB.
    const resetToken  = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetExpiry = Date.now() + 60 * 60 * 1000
    user.resetPasswordToken  = hashedToken
    user.resetPasswordExpiry = resetExpiry
    await user.save()
    await sendPasswordResetEmail(user.name, user.email, resetToken)
    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token }    = req.params
    const { password } = req.body
    const pwdError = validatePassword(password)
    if (pwdError) return res.status(400).json({ error: pwdError })
    // Hash the incoming token the same way, then match against the stored hash.
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    })
    if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' })
    user.password             = password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpiry  = undefined
    await user.save()
    res.json({ message: 'Password reset successful. You can now login.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/auth/delete-account
router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'No token provided' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId  = decoded.id

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const Transaction = require('../models/Transaction')
    const Budget      = require('../models/Budget')
    const Goal        = require('../models/Goal')

    await Transaction.deleteMany({ userId })
    await Budget.deleteMany({ userId })
    await Goal.deleteMany({ userId })
    await User.findByIdAndDelete(userId)

    sendAccountDeletionEmail(user.name, user.email)

    res.json({ message: 'Account deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router