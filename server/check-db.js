const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'pos.db');
const db = new sqlite3.Database(dbPath);

db.serialize(function() {
    console.log('📁 Database:', dbPath);
    console.log('='.repeat(40));
    
    // Barcha jadvallarni ko'rish
    db.all("SELECT name FROM sqlite_master WHERE type='table'", function(err, tables) {
        if (err) {
            console.error('❌ Xatolik:', err);
            return;
        }
        console.log('📋 Jadvallar:');
        tables.forEach(function(t) {
            console.log('  - ' + t.name);
        });
        console.log('='.repeat(40));
        
        // Shifts jadvalidagi ma'lumotlar
        db.all('SELECT * FROM shifts', function(err2, rows) {
            if (err2) {
                console.error('❌ Shifts xatosi:', err2);
                return;
            }
            console.log('📊 Shifts ma\'lumotlari:', rows.length + ' ta');
            if (rows.length > 0) {
                console.log(rows);
            }
            db.close();
        });
    });
});
