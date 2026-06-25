const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads papkasini yaratish
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer sozlamalari
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('❌ Faqat rasm fayllari yuklanishi mumkin!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// ===== Barcha mahsulotlarni olish =====
router.get('/', (req, res) => {
    const db = req.app.get('db');
    
    db.all('SELECT * FROM products WHERE isActive = 1 ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            const products = rows.map(p => {
                if (p.image && p.image !== 'default-product.png' && !p.image.startsWith('http')) {
                    p.image = 'http://localhost:5000/uploads/' + p.image;
                }
                return p;
            });
            res.json({ success: true, data: products });
        }
    });
});

// ===== Mahsulot qo'shish =====
router.post('/', upload.single('image'), (req, res) => {
    const db = req.app.get('db');
    const { name, code, category, purchasePrice, sellingPrice, quantity, unit, minStock } = req.body;
    const imageFile = req.file ? req.file.filename : 'default-product.png';
    
    db.get('SELECT * FROM products WHERE code = ?', [code], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
            return;
        }
        if (row) {
            if (req.file) fs.unlink(req.file.path, () => {});
            res.status(400).json({ success: false, message: '❌ Bu kod bilan mahsulot allaqachon mavjud!' });
            return;
        }
        
        db.run(
            `INSERT INTO products (name, code, category, purchasePrice, sellingPrice, quantity, unit, minStock, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, code, category, parseFloat(purchasePrice) || 0, parseFloat(sellingPrice) || 0,
             parseFloat(quantity) || 0, unit || 'dona', parseFloat(minStock) || 5, imageFile],
            function(err2) {
                if (err2) {
                    if (req.file) fs.unlink(req.file.path, () => {});
                    res.status(500).json({ success: false, message: err2.message });
                } else {
                    res.status(201).json({
                        success: true,
                        data: { id: this.lastID, name, code, category, image: 'http://localhost:5000/uploads/' + imageFile },
                        message: '✅ Mahsulot qo\'shildi!'
                    });
                }
            }
        );
    });
});

// ===== Mahsulotni yangilash =====
router.put('/:id', upload.single('image'), (req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    const { name, code, category, purchasePrice, sellingPrice, quantity, unit, minStock } = req.body;
    const imageFile = req.file ? req.file.filename : null;
    
    db.get('SELECT * FROM products WHERE code = ? AND id != ?', [code, id], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
            return;
        }
        if (row) {
            if (req.file) fs.unlink(req.file.path, () => {});
            res.status(400).json({ success: false, message: '❌ Bu kod bilan mahsulot allaqachon mavjud!' });
            return;
        }
        
        let query, params;
        if (imageFile) {
            query = `UPDATE products SET name=?, code=?, category=?, purchasePrice=?, sellingPrice=?,
                     quantity=?, unit=?, minStock=?, image=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?`;
            params = [name, code, category, parseFloat(purchasePrice) || 0, parseFloat(sellingPrice) || 0,
                      parseFloat(quantity) || 0, unit || 'dona', parseFloat(minStock) || 5, imageFile, id];
        } else {
            query = `UPDATE products SET name=?, code=?, category=?, purchasePrice=?, sellingPrice=?,
                     quantity=?, unit=?, minStock=?, updatedAt=CURRENT_TIMESTAMP WHERE id=?`;
            params = [name, code, category, parseFloat(purchasePrice) || 0, parseFloat(sellingPrice) || 0,
                      parseFloat(quantity) || 0, unit || 'dona', parseFloat(minStock) || 5, id];
        }
        
        db.run(query, params, function(err2) {
            if (err2) {
                if (req.file) fs.unlink(req.file.path, () => {});
                res.status(500).json({ success: false, message: err2.message });
            } else {
                res.json({ success: true, message: '✅ Mahsulot yangilandi!' });
            }
        });
    });
});

// ===== Mahsulotni o'chirish =====
router.delete('/:id', (req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    
    db.get('SELECT image FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
            return;
        }
        
        db.run('UPDATE products SET isActive = 0 WHERE id = ?', [id], function(err2) {
            if (err2) {
                res.status(500).json({ success: false, message: err2.message });
            } else {
                if (row && row.image && row.image !== 'default-product.png') {
                    fs.unlink(path.join(__dirname, '../uploads', row.image), () => {});
                }
                res.json({ success: true, message: '🗑️ Mahsulot o\'chirildi!' });
            }
        });
    });
});

// ===== Kod bo'yicha qidirish =====
router.get('/search/:code', (req, res) => {
    const db = req.app.get('db');
    const code = req.params.code;
    
    db.get('SELECT * FROM products WHERE code = ? AND isActive = 1', [code], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else if (!row) {
            res.status(404).json({ success: false, message: '❌ Mahsulot topilmadi!' });
        } else {
            if (row.image && row.image !== 'default-product.png' && !row.image.startsWith('http')) {
                row.image = 'http://localhost:5000/uploads/' + row.image;
            }
            res.json({ success: true, data: row });
        }
    });
});

// ===== Kam qolgan mahsulotlar =====
router.get('/low-stock', (req, res) => {
    const db = req.app.get('db');
    
    db.all('SELECT * FROM products WHERE isActive = 1 AND quantity <= minStock ORDER BY quantity ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
        } else {
            res.json({ success: true, data: rows });
        }
    });
});

// ===== Excelga yuklash =====
router.get('/export/excel', (req, res) => {
    const db = req.app.get('db');
    const XLSX = require('xlsx');
    
    db.all('SELECT * FROM products WHERE isActive = 1', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: err.message });
            return;
        }
        
        const data = rows.map(p => ({
            'Mahsulot nomi': p.name,
            'Kod': p.code,
            'Kategoriya': p.category,
            'Kelish narxi': p.purchasePrice,
            'Sotish narxi': p.sellingPrice,
            'Soni': p.quantity,
            'Birlik': p.unit,
            'Minimal zaxira': p.minStock
        }));
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');
        
        const filePath = path.join(__dirname, '../uploads/products_export.xlsx');
        XLSX.writeFile(wb, filePath);
        
        res.download(filePath, 'mahsulotlar_royxati.xlsx', () => {
            setTimeout(() => fs.unlink(filePath, () => {}), 5000);
        });
    });
});

module.exports = router;