const mongoose = require('mongoose');

const marketProductSchema = mongoose.Schema({
      name: {
            type: String,
            required: [true, 'Please add a product name'],
      },
      category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: ['Kitchen Essentials', 'Bathroom / Daily Care', 'Vegetables', 'Others'],
      },
      unit: {
            type: String,
            required: [true, 'Please add a unit (e.g., kg, L, piece)'],
      },
      image: {
            type: String,
            default: '',
      }
}, {
      timestamps: true
});

module.exports = mongoose.model('MarketProduct', marketProductSchema);
