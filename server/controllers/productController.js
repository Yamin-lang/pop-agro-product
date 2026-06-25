const Product = require('../models/Product');
const Sale = require('../models/Sale');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Barcha mahsulotlarni olish
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };

        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bitta mahsulot
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mahsulot qo'shish
exports.createProduct = async (req, res) => {
    try {
        const { name, code, category, purchasePrice, sellingPrice, quantity, unit, minStock } = req.body;

        const existingProduct = await Product.findOne({ code });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Bu kod bilan mahsulot allaqachon mavjud'
            });
        }

        const product = new Product({
            name,
            code,
            category,
            purchasePrice: Number(purchasePrice),
            sellingPrice: Number(sellingPrice),
            quantity: Number(quantity) || 0,
            unit: unit || 'dona',
            minStock: Number(minStock) || 5,
            image: req.file ? req.file.filename : 'default-product.png'
        });

        await product.save();
        res.status(201).json({
            success: true,
            data: product,
            message: 'Mahsulot muvaffaqiyatli qo\'shildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mahsulotni yangilash
exports.updateProduct = async (req, res) => {
    try {
        const updates = req.body;
        if (req.file) {
            updates.image = req.file.filename;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        res.json({
            success: true,
            data: product,
            message: 'Mahsulot yangilandi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mahsulotni o'chirish
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi'
            });
        }

        res.json({
            success: true,
            message: 'Mahsulot o\'chirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Kod bo'yicha qidirish (kassa uchun)
exports.searchByCode = async (req, res) => {
    try {
        const code = req.params.code;
        const product = await Product.findOne({ 
            code: code,
            isActive: true,
            quantity: { $gt: 0 }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Mahsulot topilmadi yoki yetarli emas'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Kam qolgan mahsulotlar
exports.getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ['$quantity', '$minStock'] }
        }).sort({ quantity: 1 });

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Kam sotilayotgan mahsulotlar
exports.getSlowMovingProducts = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sales = await Sale.find({
            createdAt: { $gte: thirtyDaysAgo },
            status: 'completed'
        });

        const productSales = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const productId = item.product.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId,
                        productName: item.productName,
                        totalQuantity: 0,
                        totalAmount: 0
                    };
                }
                productSales[productId].totalQuantity += item.quantity;
                productSales[productId].totalAmount += item.total;
            });
        });

        const sortedProducts = Object.values(productSales)
            .sort((a, b) => a.totalQuantity - b.totalQuantity)
            .slice(0, 20);

        const productIds = sortedProducts.map(p => p.productId);
        const products = await Product.find({
            _id: { $in: productIds }
        });

        const result = sortedProducts.map(sp => {
            const product = products.find(p => p._id.toString() === sp.productId);
            return {
                ...sp,
                product,
                stock: product ? product.quantity : 0
            };
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Excelga yuklash
exports.exportToExcel = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });

        const data = products.map(p => ({
            'Mahsulot nomi': p.name,
            'Kod': p.code,
            'Kategoriya': p.category,
            'Kelish narxi': p.purchasePrice,
            'Sotish narxi': p.sellingPrice,
            'Soni': p.quantity,
            'Birlik': p.unit,
            'Minimal zaxira': p.minStock,
            'Holat': p.isActive ? 'Faol' : 'Faol emas'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Mahsulotlar');

        const filePath = path.join(__dirname, '../uploads/products_export.xlsx');
        XLSX.writeFile(wb, filePath);

        res.download(filePath, 'mahsulotlar_ro\'yxati.xlsx', (err) => {
            if (err) {
                console.error('Yuklab olishda xatolik:', err);
            }
            setTimeout(() => {
                fs.unlink(filePath, () => {});
            }, 5000);
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};