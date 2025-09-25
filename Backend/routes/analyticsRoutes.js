const express = require('express');
const router = express.Router();
const { getSummary, getByCategory, getByDate } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Analytics endpoints
router.get('/summary', authenticateToken, getSummary);
router.get('/by-category', authenticateToken, getByCategory);
router.get('/by-date', authenticateToken, getByDate);

module.exports = router;
