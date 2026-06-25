// ============================================
// API.JS - SERVER BOG'LANISH (TO'LIQ TUZATILGAN)
// ============================================

// ============================================
// 🔥 API BASE - AVTOMATIK ANIQLASH
// ============================================
var API_BASE = (function() {
    // Agar Vercel da bo'lsa
    if (window.location.hostname.includes('vercel.app')) {
        return 'https://pop-agro-product.vercel.app/api';  // 🔥 TO'LIQ URL
    }
    // Agar localhost da bo'lsa
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // Agar boshqa domain bo'lsa
    return window.location.origin + '/api';
})();

// Global qilish
window.API_BASE = API_BASE;

console.log('✅ API_BASE:', API_BASE);

// ============================================
// API SO'ROVLAR
// ============================================
var API = {
    // ==================== PRODUCTS ====================
    getProducts: function() {
        console.log('📤 API.getProducts - URL:', API_BASE + '/products');
        return fetch(API_BASE + '/products')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
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
        console.log('📤 API.addProduct - URL:', API_BASE + '/products');
        return fetch(API_BASE + '/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        console.log('📤 API.updateProduct - URL:', API_BASE + '/products/' + id);
        return fetch(API_BASE + '/products/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        console.log('🗑️ API.deleteProduct - URL:', API_BASE + '/products/' + id);
        return fetch(API_BASE + '/products/' + id, {
            method: 'DELETE'
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        console.log('📤 API.addSale - URL:', API_BASE + '/sales');
        return fetch(API_BASE + '/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
    
    getSales: function(date, shiftId) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        var url = API_BASE + '/sales/daily?date=' + queryDate;
        if (shiftId) {
            url += '&shift_id=' + shiftId;
        }
        console.log('📤 API.getSales - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
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
        var url = API_BASE + '/sales/monthly?year=' + y + '&month=' + m;
        console.log('📤 API.getMonthlySales - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get monthly sales error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== SHIFTS ====================
    openShift: function(balance) {
        console.log('📤 API.openShift - URL:', API_BASE + '/shifts/open');
        return fetch(API_BASE + '/shifts/open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openingBalance: balance || 0 })
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
            return r.json();
        })
        .then(function(data) {
            return data;
        })
        .catch(function(err) {
            console.error('❌ Open shift error:', err);
            return { success: false, message: err.message };
        });
    },
    
    closeShift: function(balance) {
        console.log('📤 API.closeShift - URL:', API_BASE + '/shifts/close');
        return fetch(API_BASE + '/shifts/close', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ closingBalance: balance || 0 })
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
            return r.json();
        })
        .then(function(data) {
            return data;
        })
        .catch(function(err) {
            console.error('❌ Close shift error:', err);
            return { success: false, message: err.message };
        });
    },
    
    getCurrentShift: function() {
        console.log('📤 API.getCurrentShift - URL:', API_BASE + '/shifts/current');
        return fetch(API_BASE + '/shifts/current')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get current shift error:', err);
                return { success: false, message: err.message, data: null };
            });
    },
    
    getShiftHistory: function() {
        console.log('📤 API.getShiftHistory - URL:', API_BASE + '/shifts/history');
        return fetch(API_BASE + '/shifts/history')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get shift history error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== DEBTORS ====================
    getDebtors: function() {
        console.log('📤 API.getDebtors - URL:', API_BASE + '/debtors');
        return fetch(API_BASE + '/debtors')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
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
        console.log('📤 API.payDebt - URL:', API_BASE + '/debtors/' + id + '/pay');
        return fetch(API_BASE + '/debtors/' + id + '/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount || 0 })
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        var url = API_BASE + '/reports/daily?date=' + queryDate;
        console.log('📤 API.getDailyReport - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get daily report error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    // ==================== 📊 QO'SHIMCHA HISOBOTLAR ====================
    getMonthlyReport: function(year, month) {
        var now = new Date();
        var y = year || now.getFullYear();
        var m = month || (now.getMonth() + 1);
        var url = API_BASE + '/reports/monthly?year=' + y + '&month=' + m;
        console.log('📤 API.getMonthlyReport - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get monthly report error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    getInventoryReport: function() {
        console.log('📤 API.getInventoryReport - URL:', API_BASE + '/reports/inventory');
        return fetch(API_BASE + '/reports/inventory')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get inventory report error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    getMonthlyProfit: function(year, month) {
        var now = new Date();
        var y = year || now.getFullYear();
        var m = month || (now.getMonth() + 1);
        var url = API_BASE + '/reports/monthly-profit?year=' + y + '&month=' + m;
        console.log('📤 API.getMonthlyProfit - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get monthly profit error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    getAllReports: function() {
        console.log('📤 API.getAllReports - URL:', API_BASE + '/reports/all');
        return fetch(API_BASE + '/reports/all')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get all reports error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    // ==================== EMPLOYEES ====================
    getEmployees: function() {
        console.log('📤 API.getEmployees - URL:', API_BASE + '/employees');
        return fetch(API_BASE + '/employees')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
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
        console.log('📤 API.addEmployee - URL:', API_BASE + '/employees');
        return fetch(API_BASE + '/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        console.log('📤 API.deleteEmployee - URL:', API_BASE + '/employees/' + id);
        return fetch(API_BASE + '/employees/' + id, {
            method: 'DELETE'
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        console.log('📤 API.returnProduct - URL:', API_BASE + '/returns');
        return fetch(API_BASE + '/returns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
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
        var url = API_BASE + '/returns?date=' + queryDate;
        console.log('📤 API.getReturns - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
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
        console.log('📤 API.getAllReturns - URL:', API_BASE + '/returns/all');
        return fetch(API_BASE + '/returns/all')
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
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
    },
    
    // ==================== GENERIC REQUEST ====================
    request: function(url, options) {
        options = options || {};
        var fullUrl = API_BASE + url;
        console.log('📤 API.request - URL:', fullUrl);
        return fetch(fullUrl, {
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: options.body ? JSON.stringify(options.body) : undefined
        })
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
            return r.json();
        })
        .then(function(data) {
            return data;
        })
        .catch(function(err) {
            console.error('❌ Request error:', err);
            return { success: false, message: err.message };
        });
    }
};

// ============================================
// API ni global qilish
// ============================================
window.API = API;

console.log('✅ API ready - all functions loaded');