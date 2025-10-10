const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function syncSectionToJSON(db, section) {
    try {
        const dataDir = path.resolve(__dirname, '../data');
        ensureDir(dataDir);
        let rows = [];
        let outFile = '';

        if (section === 'members') {
            outFile = path.join(dataDir, 'members.json');
            rows = await new Promise((resolve, reject) => {
                db.all("SELECT id, name, email, phone, membership_type as membershipType, start_date as startDate, end_date as endDate, status FROM members", (err, rs) => {
                    if (err) reject(err); else resolve(rs);
                });
            });
        } else if (section === 'invoices') {
            outFile = path.join(dataDir, 'invoices.json');
            rows = await new Promise((resolve, reject) => {
                db.all("SELECT id, member_id as memberId, member_name as memberName, amount, description, due_date as dueDate, status, items, subtotal, total, membership_start_date as membershipStartDate, membership_end_date as membershipEndDate, created_at as createdAt, updated_at as updatedAt FROM invoices", (err, rs) => {
                    if (err) reject(err); else resolve(rs);
                });
            });
        } else if (section === 'followups') {
            outFile = path.join(dataDir, 'followups.json');
            rows = await new Promise((resolve, reject) => {
                db.all("SELECT id, member_id as memberId, member_name as memberName, type, due_date as dueDate, status, notes, completed_at as completedAt, created_at as createdAt, updated_at as updatedAt FROM follow_ups", (err, rs) => {
                    if (err) reject(err); else resolve(rs);
                });
            });
        } else if (section === 'proteins') {
            outFile = path.join(dataDir, 'proteins.json');
            rows = await new Promise((resolve, reject) => {
                db.all("SELECT id, name, base_price as basePrice, selling_price as sellingPrice, quantity_in_stock as quantityInStock, units_sold as unitsSold, supplier_name as supplierName, expiry_date as expiryDate, created_at as createdAt, updated_at as updatedAt FROM proteins", (err, rs) => {
                    if (err) reject(err); else resolve(rs);
                });
            });
        } else if (section === 'all') {
            await Promise.all([
                syncSectionToJSON(db, 'members'),
                syncSectionToJSON(db, 'invoices'),
                syncSectionToJSON(db, 'followups'),
                syncSectionToJSON(db, 'proteins'),
            ]);
            return { success: true };
        } else {
            throw new Error('Unknown section: ' + section);
        }

        const payload = { lastSynced: new Date().toISOString(), data: rows };
        fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
        return { success: true, file: outFile };
    } catch (err) {
        console.error('syncSectionToJSON error:', err.message);
        return { success: false, error: err.message };
    }
}

function writeSectionJSON(section, rows) {
    const dataDir = path.resolve(__dirname, '../data');
    ensureDir(dataDir);
    const outFile = path.join(dataDir, `${section}.json`);
    const payload = { lastSynced: new Date().toISOString(), data: rows };
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
    return { success: true, file: outFile };
}

module.exports = { syncSectionToJSON, writeSectionJSON };


