const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Protein {
  constructor() {
    this.dbPath = path.join(__dirname, '../database/tristar_fitness.db');
    this.db = new sqlite3.Database(this.dbPath);
    this.initTable();
  }

  initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS proteins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        base_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        quantity_in_stock INTEGER NOT NULL DEFAULT 0,
        units_sold INTEGER NOT NULL DEFAULT 0,
        supplier_name TEXT,
        expiry_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating proteins table:', err);
      } else {
        console.log('✅ Proteins table initialized');
      }
    });
  }

  // Get all protein products
  getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          *,
          (selling_price - base_price) as margin,
          ((selling_price - base_price) * units_sold) as profit
        FROM proteins 
        ORDER BY updated_at DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get protein by ID
  getById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          *,
          (selling_price - base_price) as margin,
          ((selling_price - base_price) * units_sold) as profit
        FROM proteins 
        WHERE id = ?
      `;
      
      this.db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Create new protein product
  create(productData) {
    return new Promise((resolve, reject) => {
      const { name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date } = productData;
      
      const query = `
        INSERT INTO proteins (name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...productData });
        }
      });
    });
  }

  // Update protein product
  update(id, productData) {
    return new Promise((resolve, reject) => {
      const { name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date } = productData;
      
      const query = `
        UPDATE proteins 
        SET name = ?, base_price = ?, selling_price = ?, quantity_in_stock = ?, 
            supplier_name = ?, expiry_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      this.db.run(query, [name, base_price, selling_price, quantity_in_stock, supplier_name, expiry_date, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...productData });
        }
      });
    });
  }

  // Record a sale (update units_sold and quantity_in_stock)
  recordSale(id, unitsSold) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE proteins 
        SET units_sold = units_sold + ?, 
            quantity_in_stock = quantity_in_stock - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND quantity_in_stock >= ?
      `;
      
      this.db.run(query, [unitsSold, unitsSold, id, unitsSold], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Insufficient stock or product not found'));
        } else {
          resolve({ id, unitsSold });
        }
      });
    });
  }

  // Delete protein product
  delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM proteins WHERE id = ?';
      
      this.db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: this.changes > 0 });
        }
      });
    });
  }

  // Get low stock products (stock < 5)
  getLowStock() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM proteins WHERE quantity_in_stock < 5 ORDER BY quantity_in_stock ASC';
      
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get products near expiry (≤30 days)
  getNearExpiry() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM proteins 
        WHERE expiry_date IS NOT NULL 
        AND date(expiry_date) <= date('now', '+30 days')
        AND date(expiry_date) > date('now')
        ORDER BY expiry_date ASC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get total protein revenue
  getTotalRevenue() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT SUM((selling_price - base_price) * units_sold) as total_profit,
               SUM(selling_price * units_sold) as total_revenue
        FROM proteins
      `;
      
      this.db.get(query, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            total_profit: row.total_profit || 0,
            total_revenue: row.total_revenue || 0
          });
        }
      });
    });
  }

  // Close database connection
  close() {
    this.db.close();
  }
}

module.exports = Protein;
