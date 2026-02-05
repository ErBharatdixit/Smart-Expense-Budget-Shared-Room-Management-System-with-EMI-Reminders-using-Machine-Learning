const express = require('express');
const router = express.Router();
const {
      getMarketProducts,
      getPriceHistory,
      getPricePrediction,
      seedMarketData,
      syncLivePrices
} = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

router.get('/products', protect, getMarketProducts);
router.get('/history/:id', protect, getPriceHistory);
router.get('/predict/:id', protect, getPricePrediction);
router.post('/seed', protect, seedMarketData);
router.post('/sync', protect, syncLivePrices);

module.exports = router;
