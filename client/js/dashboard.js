// ============================================
// DASHBOARD.JS - FAQAT BOSGANDA YANGILANADI (TEZ)
// ============================================

function loadDashboard(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="dashboard">
            <!-- STATISTICS -->
            <div class="stats-grid" id="statsGrid">
                <div class="stat-card blue">
                    <div class="stat-icon"><i class="fas fa-coins"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">Bugungi savdo</div>
                        <div class="stat-value" id="statToday">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card green">
                    <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">Naqd</div>
                        <div class="stat-value" id="statCash">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-icon"><i class="fas fa-credit-card"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">Terminal</div>
                        <div class="stat-value" id="statTerminal">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-icon"><i class="fas fa-file-invoice"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">Nasiya</div>
                        <div class="stat-value" id="statCredit">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card red">
                    <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">📊 Oylik savdo</div>
                        <div class="stat-value" id="statMonthly">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card teal">
                    <div class="stat-icon"><i class="fas fa-box"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">Mahsulotlar</div>
                        <div class="stat-value" id="statProducts">0</div>
                    </div>
                </div>
            </div>
            
            <!-- YANGILASH TUGMASI -->
            <div style="display:flex;justify-content:flex-end;margin-bottom:15px;">
                <button onclick="refreshDashboard()" class="btn btn-primary" style="display:flex;align-items:center;gap:8px;padding:10px 20px;">
                    <i class="fas fa-sync"></i> Yangilash
                </button>
            </div>
            
            <!-- SMENA HOLATI -->
            <div class="dashboard-card" style="border-left: 4px solid #f59e0b; margin-bottom:20px;">
                <div class="card-header">
                    <h3><i class="fas fa-clock"></i> Smena holati</h3>
                </div>
                <div id="shiftStatusDisplay" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;flex-wrap:wrap;gap:10px;">
                    <span id="shiftStatusText" style="font-size:18px;font-weight:bold;">🔴 Smena yopiq</span>
                    <span id="shiftTimeText" style="color:#888;font-size:14px;">-</span>
                    <span id="shiftBalanceText" style="color:#27ae60;font-size:14px;font-weight:bold;">Balans: 0 so'm</span>
                </div>
            </div>
            
            <!-- TOP & BOTTOM PRODUCTS -->
            <div class="dashboard-row">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-arrow-up" style="color:#27ae60;"></i> Eng ko'p sotilgan</h3>
                    </div>
                    <div id="topProducts" class="product-list">
                        <div class="loading-small">Yuklanmoqda...</div>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-arrow-down" style="color:#e74c3c;"></i> Kam sotilgan</h3>
                    </div>
                    <div id="bottomProducts" class="product-list">
                        <div class="loading-small">Yuklanmoqda...</div>
                    </div>
                </div>
            </div>
            
            <!-- LOW STOCK -->
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-exclamation-triangle" style="color:#f39c12;"></i> Kam qolgan mahsulotlar</h3>
                </div>
                <div id="lowStockProducts" class="product-list">
                    <div class="loading-small">Yuklanmoqda...</div>
                </div>
            </div>
        </div>
    `;
    
    // FAQAT BIR MARTA YUKLANADI
    loadDashboardData();
    console.log('✅ Dashboard yuklandi (faqat qo\'lda yangilash)');
}

// ============================================
// QO'LDA YANGILASH FUNKSIYASI
// ============================================
function refreshDashboard() {
    console.log('🔄 Dashboard yangilash boshlandi...');
    
    var btn = document.querySelector('.btn-primary i');
    if (btn) {
        btn.style.animation = 'spin 0.5s linear';
        setTimeout(function() {
            btn.style.animation = '';
        }, 500);
    }
    
    loadDashboardData();
    showToast('✅ Dashboard yangilandi', 'success');
}

// ============================================
// ANIMATSIYA
// ============================================
(function addStyles() {
    var style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================
// LOAD DASHBOARD DATA
// ============================================
function loadDashboardData() {
    console.log('📊 Dashboard ma\'lumotlari yuklanmoqda...');
    
    var today = new Date().toISOString().split('T')[0];
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    
    // JORIY SMENANI TEKSHIRISH
    API.getCurrentShift().then(function(shiftData) {
        console.log('📥 Smena holati:', shiftData);
        
        var isShiftActive = shiftData.success && shiftData.data;
        var shiftId = isShiftActive ? shiftData.data.id : null;
        
        // SMENA HOLATINI YANGILASH
        updateShiftStatus(shiftData, isShiftActive);
        
        // 1. KUNLIK SAVDO
        if (isShiftActive && shiftId) {
            var url = API_BASE + '/sales/daily?date=' + today + '&shift_id=' + shiftId;
            console.log('📤 Kunlik savdo so\'rovi:', url);
            
            fetch(url)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    console.log('📥 Kunlik savdo javobi:', data);
                    if (data.success) {
                        updateDailyStats(data.data);
                    }
                })
                .catch(function(err) {
                    console.error('❌ Sales error:', err);
                });
        } else {
            resetDailyStats();
        }
        
        // 2. OYLIK SAVDO
        API.getMonthlySales(year, month).then(function(data) {
            console.log('📥 Oylik savdo javobi:', data);
            if (data.success && data.data) {
                var total = data.data.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
                var elMonthly = document.getElementById('statMonthly');
                if (elMonthly) {
                    var monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
                    elMonthly.textContent = total.toLocaleString() + ' so\'m (' + monthNames[month - 1] + ')';
                    elMonthly.style.color = '#e74c3c';
                }
            }
        }).catch(function(err) {
            console.error('❌ Monthly error:', err);
        });
        
        // Mahsulotlar soni
        loadProductsCount();
    }).catch(function(err) {
        console.error('❌ Shift check error:', err);
    });
}

// ============================================
// SMENA HOLATINI YANGILASH
// ============================================
function updateShiftStatus(shiftData, isActive) {
    var statusText = document.getElementById('shiftStatusText');
    var timeText = document.getElementById('shiftTimeText');
    var balanceText = document.getElementById('shiftBalanceText');
    
    if (statusText) {
        if (isActive) {
            statusText.textContent = '🟢 Smena ochiq';
            statusText.style.color = '#22c55e';
        } else {
            statusText.textContent = '🔴 Smena yopiq';
            statusText.style.color = '#ef4444';
        }
    }
    
    if (timeText) {
        if (isActive && shiftData.data && shiftData.data.opened_at) {
            var opened = new Date(shiftData.data.opened_at);
            timeText.textContent = 'Ochilgan: ' + opened.toLocaleString();
        } else {
            timeText.textContent = 'Smena yopiq';
        }
    }
    
    if (balanceText) {
        if (isActive && shiftData.data) {
            balanceText.textContent = 'Balans: ' + (shiftData.data.opening_balance || 0).toLocaleString() + ' so\'m';
            balanceText.style.color = '#27ae60';
        } else {
            balanceText.textContent = 'Balans: 0 so\'m';
            balanceText.style.color = '#ef4444';
        }
    }
}

// ============================================
// KUNLIK STATISTIKANI YANGILASH
// ============================================
function updateDailyStats(data) {
    var total = data.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
    var cash = data.filter(function(s) { return s.payment_type === 'cash'; });
    var terminal = data.filter(function(s) { return s.payment_type === 'terminal'; });
    var credit = data.filter(function(s) { return s.payment_type === 'credit'; });
    
    var cashTotal = cash.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
    var terminalTotal = terminal.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
    var creditTotal = credit.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
    
    var elToday = document.getElementById('statToday');
    var elCash = document.getElementById('statCash');
    var elTerminal = document.getElementById('statTerminal');
    var elCredit = document.getElementById('statCredit');
    
    if (elToday) elToday.textContent = total.toLocaleString() + ' so\'m';
    if (elCash) elCash.textContent = cashTotal.toLocaleString() + ' so\'m';
    if (elTerminal) elTerminal.textContent = terminalTotal.toLocaleString() + ' so\'m';
    if (elCredit) elCredit.textContent = creditTotal.toLocaleString() + ' so\'m';
}

// ============================================
// KUNLIK STATISTIKANI 0 GA QAYTARISH
// ============================================
function resetDailyStats() {
    var elToday = document.getElementById('statToday');
    var elCash = document.getElementById('statCash');
    var elTerminal = document.getElementById('statTerminal');
    var elCredit = document.getElementById('statCredit');
    
    if (elToday) {
        elToday.textContent = '0 so\'m';
        elToday.style.color = '#ef4444';
    }
    if (elCash) elCash.textContent = '0 so\'m';
    if (elTerminal) elTerminal.textContent = '0 so\'m';
    if (elCredit) elCredit.textContent = '0 so\'m';
}

// ============================================
// MAHSULOTLAR SONI
// ============================================
function loadProductsCount() {
    console.log('📦 Mahsulotlar soni yuklanmoqda...');
    
    API.getProducts().then(function(data) {
        console.log('📥 Mahsulotlar soni:', data.data ? data.data.length : 0);
        if (data.success && data.data) {
            var elProducts = document.getElementById('statProducts');
            if (elProducts) elProducts.textContent = data.data.length;
            analyzeProducts(data.data);
        }
    }).catch(function(err) {
        console.error('❌ Products error:', err);
    });
}

// ============================================
// ANALYZE PRODUCTS
// ============================================
function analyzeProducts(products) {
    if (!products || products.length === 0) {
        renderProductList('topProducts', [], 'sotilgan');
        renderProductList('bottomProducts', [], 'sotilgan');
        renderProductList('lowStockProducts', [], 'qolgan');
        return;
    }
    
    var sorted = products.slice().sort(function(a, b) {
        return (b.sales_count || 0) - (a.sales_count || 0);
    });
    var top = sorted.slice(0, 5);
    var bottom = sorted.slice(-5).reverse();
    var lowStock = products.filter(function(p) { return (p.quantity || 0) < 5; });
    
    renderProductList('topProducts', top, 'sotilgan');
    renderProductList('bottomProducts', bottom, 'sotilgan');
    renderProductList('lowStockProducts', lowStock, 'qolgan');
}

// ============================================
// RENDER PRODUCT LIST
// ============================================
function renderProductList(elementId, products, label) {
    var container = document.getElementById(elementId);
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state">Ma\'lumot yo\'q</div>';
        return;
    }
    
    var html = '';
    products.forEach(function(p) {
        var countClass = '';
        if (label === 'qolgan') {
            if ((p.quantity || 0) < 3) countClass = 'low';
            else if ((p.quantity || 0) < 10) countClass = 'medium';
            else countClass = 'high';
        }
        html += '<div class="product-item">';
        html += '<span class="product-name">' + (p.name || 'N/A') + '</span>';
        html += '<span class="product-count ' + countClass + '">' + (p.quantity || 0) + ' ' + label + '</span>';
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// ============================================
// DASHBOARD YAKUNLANDI
// ============================================
console.log('✅ Dashboard.js loaded - faqat qo\'lda yangilash');