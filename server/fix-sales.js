const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'pos.db');
const db = new sqlite3.Database(dbPath);

// 1. cashierName ustunini qo'shish
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
    
    // 2. Jadval ustunlarini ko'rsatish
    db.all("PRAGMA table_info(sales)", function(err2, columns) {
        if (err2) {
            console.error('❌ Jadval ma\'lumotlari xatosi:', err2);
            db.close();
            return;
        }
        console.log('\n📋 Sales jadvali ustunlari:');
        columns.forEach(function(col) {
            console.log('  - ' + col.name + ' (' + col.type + ')');
        });
        db.close();
    });
});