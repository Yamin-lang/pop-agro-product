// ============================================
// API.JS - SERVER BOG'LANISH (TUZATILGAN)
// ============================================

// ============================================
// 🔥 API BASE - AVTOMATIK ANIQLASH
// ============================================
var API_BASE = (function() {
    // Agar Vercel da bo'lsa
    if (window.location.hostname.includes('vercel.app')) {
        return 'https://pop-agro-product.vercel.app/api';
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
        var url = API_BASE + '/products';
        console.log('📤 API.getProducts - URL:', url);
        return fetch(url)
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
        var url = API_BASE + '/products';
        console.log('📤 API.addProduct - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/products/' + id;
        console.log('📤 API.updateProduct - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/products/' + id;
        console.log('🗑️ API.deleteProduct - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/sales';
        console.log('📤 API.addSale - URL:', url);
        return fetch(url, {
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
    
    // 🔥 getSales - reports.js da ishlatiladi
    getSales: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        var url = API_BASE + '/sales/daily?date=' + queryDate;
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
        var url = API_BASE + '/shifts/open';
        console.log('📤 API.openShift - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/shifts/close';
        console.log('📤 API.closeShift - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/shifts/current';
        console.log('📤 API.getCurrentShift - URL:', url);
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
                console.error('❌ Get current shift error:', err);
                return { success: false, message: err.message, data: null };
            });
    },
    
    getShiftHistory: function() {
        var url = API_BASE + '/shifts/history';
        console.log('📤 API.getShiftHistory - URL:', url);
        return fetch(url)
            .then(function(r) {
                console.log('📥 Response status:', r.status);
                if (!r.ok) {
                    throw new Error('HTTP ' + r.status);
                }
                return r.json();
            })
            .then(function(data) {
                console.log('📥 Shift history:', data);
                return data;
            })
            .catch(function(err) {
                console.error('❌ Get shift history error:', err);
                return { success: false, message: err.message, data: [] };
            });
    },
    
    // ==================== DEBTORS ====================
    getDebtors: function() {
        var url = API_BASE + '/debtors';
        console.log('📤 API.getDebtors - URL:', url);
        return fetch(url)
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
        var url = API_BASE + '/debtors/' + id + '/pay';
        console.log('📤 API.payDebt - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/reports/inventory';
        console.log('📤 API.getInventoryReport - URL:', url);
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
        var url = API_BASE + '/reports/all';
        console.log('📤 API.getAllReports - URL:', url);
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
                console.error('❌ Get all reports error:', err);
                return { success: false, message: err.message, data: {} };
            });
    },
    
    // ==================== EMPLOYEES ====================
    getEmployees: function() {
        var url = API_BASE + '/employees';
        console.log('📤 API.getEmployees - URL:', url);
        return fetch(url)
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
        var url = API_BASE + '/employees';
        console.log('📤 API.addEmployee - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/employees/' + id;
        console.log('📤 API.deleteEmployee - URL:', url);
        return fetch(url, {
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
    
    // ==================== RETURNS ====================
    returnProduct: function(data) {
        var url = API_BASE + '/returns';
        console.log('📤 API.returnProduct - URL:', url);
        return fetch(url, {
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
        var url = API_BASE + '/returns/all';
        console.log('📤 API.getAllReturns - URL:', url);
        return fetch(url)
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