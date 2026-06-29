const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true, trim: true },
    target:  { type: Number, required: true },
    saved:   { type: Number, default: 0 },
    icon:    { type: String, default: '🎯' },
    color:   { type: String, default: '#ff2d8f' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Goal', goalSchema)