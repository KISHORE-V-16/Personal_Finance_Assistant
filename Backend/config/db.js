// config/db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

let db; // shared connection

const initializeDatabase = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected successfully");
    return db;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

// expose a getter
const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
};

module.exports = { initializeDatabase, getDb };
