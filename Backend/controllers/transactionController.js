const { getDb } = require("../config/db");

const getTransactions = async (req, res) => {
  try {
    let { page = 1, limit = 10, startDate, endDate, type, category } = req.query;
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const db = getDb();

    // Base query
    let query = "SELECT * FROM transactions WHERE user_id = ?";
    const params = [req.user.userId];

    // Apply filters
    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    // Append ORDER BY / LIMIT / OFFSET (no placeholders for LIMIT/OFFSET)
    query += ` ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`;

    // Fetch transactions
    const [transactions] = await db.execute(query, params);

    // Fetch total count (apply same filters, but without limit/offset)
    let countQuery = "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?";
    const countParams = [req.user.userId];

    if (startDate && endDate) {
      countQuery += " AND date BETWEEN ? AND ?";
      countParams.push(startDate, endDate);
    }
    if (type) {
      countQuery += " AND type = ?";
      countParams.push(type);
    }
    if (category) {
      countQuery += " AND category = ?";
      countParams.push(category);
    }

    const [countRes] = await db.execute(countQuery, countParams);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total: countRes[0].total,
        totalPages: Math.ceil(countRes[0].total / limit),
      },
    });
  } catch (err) {
    console.error("getTransactions error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const receiptPath = req.file ? req.file.path : null;

    const db = getDb();

    const [result] = await db.execute(
      "INSERT INTO transactions (user_id, type, amount, category, description, date, receipt_path) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.userId, type, amount, category, description, date, receiptPath]
    );

    res.status(201).json({ id: result.insertId, type, amount, category, description, date, receiptPath });
  } catch (err) {
    console.error("getTransactions error:", err); // <-- print actual error
    res.status(500).json({ error: "Server error" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    const db = getDb();

    const [result] = await db.execute(
      "UPDATE transactions SET type=?, amount=?, category=?, description=?, date=? WHERE id=? AND user_id=?",
      [type, amount, category, description, date, id, req.user.userId]
    );

    if (!result.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Transaction updated" });
  } catch (err) {
    console.error("getTransactions error:", err); // <-- print actual error
    res.status(500).json({ error: "Server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = getDb();

    const [result] = await db.execute(
      "DELETE FROM transactions WHERE id=? AND user_id=?",
      [id, req.user.userId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error("getTransactions error:", err); // <-- print actual error
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {getTransactions,createTransaction,updateTransaction,deleteTransaction};
