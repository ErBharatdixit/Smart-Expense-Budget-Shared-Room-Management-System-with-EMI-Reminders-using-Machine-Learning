const asyncHandler = require('express-async-handler');
const Room = require('../models/Room');
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');

// @desc    Get user's room (Assuming 1 room per user for simplicity)
// @route   GET /api/rooms/myroom
// @access  Private
const getMyRoom = asyncHandler(async (req, res) => {
      const room = await Room.findOne({ members: req.user.id })
            .populate('members', 'name email')
            .populate('expenses.paidBy', 'name');

      if (room) {
            // SHARED LIVING INTELLIGENCE
            const memberCount = room.members.length;
            const totalExpense = room.expenses.reduce((acc, e) => acc + e.amount, 0);
            const sharePerPerson = memberCount > 0 ? totalExpense / memberCount : 0;

            // 1. Fairness Score & Spending Power
            const memberStats = room.members.map(m => {
                  const paidByMe = room.expenses
                        .filter(e => e.paidBy._id.toString() === m._id.toString())
                        .reduce((acc, e) => acc + e.amount, 0);

                  // Fairness Score: 0 to 100. (Contribution / Share) * 50 capped at 100.
                  // Ideal is 50 (Balanced). > 50 means you are the 'Provider'. < 50 means you are 'Ower'.
                  const delta = paidByMe - sharePerPerson;
                  const fairnessScore = Math.max(0, Math.min(100, 50 + (delta / (sharePerPerson || 1)) * 50));

                  return {
                        memberId: m._id,
                        name: m.name,
                        paid: paidByMe,
                        fairnessScore: fairnessScore.toFixed(0),
                        status: delta >= 0 ? "Provider 👑" : "Settler ⚖️"
                  };
            });

            // 2. Who spends most often
            const frequency = {};
            room.expenses.forEach(e => {
                  const id = e.paidBy._id.toString();
                  frequency[id] = (frequency[id] || 0) + 1;
            });
            const topSpenderId = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a])[0];

            // 3. One-Tap Settlement Summary
            const netBalances = room.members.map(m => {
                  const paid = room.expenses
                        .filter(e => e.paidBy._id.toString() === m._id.toString())
                        .reduce((acc, e) => acc + e.amount, 0);
                  return { name: m.name, balance: paid - sharePerPerson };
            });

            // Simple settlement logic: Rahul pays Bharat
            const settlementSummary = [];
            const debtors = netBalances.filter(b => b.balance < -1).sort((a, b) => a.balance - b.balance);
            const creditors = netBalances.filter(b => b.balance > 1).sort((a, b) => b.balance - a.balance);

            let d = 0, c = 0;
            while (d < debtors.length && c < creditors.length) {
                  const amount = Math.min(Math.abs(debtors[d].balance), creditors[c].balance);
                  settlementSummary.push(`${debtors[d].name} ➡️ Pay ₹${amount.toFixed(0)} to ${creditors[c].name}`);
                  debtors[d].balance += amount;
                  creditors[c].balance -= amount;
                  if (Math.abs(debtors[d].balance) < 1) d++;
                  if (creditors[c].balance < 1) c++;
            }

            res.status(200).json({
                  ...room._doc,
                  intelligence: {
                        memberStats,
                        topSpender: room.members.find(m => m._id.toString() === topSpenderId)?.name || "N/A",
                        settlementSummary,
                        totalRoomExpense: totalExpense
                  }
            });
      } else {
            res.status(200).json(null);
      }
});

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
const createRoom = asyncHandler(async (req, res) => {
      const { name } = req.body;

      if (!name) {
            res.status(400);
            throw new Error('Please add a room name');
      }

      // Check if user is already in a room? For simplicity, let's allow creating one.
      // Ideally user should leave existing room first.

      // Generate a unique 6-character code
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();

      const room = await Room.create({
            name,
            code,
            createdBy: req.user.id,
            members: [req.user.id] // Creator is the first member
      });

      res.status(201).json(room);
});

// @desc    Join a room via code
// @route   POST /api/rooms/join
// @access  Private
const joinRoom = asyncHandler(async (req, res) => {
      const { code } = req.body;

      if (!code) {
            res.status(400);
            throw new Error('Please enter a room code');
      }

      const room = await Room.findOne({ code });

      if (!room) {
            res.status(404);
            throw new Error('Room not found');
      }

      // Check if already a member
      if (room.members.includes(req.user.id)) {
            res.status(400);
            throw new Error('You are already a member of this room');
      }

      room.members.push(req.user.id);
      await room.save();

      res.status(200).json(room);
});

// @desc    Add shared expense
// @route   POST /api/rooms/expenses
// @access  Private
const addSharedExpense = asyncHandler(async (req, res) => {
      const { description, amount } = req.body;

      // Find the room the user belongs to
      const room = await Room.findOne({ members: req.user.id });

      if (!room) {
            res.status(404);
            throw new Error('You are not in a room');
      }

      const expense = {
            description,
            amount: Number(amount),
            paidBy: req.user.id
      };

      room.expenses.push(expense);
      await room.save();

      // Return the updated room with populated fields for immediate UI update
      const updatedRoom = await Room.findById(room._id)
            .populate('members', 'name email')
            .populate('expenses.paidBy', 'name');

      res.status(200).json(updatedRoom);
});

// @desc    Predict room's next month total expense
// @route   GET /api/rooms/predict
// @access  Private
const predictRoomExpense = asyncHandler(async (req, res) => {
      const room = await Room.findOne({ members: req.user.id });

      if (!room) {
            res.status(404);
            throw new Error('You are not in a room');
      }

      // Aggregate room expenses by month
      const expenses = room.expenses || [];
      const monthlyTotals = {};

      expenses.forEach(e => {
            const date = new Date(e.date);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyTotals[key] = (monthlyTotals[key] || 0) + e.amount;
      });

      // Sort keys (months) and get values
      const sortedTotals = Object.keys(monthlyTotals)
            .sort()
            .map(key => monthlyTotals[key]);

      if (sortedTotals.length === 0) {
            return res.status(200).json({ predicted_expense: 0 });
      }

      try {
            const response = await axios.post('http://127.0.0.1:5001/predict_next_month', {
                  monthly_totals: sortedTotals
            });
            res.status(200).json(response.data);
      } catch (error) {
            console.error("ML Room Prediction Error:", error.message);
            res.status(200).json({
                  predicted_expense: sortedTotals.length > 0 ? sortedTotals[sortedTotals.length - 1] : 0,
                  error: "ML Service Unavailable",
                  offlineMode: true
            });
      }
});

module.exports = {
      getMyRoom,
      createRoom,
      joinRoom,
      addSharedExpense,
      predictRoomExpense
};
