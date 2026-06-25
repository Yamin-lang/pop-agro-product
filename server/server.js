// ============================================
// POP-AGRO-PRODUCT SERVER (TO'LIQ TUZATILGAN)
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// ============================================
// 🔥 DATABASE TANLASH - FAQAT SQLITE (POSTGRESQL O'CHIRILDI)
// ============================================
const USE_POSTGRES = false; // 🔥 SQLITE ga majburlash

let db = null;

const sqlite3 = require('sqlite3').verbose();
db = new sqlite3.Database(path.join(__dirname, 'database.db'), function(err) {
    if (err) console.error('❌ Database connection error:', err.message);
    else console.log('✅ SQLite connected');
});
console.log('✅ Using SQLite');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('✅ Middleware loaded');

// ============================================
// DATABASE FUNKSIYALARI
// ============================================

function query(sql, params) {
    params = params || [];
    return new Promise(function(resolve, reject) {
        db.all(sql, params, function(err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function queryOne(sql, params) {
    params = params || [];
    return new Promise(function(resolve, reject) {
        db.get(sql, params, function(err, row) {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function queryRun(sql, params) {
    params = params || [];
    return new Promise(function(resolve, reject) {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else {
                resolve({ 
                    lastID: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
}

// ============================================
// JADVALLARNI YARATISH
// ============================================
async function createTables() {
    try {
        await queryRun(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                code TEXT,
                price REAL DEFAULT 0,
                cost_price REAL DEFAULT 0,
                quantity REAL DEFAULT 0,
                unit TEXT DEFAULT 'dona',
                image TEXT,
                sales_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Products table ready');

        await queryRun(`
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER,
                quantity REAL DEFAULT 0,
                price REAL DEFAULT 0,
                total_price REAL DEFAULT 0,
                discount REAL DEFAULT 0,
                payment_type TEXT DEFAULT 'cash',
                shift_id INTEGER,
                sale_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Sales table ready');

        await queryRun(`
            CREATE TABLE IF NOT EXISTS shifts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                opening_balance REAL DEFAULT 0,
                closing_balance REAL DEFAULT 0,
                opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                closed_at DATETIME,
                is_active INTEGER DEFAULT 1,
                total_sales INTEGER DEFAULT 0,
                total_amount REAL DEFAULT 0,
                cash_amount REAL DEFAULT 0,
                terminal_amount REAL DEFAULT 0,
                credit_amount REAL DEFAULT 0
            )
        `);
        console.log('✅ Shifts table ready');

        await queryRun(`
            CREATE TABLE IF NOT EXISTS debtors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                amount REAL DEFAULT 0,
                sale_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                paid_at DATETIME,
                is_paid INTEGER DEFAULT 0
            )
        `);
        console.log('✅ Debtors table ready');

        await queryRun(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                password TEXT,
                position TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Employees table ready');

        await queryRun(`
            CREATE TABLE IF NOT EXISTS returns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sale_id INTEGER,
                product_id INTEGER,
                quantity REAL DEFAULT 0,
                price REAL DEFAULT 0,
                total_price REAL DEFAULT 0,
                reason TEXT,
                returned_by TEXT,
                return_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Returns table ready');

        // ✅ Admin foydalanuvchi yaratish (agar mavjud bo'lmasa)
        const adminExists = await queryOne('SELECT * FROM employees WHERE email = ?', ['admin@example.com']);
        if (!adminExists) {
            await queryRun(
                `INSERT INTO employees (name, email, password, position) VALUES (?, ?, ?, ?)`,
                ['Admin', 'admin@example.com', '123456', 'Administrator']
            );
            console.log('✅ Admin user created');
        }

    } catch (err) {
        console.error('❌ Table creation error:', err.message);
    }
}

createTables();

// ============================================
// ============================================
// 🔥 BARCHA API LAR - BIRINCHI BO'LIB KELADI
// ============================================
// ============================================

// ============================================
// API - PRODUCTS
// ============================================
app.get('/api/products', async function(req, res) {
    console.log('📤 GET /api/products');
    try {
        var rows = await query('SELECT * FROM products ORDER BY id DESC');
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Products error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

app.post('/api/products', async function(req, res) {
    console.log('📤 POST /api/products');
    var name = req.body.name;
    var code = req.body.code;
    var price = req.body.price;
    var cost_price = req.body.cost_price;
    var quantity = req.body.quantity;
    var unit = req.body.unit;
    var image = req.body.image;
    var image_data = req.body.image_data;
    
    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Nomi va narxi kiritilishi shart' });
    }

    var imageToSave = image_data || image || '';

    try {
        var result = await queryRun(
            `INSERT INTO products (name, code, price, cost_price, quantity, unit, image) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, code || '', parseFloat(price) || 0, parseFloat(cost_price) || 0, parseFloat(quantity) || 0, unit || 'dona', imageToSave]
        );
        var row = await queryOne('SELECT * FROM products WHERE id = ?', [result.lastID]);
        res.json({ success: true, data: row });
    } catch (err) {
        console.error('Insert error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/products/:id', async function(req, res) {
    var id = req.params.id;
    var name = req.body.name;
    var code = req.body.code;
    var price = req.body.price;
    var cost_price = req.body.cost_price;
    var quantity = req.body.quantity;
    var unit = req.body.unit;
    var image = req.body.image;

    try {
        await queryRun(
            `UPDATE products SET name=?, code=?, price=?, cost_price=?, quantity=?, unit=?, image=? WHERE id=?`,
            [name, code, parseFloat(price) || 0, parseFloat(cost_price) || 0, parseFloat(quantity) || 0, unit, image, id]
        );
        var row = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        }
        res.json({ success: true, data: row });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/products/:id', async function(req, res) {
    var id = req.params.id;
    console.log('🗑️ DELETE /api/products/' + id);
    
    try {
        var existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        }
        
        await queryRun('DELETE FROM products WHERE id = ?', [id]);
        
        console.log('✅ Mahsulot o\'chirildi - ID:', id);
        res.json({ success: true, message: 'Mahsulot o\'chirildi', data: { id: id } });
    } catch (err) {
        console.error('❌ Delete error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// 🔥 API - SALES
// ============================================
app.post('/api/sales', async function(req, res) {
    console.log('📤 POST /api/sales');
    console.log('📦 Savdo ma\'lumotlari:', JSON.stringify(req.body, null, 2));
    
    var items = req.body.items;
    var total = req.body.total;
    var discount = req.body.discount;
    var payment_type = req.body.payment_type;
    var shift_id = req.body.shift_id;
    var debtor = req.body.debtor;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Savatcha bo\'sh' });
    }

    var saleIds = [];

    try {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemTotal = (item.price || 0) * (item.quantity || 0);
            
            var result = await queryRun(
                `INSERT INTO sales (product_id, quantity, price, total_price, discount, payment_type, shift_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [item.product_id, item.quantity || 0, item.price || 0, itemTotal, discount || 0, payment_type || 'cash', shift_id || null]
            );
            saleIds.push(result.lastID);
            
            console.log('📦 KAMAYTIRISH - ID:', item.product_id, 'Miqdor:', item.quantity);
            
            var updateResult = await queryRun(
                'UPDATE products SET quantity = quantity - ?, sales_count = sales_count + 1 WHERE id = ?',
                [item.quantity || 0, item.product_id]
            );
            console.log('✅ Yangilandi:', updateResult.changes, 'qator');
            
            var updated = await queryOne('SELECT quantity FROM products WHERE id = ?', [item.product_id]);
            console.log('✅ Yangi miqdor:', updated ? updated.quantity : 'N/A');
        }

        if (payment_type === 'credit' && debtor) {
            await queryRun(
                `INSERT INTO debtors (name, phone, address, amount, sale_id, is_paid) 
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [debtor.name, debtor.phone || '', debtor.address || '', total || 0, saleIds[0] || null]
            );
        }

        res.json({ success: true, message: 'Savdo qabul qilindi', data: { saleIds: saleIds } });
    } catch (err) {
        console.error('❌ Sale error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/sales/daily', async function(req, res) {
    var date = req.query.date;
    var shiftId = req.query.shift_id;
    var queryDate = date || new Date().toISOString().split('T')[0];
    console.log('📤 GET /api/sales/daily?date=' + queryDate + '&shift_id=' + shiftId);

    var sql = `
        SELECT s.*, p.name as product_name 
        FROM sales s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE DATE(s.sale_date) = ?
    `;
    var params = [queryDate];
    
    if (shiftId) {
        sql += ' AND s.shift_id = ?';
        params.push(shiftId);
    }
    
    sql += ' ORDER BY s.sale_date DESC';
    
    try {
        var rows = await query(sql, params);
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Daily sales error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

app.get('/api/sales/monthly', async function(req, res) {
    var year = req.query.year;
    var month = req.query.month;
    var now = new Date();
    var y = year || now.getFullYear();
    var m = month || (now.getMonth() + 1);
    var monthStr = String(m).padStart(2, '0');
    console.log('📤 GET /api/sales/monthly?year=' + y + '&month=' + m);

    try {
        var sql = `
            SELECT s.*, p.name as product_name 
            FROM sales s
            LEFT JOIN products p ON s.product_id = p.id
            WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
            ORDER BY s.sale_date DESC
        `;
        var rows = await query(sql, [String(y), monthStr]);
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Monthly sales error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

// ============================================
// 🔥 API - SHIFTS
// ============================================

app.post('/api/shifts/open', async function(req, res) {
    console.log('📤 POST /api/shifts/open');
    var openingBalance = req.body.openingBalance;

    try {
        var result = await queryRun(
            'INSERT INTO shifts (opening_balance, is_active) VALUES (?, 1)',
            [parseFloat(openingBalance) || 0]
        );
        var row = await queryOne('SELECT * FROM shifts WHERE id = ?', [result.lastID]);
        res.json({ success: true, data: row });
    } catch (err) {
        console.error('Open shift error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/shifts/close', async function(req, res) {
    console.log('📤 POST /api/shifts/close');
    var closingBalance = req.body.closingBalance;
    
    try {
        var shift = await queryOne('SELECT * FROM shifts WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
        if (!shift) {
            return res.status(404).json({ success: false, message: 'Aktiv smena topilmadi' });
        }
        
        var reportSql = `
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_price), 0) as total_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
            FROM sales
            WHERE shift_id = ?
        `;
        var report = await queryOne(reportSql, [shift.id]);
        
        await queryRun(
            `UPDATE shifts SET 
                closing_balance = ?, 
                closed_at = CURRENT_TIMESTAMP, 
                is_active = 0,
                total_sales = ?,
                total_amount = ?,
                cash_amount = ?,
                terminal_amount = ?,
                credit_amount = ?
            WHERE id = ?`,
            [
                parseFloat(closingBalance) || 0,
                report.total_sales || 0,
                report.total_amount || 0,
                report.cash_amount || 0,
                report.terminal_amount || 0,
                report.credit_amount || 0,
                shift.id
            ]
        );
        
        await queryRun('DELETE FROM sales WHERE shift_id = ?', [shift.id]);
        
        res.json({ 
            success: true, 
            message: 'Smena yopildi va savdo tozalandi!',
            data: {
                shift_id: shift.id,
                report: report,
                sales_cleared: true
            }
        });
    } catch (err) {
        console.error('Close shift error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/shifts/current', async function(req, res) {
    console.log('📤 GET /api/shifts/current');
    try {
        var row = await queryOne('SELECT * FROM shifts WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
        res.json({ success: true, data: row || null });
    } catch (err) {
        console.error('Current shift error:', err);
        res.status(500).json({ success: false, message: err.message, data: null });
    }
});

app.get('/api/shifts/history', async function(req, res) {
    console.log('📤 GET /api/shifts/history');
    try {
        var rows = await query(`
            SELECT 
                id,
                opening_balance,
                closing_balance,
                opened_at,
                closed_at,
                is_active,
                total_sales,
                total_amount,
                cash_amount,
                terminal_amount,
                credit_amount,
                CASE 
                    WHEN is_active = 1 THEN '🟢 Ochilgan'
                    ELSE '🔴 Yopilgan'
                END as status_text
            FROM shifts 
            ORDER BY id DESC
        `);
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Shift history error:', err);
        res.json({ success: true, data: [] });
    }
});

// ============================================
// API - DEBTORS
// ============================================
app.get('/api/debtors', async function(req, res) {
    console.log('📤 GET /api/debtors');
    try {
        var rows = await query('SELECT * FROM debtors WHERE is_paid = 0 ORDER BY created_at DESC');
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Debtors error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

app.post('/api/debtors/:id/pay', async function(req, res) {
    var id = req.params.id;
    var amount = req.body.amount;
    console.log('📤 POST /api/debtors/' + id + '/pay');

    try {
        var debtor = await queryOne('SELECT * FROM debtors WHERE id = ?', [id]);
        if (!debtor) {
            return res.status(404).json({ success: false, message: 'Qarzdor topilmadi' });
        }

        var newAmount = Math.max(0, (debtor.amount || 0) - (parseFloat(amount) || 0));
        var isPaid = newAmount <= 0 ? 1 : 0;

        await queryRun(
            'UPDATE debtors SET amount = ?, is_paid = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newAmount, isPaid, id]
        );
        res.json({ success: true, message: 'Qarz to\'landi', data: { remaining: newAmount } });
    } catch (err) {
        console.error('Pay debt error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// API - REPORTS
// ============================================
app.get('/api/reports/daily', async function(req, res) {
    var date = req.query.date;
    var queryDate = date || new Date().toISOString().split('T')[0];
    console.log('📤 GET /api/reports/daily?date=' + queryDate);

    try {
        var row = await queryOne(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_price), 0) as total_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
            FROM sales
            WHERE DATE(sale_date) = ?
        `, [queryDate]);
        res.json({ success: true, data: row || { total_sales: 0, total_amount: 0 } });
    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ success: false, message: err.message, data: {} });
    }
});

// ============================================
// 📊 QO'SHIMCHA HISOBOTLAR
// ============================================

// 1. Oylik savdo hisoboti
app.get('/api/reports/monthly', async function(req, res) {
    var year = req.query.year;
    var month = req.query.month;
    var now = new Date();
    var y = year || now.getFullYear();
    var m = month || (now.getMonth() + 1);
    var monthStr = String(m).padStart(2, '0');
    
    console.log('📤 GET /api/reports/monthly?year=' + y + '&month=' + m);
    
    try {
        var row = await queryOne(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_price), 0) as total_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
            FROM sales
            WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
        `, [String(y), monthStr]);
        res.json({ success: true, data: row || { total_sales: 0, total_amount: 0 } });
    } catch (err) {
        console.error('Monthly report error:', err);
        res.status(500).json({ success: false, message: err.message, data: {} });
    }
});

// 2. Jami tavar qiymati va foyda
app.get('/api/reports/inventory', async function(req, res) {
    console.log('📤 GET /api/reports/inventory');
    
    try {
        var rows = await query('SELECT name, price, cost_price, quantity FROM products');
        
        var totalCost = 0;
        var totalPrice = 0;
        var totalQuantity = 0;
        
        rows.forEach(function(p) {
            var qty = p.quantity || 0;
            var cost = p.cost_price || 0;
            var price = p.price || 0;
            
            totalCost += qty * cost;
            totalPrice += qty * price;
            totalQuantity += qty;
        });
        
        var potentialProfit = totalPrice - totalCost;
        
        res.json({ 
            success: true, 
            data: {
                total_quantity: totalQuantity,
                total_cost: totalCost,
                total_price: totalPrice,
                potential_profit: potentialProfit,
                products: rows
            }
        });
    } catch (err) {
        console.error('Inventory report error:', err);
        res.status(500).json({ success: false, message: err.message, data: {} });
    }
});

// 3. Oylik foyda hisoboti
app.get('/api/reports/monthly-profit', async function(req, res) {
    var year = req.query.year;
    var month = req.query.month;
    var now = new Date();
    var y = year || now.getFullYear();
    var m = month || (now.getMonth() + 1);
    var monthStr = String(m).padStart(2, '0');
    
    console.log('📤 GET /api/reports/monthly-profit?year=' + y + '&month=' + m);
    
    try {
        var rows = await query(`
            SELECT 
                s.*,
                p.cost_price,
                p.name as product_name,
                (s.price - p.cost_price) * s.quantity as profit
            FROM sales s
            LEFT JOIN products p ON s.product_id = p.id
            WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
        `, [String(y), monthStr]);
        
        var totalProfit = 0;
        rows.forEach(function(r) {
            totalProfit += r.profit || 0;
        });
        
        res.json({ 
            success: true, 
            data: {
                total_profit: totalProfit,
                total_sales: rows.length,
                details: rows
            }
        });
    } catch (err) {
        console.error('Monthly profit error:', err);
        res.status(500).json({ success: false, message: err.message, data: {} });
    }
});

// 4. Barcha hisobotlar (bir vaqtda)
app.get('/api/reports/all', async function(req, res) {
    console.log('📤 GET /api/reports/all');
    
    try {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var monthStr = String(month).padStart(2, '0');
        
        // Oylik savdo
        var monthly = await queryOne(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_price), 0) as total_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
            FROM sales
            WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
        `, [String(year), monthStr]);
        
        // Ombor holati
        var inventoryRows = await query('SELECT name, price, cost_price, quantity FROM products');
        var totalCost = 0;
        var totalPrice = 0;
        var totalQuantity = 0;
        
        inventoryRows.forEach(function(p) {
            var qty = p.quantity || 0;
            var cost = p.cost_price || 0;
            var price = p.price || 0;
            totalCost += qty * cost;
            totalPrice += qty * price;
            totalQuantity += qty;
        });
        
        // Oylik foyda
        var profit = await queryOne(`
            SELECT 
                COALESCE(SUM((s.price - p.cost_price) * s.quantity), 0) as total_profit,
                COUNT(*) as total_sales
            FROM sales s
            LEFT JOIN products p ON s.product_id = p.id
            WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
        `, [String(year), monthStr]);
        
        res.json({ 
            success: true, 
            data: {
                monthly: monthly || { total_sales: 0, total_amount: 0 },
                inventory: {
                    total_quantity: totalQuantity,
                    total_cost: totalCost,
                    total_price: totalPrice,
                    potential_profit: totalPrice - totalCost
                },
                profit: profit || { total_profit: 0, total_sales: 0 }
            }
        });
    } catch (err) {
        console.error('All reports error:', err);
        res.status(500).json({ success: false, message: err.message, data: {} });
    }
});

// ============================================
// API - EMPLOYEES
// ============================================
app.get('/api/employees', async function(req, res) {
    console.log('📤 GET /api/employees');
    try {
        var rows = await query('SELECT id, name, email, position, phone FROM employees ORDER BY id DESC');
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Employees error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

app.post('/api/employees', async function(req, res) {
    console.log('📤 POST /api/employees');
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var position = req.body.position;
    var phone = req.body.phone;
    
    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Ism va email kiritilishi shart' });
    }

    try {
        var result = await queryRun(
            'INSERT INTO employees (name, email, password, position, phone) VALUES (?, ?, ?, ?, ?)',
            [name, email, password || '123456', position || '', phone || '']
        );
        var row = await queryOne('SELECT id, name, email, position, phone FROM employees WHERE id = ?', [result.lastID]);
        res.json({ success: true, data: row });
    } catch (err) {
        console.error('Add employee error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/employees/:id', async function(req, res) {
    var id = req.params.id;
    console.log('📤 DELETE /api/employees/' + id);
    try {
        await queryRun('DELETE FROM employees WHERE id = ?', [id]);
        res.json({ success: true, message: 'Xodim o\'chirildi' });
    } catch (err) {
        console.error('Delete employee error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================
// 🔥 API - RETURNS (QAYTARISH)
// ============================================

app.post('/api/returns', async function(req, res) {
    console.log('📤 POST /api/returns');
    var sale_id = req.body.sale_id;
    var product_id = req.body.product_id;
    var quantity = req.body.quantity;
    var price = req.body.price;
    var total_price = req.body.total_price;
    var reason = req.body.reason;
    var returned_by = req.body.returned_by;
    
    if (!product_id || !quantity) {
        return res.status(400).json({ 
            success: false, 
            message: 'Mahsulot ID va miqdor kiritilishi shart' 
        });
    }
    
    try {
        var product = await queryOne('SELECT * FROM products WHERE id = ?', [product_id]);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        }
        
        var newQuantity = (product.quantity || 0) + parseFloat(quantity);
        
        var result = await queryRun(
            `INSERT INTO returns (sale_id, product_id, quantity, price, total_price, reason, returned_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                sale_id || null, 
                product_id, 
                parseFloat(quantity), 
                parseFloat(price) || parseFloat(product.price), 
                parseFloat(total_price) || (parseFloat(price) || parseFloat(product.price)) * parseFloat(quantity), 
                reason || 'Boshqa', 
                returned_by || 'Admin'
            ]
        );
        
        await queryRun(
            'UPDATE products SET quantity = ? WHERE id = ?',
            [newQuantity, product_id]
        );
        
        var row = await queryOne('SELECT * FROM returns WHERE id = ?', [result.lastID]);
        res.json({ 
            success: true, 
            message: 'Mahsulot qaytarib olindi va omborga qo\'shildi!',
            data: {
                return: row,
                product: {
                    id: product_id,
                    name: product.name,
                    old_quantity: product.quantity,
                    new_quantity: newQuantity
                }
            }
        });
    } catch (err) {
        console.error('Return error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/returns', async function(req, res) {
    var date = req.query.date;
    var queryDate = date || new Date().toISOString().split('T')[0];
    console.log('📤 GET /api/returns?date=' + queryDate);
    
    try {
        var rows = await query(`
            SELECT r.*, p.name as product_name, s.sale_date as original_sale_date
            FROM returns r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN sales s ON r.sale_id = s.id
            WHERE DATE(r.return_date) = ?
            ORDER BY r.return_date DESC
        `, [queryDate]);
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Get returns error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

app.get('/api/returns/all', async function(req, res) {
    console.log('📤 GET /api/returns/all');
    try {
        var rows = await query(`
            SELECT r.*, p.name as product_name, s.sale_date as original_sale_date
            FROM returns r
            LEFT JOIN products p ON r.product_id = p.id
            LEFT JOIN sales s ON r.sale_id = s.id
            ORDER BY r.return_date DESC
            LIMIT 100
        `);
        res.json({ success: true, data: rows || [] });
    } catch (err) {
        console.error('Get all returns error:', err);
        res.status(500).json({ success: false, message: err.message, data: [] });
    }
});

// ============================================
// 🔥 STATIC FILES - FAQAT API LARDAN KEYIN!
// ============================================
app.use(express.static(path.join(__dirname, '../client')));

// ============================================
// FRONTEND - FAQAT API LAR ISHLAMASA
// ============================================
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, function() {
    console.log('='.repeat(50));
    console.log('🚀 POP-AGRO-PRODUCT SERVER');
    console.log('='.repeat(50));
    console.log('✅ Server: http://localhost:' + PORT);
    console.log('📊 API: http://localhost:' + PORT + '/api/products');
    console.log('📊 Monthly Report: http://localhost:' + PORT + '/api/reports/monthly');
    console.log('📊 Inventory: http://localhost:' + PORT + '/api/reports/inventory');
    console.log('📊 Monthly Profit: http://localhost:' + PORT + '/api/reports/monthly-profit');
    console.log('📊 All Reports: http://localhost:' + PORT + '/api/reports/all');
    console.log('🔄 Returns: http://localhost:' + PORT + '/api/returns');
    console.log('📋 Shifts: http://localhost:' + PORT + '/api/shifts/history');
    console.log('🌐 Frontend: http://localhost:' + PORT);
    console.log('='.repeat(50));
});

process.on('uncaughtException', function(err) {
    console.error('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', function(err) {
    console.error('❌ Unhandled Rejection:', err);
});

// ============================================
// 🚀 VERCEL EXPORT
// ============================================
module.exports = app;