const express = require('express');
const router = express.Router();

// ===== Barcha xodimlar =====
router.get('/', (req, res) => {
    const db = req.app.get('db');
    
    db.all('SELECT * FROM employees WHERE isActive = 1 ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, data: rows });
        }
    });
});

// ===== Xodim qo'shish =====
router.post('/', (req, res) => {
    const db = req.app.get('db');
    const { name, phone, position, salary } = req.body;
    
    db.run(
        `INSERT INTO employees (name, phone, position, salary) VALUES (?, ?, ?, ?)`,
        [name, phone || '', position || 'sotuvchi', salary || 0],
        function(err) {
            if (err) {
                res.status(500).json({ success: false, message: err.message });
            } else {
                res.status(201).json({
                    success: true,
                    data: { id: this.lastID, name, phone, position },
                    message: '✅ Xodim qo\'shildi!'
                });
            }
        }
    );
});

// ===== Xodimni yangilash =====
router.put('/:id', (req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    const { name, phone, position, salary } = req.body;
    
    db.run(
        `UPDATE employees SET name=?, phone=?, position=?, salary=? WHERE id=?`,
        [name, phone || '', position || 'sotuvchi', salary || 0, id],
        function(err) {
            if (err) {
                res.status(500).json({ success: false, message: err.message });
            } else {
                res.json({ success: true, message: '✅ Xodim yangilandi!' });
            }
        }
    );
});

// ===== Xodimni o'chirish =====
router.delete('/:id', (req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    
    db.run('UPDATE employees SET isActive = 0 WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, message: '🗑️ Xodim o\'chirildi!' });
        }
    });
});

// ===== Check-in =====
router.post('/:id/check-in', (req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    
    db.run('UPDATE employees SET checkInTime = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, message: '✅ Ishga kelgan vaqti belgilandi!' });
        }
    });
});

module.exports = router;