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
            
            <!-- QO'SHIMCHA STATISTIKA -->
            <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="stat-card indigo">
                    <div class="stat-icon"><i class="fas fa-warehouse"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">🏪 Jami tavar qiymati</div>
                        <div class="stat-value" id="statTotalCost">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card gold">
                    <div class="stat-icon"><i class="fas fa-tag"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">💰 Sotish narxi (jami)</div>
                        <div class="stat-value" id="statTotalPrice">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card success">
                    <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">📈 Potensial foyda</div>
                        <div class="stat-value" id="statPotentialProfit">0 so'm</div>
                    </div>
                </div>
            </div>
            
            <!-- OYLIK FOYDA -->
            <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                <div class="stat-card pink">
                    <div class="stat-icon"><i class="fas fa-hand-holding-heart"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">📊 Oylik foyda</div>
                        <div class="stat-value" id="statMonthlyProfit">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card cyan">
                    <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                    <div class="stat-info">
                        <div class="stat-label">📊 Foyda foizi</div>
                        <div class="stat-value" id="statProfitPercent">0%</div>
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
    if (typeof showToast === 'function') {
        showToast('✅ Dashboard yangilandi', 'success');
    }
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
        .stat-card.indigo { background: linear-gradient(135deg, #4f46e5, #818cf8); color: white; }
        .stat-card.gold { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }
        .stat-card.success { background: linear-gradient(135deg, #059669, #34d399); color: white; }
        .stat-card.pink { background: linear-gradient(135deg, #db2777, #f472b6); color: white; }
        .stat-card.cyan { background: linear-gradient(135deg, #0891b2, #22d3ee); color: white; }
        .stat-value { font-size: 20px; font-weight: bold; margin-top: 5px; }
        .dashboard-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s; cursor: default; }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-icon { font-size: 28px; opacity: 0.9; }
        .stat-label { font-size: 14px; opacity: 0.85; font-weight: 500; }
        @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr 1fr; }
            .dashboard-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
})();

// ============================================
// LOAD DASHBOARD DATA (TUZATILGAN - HASHTAG YO'Q)
// ============================================
function loadDashboardData() {
    console.log('📊 Dashboard ma\'lumotlari yuklanmoqda...');
    
    var today = new Date().toISOString().split('T')[0];
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    
    // 1. JORIY SMENANI TEKSHIRISH
    API.getCurrentShift().then(function(shiftData) {
        console.log('📥 Smena holati:', shiftData);
        
        var isShiftActive = shiftData.success && shiftData.data;
        var shiftId = isShiftActive ? shiftData.data.id : null;
        
        // SMENA HOLATINI YANGILASH
        updateShiftStatus(shiftData, isShiftActive);
        
        // 2. KUNLIK SAVDO
        if (isShiftActive && shiftId) {
            var url = API_BASE + '/api/sales/daily?date=' + today + '&shift_id=' + shiftId;
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
        
        // 3. OYLIK SAVDO
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
        
        // 4. MAHSULOTLAR SONI
        loadProductsCount();
        
        // 5. QO'SHIMCHA HISOBOTLAR
        loadReports(year, month);
        
    }).catch(function(err) {
        console.error('❌ Shift check error:', err);
    });
}

// ============================================
// 📊 QO'SHIMCHA HISOBOTLARNI YUKLASH
// ============================================
function loadReports(year, month) {
    console.log('📊 Qo\'shimcha hisobotlar yuklanmoqda...');
    
    // 1. Ombor holati (Inventory)
    API.request('/api/reports/inventory').then(function(data) {
        console.log('📥 Inventory javobi:', data);
        if (data.success && data.data) {
            var elTotalCost = document.getElementById('statTotalCost');
            var elTotalPrice = document.getElementById('statTotalPrice');
            var elPotentialProfit = document.getElementById('statPotentialProfit');
            
            if (elTotalCost) elTotalCost.textContent = (data.data.total_cost || 0).toLocaleString() + ' so\'m';
            if (elTotalPrice) elTotalPrice.textContent = (data.data.total_price || 0).toLocaleString() + ' so\'m';
            if (elPotentialProfit) {
                var profit = data.data.potential_profit || 0;
                elPotentialProfit.textContent = profit.toLocaleString() + ' so\'m';
                elPotentialProfit.style.color = profit >= 0 ? '#22c55e' : '#ef4444';
            }
        }
    }).catch(function(err) {
        console.error('❌ Inventory error:', err);
    });
    
    // 2. Oylik foyda
    var url = '/api/reports/monthly-profit?year=' + year + '&month=' + month;
    API.request(url).then(function(data) {
        console.log('📥 Oylik foyda javobi:', data);
        if (data.success && data.data) {
            var elMonthlyProfit = document.getElementById('statMonthlyProfit');
            var elProfitPercent = document.getElementById('statProfitPercent');
            
            if (elMonthlyProfit) {
                var profit = data.data.total_profit || 0;
                elMonthlyProfit.textContent = profit.toLocaleString() + ' so\'m';
                elMonthlyProfit.style.color = profit >= 0 ? '#22c55e' : '#ef4444';
            }
            
            // Foyda foizi - inventory dan olamiz
            API.request('/api/reports/inventory').then(function(invData) {
                if (invData.success && invData.data) {
                    var totalCost = invData.data.total_cost || 0;
                    var potentialProfit = invData.data.potential_profit || 0;
                    var percent = totalCost > 0 ? ((potentialProfit / totalCost) * 100) : 0;
                    if (elProfitPercent) {
                        elProfitPercent.textContent = percent.toFixed(1) + '%';
                        elProfitPercent.style.color = percent >= 0 ? '#22c55e' : '#ef4444';
                    }
                }
            }).catch(function(err) {
                console.error('❌ Profit percent error:', err);
            });
        }
    }).catch(function(err) {
        console.error('❌ Monthly profit error:', err);
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
    if (!data || !data.length) {
        resetDailyStats();
        return;
    }
    
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
    
    if (elToday) {
        elToday.textContent = total.toLocaleString() + ' so\'m';
        elToday.style.color = '#1e293b';
    }
    if (elCash) {
        elCash.textContent = cashTotal.toLocaleString() + ' so\'m';
        elCash.style.color = '#22c55e';
    }
    if (elTerminal) {
        elTerminal.textContent = terminalTotal.toLocaleString() + ' so\'m';
        elTerminal.style.color = '#f59e0b';
    }
    if (elCredit) {
        elCredit.textContent = creditTotal.toLocaleString() + ' so\'m';
        elCredit.style.color = '#8b5cf6';
    }
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
        var displayValue = label === 'sotilgan' ? (p.sales_count || 0) : (p.quantity || 0);
        
        if (label === 'qolgan') {
            if ((p.quantity || 0) < 3) countClass = 'low';
            else if ((p.quantity || 0) < 10) countClass = 'medium';
            else countClass = 'high';
        }
        
        html += '<div class="product-item">';
        html += '<span class="product-name">' + (p.name || 'N/A') + '</span>';
        html += '<span class="product-count ' + countClass + '">' + displayValue + ' ' + label + '</span>';
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// ============================================
// DASHBOARD YAKUNLANDI
// ============================================
console.log('✅ Dashboard.js loaded - faqat qo\'lda yangilash');