const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const { authenticateToken, upload } = require('../middleware/authMiddleware');

// Transactions CRUD
router.get('/', authenticateToken, getTransactions);
router.post('/', authenticateToken, upload.single('receipt'), createTransaction);
router.put('/:id', authenticateToken, updateTransaction);
router.delete('/:id', authenticateToken, deleteTransaction);

module.exports = router;
