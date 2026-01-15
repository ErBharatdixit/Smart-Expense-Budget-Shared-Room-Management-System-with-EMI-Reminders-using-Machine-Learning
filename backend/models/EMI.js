const mongoose = require('mongoose');

const emiSchema = mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      dueDate: { type: Date, required: true },
      category: { type: String, default: 'EMI' }, // e.g., Loan, Rent, Insurance
      isPaid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('EMI', emiSchema);
