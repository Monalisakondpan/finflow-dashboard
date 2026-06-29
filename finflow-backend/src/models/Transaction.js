const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:     { type: String, required: true, trim: true },
    amount:   { type: Number, required: true },
    category: {
      type: String,
      enum: ['Food & Dining','Housing','Shopping','Transport','Subscriptions','Income','Entertainment','Health','Other'],
      default: 'Other',
    },
    type:  { type: String, enum: ['debit','credit'], required: true },
    icon:  { type: String, default: '💳' },
    date:  { type: String, required: true },
    month: { type: String },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

// Auto-set month from date
transactionSchema.pre('save', function (next) {
  if (this.date) {
    this.month = this.date.substring(0, 7)
  }
  next()
})

module.exports = mongoose.model('Transaction', transactionSchema)