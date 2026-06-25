const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Shift = require('../models/Shift');
const User = require('../models/User');
const moment = require('moment');

// Yangi savdo qilish
exports.createSale = async (req, res) => {
    try {
        const { items, discount, paymentMethod, paidAmount, customerName, customerPhone } = req.body;

        // Smena ochiqligini tekshirish
        const activeShift = await Shift.findOne({ 
            cashier: req.user._id, 
            status: 'open' 
        });

        if (!activeShift) {
            return res.status(400).json({
                success: false,
                message: 'Smena ochilmagan. Iltimos, smenani oching!'
            });
        }

        let subtotal = 0;
        const saleItems = [];

        // Har bir mahsulotni tekshirish va hisoblash
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Mahsulot topilmadi: ${item.productId}`
                });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} dan yetarli emas. Mavjud: ${product.quantity}`
                });
            }

            const total = item.quantity * product.sellingPrice;
            subtotal += total;

            saleItems.push({
                product: product._id,
                productName: product.name,
                productCode: product.code,
                quantity: item.quantity,
                unit: product.unit,
                price: product.sellingPrice,
                total: total
            });

            // Mahsulot sonini kamaytirish
            product.quantity -= item.quantity;
            await product.save();
        }

        const total = subtotal - (discount || 0);

        // Savdoni yaratish
        const sale = new Sale({
            shift: activeShift._id,
            cashier: req.user._id,
            items: saleItems,
            subtotal,
            discount: discount || 0,
            total,
            paymentMethod,
            paidAmount: paidAmount || total,
            change: (paidAmount || total) - total,
            customerName,
            customerPhone,
            status: 'completed'
        });

        await sale.save();

        // Smena statistikasini yangilash
        activeShift.totalSales += total;
        if (paymentMethod === 'naxt') activeShift.totalCash += total;
        else if (paymentMethod === 'karta') activeShift.totalCard += total;
        else if (paymentMethod === 'clik') activeShift.totalClick += total;
        else if (paymentMethod === 'nasiya') activeShift.totalCredit += total;
        await activeShift.save();

        res.status(201).json({
            success: true,
            data: sale,
            message: 'Savdo muvaffaqiyatli amalga oshirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Barcha savdolarni olish
exports.getAllSales = async (req, res) => {
    try {
        const { startDate, endDate, paymentMethod } = req.query;
        let query = { status: 'completed' };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        const sales = await Sale.find(query)
            .populate('cashier', 'name email')
            .populate('shift')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: sales
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bitta savdoni olish
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('cashier', 'name email')
            .populate('shift')
            .populate('items.product');

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Savdo topilmadi'
            });
        }

        res.json({
            success: true,
            data: sale
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Kunlik savdo
exports.getDailySales = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const sales = await Sale.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
        });

        const summary = {
            total: 0,
            naxt: 0,
            karta: 0,
            clik: 0,
            nasiya: 0,
            count: sales.length
        };

        sales.forEach(sale => {
            summary.total += sale.total;
            if (sale.paymentMethod === 'naxt') summary.naxt += sale.total;
            else if (sale.paymentMethod === 'karta') summary.karta += sale.total;
            else if (sale.paymentMethod === 'clik') summary.clik += sale.total;
            else if (sale.paymentMethod === 'nasiya') summary.nasiya += sale.total;
        });

        res.json({
            success: true,
            data: {
                date: startOfDay,
                summary,
                sales
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Oylik savdo
exports.getMonthlySales = async (req, res) => {
    try {
        const { year, month } = req.query;
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month || new Date().getMonth() + 1;

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const sales = await Sale.find({
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'completed'
        });

        const summary = {
            total: 0,
            naxt: 0,
            karta: 0,
            clik: 0,
            nasiya: 0,
            count: sales.length
        };

        sales.forEach(sale => {
            summary.total += sale.total;
            if (sale.paymentMethod === 'naxt') summary.naxt += sale.total;
            else if (sale.paymentMethod === 'karta') summary.karta += sale.total;
            else if (sale.paymentMethod === 'clik') summary.clik += sale.total;
            else if (sale.paymentMethod === 'nasiya') summary.nasiya += sale.total;
        });

        res.json({
            success: true,
            data: {
                year: targetYear,
                month: targetMonth,
                summary,
                sales
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Chek chop etish
exports.printReceipt = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('cashier', 'name')
            .populate('items.product');

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Savdo topilmadi'
            });
        }

        // Chek ma'lumotlarini tayyorlash
        const receipt = {
            shopName: 'Pop-agro-product',
            phone: '+998777272113',
            invoiceNumber: sale.invoiceNumber,
            date: moment(sale.createdAt).format('DD.MM.YYYY HH:mm'),
            cashier: sale.cashier.name,
            items: sale.items.map(item => ({
                name: item.productName,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })),
            subtotal: sale.subtotal,
            discount: sale.discount,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            paidAmount: sale.paidAmount,
            change: sale.change
        };

        res.json({
            success: true,
            data: receipt,
            message: 'Chek tayyor'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Savdoni bekor qilish
exports.cancelSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Savdo topilmadi'
            });
        }

        if (sale.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Savdo allaqachon bekor qilingan'
            });
        }

        // Mahsulotlarni qaytarish
        for (const item of sale.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        sale.status = 'cancelled';
        await sale.save();

        res.json({
            success: true,
            message: 'Savdo bekor qilindi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};