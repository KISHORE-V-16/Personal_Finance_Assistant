async function createTables(db) {
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
  
      await db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type ENUM('income', 'expense') NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          receipt_path VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
  
      await db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type ENUM('income', 'expense') NOT NULL,
          color VARCHAR(7) DEFAULT '#007bff'
        )
      `);
  
      const defaultCategories = [
        ['Food & Dining', 'expense', '#ff6384'],
        ['Transportation', 'expense', '#36a2eb'],
        ['Shopping', 'expense', '#cc65fe'],
        ['Entertainment', 'expense', '#ffce56'],
        ['Bills & Utilities', 'expense', '#ff9f40'],
        ['Healthcare', 'expense', '#4bc0c0'],
        ['Education', 'expense', '#9966ff'],
        ['Travel', 'expense', '#ff6384'],
        ['Salary', 'income', '#4caf50'],
        ['Freelance', 'income', '#8bc34a'],
        ['Investment', 'income', '#cddc39'],
        ['Other Income', 'income', '#ffeb3b']
      ];
  
      for (const [name, type, color] of defaultCategories) {
        await db.execute(
          'INSERT IGNORE INTO categories (name, type, color) VALUES (?, ?, ?)',
          [name, type, color]
        );
      }
  
      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
    }
  }
  
  module.exports = { createTables };
  