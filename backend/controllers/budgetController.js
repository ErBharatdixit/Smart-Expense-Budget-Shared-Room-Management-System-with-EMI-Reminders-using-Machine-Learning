const asyncHandler = require('express-async-handler');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get budgets for current month with spending progress
// @route   GET /api/budgets
// @access  Private
const getBudgets = asyncHandler(async (req, res) => {
      const month = req.query.month || (new Date().getMonth() + 1);
      const year = req.query.year || new Date().getFullYear();

      // Get all budgets set by user for this month
      const budgets = await Budget.find({
            user: req.user.id,
            month,
            year
      });

      // Calculate actual spending for each category
      const spending = await Expense.aggregate([
            {
                  $match: {
                        user: req.user._id,
                        $expr: {
                              $and: [
                                    { $eq: [{ $month: "$date" }, parseInt(month)] },
                                    { $eq: [{ $year: "$date" }, parseInt(year)] }
                              ]
                        }
                  }
            },
            {
                  $group: {
                        _id: "$category",
                        totalSpent: { $sum: "$amount" }
                  }
            }
      ]);

      // Merge budgets with spending data
      const budgetData = budgets.map(budget => {
            const spentData = spending.find(s => s._id === budget.category);
            return {
                  ...budget._doc,
                  spent: spentData ? spentData.totalSpent : 0
            };
      });

      res.status(200).json(budgetData);
});

// @desc    Set or Update budget
// @route   POST /api/budgets
// @access  Private
const setBudget = asyncHandler(async (req, res) => {
      const { category, amount, month, year } = req.body;

      if (!category || !amount) {
            res.status(400);
            throw new Error('Please add category and amount');
      }

      const currentMonth = month || (new Date().getMonth() + 1);
      const currentYear = year || new Date().getFullYear();

      // Check if budget exists, if so update it
      const budget = await Budget.findOne({
            user: req.user.id,
            category,
            month: currentMonth,
            year: currentYear
      });

      if (budget) {
            budget.amount = amount;
            const updatedBudget = await budget.save();
            res.status(200).json(updatedBudget);
      } else {
            const newBudget = await Budget.create({
                  user: req.user.id,
                  category,
                  amount,
                  month: currentMonth,
                  year: currentYear
            });
            res.status(201).json(newBudget);
      }
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = asyncHandler(async (req, res) => {
      const budget = await Budget.findById(req.params.id);

      if (!budget) {
            res.status(404);
            throw new Error('Budget not found');
      }

      if (budget.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
      }

      await budget.deleteOne();
      res.status(200).json({ id: req.params.id });
});

module.exports = {
      getBudgets,
      setBudget,
      deleteBudget
};
