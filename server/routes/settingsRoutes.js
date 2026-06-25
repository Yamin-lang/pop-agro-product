const express = require('express');
const router = express.Router();

// ===== Sozlamalarni olish =====
router.get('/', (req, res) => {
    const db = req.app.get('db');
    
    db.get('SELECT * FROM settings LIMIT 1', [], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else if (!row) {
            // Default sozlamalar
            db.run(
                `INSERT INTO settings (shopName, shopPhone, currency, printerType, paperSize)
                 VALUES (?, ?, ?, ?, ?)`,
                ['Pop-agro-product', '+998777272113', 'UZS', 'xprinter', '80mm'],
                function() {
                    db.get('SELECT * FROM settings WHERE id = ?', [this.lastID], (err2, newRow) => {
                        res.json({ success: true, data: newRow });
                    });
                }
            );
        } else {
            res.json({ success: true, data: row });
        }
    });
});

// ===== Sozlamalarni yangilash =====
router.put('/', (req, res) => {
    const db = req.app.get('db');
    const { shopName, shopAddress, shopPhone, currency, printerType, paperSize, lowStockAlert } = req.body;
    
    db.get('SELECT * FROM settings LIMIT 1', [], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
            return;
        }
        
        if (!row) {
            db.run(
                `INSERT INTO settings (shopName, shopAddress, shopPhone, currency, printerType, paperSize, lowStockAlert)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [shopName || 'Pop-agro-product', shopAddress || '', shopPhone || '+998777272113',
                 currency || 'UZS', printerType || 'xprinter', paperSize || '80mm', lowStockAlert || 5],
                function() {
                    res.json({ success: true, message: '✅ Sozlamalar saqlandi!' });
                }
            );
        } else {
            db.run(
                `UPDATE settings SET shopName=?, shopAddress=?, shopPhone=?, currency=?,
                 printerType=?, paperSize=?, lowStockAlert=?, updatedAt=CURRENT_TIMESTAMP
                 WHERE id=?`,
                [shopName || 'Pop-agro-product', shopAddress || '', shopPhone || '+998777272113',
                 currency || 'UZS', printerType || 'xprinter', paperSize || '80mm', lowStockAlert || 5, row.id],
                function(err2) {
                    if (err2) {
                        res.status(500).json({ success: false, message: err2.message });
                    } else {
                        res.json({ success: true, message: '✅ Sozlamalar saqlandi!' });
                    }
                }
            );
        }
    });
});

module.exports = router;