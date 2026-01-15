const mongoose = require('mongoose');

const sharedExpenseSchema = mongoose.Schema({
      room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
      payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
      participants: [
            {
                  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                  share: { type: Number } // Amount they owe
            }
      ],
      date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SharedExpense', sharedExpenseSchema);
