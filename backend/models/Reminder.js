const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema({
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
      dueDate: {
            type: Date,
            required: [true, 'Please add a due date']
      },
      category: {
            type: String,
            enum: ['EMI', 'Bill', 'Subscription', 'Insurance', 'Other'],
            default: 'Other'
      },
      isPaid: {
            type: Boolean,
            default: false
      }
}, {
      timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);
