const Employee = require('../models/Employee');

// Barcha xodimlar
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xodim qo'shish
exports.createEmployee = async (req, res) => {
    try {
        const { name, phone, position, salary, notes } = req.body;

        const employee = new Employee({
            name,
            phone,
            position: position || 'sotuvchi',
            salary: salary || 0,
            notes,
            hireDate: new Date()
        });

        await employee.save();

        res.status(201).json({
            success: true,
            data: employee,
            message: 'Xodim muvaffaqiyatli qo\'shildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xodimni yangilash
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Xodim topilmadi'
            });
        }

        res.json({
            success: true,
            data: employee,
            message: 'Xodim yangilandi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xodimni o'chirish
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Xodim topilmadi'
            });
        }

        res.json({
            success: true,
            message: 'Xodim o\'chirildi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Kelgan vaqtini belgilash
exports.checkIn = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Xodim topilmadi'
            });
        }

        employee.checkInTime = new Date();
        await employee.save();

        res.json({
            success: true,
            data: employee,
            message: `${employee.name} ishga keldi`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Chiqish vaqtini belgilash
exports.checkOut = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Xodim topilmadi'
            });
        }

        employee.checkOutTime = new Date();
        await employee.save();

        res.json({
            success: true,
            data: employee,
            message: `${employee.name} ishdan chiqdi`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};