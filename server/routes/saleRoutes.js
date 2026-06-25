const express = require('express');
const router = express.Router();

// ============================================
// YANGI SAVDO QILISH
// ============================================

router.post('/', function(req, res) {
    var db = req.app.get('db');
    var body = req.body;
    
    console.log('📥 POST /sales so\'rovi keldi');
    console.log('📥 Body:', JSON.stringify(body, null, 2));
    
    // 1. Ma'lumotlarni olish
    var items = body.items || [];
    var paymentMethod = body.paymentMethod;
    var paidAmount = parseFloat(body.paidAmount) || 0;
    var discount = parseFloat(body.discount) || 0;
    var cashierId = 1;
    
    // 2. Validatsiya
    if (!items || items.length === 0) {
        console.log('❌ Savat bo\'sh');
        return res.status(400).json({ success: false, message: '❌ Savat bo\'sh!' });
    }
    if (!paymentMethod) {
        console.log('❌ To\'lov usuli tanlanmagan');
        return res.status(400).json({ success: false, message: '❌ To\'lov usulini tanlang!' });
    }
    
    // 3. Mahsulotlarni tekshirish
    var subtotal = 0;
    var saleItems = [];
    var productUpdates = [];
    var errors = [];
    var invoiceNumber = 'INV-' + Date.now().toString().slice(-8); // <-- GLOBAL QILDIK!
    var total = 0;
    
    function processItems(index) {
        if (index >= items.length) {
            if (errors.length > 0) {
                return res.status(400).json({ success: false, message: errors.join(' ') });
            }
            createSale();
            return;
        }
        
        var item = items[index];
        var productId = parseInt(item.productId);
        var quantity = parseFloat(item.quantity) || 0;
        
        console.log('📦 Mahsulot:', productId, 'x', quantity);
        
        db.get('SELECT * FROM products WHERE id = ? AND isActive = 1', [productId], function(err, product) {
            if (err) {
                console.error('❌ DB xatosi:', err);
                errors.push('DB xatosi: ' + err.message);
                processItems(index + 1);
                return;
            }
            if (!product) {
                console.log('❌ Mahsulot topilmadi:', productId);
                errors.push('Mahsulot topilmadi! ID: ' + productId);
                processItems(index + 1);
                return;
            }
            if (product.quantity < quantity) {
                console.log('❌ Yetarli emas:', product.name, 'Mavjud:', product.quantity);
                errors.push(product.name + ' dan yetarli emas! Mavjud: ' + product.quantity);
                processItems(index + 1);
                return;
            }
            
            var itemTotal = quantity * product.sellingPrice;
            subtotal += itemTotal;
            
            saleItems.push({
                product_id: product.id,
                productName: product.name,
                productCode: product.code,
                quantity: quantity,
                unit: product.unit,
                price: product.sellingPrice,
                total: itemTotal
            });
            
            productUpdates.push({ id: product.id, quantity: quantity });
            processItems(index + 1);
        });
    }
    
    function createSale() {
        total = subtotal - discount;
        
        console.log('📝 Savdo ma\'lumotlari:');
        console.log('  Invoice:', invoiceNumber);
        console.log('  Subtotal:', subtotal);
        console.log('  Discount:', discount);
        console.log('  Total:', total);
        console.log('  Payment:', paymentMethod);
        console.log('  Paid:', paidAmount);
        
        db.run(
            `INSERT INTO sales (invoiceNumber, cashier_id, subtotal, discount, total, paymentMethod, paidAmount, changeAmount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoiceNumber, 
                cashierId, 
                subtotal, 
                discount, 
                total, 
                paymentMethod, 
                paidAmount, 
                Math.max(0, paidAmount - total), 
                'completed'
            ],
            function(err) {
                if (err) {
                    console.error('❌ INSERT xatosi:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: '❌ Savdo saqlanmadi: ' + err.message 
                    });
                }
                
                var saleId = this.lastID;
                console.log('✅ Savdo yaratildi! ID:', saleId);
                
                if (saleItems.length === 0) {
                    updateProducts(saleId);
                } else {
                    insertSaleItems(saleId);
                }
            }
        );
    }
    
    function insertSaleItems(saleId) {
        var count = 0;
        var totalItems = saleItems.length;
        
        saleItems.forEach(function(item) {
            db.run(
                `INSERT INTO sale_items (sale_id, product_id, productName, productCode, quantity, unit, price, total)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    saleId, 
                    item.product_id, 
                    item.productName, 
                    item.productCode, 
                    item.quantity, 
                    item.unit, 
                    item.price, 
                    item.total
                ],
                function(err) {
                    if (err) {
                        console.error('❌ Sale item xatosi:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: '❌ Savdo tafsilotlari saqlanmadi!' 
                        });
                    }
                    count++;
                    if (count === totalItems) {
                        updateProducts(saleId);
                    }
                }
            );
        });
    }
    
    function updateProducts(saleId) {
        var count = 0;
        var totalItems = productUpdates.length;
        
        if (totalItems === 0) {
            finishSale(saleId);
            return;
        }
        
        productUpdates.forEach(function(p) {
            db.run(
                'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                [p.quantity, p.id],
                function(err) {
                    if (err) {
                        console.error('❌ Update xatosi:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: '❌ Mahsulotlar yangilanmadi!' 
                        });
                    }
                    count++;
                    if (count === totalItems) {
                        finishSale(saleId);
                    }
                }
            );
        });
    }
    
    function finishSale(saleId) {
        console.log('✅ Savdo yakunlandi! ID:', saleId);
        res.status(201).json({
            success: true,
            message: '✅ Savdo muvaffaqiyatli amalga oshirildi!',
            data: {
                invoiceNumber: invoiceNumber, // <-- global o'zgaruvchi
                total: total,                 // <-- global o'zgaruvchi
                paymentMethod: paymentMethod  // <-- global o'zgaruvchi
            }
        });
    }
    
    // BOSHLASH
    processItems(0);
});

// ============================================
// KUNLIK SAVDO
// ============================================

router.get('/daily', function(req, res) {
    var db = req.app.get('db');
    var date = req.query.date || new Date().toISOString().split('T')[0];
    
    db.all(
        `SELECT * FROM sales WHERE status = "completed" AND date(createdAt) = ?`,
        [date],
        function(err, rows) {
            if (err) {
                console.error('❌ GET /sales/daily xatosi:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            
            var summary = {
                total: 0,
                cash: 0,
                card: 0,
                click: 0,
                credit: 0,
                count: rows.length
            };
            
            rows.forEach(function(sale) {
                summary.total += sale.total;
                if (sale.paymentMethod === 'naxt') summary.cash += sale.total;
                else if (sale.paymentMethod === 'karta') summary.card += sale.total;
                else if (sale.paymentMethod === 'clik') summary.click += sale.total;
                else if (sale.paymentMethod === 'nasiya') summary.credit += sale.total;
            });
            
            res.json({
                success: true,
                data: {
                    date: date,
                    summary: summary,
                    sales: rows
                }
            });
        }
    );
});

// ============================================
// OYLIK SAVDO
// ============================================

router.get('/monthly', function(req, res) {
    var db = req.app.get('db');
    var year = parseInt(req.query.year) || new Date().getFullYear();
    var month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    var startDate = year + '-' + String(month).padStart(2, '0') + '-01';
    var endDate = year + '-' + String(month).padStart(2, '0') + '-31';
    
    db.all(
        `SELECT * FROM sales WHERE status = "completed" AND date(createdAt) BETWEEN ? AND ?`,
        [startDate, endDate],
        function(err, rows) {
            if (err) {
                console.error('❌ GET /sales/monthly xatosi:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            
            var summary = {
                total: 0,
                cash: 0,
                card: 0,
                click: 0,
                credit: 0,
                count: rows.length
            };
            
            rows.forEach(function(sale) {
                summary.total += sale.total;
                if (sale.paymentMethod === 'naxt') summary.cash += sale.total;
                else if (sale.paymentMethod === 'karta') summary.card += sale.total;
                else if (sale.paymentMethod === 'clik') summary.click += sale.total;
                else if (sale.paymentMethod === 'nasiya') summary.credit += sale.total;
            });
            
            res.json({
                success: true,
                data: {
                    year: year,
                    month: month,
                    summary: summary,
                    sales: rows
                }
            });
        }
    );
});

module.exports = router;