const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = this.getDatabasePath();
    this.ensureDataDirectory();
  }

  getDatabasePath() {
    const appName = 'TriStarFitness';
    let dataDir;
    
    if (process.platform === 'win32') {
      dataDir = path.join(os.homedir(), 'AppData', 'Local', appName, 'data');
    } else if (process.platform === 'darwin') {
      dataDir = path.join(os.homedir(), '.tristarfitness', 'data');
    } else {
      dataDir = path.join(os.homedir(), '.tristarfitness', 'data');
    }
    
    return path.join(dataDir, 'tristar.db');
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
          console.log('✅ Database connected:', this.dbPath);
          this.createTables()
            .then(() => this.insertDefaultData())
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const tables = [
        // Members table
        `CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          membership_type TEXT NOT NULL CHECK(membership_type IN ('monthly', 'quarterly', 'annual')),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'expired')),
          trainer TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Visitors table
        `CREATE TABLE IF NOT EXISTS visitors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          date DATE NOT NULL,
          purpose TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Payments table
        `CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          date DATE NOT NULL,
          method TEXT NOT NULL CHECK(method IN ('cash', 'card', 'online', 'cheque')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members (id)
        )`,
        
        // Invoices table
        `CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id INTEGER NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          invoice_date DATE NOT NULL,
          due_date DATE NOT NULL,
          status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'overdue')),
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members (id)
        )`,
        
        // Admins/Managers table
        `CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('admin', 'manager')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      let completed = 0;
      tables.forEach((table, index) => {
        this.db.run(table, (err) => {
          if (err) {
            console.error(`Error creating table ${index + 1}:`, err);
            reject(err);
          } else {
            completed++;
            if (completed === tables.length) {
              console.log('✅ Database tables created successfully');
              resolve();
            }
          }
        });
      });
    });
  }

  async insertDefaultData() {
    return new Promise((resolve, reject) => {
      // Check if admin exists
      this.db.get("SELECT COUNT(*) as count FROM admins", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          // Insert default admin
          this.db.run(`
            INSERT INTO admins (name, username, password, role) VALUES 
            ('Admin', 'admin', 'admin123', 'admin'),
            ('Manager', 'manager', 'manager123', 'manager')
          `, (err) => {
            if (err) {
              console.error('Error inserting default admin:', err);
            } else {
              console.log('✅ Default admin created');
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  // CRUD Operations for Members
  async getMembers() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM members ORDER BY created_at DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async addMember(member) {
    return new Promise((resolve, reject) => {
      const { name, phone, email, membership_type, start_date, end_date, trainer, notes } = member;
      this.db.run(`
        INSERT INTO members (name, phone, email, membership_type, start_date, end_date, status, trainer, notes)
        VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
      `, [name, phone, email, membership_type, start_date, end_date, trainer, notes], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...member });
      });
    });
  }

  async updateMember(id, member) {
    return new Promise((resolve, reject) => {
      const { name, phone, email, membership_type, start_date, end_date, status, trainer, notes } = member;
      this.db.run(`
        UPDATE members 
        SET name = ?, phone = ?, email = ?, membership_type = ?, start_date = ?, end_date = ?, status = ?, trainer = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, phone, email, membership_type, start_date, end_date, status, trainer, notes, id], function(err) {
        if (err) reject(err);
        else resolve({ id, ...member });
      });
    });
  }

  async deleteMember(id) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM members WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve({ id });
      });
    });
  }

  // CRUD Operations for Visitors
  async getVisitors() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM visitors ORDER BY date DESC", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async addVisitor(visitor) {
    return new Promise((resolve, reject) => {
      const { name, phone, email, date, purpose, notes } = visitor;
      this.db.run(`
        INSERT INTO visitors (name, phone, email, date, purpose, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, phone, email, date, purpose, notes], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...visitor });
      });
    });
  }

  // CRUD Operations for Payments
  async getPayments() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT p.*, m.name as member_name 
        FROM payments p 
        JOIN members m ON p.member_id = m.id 
        ORDER BY p.date DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async addPayment(payment) {
    return new Promise((resolve, reject) => {
      const { member_id, amount, date, method, notes } = payment;
      this.db.run(`
        INSERT INTO payments (member_id, amount, date, method, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [member_id, amount, date, method, notes], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...payment });
      });
    });
  }

  // CRUD Operations for Invoices
  async getInvoices() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT i.*, m.name as member_name 
        FROM invoices i 
        JOIN members m ON i.member_id = m.id 
        ORDER BY i.invoice_date DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async addInvoice(invoice) {
    return new Promise((resolve, reject) => {
      const { member_id, amount, invoice_date, due_date, status, description } = invoice;
      this.db.run(`
        INSERT INTO invoices (member_id, amount, invoice_date, due_date, status, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [member_id, amount, invoice_date, due_date, status, description], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...invoice });
      });
    });
  }

  // Analytics
  async getAnalytics() {
    return new Promise((resolve, reject) => {
      const analytics = {};
      
      // Get member stats
      this.db.get("SELECT COUNT(*) as total FROM members", (err, memberCount) => {
        if (err) { reject(err); return; }
        analytics.members = { total: memberCount.total };
        
        this.db.get("SELECT COUNT(*) as active FROM members WHERE status = 'active'", (err, activeCount) => {
          if (err) { reject(err); return; }
          analytics.members.active = activeCount.active;
          
          // Get revenue stats
          this.db.get("SELECT SUM(amount) as total FROM payments", (err, revenue) => {
            if (err) { reject(err); return; }
            analytics.revenue = { total: revenue.total || 0 };
            
            resolve(analytics);
          });
        });
      });
    });
  }

  // Export functions
  async exportDatabase() {
    return new Promise((resolve, reject) => {
      const exportPath = path.join(path.dirname(this.dbPath), `tristar_backup_${Date.now()}.db`);
      fs.copyFile(this.dbPath, exportPath, (err) => {
        if (err) reject(err);
        else resolve(exportPath);
      });
    });
  }

  async exportCSV(table) {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (rows.length === 0) {
          resolve('');
          return;
        }
        
        // Convert to CSV
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map(row => 
          Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(',')
        );
        
        const csv = [headers, ...csvRows].join('\n');
        resolve(csv);
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = Database;
