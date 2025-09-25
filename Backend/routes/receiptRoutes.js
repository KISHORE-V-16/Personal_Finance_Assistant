const express = require('express');
const router = express.Router();
const { processReceipt } = require('../controllers/receiptController');
const { authenticateToken, upload } = require('../middleware/authMiddleware');

// Receipt OCR / PDF parsing
router.post('/', authenticateToken, upload.single('receipt'), processReceipt);

module.exports = router;
