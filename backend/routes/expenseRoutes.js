const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, deleteExpense, predictCategory, predictNextMonthExpense, getFinancialInsights } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, createExpense);
router.get('/prediction', protect, predictNextMonthExpense);
router.get('/insights', protect, getFinancialInsights);
router.post('/predict', protect, predictCategory);
router.route('/:id').delete(protect, deleteExpense);

module.exports = router;
