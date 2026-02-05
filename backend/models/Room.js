const mongoose = require('mongoose');

// Schema for individual shared expenses within a room
const sharedExpenseSchema = mongoose.Schema({
      description: {
            type: String,
            required: [true, 'Please add a description']
      },
      amount: {
            type: Number,
            required: [true, 'Please add an amount']
      },
      paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
      },
      date: {
            type: Date,
            default: Date.now
      }
});

const roomSchema = mongoose.Schema({
      name: {
            type: String,
            required: [true, 'Please add a room name']
      },
      code: {
            type: String,
            required: true,
            unique: true
      },
      createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
      },
      members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
      }],
      expenses: [sharedExpenseSchema]
}, {
      timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
