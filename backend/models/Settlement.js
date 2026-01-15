const mongoose = require('mongoose');

const settlementSchema = mongoose.Schema({
      room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
      payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who paid
      payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who received
      amount: { type: Number, required: true },
      isSettled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Settlement', settlementSchema);
