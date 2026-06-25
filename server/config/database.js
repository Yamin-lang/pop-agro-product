const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Data papkasini yaratish
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite connection error:', err.message);
    } else {
        console.log('✅ SQLite connected successfully');
    }
});

// Jadvallarni yaratish
db.serialize(() => {
    // ============================================
    // USERS
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'cashier',
            isActive INTEGER DEFAULT 1,
            lastLogin DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ============================================
    // PRODUCTS - GRAMM UCHUN ANIQLIK QO'SHILDI
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            purchasePrice REAL NOT NULL,
            sellingPrice REAL NOT NULL,
            quantity REAL DEFAULT 0,
            unit TEXT DEFAULT 'dona',
            image TEXT DEFAULT 'default-product.png',
            barcode TEXT,
            minStock REAL DEFAULT 5,
            isActive INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ============================================
    // SALES
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceNumber TEXT UNIQUE NOT NULL,
            shift_id INTEGER,
            cashier_id INTEGER NOT NULL,
            cashierName TEXT DEFAULT 'Admin',
            subtotal REAL NOT NULL,
            discount REAL DEFAULT 0,
            total REAL NOT NULL,
            paymentMethod TEXT NOT NULL,
            paidAmount REAL NOT NULL,
            changeAmount REAL DEFAULT 0,
            customerName TEXT,
            customerPhone TEXT,
            status TEXT DEFAULT 'completed',
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ============================================
    // SALE ITEMS - GRAMM UCHUN ANIQLIK QO'SHILDI
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            productName TEXT NOT NULL,
            productCode TEXT,
            quantity REAL NOT NULL,
            unit TEXT,
            price REAL NOT NULL,
            total REAL NOT NULL
        )
    `);

    // ============================================
    // SHIFTS
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS shifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cashier_id INTEGER NOT NULL,
            openingTime DATETIME DEFAULT CURRENT_TIMESTAMP,
            closingTime DATETIME,
            openingBalance REAL DEFAULT 0,
            closingBalance REAL,
            totalSales REAL DEFAULT 0,
            totalCash REAL DEFAULT 0,
            totalCard REAL DEFAULT 0,
            totalClick REAL DEFAULT 0,
            totalCredit REAL DEFAULT 0,
            status TEXT DEFAULT 'open',
            notes TEXT
        )
    `);

    // ============================================
    // EMPLOYEES
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            position TEXT DEFAULT 'sotuvchi',
            salary REAL,
            hireDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            checkInTime DATETIME,
            checkOutTime DATETIME,
            isActive INTEGER DEFAULT 1,
            notes TEXT
        )
    `);

    // ============================================
    // SETTINGS
    // ============================================
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shopName TEXT DEFAULT 'Pop-agro-product',
            shopAddress TEXT,
            shopPhone TEXT DEFAULT '+998777272113',
            taxNumber TEXT,
            receiptFooter TEXT,
            currency TEXT DEFAULT 'UZS',
            printerType TEXT DEFAULT 'xprinter',
            printerPort TEXT DEFAULT 'USB001',
            paperSize TEXT DEFAULT '80mm',
            lowStockAlert REAL DEFAULT 5,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ============================================
    // ADMIN USER YARATISH
    // ============================================
    db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, row) => {
        if (err) {
            console.error('❌ Admin tekshirish xatosi:', err);
            return;
        }
        if (!row) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                ['Admin', 'admin@example.com', hashedPassword, 'admin'],
                function(err2) {
                    if (err2) {
                        console.error('❌ Admin yaratish xatosi:', err2);
                    } else {
                        console.log('✅ Admin user yaratildi: admin@example.com / admin123');
                    }
                }
            );
        }
    });

    // ============================================
    // GRAMM UCHUN TRIGGER - quantity ni 3 xonagacha yaxlitlash
    // ============================================
    db.run(`
        CREATE TRIGGER IF NOT EXISTS round_quantity 
        BEFORE INSERT ON products 
        BEGIN
            UPDATE products SET quantity = ROUND(quantity, 3);
        END
    `, (err) => {
        if (err && !err.message.includes('already exists')) {
            console.error('❌ Trigger yaratish xatosi:', err);
        }
    });

    db.run(`
        CREATE TRIGGER IF NOT EXISTS round_quantity_update 
        BEFORE UPDATE ON products 
        BEGIN
            UPDATE products SET quantity = ROUND(quantity, 3);
        END
    `, (err) => {
        if (err && !err.message.includes('already exists')) {
            console.error('❌ Trigger yaratish xatosi:', err);
        }
    });

    console.log('✅ Database tables created successfully');
    console.log('✅ Gramm aniqlik (0.001) qo\'shildi');
});

module.exports = db;