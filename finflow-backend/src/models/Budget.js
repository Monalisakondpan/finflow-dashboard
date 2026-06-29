const mongoose = require('mongoose')

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:   { type: String, required: true, trim: true },
    spent:  { type: Number, default: 0 },
    limit:  { type: Number, required: true },
    color:  { type: String, default: '#ff4da6' },
    month:  { type: String, default: () => new Date().toISOString().substring(0, 7) },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Budget', budgetSchema)