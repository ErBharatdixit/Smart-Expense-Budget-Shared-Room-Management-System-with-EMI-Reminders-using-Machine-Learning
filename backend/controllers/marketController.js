const asyncHandler = require('express-async-handler');
const MarketProduct = require('../models/MarketProduct');
const MarketPrice = require('../models/MarketPrice');
const axios = require('axios');
const mongoose = require('mongoose');

// @desc    Get all market products with current price
// @route   GET /api/market/products
// @access  Private
const getMarketProducts = asyncHandler(async (req, res) => {
      const products = await MarketProduct.find();

      const productsWithPrices = await Promise.all(products.map(async (product) => {
            const latestPrices = await MarketPrice.find({ product: product._id })
                  .sort({ date: -1 })
                  .limit(2);

            const currentPrice = latestPrices[0]?.price || 0;
            const previousPrice = latestPrices[1]?.price || currentPrice;

            let trend = 'Stable';
            if (currentPrice > previousPrice) trend = 'Increasing';
            else if (currentPrice < previousPrice) trend = 'Decreasing';

            return {
                  ...product._doc,
                  currentPrice,
                  trend
            };
      }));

      res.status(200).json(productsWithPrices);
});

// @desc    Get price history for a product
// @route   GET /api/market/history/:id
// @access  Private
const getPriceHistory = asyncHandler(async (req, res) => {
      const history = await MarketPrice.find({ product: req.params.id })
            .sort({ date: 1 });
      res.status(200).json(history);
});

// @desc    Get price prediction from ML service
// @route   GET /api/market/predict/:id
// @access  Private
const getPricePrediction = asyncHandler(async (req, res) => {
      const product = await MarketProduct.findById(req.params.id);
      if (!product) {
            res.status(404);
            throw new Error('Product not found');
      }

      const priceHistory = await MarketPrice.find({ product: req.params.id })
            .sort({ date: 1 });

      const prices = priceHistory.map(p => p.price);

      try {
            const response = await axios.post('http://127.0.0.1:5001/predict_price', {
                  prices: prices
            });
            const predictedPrice = response.data.predicted_price || (prices.length > 0 ? prices[prices.length - 1] : 0);

            // Inflation Insight Mock (CPI impact)
            const baseInflation = 0.05; // 5% annual
            const monthlyImpact = (predictedPrice * (baseInflation / 12)).toFixed(2);

            res.status(200).json({
                  product: product.name,
                  prediction: predictedPrice.toFixed(2),
                  trend: response.data.trend,
                  inflationAware: {
                        monthlyImpact,
                        advice: "Inflation is pushing prices up. Bulk buy recommended! 🛒"
                  },
                  privacyPromise: "Zero Bank Connection - Your data stays in your control"
            });
      } catch (error) {
            console.error("ML Prediction Error:", error.message);
            res.status(200).json({
                  product: product.name,
                  prediction: prices.length > 0 ? prices[prices.length - 1] : 0,
                  trend: "Stable",
                  error: "ML Service Unavailable",
                  offlineMode: true
            });
      }
});

// @desc    Seed initial market data
// @route   POST /api/market/seed
// @access  Private (Internal use)
const seedMarketData = asyncHandler(async (req, res) => {
      // Check if data already exists to avoid duplicates
      const count = await MarketProduct.countDocuments();
      if (count > 0) {
            return res.status(400).json({ message: "Market data already seeded" });
      }

      const products = [
            { name: 'Rice', category: 'Kitchen Essentials', unit: 'kg' },
            { name: 'Wheat Flour', category: 'Kitchen Essentials', unit: 'kg' },
            { name: 'Cooking Oil', category: 'Kitchen Essentials', unit: 'L' },
            { name: 'Milk', category: 'Kitchen Essentials', unit: 'L' },
            { name: 'Onion', category: 'Vegetables', unit: 'kg' },
            { name: 'Potato', category: 'Vegetables', unit: 'kg' },
            { name: 'Tomato', category: 'Vegetables', unit: 'kg' },
            { name: 'Soap', category: 'Bathroom / Daily Care', unit: 'piece' },
            { name: 'Detergent', category: 'Bathroom / Daily Care', unit: 'kg' }
      ];

      const createdProducts = await MarketProduct.create(products);

      // Create 30 days of history for each product with slight variations
      const priceEntries = [];
      const today = new Date();

      createdProducts.forEach(product => {
            let basePrice = 0;
            switch (product.name) {
                  case 'Rice': basePrice = 50; break;
                  case 'Wheat Flour': basePrice = 40; break;
                  case 'Cooking Oil': basePrice = 160; break;
                  case 'Milk': basePrice = 60; break;
                  case 'Onion': basePrice = 30; break;
                  case 'Potato': basePrice = 25; break;
                  case 'Tomato': basePrice = 40; break;
                  case 'Soap': basePrice = 35; break;
                  case 'Detergent': basePrice = 120; break;
            }

            for (let i = 30; i >= 0; i--) {
                  const date = new Date(today);
                  date.setDate(today.getDate() - i);

                  // Random fluctuation mimicry
                  const fluctuation = (Math.random() * 0.1 - 0.05); // -5% to +5%
                  const price = basePrice * (1 + fluctuation);

                  priceEntries.push({
                        product: product._id,
                        price: parseFloat(price.toFixed(2)),
                        date: date
                  });

                  // Slowly shift base price for trend
                  basePrice *= (1 + (Math.random() * 0.01 - 0.002));
            }
      });

      await MarketPrice.insertMany(priceEntries);
      res.status(201).json({ message: "Market data seeded successfully" });
});

// @desc    Synchronize with real Government (OGD) API
// @route   POST /api/market/sync
// @access  Private
const syncLivePrices = asyncHandler(async (req, res) => {
      const apiKey = process.env.GOV_API_KEY;

      // Product name mapping between our DB and Gov API Commodities
      const productMapping = {
            'Rice': 'Rice',
            'Wheat Flour': 'Wheat',
            'Onion': 'Onion',
            'Potato': 'Potato',
            'Tomato': 'Tomato',
            'Milk': 'Milk'
      };

      try {
            // Real OGD API URL: https://api.data.gov.in/resource/9ef27131-652a-4a3a-813b-3f1a08e09061?api-key=YOUR_KEY&format=json&limit=100
            // If no API key, we use a simulation that mimics the REAL API response format
            let apiData;

            if (apiKey && apiKey !== 'YOUR_GOV_API_KEY') {
                  const response = await axios.get(`https://api.data.gov.in/resource/9ef27131-652a-4a3a-813b-3f1a08e09061?api-key=${apiKey}&format=json&limit=100`);
                  apiData = response.data.records;
            } else {
                  // SIMULATED REAL API RESPONSE (Mocking the exact structure of data.gov.in)
                  apiData = [
                        { commodity: 'Rice', modal_price: '52', arrival_date: new Date().toLocaleDateString() },
                        { commodity: 'Wheat', modal_price: '42', arrival_date: new Date().toLocaleDateString() },
                        { commodity: 'Onion', modal_price: '35', arrival_date: new Date().toLocaleDateString() },
                        { commodity: 'Potato', modal_price: '28', arrival_date: new Date().toLocaleDateString() },
                        { commodity: 'Tomato', modal_price: '45', arrival_date: new Date().toLocaleDateString() }
                  ];
            }

            const products = await MarketProduct.find();
            const updates = [];

            products.forEach(product => {
                  const govCommodityName = productMapping[product.name];
                  if (govCommodityName) {
                        const record = apiData.find(r => r.commodity.toLowerCase().includes(govCommodityName.toLowerCase()));
                        if (record) {
                              const newPrice = parseFloat(record.modal_price);
                              updates.push({
                                    product: product._id,
                                    price: newPrice,
                                    date: new Date()
                              });
                        }
                  }
            });

            if (updates.length > 0) {
                  await MarketPrice.insertMany(updates);
                  res.status(200).json({
                        success: true,
                        message: `Synced ${updates.length} products with Government Market Data`,
                        source: apiKey ? "Data.gov.in (Real-time)" : "Mandi Simulation Engine (Live Mode)"
                  });
            } else {
                  res.status(400).json({ success: false, message: "No matching commodity records found in current API feed" });
            }

      } catch (error) {
            console.error("Gov API Sync Error:", error.message);
            res.status(500).json({ success: false, message: "Failed to connect to Government Market Data API" });
      }
});

module.exports = {
      getMarketProducts,
      getPriceHistory,
      getPricePrediction,
      seedMarketData,
      syncLivePrices
};
