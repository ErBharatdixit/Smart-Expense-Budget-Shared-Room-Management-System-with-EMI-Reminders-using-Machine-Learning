const mongoose = require('mongoose');

const marketPriceSchema = mongoose.Schema({
      product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'MarketProduct',
      },
      price: {
            type: Number,
            required: [true, 'Please add a price'],
      },
      date: {
            type: Date,
            required: true,
            default: Date.now,
      }
}, {
      timestamps: true
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
