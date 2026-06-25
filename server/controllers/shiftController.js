const Shift = require('../models/Shift');
const User = require('../models/User');
const Sale = require('../models/Sale');
const moment = require('moment');

// Smena ochish
exports.openShift = async (req, res) => {
    try {
        const { openingBalance } = req.body;

        // Avvalgi ochiq smena borligini tekshirish
        const existingShift = await Shift.findOne({
            cashier: req.user._id,
            status: 'open'
        });

        if (existingShift) {
            return res.status(400).json({
                success: false,
                message: 'Sizda allaqachon ochiq smena mavjud'
            });
        }

        const shift = new Shift({
            cashier: req.user._id,
            openingBalance: openingBalance || 0,
            openingTime: new Date(),
            status: 'open'
        });

        await shift.save();

        res.status(201).json({
            success: true,
            data: shift,
            message: 'Smena muvaffaqiyatli ochildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Smena yopish
exports.closeShift = async (req, res) => {
    try {
        const { closingBalance } = req.body;

        const shift = await Shift.findOne({
            cashier: req.user._id,
            status: 'open'
        });

        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Ochiq smena topilmadi'
            });
        }

        // Smena davomidagi savdolarni hisoblash
        const sales = await Sale.find({
            shift: shift._id,
            status: 'completed'
        });

        let totalCash = 0, totalCard = 0, totalClick = 0, totalCredit = 0;
        let totalSales = 0;

        sales.forEach(sale => {
            totalSales += sale.total;
            if (sale.paymentMethod === 'naxt') totalCash += sale.total;
            else if (sale.paymentMethod === 'karta') totalCard += sale.total;
            else if (sale.paymentMethod === 'clik') totalClick += sale.total;
            else if (sale.paymentMethod === 'nasiya') totalCredit += sale.total;
        });

        shift.closingTime = new Date();
        shift.status = 'closed';
        shift.closingBalance = closingBalance || 0;
        shift.totalSales = totalSales;
        shift.totalCash = totalCash;
        shift.totalCard = totalCard;
        shift.totalClick = totalClick;
        shift.totalCredit = totalCredit;

        await shift.save();

        res.json({
            success: true,
            data: shift,
            summary: {
                totalSales,
                totalCash,
                totalCard,
                totalClick,
                totalCredit,
                salesCount: sales.length
            },
            message: 'Smena muvaffaqiyatli yopildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Joriy smena holati
exports.getCurrentShift = async (req, res) => {
    try {
        const shift = await Shift.findOne({
            cashier: req.user._id,
            status: 'open'
        }).populate('cashier', 'name email');

        if (!shift) {
            return res.json({
                success: true,
                data: null,
                message: 'Ochiq smena mavjud emas'
            });
        }

        // Smenadagi savdolarni hisoblash
        const sales = await Sale.find({
            shift: shift._id,
            status: 'completed'
        });

        let totalCash = 0, totalCard = 0, totalClick = 0, totalCredit = 0;
        let totalSales = 0;

        sales.forEach(sale => {
            totalSales += sale.total;
            if (sale.paymentMethod === 'naxt') totalCash += sale.total;
            else if (sale.paymentMethod === 'karta') totalCard += sale.total;
            else if (sale.paymentMethod === 'clik') totalClick += sale.total;
            else if (sale.paymentMethod === 'nasiya') totalCredit += sale.total;
        });

        res.json({
            success: true,
            data: {
                shift,
                summary: {
                    totalSales,
                    totalCash,
                    totalCard,
                    totalClick,
                    totalCredit,
                    salesCount: sales.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Smena tarixi
exports.getShiftHistory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { status: 'closed' };

        if (startDate && endDate) {
            query.closingTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const shifts = await Shift.find(query)
            .populate('cashier', 'name email')
            .sort({ closingTime: -1 });

        res.json({
            success: true,
            data: shifts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bitta smena
exports.getShiftById = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id)
            .populate('cashier', 'name email');

        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Smena topilmadi'
            });
        }

        const sales = await Sale.find({
            shift: shift._id,
            status: 'completed'
        });

        res.json({
            success: true,
            data: {
                shift,
                sales,
                salesCount: sales.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};