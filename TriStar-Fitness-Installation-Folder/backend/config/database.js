const { db, initializeTables, insertDemoData } = require('./sqlite');

const connectDB = async () => {
    try {
        console.log('Connecting to SQLite database...');
        initializeTables();
        
        // Insert demo data after a short delay to ensure tables are created
        setTimeout(() => {
            insertDemoData();
        }, 1000);
        
        console.log('SQLite database connected successfully');
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB, db };