// ============================================
// API.JS - SERVER BOG'LANISH
// ============================================

var API_BASE = 'http://localhost:5000/api';

console.log('✅ API loaded, base:', API_BASE);

// ============================================
// API SO'ROVLAR
// ============================================
var API = {
    // ==================== PRODUCTS ====================
    getProducts: function() {
        console.log('📤 API.getProducts called');
        return fetch(API_BASE + '/products')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Products count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get products error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    addProduct: function(data) {
        console.log('📤 API.addProduct called with:', data);
        return fetch(API_BASE + '/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Add product response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Add product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    updateProduct: function(id, data) {
        console.log('📤 API.updateProduct called - ID:', id, 'Data:', data);
        return fetch(API_BASE + '/products/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Update product response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Update product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    deleteProduct: function(id) {
        console.log('🗑️ API.deleteProduct called - ID:', id);
        return fetch(API_BASE + '/products/' + id, {
            method: 'DELETE'
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Delete product response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Delete product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // ==================== SALES ====================
    addSale: function(data) {
        console.log('📤 API.addSale called with:', data);
        return fetch(API_BASE + '/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Add sale response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Add sale error:', err);
            return { success: false, message: err.message };
        });
    },
    
    getSales: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        console.log('📤 API.getSales called - date:', queryDate);
        return fetch(API_BASE + '/sales/daily?date=' + queryDate)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Sales count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get sales error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    getMonthlySales: function(year, month) {
        var now = new Date();
        var y = year || now.getFullYear();
        var m = month || (now.getMonth() + 1);
        console.log('📤 API.getMonthlySales called - year:', y, 'month:', m);
        return fetch(API_BASE + '/sales/monthly?year=' + y + '&month=' + m)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Monthly sales count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get monthly sales error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== SHIFTS ====================
    openShift: function(balance) {
        console.log('📤 API.openShift called - balance:', balance);
        return fetch(API_BASE + '/shifts/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openingBalance: balance || 0 })
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Open shift response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Open shift error:', err);
            return { success: false, message: err.message };
        });
    },
    
    closeShift: function(balance) {
        console.log('📤 API.closeShift called - balance:', balance);
        return fetch(API_BASE + '/shifts/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ closingBalance: balance || 0 })
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Close shift response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Close shift error:', err);
            return { success: false, message: err.message };
        });
    },
    
    getCurrentShift: function() {
        console.log('📤 API.getCurrentShift called');
        return fetch(API_BASE + '/shifts/current')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Current shift:', data);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get current shift error:', err);
                return { success: false, message: err.message, data: null };
            });
    },
    
    getShiftHistory: function() {
        console.log('📤 API.getShiftHistory called');
        return fetch(API_BASE + '/shifts/history')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Shift history count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get shift history error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== DEBTORS ====================
    getDebtors: function() {
        console.log('📤 API.getDebtors called');
        return fetch(API_BASE + '/debtors')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Debtors count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get debtors error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    payDebt: function(id, amount) {
        console.log('📤 API.payDebt called - ID:', id, 'Amount:', amount);
        return fetch(API_BASE + '/debtors/' + id + '/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount || 0 })
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Pay debt response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Pay debt error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // ==================== REPORTS ====================
    getDailyReport: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        console.log('📤 API.getDailyReport called - date:', queryDate);
        return fetch(API_BASE + '/reports/daily?date=' + queryDate)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Daily report:', data);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get daily report error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    // ==================== EMPLOYEES ====================
    getEmployees: function() {
        console.log('📤 API.getEmployees called');
        return fetch(API_BASE + '/employees')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Employees count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get employees error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    addEmployee: function(data) {
        console.log('📤 API.addEmployee called with:', data);
        return fetch(API_BASE + '/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Add employee response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Add employee error:', err);
            return { success: false, message: err.message };
        });
    },
    
    deleteEmployee: function(id) {
        console.log('📤 API.deleteEmployee called - ID:', id);
        return fetch(API_BASE + '/employees/' + id, {
            method: 'DELETE'
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Delete employee response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Delete employee error:', err);
            return { success: false, message: err.message };
        });
    },
    
    // ==================== RETURNS (QAYTARISH) ====================
    
    returnProduct: function(data) {
        console.log('📤 API.returnProduct called with:', data);
        return fetch(API_BASE + '/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Return product response:', data);
            return data;
        })
        .catch(function(err) {
            console.error('❌ Return product error:', err);
            return { success: false, message: err.message };
        });
    },
    
    getReturns: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        console.log('📤 API.getReturns called - date:', queryDate);
        return fetch(API_BASE + '/returns?date=' + queryDate)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Returns count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get returns error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    getAllReturns: function() {
        console.log('📤 API.getAllReturns called');
        return fetch(API_BASE + '/returns/all')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                return r.json();
            })
            .then(function(data) {
                console.log('📥 All returns count:', data.data ? data.data.length : 0);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get all returns error:', err);
                return { success: false, message: err.message, data: [] };
            });
    }
};

console.log('✅ API ready - all functions loaded');