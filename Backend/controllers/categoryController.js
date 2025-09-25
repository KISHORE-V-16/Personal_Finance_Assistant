const { getDb } = require("../config/db");

const getCategories = async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.execute("SELECT DISTINCT type,name FROM categories ORDER BY name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {getCategories};