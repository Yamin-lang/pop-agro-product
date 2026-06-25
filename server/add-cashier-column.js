const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'pos.db');
const db = new sqlite3.Database(dbPath);

// cashierName ustunini qo'shish
db.run("ALTER TABLE sales ADD COLUMN cashierName TEXT DEFAULT 'Admin'", function(err) {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('✅ cashierName ustuni allaqachon mavjud');
        } else {
            console.error('❌ Xatolik:', err.message);
        }
    } else {
        console.log('✅ cashierName ustuni qo\'shildi!');
    }
    db.close();
});