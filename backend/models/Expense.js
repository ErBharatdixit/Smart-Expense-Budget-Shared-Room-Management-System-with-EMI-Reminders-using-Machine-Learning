const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
      user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
      },
      title: {
            type: String,
            required: [true, 'Please add a title']
      },
      amount: {
            type: Number,
            required: [true, 'Please add an amount']
      },
      category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: ['Food', 'Travel', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Education', 'Other']
      },
      date: {
            type: Date,
            default: Date.now
      },
      description: {
            type: String
      }
}, {
      timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
