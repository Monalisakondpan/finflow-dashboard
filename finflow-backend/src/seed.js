// Run this once to populate your MongoDB with demo data
// Command: node src/seed.js

require('dotenv').config()
const mongoose    = require('mongoose')
const connectDB   = require('./config/db')
const Transaction = require('./models/Transaction')
const Budget      = require('./models/Budget')

const TRANSACTIONS = [
  { name:'Salary Credit',    amount:95000,  category:'Income',        type:'credit', icon:'💼', date:'2026-03-01', month:'2026-03' },
  { name:'Rent Payment',     amount:-18000, category:'Housing',       type:'debit',  icon:'🏠', date:'2026-03-01', month:'2026-03' },
  { name:'Netflix Premium',  amount:-649,   category:'Subscriptions', type:'debit',  icon:'📱', date:'2026-03-02', month:'2026-03' },
  { name:'Swiggy Order',     amount:-870,   category:'Food & Dining', type:'debit',  icon:'🍕', date:'2026-03-05', month:'2026-03' },
  { name:'Ola Ride',         amount:-340,   category:'Transport',     type:'debit',  icon:'🚕', date:'2026-03-07', month:'2026-03' },
  { name:'Amazon Shopping',  amount:-3200,  category:'Shopping',      type:'debit',  icon:'📦', date:'2026-03-09', month:'2026-03' },
  { name:'Starbucks Coffee', amount:-640,   category:'Food & Dining', type:'debit',  icon:'☕', date:'2026-03-11', month:'2026-03' },
  { name:'BigBasket Grocery',amount:-2840,  category:'Food & Dining', type:'debit',  icon:'🛒', date:'2026-03-13', month:'2026-03' },
  { name:'Gym Membership',   amount:-1499,  category:'Health',        type:'debit',  icon:'💪', date:'2026-03-03', month:'2026-03' },
  { name:'Zomato Order',     amount:-750,   category:'Food & Dining', type:'debit',  icon:'🍔', date:'2026-03-14', month:'2026-03' },
  { name:'Rapido Bike',      amount:-120,   category:'Transport',     type:'debit',  icon:'🛵', date:'2026-03-14', month:'2026-03' },
  { name:'Myntra Clothes',   amount:-4440,  category:'Shopping',      type:'debit',  icon:'👕', date:'2026-03-10', month:'2026-03' },
  { name:'Spotify Premium',  amount:-119,   category:'Subscriptions', type:'debit',  icon:'🎵', date:'2026-03-02', month:'2026-03' },
  { name:'Freelance Payment',amount:-0,     category:'Income',        type:'credit', icon:'💻', date:'2026-03-08', month:'2026-03' },
  // Previous months for the chart
  { name:'Salary Feb',       amount:90000,  category:'Income',        type:'credit', icon:'💼', date:'2026-02-01', month:'2026-02' },
  { name:'Rent Feb',         amount:-18000, category:'Housing',       type:'debit',  icon:'🏠', date:'2026-02-01', month:'2026-02' },
  { name:'Expenses Feb',     amount:-36500, category:'Food & Dining', type:'debit',  icon:'🍔', date:'2026-02-15', month:'2026-02' },
  { name:'Salary Jan',       amount:88000,  category:'Income',        type:'credit', icon:'💼', date:'2026-01-01', month:'2026-01' },
  { name:'Rent Jan',         amount:-18000, category:'Housing',       type:'debit',  icon:'🏠', date:'2026-01-01', month:'2026-01' },
  { name:'Expenses Jan',     amount:-34000, category:'Food & Dining', type:'debit',  icon:'🍔', date:'2026-01-15', month:'2026-01' },
]

const BUDGETS = [
  { name:'Housing / Rent',  spent:18000, limit:20000, color:'#00c896', month:'2026-03' },
  { name:'Food & Dining',   spent:12400, limit:15000, color:'#4a9eff', month:'2026-03' },
  { name:'Shopping',        spent:8640,  limit:8000,  color:'#ff5e5e', month:'2026-03' },
  { name:'Transport',       spent:7200,  limit:8000,  color:'#f0b429', month:'2026-03' },
  { name:'Subscriptions',   spent:4800,  limit:5000,  color:'#c084fc', month:'2026-03' },
]

async function seed() {
  await connectDB()

  console.log('🌱  Seeding database...')

  await Transaction.deleteMany({})
  await Budget.deleteMany({})

  await Transaction.insertMany(TRANSACTIONS)
  await Budget.insertMany(BUDGETS)

  console.log(`✅  Inserted ${TRANSACTIONS.length} transactions`)
  console.log(`✅  Inserted ${BUDGETS.length} budget categories`)
  console.log('🎉  Seed complete! Open MongoDB Compass to verify.')

  mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
