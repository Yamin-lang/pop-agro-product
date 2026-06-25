// ============================================
// API.JS - SERVER BOG'LANISH (TUZATILGAN)
// ============================================

// ============================================
// 🔥 API BASE - DOIMIY /api BILAN
// ============================================
var API_BASE = window.location.origin + '/api';

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
        console.log('📤 API.addProduct called with:', data);
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
        console.log('📤 API.updateProduct called - ID:', id);
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
        console.log('🗑️ API.deleteProduct called - ID:', id);
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
        console.log('📤 API.addSale called');
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
        console.log('📤 API.getSales - url:', url);
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
        console.log('📤 API.getMonthlySales - year:', y, 'month:', m);
        return fetch(API_BASE + '/sales/monthly?year=' + y + '&month=' + m)
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
        console.log('📤 API.openShift - balance:', balance);
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
        console.log('📤 API.closeShift - balance:', balance);
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
        console.log('📤 API.getCurrentShift called');
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
        console.log('📤 API.getShiftHistory called');
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
    
    // ==================== REPORTS ====================
    getDailyReport: function(date) {
        var queryDate = date || new Date().toISOString().split('T')[0];
        console.log('📤 API.getDailyReport - date:', queryDate);
        return fetch(API_BASE + '/reports/daily?date=' + queryDate)
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
        console.log('📤 API.getMonthlyReport - year:', y, 'month:', m);
        return fetch(API_BASE + '/reports/monthly?year=' + y + '&month=' + m)
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
        console.log('📤 API.getInventoryReport called');
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
        console.log('📤 API.getMonthlyProfit - year:', y, 'month:', m);
        return fetch(API_BASE + '/reports/monthly-profit?year=' + y + '&month=' + m)
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
        console.log('📤 API.getAllReports called');
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
    
    // ==================== GENERIC REQUEST ====================
    request: function(url, options) {
        options = options || {};
        console.log('📤 API.request - url:', url);
        return fetch(API_BASE + url, {
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

console.log('✅ API ready - all functions loaded');