const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      month: { type: String, required: true }, // Format: YYYY-MM
      amount: { type: Number, required: true },
      categoryLimits: [
            {
                  category: { type: String },
                  limit: { type: Number }
            }
      ]
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
