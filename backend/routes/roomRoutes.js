const express = require('express');
const router = express.Router();
const { getMyRoom, createRoom, joinRoom, addSharedExpense, predictRoomExpense } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/myroom', protect, getMyRoom);
router.get('/predict', protect, predictRoomExpense);
router.post('/', protect, createRoom);
router.post('/join', protect, joinRoom);
router.post('/expenses', protect, addSharedExpense);

module.exports = router;
