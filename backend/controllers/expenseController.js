const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const User = require('../models/User');
const axios = require('axios');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Reminder = require('../models/Reminder');

// @desc    Predict expense category
// @route   POST /api/expenses/predict
// @access  Private
const predictCategory = asyncHandler(async (req, res) => {
      const { title } = req.body;

      if (!title) {
            res.status(400);
            throw new Error('Please provide a title/description');
      }

      try {
            // Call Python ML Service
            const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
            const response = await axios.post(`${ML_SERVICE_URL}/predict_category`, {
                  description: title
            });

            res.status(200).json(response.data);
      } catch (error) {
            // Suppress connection refused errors from ML service
            const isConnectionError = error.code === 'ECONNREFUSED' || (error.message && error.message.includes('ECONNREFUSED'));
            if (!isConnectionError) {
                  console.error("ML Service Error:", error.message);
            }
            // Fallback or error
            res.status(500).json({ category: "Uncategorized", error: "ML Service Unavailable" });
      }
});

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
      const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
      res.status(200).json(expenses);
});

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
      const { title, amount, category, date, description } = req.body;

      if (!title || !amount || !category) {
            res.status(400);
            throw new Error('Please add title, amount and category');
      }

      const expense = await Expense.create({
            user: req.user.id,
            title,
            amount,
            category,
            date: date || Date.now(),
            description
      });

      res.status(201).json(expense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
      const expense = await Expense.findById(req.params.id);

      if (!expense) {
            res.status(404);
            throw new Error('Expense not found');
      }

      // Check for user
      if (!req.user) {
            res.status(401);
            throw new Error('User not found');
      }

      // Make sure the logged in user matches the expense user
      if (expense.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
      }

      await expense.deleteOne();

      res.status(200).json({ id: req.params.id });
});

// @desc    Predict next month's total expense
// @route   GET /api/expenses/prediction
// @access  Private
const predictNextMonthExpense = asyncHandler(async (req, res) => {
      // Aggregate expenses by month for the user
      const stats = await Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                  $group: {
                        _id: {
                              year: { $year: "$date" },
                              month: { $month: "$date" }
                        },
                        total: { $sum: "$amount" }
                  }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      const monthlyTotals = stats.map(s => s.total);

      if (monthlyTotals.length === 0) {
            return res.status(200).json({ predicted_expense: 0, message: "No historical data found" });
      }

      try {
            // Call Python ML Service
            const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
            const response = await axios.post(`${ML_SERVICE_URL}/predict_next_month`, {
                  monthly_totals: monthlyTotals
            });

            res.status(200).json(response.data);
      } catch (error) {
            const isConnectionError = error.code === 'ECONNREFUSED' || (error.message && error.message.includes('ECONNREFUSED'));
            if (!isConnectionError) {
                  console.error("ML Service Error:", error.message);
            }
            res.status(200).json({ predicted_expense: 0, error: "ML Service Unavailable", offlineMode: true });
      }
});

// @desc    Get advanced financial insights (Behavior, EMI Impact, Risk)
// @route   GET /api/expenses/insights
// @access  Private
const getFinancialInsights = asyncHandler(async (req, res) => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // 1. Get Category Distribution for current month
      const categoryDistribution = await Expense.aggregate([
            {
                  $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),
                        $expr: {
                              $and: [
                                    { $eq: [{ $month: "$date" }, currentMonth] },
                                    { $eq: [{ $year: "$date" }, currentYear] }
                              ]
                        }
                  }
            },
            { $group: { _id: "$category", total: { $sum: "$amount" } } }
      ]);

      const catDistMap = {};
      categoryDistribution.forEach(c => { catDistMap[c._id] = c.total; });

      // 2. Get Upcoming EMIs (unpaid reminders of type EMI/Bill)
      const upcomingReminders = await Reminder.find({
            user: req.user.id,
            isPaid: false,
            category: { $in: ['EMI', 'Bill'] }
      });
      const totalUpcomingEMIs = upcomingReminders.reduce((acc, r) => acc + r.amount, 0);

      // 3. Get Monthly Totals for Prediction
      const stats = await Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
            {
                  $group: {
                        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                        total: { $sum: "$amount" }
                  }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
      const monthlyTotals = stats.map(s => s.total);

      // 4. Get Total Budget
      const budgets = await Budget.find({ user: req.user.id, month: currentMonth, year: currentYear });
      const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);

      try {
            // Call ML Service for Prediction, Behavior, and Personality
            const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
            const [predRes, behaviorRes, personalityRes] = await Promise.all([
                  axios.post(`${ML_SERVICE_URL}/predict_next_month`, { monthly_totals: monthlyTotals }),
                  axios.post(`${ML_SERVICE_URL}/analyze_behavior`, { category_distribution: catDistMap }),
                  axios.post(`${ML_SERVICE_URL}/analyze_personality`, {
                        category_distribution: catDistMap,
                        total_spend: monthlyTotals.length > 0 ? monthlyTotals[monthlyTotals.length - 1] : 0,
                        month_count: monthlyTotals.length
                  })
            ]);

            const predictedSpend = predRes.data.predicted_expense || 0;
            const behavior = behaviorRes.data;
            const personality = personalityRes.data;

            // 5. Calculate Risk Level
            let riskLevel = "Low";
            let riskScore = 0;
            if (totalBudget > 0) {
                  riskScore = ((predictedSpend + totalUpcomingEMIs) / totalBudget) * 100;
                  if (riskScore > 90) riskLevel = "High";
                  else if (riskScore > 70) riskLevel = "Medium";
            } else if (predictedSpend + totalUpcomingEMIs > 0) {
                  riskLevel = "Medium";
            }

            // 6. EMI Impact Analysis
            const emiImpact = predictedSpend > 0 ? (totalUpcomingEMIs / (predictedSpend + totalUpcomingEMIs)) * 100 : 0;

            // 7. Calculate Budget Utilization
            let budgetUtilization = 0;
            let currentMonthSpend = 0;
            if (monthlyTotals.length > 0) {
                  currentMonthSpend = monthlyTotals[monthlyTotals.length - 1] || 0;
                  if (totalBudget > 0) {
                        budgetUtilization = ((currentMonthSpend / totalBudget) * 100).toFixed(1);
                  }
            }

            // 8. ELIm10 Mode (Explain Like I'm 10)
            const elim10 = {
                  summary: `Bro, you spent ₹${currentMonthSpend.toLocaleString()} this month.`,
                  comparison: `That's equal to ${Math.floor(currentMonthSpend / 400)} biryanis 🍗 or ${Math.floor(currentMonthSpend / 10)} cups of chai ☕.`,
                  spendingLevel: currentMonthSpend > totalBudget && totalBudget > 0 ? "You're spending like a king, but your wallet is crying. 😭" : "You're doing great! Keep it up. 🚀"
            };

            // 9. Micro-Habits
            const microHabits = [];
            if (catDistMap['Chai/Sutta'] > 500) microHabits.push("Skip one chai-sutta break every 2 days → save ₹150/month. ☕");
            if (catDistMap['Food'] > totalBudget * 0.4) microHabits.push("Cook twice this week instead of ordering → save ₹300. 👨‍🍳");
            if (catDistMap['Entertainment'] > 1000) microHabits.push("Review your OTT subscriptions. Do you really need all of them? 🎬");
            if (microHabits.length === 0) microHabits.push("You're a master of micro-habits! Try setting a small savings goal. 🎯");

            res.status(200).json({
                  prediction: predictedSpend,
                  behavior: behavior.behavior || "Unknown",
                  behaviorTags: behavior.tags || [],
                  stableP: behavior.stable_p || 0,
                  variableP: behavior.variable_p || 0,
                  emiImpact: emiImpact.toFixed(1),
                  totalUpcomingEMIs,
                  riskLevel,
                  riskScore: riskScore.toFixed(1),
                  budgetUtilization,
                  elim10,
                  personality,
                  microHabits
            });

      } catch (error) {
            // Suppress connection refused errors from ML service
            const isConnectionError = error.code === 'ECONNREFUSED' || (error.message && error.message.includes('ECONNREFUSED'));
            if (!isConnectionError) {
                  console.error("ML Insights Error:", error.message);
            }

            // Calculate manual fallback values
            let currentMonthSpend = 0;
            if (monthlyTotals.length > 0) {
                  // Check if the last entry is actually for the current month/year
                  const lastEntry = stats[stats.length - 1];
                  if (lastEntry._id.month === currentMonth && lastEntry._id.year === currentYear) {
                        currentMonthSpend = lastEntry.total;
                  }
            }

            // Manual Risk Calculation
            let riskLevel = "Low";
            let riskScore = 0;
            const projectedSpend = currentMonthSpend + totalUpcomingEMIs; // Simple fallback projection (just what we know)

            if (totalBudget > 0) {
                  riskScore = (projectedSpend / totalBudget) * 100;
                  if (riskScore > 90) riskLevel = "High";
                  else if (riskScore > 70) riskLevel = "Medium";
            } else if (projectedSpend > 0) {
                  // If no budget set but spending exists, default to Medium as a warning
                  riskLevel = "Medium";
            }

            let budgetUtilization = 0;
            if (totalBudget > 0) {
                  budgetUtilization = ((currentMonthSpend / totalBudget) * 100).toFixed(1);
            }

            // Fallback response
            res.status(200).json({
                  prediction: currentMonthSpend, // Show at least what they've spent
                  behavior: "Analysis Unavailable",
                  behaviorTags: ["Service Offline"],
                  stableP: 0,
                  variableP: 0,
                  emiImpact: currentMonthSpend > 0 ? ((totalUpcomingEMIs / (currentMonthSpend + totalUpcomingEMIs)) * 100).toFixed(1) : "0.0",
                  totalUpcomingEMIs,
                  riskLevel,
                  riskScore: riskScore.toFixed(1),
                  budgetUtilization,
                  mlServiceRunning: false,
                  error: "ML Service Unavailable",
                  elim10: {
                        summary: "ML Brain is sleeping 😴",
                        comparison: `You've spent ₹${currentMonthSpend.toLocaleString()} so far.`,
                        spendingLevel: riskLevel === 'High' ? "Slow down! You're burning through cash. 🔥" : "You're doing okay manually!"
                  },
                  personality: {
                        personality: "Offline 🕵️",
                        description: "AI is unavailable, but your manual tracking is solid.",
                        advice: "Keep an eye on that budget!"
                  },
                  microHabits: ["Check your subscriptions this week."]
            });
      }
});

module.exports = {
      getExpenses,
      createExpense,
      deleteExpense,
      predictCategory,
      predictNextMonthExpense,
      getFinancialInsights
};
