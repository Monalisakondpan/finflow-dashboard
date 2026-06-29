require('dotenv').config()
const express      = require('express')
const cors         = require('cors')
const helmet       = require('helmet')
const rateLimit    = require('express-rate-limit')
const connectDB    = require('./config/db')

const authRoutes        = require('./routes/auth')
const transactionRoutes = require('./routes/transactions')
const budgetRoutes      = require('./routes/budgets')
const dashboardRoutes   = require('./routes/dashboard')
const chatRoutes        = require('./routes/chat')
const goalRoutes        = require('./routes/goals')

const protect = require('./middleware/auth')

const app  = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', 1)

connectDB()

app.use(helmet())

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Block MongoDB operator injection ($gt, $where, etc)
function sanitizeMongo (obj) {
  if (!obj || typeof obj !== 'object') return
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
    } else {
      sanitizeMongo(obj[key])
    }
  }
}
app.use((req, _res, next) => {
  sanitizeMongo(req.body)
  sanitizeMongo(req.params)
  sanitizeMongo(req.query)
  next()
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many attempts, please try again in 15 minutes.' },
})

app.use('/api', apiLimiter)

app.use((req, _res, next) => {
  console.log(`${req.method}  ${req.path}`)
  next()
})

app.use('/api/auth', authLimiter, authRoutes)

app.use('/api/transactions', protect, transactionRoutes)
app.use('/api/budgets',      protect, budgetRoutes)
app.use('/api/dashboard',    protect, dashboardRoutes)
app.use('/api/chat',         protect, chatRoutes)
app.use('/api/goals',        protect, goalRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FinFlow API is running', timestamp: new Date() })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, _req, res, _next) => {
  console.error('Server error:', err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log('')
  console.log('🚀  FinFlow Backend running!')
  console.log(`📡  API:    http://localhost:${PORT}/api`)
  console.log(`💚  Health: http://localhost:${PORT}/api/health`)
  console.log('')
})