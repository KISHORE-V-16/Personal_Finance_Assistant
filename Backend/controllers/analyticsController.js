// controllers/analyticsController.js
const { getDb } = require("../config/db");

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = getDb();

    let query = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ?
    `;
    const params = [req.user.userId];

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query += " GROUP BY type";

    const [results] = await db.execute(query, params);

    const summary = {
      income: 0,
      expenses: 0,
      incomeCount: 0,
      expenseCount: 0,
    };

    results.forEach((row) => {
      if (row.type === "income") {
        summary.income = parseFloat(row.total);
        summary.incomeCount = row.count;
      } else {
        summary.expenses = parseFloat(row.total);
        summary.expenseCount = row.count;
      }
    });

    summary.balance = summary.income - summary.expenses;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/analytics/by-category
const getByCategory = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const db = getDb();

    let query = `
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ?
    `;
    const params = [req.user.userId];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query += " GROUP BY category ORDER BY total DESC";

    const [results] = await db.execute(query, params);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/analytics/by-date
const getByDate = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const db = getDb();
    
    let query = `
      SELECT 
        DATE(date) as date,
        SUM(amount) as total
      FROM transactions 
      WHERE user_id = ?
    `;
    const params = [req.user.userId];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query += " GROUP BY DATE(date) ORDER BY date ASC";

    const [results] = await db.execute(query, params);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getSummary, getByCategory, getByDate };
