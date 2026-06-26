// ============================================
// POP-AGRO-PRODUCT SERVER (TO'LIQ TUZATILGAN)
// ============================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// 🔥 CORS - BARCHA DOMENLARGA RUXSAT
// ============================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('✅ Middleware loaded');

// ============================================
// DATABASE
// ============================================
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), function(err) {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Database connected');
    }
});

db.serialize(function() {
    // Products
    db.run(`CREATE TABLE IF NOT EXISTS products (
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
    )`, function(err) {
        if (err) console.error('Products table error:', err);
        else console.log('✅ Products table ready');
    });

    // Sales
    db.run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity REAL DEFAULT 0,
        price REAL DEFAULT 0,
        total_price REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        payment_type TEXT DEFAULT 'cash',
        shift_id INTEGER,
        sale_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) console.error('Sales table error:', err);
        else console.log('✅ Sales table ready');
    });

    // Shifts
    db.run(`CREATE TABLE IF NOT EXISTS shifts (
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
        credit_amount REAL DEFAULT 0,
        sale_dates TEXT
    )`, function(err) {
        if (err) console.error('Shifts table error:', err);
        else console.log('✅ Shifts table ready');
    });

    // Debtors
    db.run(`CREATE TABLE IF NOT EXISTS debtors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        amount REAL DEFAULT 0,
        sale_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        is_paid INTEGER DEFAULT 0
    )`, function(err) {
        if (err) console.error('Debtors table error:', err);
        else console.log('✅ Debtors table ready');
    });

    // Employees
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        position TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) console.error('Employees table error:', err);
        else console.log('✅ Employees table ready');
    });

    // Returns
    db.run(`CREATE TABLE IF NOT EXISTS returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        product_id INTEGER,
        quantity REAL DEFAULT 0,
        price REAL DEFAULT 0,
        total_price REAL DEFAULT 0,
        reason TEXT,
        returned_by TEXT,
        return_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) console.error('Returns table error:', err);
        else console.log('✅ Returns table ready');
    });

    // Admin user
    db.get('SELECT * FROM employees WHERE email = ?', ['admin@example.com'], function(err, row) {
        if (!row) {
            db.run(`INSERT INTO employees (name, email, password, position) VALUES (?, ?, ?, ?)`,
                ['Admin', 'admin@example.com', '123456', 'Administrator'],
                function(err) {
                    if (err) console.error('Admin insert error:', err);
                    else console.log('✅ Admin user created');
                }
            );
        }
    });
});

// ============================================
// API - PRODUCTS
// ============================================
app.get('/api/products', function(req, res) {
    console.log('📤 GET /api/products');
    db.all('SELECT * FROM products ORDER BY id DESC', function(err, rows) {
        if (err) {
            console.error('Products error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

app.post('/api/products', function(req, res) {
    console.log('📤 POST /api/products');
    var { name, code, price, cost_price, quantity, unit, image, image_data } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Nomi va narxi kiritilishi shart' });
    }

    var imageToSave = image_data || image || '';

    db.run(
        `INSERT INTO products (name, code, price, cost_price, quantity, unit, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, code || '', parseFloat(price) || 0, parseFloat(cost_price) || 0, parseFloat(quantity) || 0, unit || 'dona', imageToSave],
        function(err) {
            if (err) {
                console.error('Insert error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            db.get('SELECT * FROM products WHERE id = ?', [this.lastID], function(err, row) {
                res.json({ success: true, data: row });
            });
        }
    );
});

app.put('/api/products/:id', function(req, res) {
    var id = req.params.id;
    var { name, code, price, cost_price, quantity, unit, image } = req.body;

    db.run(
        `UPDATE products SET name=?, code=?, price=?, cost_price=?, quantity=?, unit=?, image=? WHERE id=?`,
        [name, code, parseFloat(price) || 0, parseFloat(cost_price) || 0, parseFloat(quantity) || 0, unit, image, id],
        function(err) {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
            }
            db.get('SELECT * FROM products WHERE id = ?', [id], function(err, row) {
                res.json({ success: true, data: row });
            });
        }
    );
});

app.delete('/api/products/:id', function(req, res) {
    var id = req.params.id;
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Mahsulot o\'chirildi' });
    });
});

// ============================================
// API - SALES
// ============================================
app.post('/api/sales', function(req, res) {
    console.log('📤 POST /api/sales');
    var { items, total, discount, payment_type, shift_id, debtor } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Savatcha bo\'sh' });
    }

    var saleIds = [];

    db.serialize(function() {
        var stmt = db.prepare(
            `INSERT INTO sales (product_id, quantity, price, total_price, discount, payment_type, shift_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
        );

        items.forEach(function(item) {
            var itemTotal = (item.price || 0) * (item.quantity || 0);
            stmt.run([item.product_id, item.quantity || 0, item.price || 0, itemTotal, discount || 0, payment_type || 'cash', shift_id || null], function(err) {
                if (!err) saleIds.push(this.lastID);
            });
            
            db.run(
                'UPDATE products SET quantity = quantity - ?, sales_count = sales_count + 1 WHERE id = ?',
                [item.quantity || 0, item.product_id]
            );
        });

        stmt.finalize(function(err) {
            if (err) {
                console.error('Sale error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }

            if (payment_type === 'credit' && debtor) {
                db.run(
                    `INSERT INTO debtors (name, phone, address, amount, sale_id, is_paid) 
                     VALUES (?, ?, ?, ?, ?, 0)`,
                    [debtor.name, debtor.phone || '', debtor.address || '', total || 0, saleIds[0] || null]
                );
            }

            res.json({ success: true, message: 'Savdo qabul qilindi', data: { saleIds: saleIds } });
        });
    });
});

app.get('/api/sales/daily', function(req, res) {
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
    
    db.all(sql, params, function(err, rows) {
        if (err) {
            console.error('Daily sales error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

app.get('/api/sales/monthly', function(req, res) {
    var year = req.query.year;
    var month = req.query.month;
    var now = new Date();
    var y = year || now.getFullYear();
    var m = month || (now.getMonth() + 1);
    var monthStr = String(m).padStart(2, '0');
    console.log('📤 GET /api/sales/monthly?year=' + y + '&month=' + m);

    db.all(`
        SELECT s.*, p.name as product_name 
        FROM sales s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
        ORDER BY s.sale_date DESC
    `, [String(y), monthStr], function(err, rows) {
        if (err) {
            console.error('Monthly sales error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

// ============================================
// API - SHIFTS
// ============================================
app.post('/api/shifts/open', function(req, res) {
    console.log('📤 POST /api/shifts/open');
    var openingBalance = req.body.openingBalance;

    db.run(
        'INSERT INTO shifts (opening_balance, is_active) VALUES (?, 1)',
        [parseFloat(openingBalance) || 0],
        function(err) {
            if (err) {
                console.error('Open shift error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            db.get('SELECT * FROM shifts WHERE id = ?', [this.lastID], function(err, row) {
                res.json({ success: true, data: row });
            });
        }
    );
});

app.post('/api/shifts/close', function(req, res) {
    console.log('📤 POST /api/shifts/close');
    var closingBalance = req.body.closingBalance;
    
    db.get('SELECT * FROM shifts WHERE is_active = 1 ORDER BY id DESC LIMIT 1', function(err, shift) {
        if (err) {
            console.error('Get shift error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!shift) {
            return res.status(404).json({ success: false, message: 'Aktiv smena topilmadi' });
        }
        
        db.get(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(total_price), 0) as total_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
                COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount,
                GROUP_CONCAT(DISTINCT DATE(sale_date)) as sale_dates
            FROM sales
            WHERE shift_id = ?
        `, [shift.id], function(err, report) {
            if (err) {
                console.error('Report error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            
            db.run(
                `UPDATE shifts SET 
                    closing_balance = ?, 
                    closed_at = CURRENT_TIMESTAMP, 
                    is_active = 0,
                    total_sales = ?,
                    total_amount = ?,
                    cash_amount = ?,
                    terminal_amount = ?,
                    credit_amount = ?,
                    sale_dates = ?
                WHERE id = ?`,
                [
                    parseFloat(closingBalance) || 0,
                    report.total_sales || 0,
                    report.total_amount || 0,
                    report.cash_amount || 0,
                    report.terminal_amount || 0,
                    report.credit_amount || 0,
                    report.sale_dates || '',
                    shift.id
                ],
                function(err) {
                    if (err) {
                        console.error('Close shift error:', err);
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    
                    db.run('DELETE FROM sales WHERE shift_id = ?', [shift.id], function(err) {
                        if (err) console.error('Clear sales error:', err);
                        else console.log('✅ Sales cleared for shift:', shift.id);
                    });
                    
                    res.json({ 
                        success: true, 
                        message: 'Smena yopildi!',
                        data: {
                            shift_id: shift.id,
                            report: report,
                            sales_cleared: true
                        }
                    });
                }
            );
        });
    });
});

app.get('/api/shifts/current', function(req, res) {
    console.log('📤 GET /api/shifts/current');
    db.get('SELECT * FROM shifts WHERE is_active = 1 ORDER BY id DESC LIMIT 1', function(err, row) {
        if (err) {
            console.error('Current shift error:', err);
            return res.status(500).json({ success: false, message: err.message, data: null });
        }
        res.json({ success: true, data: row || null });
    });
});

app.get('/api/shifts/history', function(req, res) {
    console.log('📤 GET /api/shifts/history');
    db.all(`
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
            sale_dates,
            CASE 
                WHEN is_active = 1 THEN '🟢 Ochilgan'
                ELSE '🔴 Yopilgan'
            END as status_text
        FROM shifts 
        ORDER BY id DESC
    `, function(err, rows) {
        if (err) {
            console.error('Shift history error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

// ============================================
// API - DEBTORS
// ============================================
app.get('/api/debtors', function(req, res) {
    console.log('📤 GET /api/debtors');
    db.all('SELECT * FROM debtors WHERE is_paid = 0 ORDER BY created_at DESC', function(err, rows) {
        if (err) {
            console.error('Debtors error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

app.post('/api/debtors/:id/pay', function(req, res) {
    var id = req.params.id;
    var amount = req.body.amount;
    console.log('📤 POST /api/debtors/' + id + '/pay');

    db.get('SELECT * FROM debtors WHERE id = ?', [id], function(err, debtor) {
        if (err) {
            console.error('Debtor get error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!debtor) {
            return res.status(404).json({ success: false, message: 'Qarzdor topilmadi' });
        }

        var newAmount = Math.max(0, (debtor.amount || 0) - (parseFloat(amount) || 0));
        var isPaid = newAmount <= 0 ? 1 : 0;

        db.run(
            'UPDATE debtors SET amount = ?, is_paid = ?, paid_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newAmount, isPaid, id],
            function(err) {
                if (err) {
                    console.error('Pay debt error:', err);
                    return res.status(500).json({ success: false, message: err.message });
                }
                res.json({ success: true, message: 'Qarz to\'landi', data: { remaining: newAmount } });
            }
        );
    });
});

// ============================================
// API - REPORTS
// ============================================
app.get('/api/reports/daily', function(req, res) {
    var date = req.query.date;
    var queryDate = date || new Date().toISOString().split('T')[0];
    console.log('📤 GET /api/reports/daily?date=' + queryDate);

    db.get(`
        SELECT 
            COUNT(*) as total_sales,
            COALESCE(SUM(total_price), 0) as total_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
        FROM sales
        WHERE DATE(sale_date) = ?
    `, [queryDate], function(err, row) {
        if (err) {
            console.error('Report error:', err);
            return res.status(500).json({ success: false, message: err.message, data: {} });
        }
        res.json({ success: true, data: row || { total_sales: 0, total_amount: 0 } });
    });
});

app.get('/api/reports/monthly', function(req, res) {
    var year = req.query.year;
    var month = req.query.month;
    var now = new Date();
    var y = year || now.getFullYear();
    var m = month || (now.getMonth() + 1);
    var monthStr = String(m).padStart(2, '0');
    console.log('📤 GET /api/reports/monthly?year=' + y + '&month=' + m);

    db.get(`
        SELECT 
            COUNT(*) as total_sales,
            COALESCE(SUM(total_price), 0) as total_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
        FROM sales
        WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
    `, [String(y), monthStr], function(err, row) {
        if (err) {
            console.error('Monthly report error:', err);
            return res.status(500).json({ success: false, message: err.message, data: {} });
        }
        res.json({ success: true, data: row || { total_sales: 0, total_amount: 0 } });
    });
});

app.get('/api/reports/inventory', function(req, res) {
    console.log('📤 GET /api/reports/inventory');
    db.all('SELECT name, price, cost_price, quantity FROM products', function(err, rows) {
        if (err) {
            console.error('Inventory report error:', err);
            return res.status(500).json({ success: false, message: err.message, data: {} });
        }
        var totalCost = 0, totalPrice = 0, totalQuantity = 0;
        rows.forEach(function(p) {
            var qty = p.quantity || 0;
            totalCost += qty * (p.cost_price || 0);
            totalPrice += qty * (p.price || 0);
            totalQuantity += qty;
        });
        res.json({ success: true, data: {
            total_quantity: totalQuantity,
            total_cost: totalCost,
            total_price: totalPrice,
            potential_profit: totalPrice - totalCost,
            products: rows
        }});
    });
});

app.get('/api/reports/monthly-profit', function(req, res) {
    var year = req.query.year;
    var month = req.query.month;
    var now = new Date();
    var y = year || now.getFullYear();
    var m = month || (now.getMonth() + 1);
    var monthStr = String(m).padStart(2, '0');
    console.log('📤 GET /api/reports/monthly-profit?year=' + y + '&month=' + m);

    db.all(`
        SELECT 
            s.*,
            p.cost_price,
            p.name as product_name,
            (s.price - p.cost_price) * s.quantity as profit
        FROM sales s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
    `, [String(y), monthStr], function(err, rows) {
        if (err) {
            console.error('Monthly profit error:', err);
            return res.status(500).json({ success: false, message: err.message, data: {} });
        }
        var totalProfit = 0;
        rows.forEach(function(r) {
            totalProfit += r.profit || 0;
        });
        res.json({ success: true, data: {
            total_profit: totalProfit,
            total_sales: rows.length,
            details: rows
        }});
    });
});

app.get('/api/reports/all', function(req, res) {
    console.log('📤 GET /api/reports/all');
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var monthStr = String(month).padStart(2, '0');

    db.get(`
        SELECT 
            COUNT(*) as total_sales,
            COALESCE(SUM(total_price), 0) as total_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'cash' THEN total_price ELSE 0 END), 0) as cash_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'terminal' THEN total_price ELSE 0 END), 0) as terminal_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'credit' THEN total_price ELSE 0 END), 0) as credit_amount
        FROM sales
        WHERE strftime('%Y', sale_date) = ? AND strftime('%m', sale_date) = ?
    `, [String(year), monthStr], function(err, monthly) {
        if (err) {
            console.error('Monthly report error:', err);
            return res.status(500).json({ success: false, message: err.message, data: {} });
        }
        db.all('SELECT name, price, cost_price, quantity FROM products', function(err, rows) {
            if (err) {
                console.error('Inventory error:', err);
                return res.status(500).json({ success: false, message: err.message, data: {} });
            }
            var totalCost = 0, totalPrice = 0, totalQuantity = 0;
            rows.forEach(function(p) {
                var qty = p.quantity || 0;
                totalCost += qty * (p.cost_price || 0);
                totalPrice += qty * (p.price || 0);
                totalQuantity += qty;
            });
            db.all(`
                SELECT (s.price - p.cost_price) * s.quantity as profit
                FROM sales s
                LEFT JOIN products p ON s.product_id = p.id
                WHERE strftime('%Y', s.sale_date) = ? AND strftime('%m', s.sale_date) = ?
            `, [String(year), monthStr], function(err, profitRows) {
                if (err) {
                    console.error('Profit error:', err);
                    return res.status(500).json({ success: false, message: err.message, data: {} });
                }
                var totalProfit = 0;
                profitRows.forEach(function(r) {
                    totalProfit += r.profit || 0;
                });
                res.json({ success: true, data: {
                    monthly: monthly || { total_sales: 0, total_amount: 0 },
                    inventory: {
                        total_quantity: totalQuantity,
                        total_cost: totalCost,
                        total_price: totalPrice,
                        potential_profit: totalPrice - totalCost
                    },
                    profit: { total_profit: totalProfit, total_sales: profitRows.length }
                }});
            });
        });
    });
});

// ============================================
// API - EMPLOYEES
// ============================================
app.get('/api/employees', function(req, res) {
    console.log('📤 GET /api/employees');
    db.all('SELECT id, name, email, position, phone FROM employees ORDER BY id DESC', function(err, rows) {
        if (err) {
            console.error('Employees error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

app.post('/api/employees', function(req, res) {
    console.log('📤 POST /api/employees');
    var { name, email, password, position, phone } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Ism va email kiritilishi shart' });
    }

    db.run(
        'INSERT INTO employees (name, email, password, position, phone) VALUES (?, ?, ?, ?, ?)',
        [name, email, password || '123456', position || '', phone || ''],
        function(err) {
            if (err) {
                console.error('Add employee error:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            db.get('SELECT id, name, email, position, phone FROM employees WHERE id = ?', [this.lastID], function(err, row) {
                res.json({ success: true, data: row });
            });
        }
    );
});

app.delete('/api/employees/:id', function(req, res) {
    var id = req.params.id;
    console.log('📤 DELETE /api/employees/' + id);
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Delete employee error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Xodim o\'chirildi' });
    });
});

// ============================================
// API - RETURNS
// ============================================
app.post('/api/returns', function(req, res) {
    console.log('📤 POST /api/returns');
    var { sale_id, product_id, quantity, price, total_price, reason, returned_by } = req.body;
    
    if (!product_id || !quantity) {
        return res.status(400).json({ success: false, message: 'Mahsulot ID va miqdor kiritilishi shart' });
    }
    
    db.get('SELECT * FROM products WHERE id = ?', [product_id], function(err, product) {
        if (err) {
            console.error('Product check error:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (!product) {
            return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        }
        
        var newQuantity = (product.quantity || 0) + parseFloat(quantity);
        
        db.run(
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
            ],
            function(err) {
                if (err) {
                    console.error('Return insert error:', err);
                    return res.status(500).json({ success: false, message: err.message });
                }
                db.run(
                    'UPDATE products SET quantity = ? WHERE id = ?',
                    [newQuantity, product_id],
                    function(err) {
                        if (err) {
                            console.error('Update quantity error:', err);
                            return res.status(500).json({ success: false, message: err.message });
                        }
                        db.get('SELECT * FROM returns WHERE id = ?', [this.lastID], function(err, row) {
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
                        });
                    }
                );
            }
        );
    });
});

app.get('/api/returns', function(req, res) {
    var date = req.query.date;
    var queryDate = date || new Date().toISOString().split('T')[0];
    console.log('📤 GET /api/returns?date=' + queryDate);
    
    db.all(`
        SELECT r.*, p.name as product_name, s.sale_date as original_sale_date
        FROM returns r
        LEFT JOIN products p ON r.product_id = p.id
        LEFT JOIN sales s ON r.sale_id = s.id
        WHERE DATE(r.return_date) = ?
        ORDER BY r.return_date DESC
    `, [queryDate], function(err, rows) {
        if (err) {
            console.error('Get returns error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

app.get('/api/returns/all', function(req, res) {
    console.log('📤 GET /api/returns/all');
    db.all(`
        SELECT r.*, p.name as product_name, s.sale_date as original_sale_date
        FROM returns r
        LEFT JOIN products p ON r.product_id = p.id
        LEFT JOIN sales s ON r.sale_id = s.id
        ORDER BY r.return_date DESC
        LIMIT 100
    `, function(err, rows) {
        if (err) {
            console.error('Get all returns error:', err);
            return res.status(500).json({ success: false, message: err.message, data: [] });
        }
        res.json({ success: true, data: rows || [] });
    });
});

// ============================================
// FRONTEND
// ============================================
app.use(express.static(path.join(__dirname, '../client')));

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
    console.log('🌐 Frontend: http://localhost:' + PORT);
    console.log('='.repeat(50));
});

process.on('uncaughtException', function(err) {
    console.error('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', function(err) {
    console.error('❌ Unhandled Rejection:', err);
});

module.exports = app;