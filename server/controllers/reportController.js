const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Shift = require('../models/Shift');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

// Kunlik hisobot
exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const sales = await Sale.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'completed'
        }).populate('cashier', 'name');

        // Statistikani hisoblash
        const summary = {
            totalSales: 0,
            totalCash: 0,
            totalCard: 0,
            totalClick: 0,
            totalCredit: 0,
            totalDiscount: 0,
            count: sales.length
        };

        const cashiers = {};

        sales.forEach(sale => {
            summary.totalSales += sale.total;
            summary.totalDiscount += sale.discount || 0;
            
            if (sale.paymentMethod === 'naxt') summary.totalCash += sale.total;
            else if (sale.paymentMethod === 'karta') summary.totalCard += sale.total;
            else if (sale.paymentMethod === 'clik') summary.totalClick += sale.total;
            else if (sale.paymentMethod === 'nasiya') summary.totalCredit += sale.total;

            // Kassirlar bo'yicha
            const cashierName = sale.cashier ? sale.cashier.name : 'Noma\'lum';
            if (!cashiers[cashierName]) {
                cashiers[cashierName] = { count: 0, total: 0 };
            }
            cashiers[cashierName].count += 1;
            cashiers[cashierName].total += sale.total;
        });

        res.json({
            success: true,
            data: {
                date: startOfDay,
                summary,
                cashiers,
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

// Oylik hisobot
exports.getMonthlyReport = async (req, res) => {
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
            totalSales: 0,
            totalCash: 0,
            totalCard: 0,
            totalClick: 0,
            totalCredit: 0,
            totalDiscount: 0,
            count: sales.length
        };

        // Kunlik ma'lumotlar
        const dailyData = {};

        sales.forEach(sale => {
            summary.totalSales += sale.total;
            summary.totalDiscount += sale.discount || 0;
            
            if (sale.paymentMethod === 'naxt') summary.totalCash += sale.total;
            else if (sale.paymentMethod === 'karta') summary.totalCard += sale.total;
            else if (sale.paymentMethod === 'clik') summary.totalClick += sale.total;
            else if (sale.paymentMethod === 'nasiya') summary.totalCredit += sale.total;

            const day = moment(sale.createdAt).format('DD');
            if (!dailyData[day]) {
                dailyData[day] = { count: 0, total: 0 };
            }
            dailyData[day].count += 1;
            dailyData[day].total += sale.total;
        });

        res.json({
            success: true,
            data: {
                year: targetYear,
                month: targetMonth,
                summary,
                dailyData,
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

// To'liq hisobot
exports.getFullReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { status: 'completed' };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const sales = await Sale.find(query)
            .populate('cashier', 'name')
            .populate('items.product');

        const products = await Product.find({ isActive: true });

        // Mahsulotlar bo'yicha statistik
        const productStats = {};
        let totalSales = 0;
        let totalItems = 0;

        sales.forEach(sale => {
            totalSales += sale.total;
            sale.items.forEach(item => {
                totalItems += item.quantity;
                const productId = item.product._id.toString();
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: item.productName,
                        code: item.productCode,
                        quantity: 0,
                        total: 0
                    };
                }
                productStats[productId].quantity += item.quantity;
                productStats[productId].total += item.total;
            });
        });

        res.json({
            success: true,
            data: {
                period: {
                    startDate: startDate || 'Boshidan',
                    endDate: endDate || 'Hozirgacha'
                },
                summary: {
                    totalSales,
                    totalItems,
                    totalTransactions: sales.length
                },
                productStats: Object.values(productStats).sort((a, b) => b.total - a.total),
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

// Excelga hisobot
exports.exportReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { status: 'completed' };

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const sales = await Sale.find(query)
            .populate('cashier', 'name');

        const data = sales.map(sale => ({
            'Chek raqami': sale.invoiceNumber,
            'Sana': moment(sale.createdAt).format('DD.MM.YYYY HH:mm'),
            'Kassir': sale.cashier ? sale.cashier.name : 'Noma\'lum',
            'Mahsulotlar soni': sale.items.length,
            'Umumiy': sale.subtotal,
            'Chegirma': sale.discount || 0,
            'Jami': sale.total,
            'To\'lov usuli': sale.paymentMethod,
            'To\'langan': sale.paidAmount,
            'Qaytim': sale.change || 0
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Hisobot');

        const filePath = path.join(__dirname, '../uploads/report_export.xlsx');
        XLSX.writeFile(wb, filePath);

        res.download(filePath, 'hisobot.xlsx', (err) => {
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