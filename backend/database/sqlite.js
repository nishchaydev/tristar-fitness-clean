const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class SQLiteDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, 'tristar_fitness.db');
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.initializeTables()
                        .then(() => this.insertDemoData())
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    async initializeTables() {
        return new Promise((resolve, reject) => {
            const tables = [
                // Users table
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('owner', 'manager')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                
                // Members table
                `CREATE TABLE IF NOT EXISTS members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    phone TEXT NOT NULL,
                    membership_type TEXT NOT NULL CHECK(membership_type IN ('monthly', 'quarterly', 'annual')),
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'expired')),
                    trainer TEXT,
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                
                // Invoices table
                `CREATE TABLE IF NOT EXISTS invoices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    member_id INTEGER NOT NULL,
                    member_name TEXT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    description TEXT NOT NULL,
                    due_date DATE NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('pending', 'paid', 'overdue')),
                    items TEXT,
                    subtotal DECIMAL(10,2),
                    tax DECIMAL(10,2),
                    total DECIMAL(10,2),
                    membership_start_date DATE,
                    membership_end_date DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (member_id) REFERENCES members (id)
                )`,
                
                // Check-ins table
                `CREATE TABLE IF NOT EXISTS check_ins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    member_id INTEGER NOT NULL,
                    member_name TEXT NOT NULL,
                    check_in_time DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (member_id) REFERENCES members (id)
                )`,
                
                // Follow-ups table
                `CREATE TABLE IF NOT EXISTS follow_ups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    member_id INTEGER NOT NULL,
                    member_name TEXT NOT NULL,
                    type TEXT NOT NULL CHECK(type IN ('payment_reminder', 'membership_renewal', 'visit_reminder')),
                    due_date DATE NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled')),
                    notes TEXT,
                    completed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (member_id) REFERENCES members (id)
                )`,
                
                // Activities table
                `CREATE TABLE IF NOT EXISTS activities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    action TEXT NOT NULL,
                    name TEXT NOT NULL,
                    time DATETIME NOT NULL,
                    details TEXT,
                    member_id INTEGER,
                    invoice_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (member_id) REFERENCES members (id),
                    FOREIGN KEY (invoice_id) REFERENCES invoices (id)
                )`,
                
                // Visitors table
                `CREATE TABLE IF NOT EXISTS visitors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT,
                    visit_date DATE NOT NULL,
                    purpose TEXT,
                    notes TEXT,
                    follow_up_created BOOLEAN DEFAULT FALSE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`
            ];

            let completed = 0;
            tables.forEach((table, index) => {
                this.db.run(table, (err) => {
                    if (err) {
                        console.error(`Error creating table ${index + 1}:`, err.message);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === tables.length) {
                            console.log('Database tables initialized successfully');
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async insertDemoData() {
        return new Promise((resolve, reject) => {
            // Check if demo data already exists
            this.db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                if (err) {
                    console.error('Error checking demo data:', err.message);
                    reject(err);
                    return;
                }

                if (row.count === 0) {
                    console.log('Inserting demo data...');
                    
                    // Insert demo users
                    this.db.run(`
                        INSERT INTO users (username, password, name, role) VALUES 
                        ('owner@tristar.com', 'owner123', 'Nikhil Verma', 'owner'),
                        ('manager@tristar.com', 'manager123', 'Manager', 'manager')
                    `);

                    // Insert demo members
                    this.db.run(`
                        INSERT INTO members (name, email, phone, membership_type, start_date, end_date, status, trainer, notes) VALUES 
                        ('John Doe', 'john@example.com', '+1234567890', 'monthly', '2024-01-01', '2024-02-01', 'active', 'Trainer A', 'Regular member'),
                        ('Jane Smith', 'jane@example.com', '+1234567891', 'quarterly', '2024-01-15', '2024-04-15', 'active', 'Trainer B', 'Premium member'),
                        ('Mike Johnson', 'mike@example.com', '+1234567892', 'annual', '2024-01-01', '2025-01-01', 'active', 'Trainer A', 'Annual member')
                    `);

                    console.log('Demo data inserted successfully');
                } else {
                    console.log('Demo data already exists');
                }
                resolve();
            });
        });
    }

    // Method to get all members
    async getMembers() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM members", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Method to get all invoices
    async getInvoices() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM invoices", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Method to get all activities
    async getActivities() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM activities ORDER BY time DESC", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Method to close database
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = SQLiteDatabase;