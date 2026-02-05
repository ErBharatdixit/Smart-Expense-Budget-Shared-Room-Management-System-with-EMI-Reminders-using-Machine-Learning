const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, getChatResponse);

module.exports = router;
