const express = require('express');
const router = express.Router();

// ============================================
// KUNLIK HISOBOT
// ============================================

router.get('/daily', function(req, res) {
    var db = req.app.get('db');
    var date = req.query.date || new Date().toISOString().split('T')[0];
    
    db.all(
        `SELECT s.*, u.name as cashierName 
         FROM sales s 
         LEFT JOIN users u ON s.cashier_id = u.id 
         WHERE s.status = "completed" AND date(s.createdAt) = ?`,
        [date],
        function(err, rows) {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            var summary = {
                totalSales: 0,
                totalCash: 0,
                totalCard: 0,
                totalClick: 0,
                totalCredit: 0,
                count: rows.length
            };
            
            var sales = rows.map(function(sale) {
                // Kassir nomini olish
                var cashier = sale.cashierName || 'Noma\'lum';
                
                // Jami hisoblash
                summary.totalSales += sale.total;
                if (sale.paymentMethod === 'naxt') summary.totalCash += sale.total;
                else if (sale.paymentMethod === 'karta') summary.totalCard += sale.total;
                else if (sale.paymentMethod === 'clik') summary.totalClick += sale.total;
                else if (sale.paymentMethod === 'nasiya') summary.totalCredit += sale.total;
                
                return {
                    invoiceNumber: sale.invoiceNumber,
                    createdAt: sale.createdAt,
                    cashier: cashier,
                    total: sale.total,
                    paymentMethod: sale.paymentMethod
                };
            });
            
            res.json({
                success: true,
                data: {
                    date: date,
                    summary: summary,
                    sales: sales
                }
            });
        }
    );
});

// ============================================
// OYLIK HISOBOT
// ============================================

router.get('/monthly', function(req, res) {
    var db = req.app.get('db');
    var year = parseInt(req.query.year) || new Date().getFullYear();
    var month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    var startDate = year + '-' + String(month).padStart(2, '0') + '-01';
    var endDate = year + '-' + String(month).padStart(2, '0') + '-31';
    
    db.all(
        `SELECT s.*, u.name as cashierName 
         FROM sales s 
         LEFT JOIN users u ON s.cashier_id = u.id 
         WHERE s.status = "completed" AND date(s.createdAt) BETWEEN ? AND ?`,
        [startDate, endDate],
        function(err, rows) {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            
            var summary = {
                totalSales: 0,
                totalCash: 0,
                totalCard: 0,
                totalClick: 0,
                totalCredit: 0,
                count: rows.length
            };
            
            var sales = rows.map(function(sale) {
                var cashier = sale.cashierName || 'Noma\'lum';
                
                summary.totalSales += sale.total;
                if (sale.paymentMethod === 'naxt') summary.totalCash += sale.total;
                else if (sale.paymentMethod === 'karta') summary.totalCard += sale.total;
                else if (sale.paymentMethod === 'clik') summary.totalClick += sale.total;
                else if (sale.paymentMethod === 'nasiya') summary.totalCredit += sale.total;
                
                return {
                    invoiceNumber: sale.invoiceNumber,
                    createdAt: sale.createdAt,
                    cashier: cashier,
                    total: sale.total,
                    paymentMethod: sale.paymentMethod
                };
            });
            
            res.json({
                success: true,
                data: {
                    year: year,
                    month: month,
                    summary: summary,
                    sales: sales
                }
            });
        }
    );
});

module.exports = router;