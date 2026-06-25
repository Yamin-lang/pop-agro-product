const express = require('express');
const router = express.Router();

// ===== JORIY SMENA HOLATI =====
router.get('/current', function(req, res) {
    var db = req.app.get('db');
    var cashierId = 1;
    
    db.get('SELECT * FROM shifts WHERE cashier_id = ? AND status = "open"', [cashierId], function(err, row) {
        if (err) {
            console.error('❌ GET /shifts/current xatosi:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ 
            success: true, 
            data: row || null 
        });
    });
});

// ===== SMENA OCHISH =====
router.post('/open', function(req, res) {
    var db = req.app.get('db');
    var cashierId = 1;
    var openingBalance = parseFloat(req.body.openingBalance) || 0;
    
    console.log('📤 POST /shifts/open so\'rovi...');
    console.log('  Cashier:', cashierId);
    console.log('  Opening Balance:', openingBalance);
    
    db.get('SELECT * FROM shifts WHERE cashier_id = ? AND status = "open"', [cashierId], function(err, row) {
        if (err) {
            console.error('❌ DB xatosi:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (row) {
            return res.status(400).json({ 
                success: false, 
                message: '❌ Sizda allaqachon ochiq smena mavjud!',
                data: row
            });
        }
        
        db.run(
            'INSERT INTO shifts (cashier_id, openingBalance, openingTime, status) VALUES (?, ?, CURRENT_TIMESTAMP, "open")',
            [cashierId, openingBalance],
            function(err2) {
                if (err2) {
                    console.error('❌ INSERT xatosi:', err2);
                    return res.status(500).json({ success: false, message: err2.message });
                }
                
                db.get('SELECT * FROM shifts WHERE id = ?', [this.lastID], function(err3, shift) {
                    if (err3) {
                        console.error('❌ GET /shifts xatosi:', err3);
                        return res.status(500).json({ success: false, message: err3.message });
                    }
                    res.status(201).json({
                        success: true,
                        message: '🔓 Smena muvaffaqiyatli ochildi!',
                        data: shift
                    });
                });
            }
        );
    });
});

// ===== SMENA YOPISH =====
router.post('/close', function(req, res) {
    var db = req.app.get('db');
    var cashierId = 1;
    var closingBalance = parseFloat(req.body.closingBalance) || 0;
    
    console.log('📤 POST /shifts/close so\'rovi...');
    console.log('  Cashier:', cashierId);
    console.log('  Closing Balance:', closingBalance);
    
    db.get('SELECT * FROM shifts WHERE cashier_id = ? AND status = "open"', [cashierId], function(err, shift) {
        if (err) {
            console.error('❌ DB xatosi:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!shift) {
            return res.status(404).json({ 
                success: false, 
                message: '❌ Ochiq smena topilmadi!' 
            });
        }
        
        console.log('📊 Smena topildi ID:', shift.id);
        
        db.all('SELECT * FROM sales WHERE shift_id = ? AND status = "completed"', [shift.id], function(err2, sales) {
            if (err2) {
                console.error('❌ Sales xatosi:', err2);
                return res.status(500).json({ success: false, message: err2.message });
            }
            
            console.log('📊 Savdolar soni:', sales.length);
            
            var totalSales = 0;
            var totalCash = 0;
            var totalCard = 0;
            var totalClick = 0;
            var totalCredit = 0;
            
            sales.forEach(function(sale) {
                totalSales += sale.total;
                if (sale.paymentMethod === 'naxt') totalCash += sale.total;
                else if (sale.paymentMethod === 'karta') totalCard += sale.total;
                else if (sale.paymentMethod === 'clik') totalClick += sale.total;
                else if (sale.paymentMethod === 'nasiya') totalCredit += sale.total;
            });
            
            console.log('📊 Hisobot:');
            console.log('  Jami:', totalSales);
            console.log('  Naxt:', totalCash);
            console.log('  Karta:', totalCard);
            console.log('  Clik:', totalClick);
            console.log('  Nasiya:', totalCredit);
            
            db.run(
                `UPDATE shifts SET 
                    status = "closed", 
                    closingTime = CURRENT_TIMESTAMP,
                    closingBalance = ?,
                    totalSales = ?,
                    totalCash = ?,
                    totalCard = ?,
                    totalClick = ?,
                    totalCredit = ?
                 WHERE id = ?`,
                [closingBalance, totalSales, totalCash, totalCard, totalClick, totalCredit, shift.id],
                function(err3) {
                    if (err3) {
                        console.error('❌ UPDATE xatosi:', err3);
                        return res.status(500).json({ success: false, message: err3.message });
                    }
                    
                    console.log('✅ Smena yopildi! ID:', shift.id);
                    
                    res.json({
                        success: true,
                        message: '🔒 Smena muvaffaqiyatli yopildi!',
                        summary: {
                            totalSales: totalSales,
                            totalCash: totalCash,
                            totalCard: totalCard,
                            totalClick: totalClick,
                            totalCredit: totalCredit,
                            salesCount: sales.length
                        }
                    });
                }
            );
        });
    });
});

module.exports = router;