// ============================================
// API.JS - SERVER BOG'LANISH
// ============================================

const API_BASE = 'http://localhost:5000/api';

console.log('✅ API loaded, base:', API_BASE);

// ============================================
// API SO'ROVLAR
// ============================================
const API = {
    // ==================== PRODUCTS ====================
    getProducts: function() {
        return fetch(API_BASE + '/products')
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get products error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    addProduct: function(data) {
        return fetch(API_BASE + '/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Add product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    updateProduct: function(id, data) {
        return fetch(API_BASE + '/products/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Update product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    deleteProduct: function(id) {
        return fetch(API_BASE + '/products/' + id, {
            method: 'DELETE'
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Delete product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // ==================== SALES ====================
    addSale: function(data) {
        return fetch(API_BASE + '/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Add sale error:', err);
            return { success: false, message: err.message };
        });
    },
    
    getSales: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        return fetch(API_BASE + '/sales/daily?date=' + queryDate)
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get sales error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    getMonthlySales: function(year, month) {
        var now = new Date();
        var y = year || now.getFullYear();
        var m = month || (now.getMonth() + 1);
        return fetch(API_BASE + '/sales/monthly?year=' + y + '&month=' + m)
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get monthly sales error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== SHIFTS ====================
    openShift: function(balance) {
        return fetch(API_BASE + '/shifts/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openingBalance: balance || 0 })
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Open shift error:', err);
            return { success: false, message: err.message };
        });
    },
    
    closeShift: function(balance) {
        return fetch(API_BASE + '/shifts/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ closingBalance: balance || 0 })
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Close shift error:', err);
            return { success: false, message: err.message };
        });
    },
    
    getCurrentShift: function() {
        return fetch(API_BASE + '/shifts/current')
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get current shift error:', err);
                return { success: false, message: err.message, data: null };
            });
    },
    
    getShiftHistory: function() {
        return fetch(API_BASE + '/shifts/history')
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get shift history error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== DEBTORS ====================
    getDebtors: function() {
        return fetch(API_BASE + '/debtors')
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get debtors error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    payDebt: function(id, amount) {
        return fetch(API_BASE + '/debtors/' + id + '/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount || 0 })
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Pay debt error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // ==================== REPORTS ====================
    getDailyReport: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        return fetch(API_BASE + '/reports/daily?date=' + queryDate)
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get report error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    // ==================== EMPLOYEES ====================
    getEmployees: function() {
        return fetch(API_BASE + '/employees')
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get employees error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    addEmployee: function(data) {
        return fetch(API_BASE + '/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Add employee error:', err);
            return { success: false, message: err.message };
        });
    },
    
    deleteEmployee: function(id) {
        return fetch(API_BASE + '/employees/' + id, {
            method: 'DELETE'
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Delete employee error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // ==================== 🔥 RETURNS (QAYTARISH) ====================
    
    // Mahsulotni qaytarib olish
    returnProduct: function(data) {
        return fetch(API_BASE + '/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .catch(function(err) {
            console.error('Return product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // Kunlik qaytarishlar ro'yxati
    getReturns: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        return fetch(API_BASE + '/returns?date=' + queryDate)
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get returns error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // Barcha qaytarishlar
    getAllReturns: function() {
        return fetch(API_BASE + '/returns/all')
            .then(function(r) { return r.json(); })
            .catch(function(err) {
                console.error('Get all returns error:', err);
                return { success: false, message: err.message, data: [] };
            });
    }
};