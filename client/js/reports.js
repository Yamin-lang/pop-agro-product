// ============================================
// REPORTS.JS - HISOBOTLAR (TO'LIQ)
// ============================================

var reportInterval = null;
var isReportActive = false;

function loadReports(container) {
    var today = new Date().toISOString().split('T')[0];
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="reports-container">
            <div class="section-header">
                <h2><i class="fas fa-file-alt"></i> Hisobotlar</h2>
                <div class="report-controls">
                    <input type="date" id="reportDate" value="${today}">
                    <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-sync"></i> Yangilash</button>
                </div>
            </div>
            
            <div class="report-summary" id="reportSummary">
                <div class="stat-card green">
                    <div class="stat-info">
                        <div class="stat-label">Jami savdolar</div>
                        <div class="stat-value" id="rTotalSales">0</div>
                    </div>
                </div>
                <div class="stat-card blue">
                    <div class="stat-info">
                        <div class="stat-label">Jami summa</div>
                        <div class="stat-value" id="rTotalAmount">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-info">
                        <div class="stat-label">Naqd</div>
                        <div class="stat-value" id="rCash">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-info">
                        <div class="stat-label">Terminal</div>
                        <div class="stat-value" id="rTerminal">0 so'm</div>
                    </div>
                </div>
                <div class="stat-card red">
                    <div class="stat-info">
                        <div class="stat-label">Nasiya</div>
                        <div class="stat-value" id="rCredit">0 so'm</div>
                    </div>
                </div>
            </div>
            
            <!-- 🔥 YOPILGAN SMENALAR HISOBOTI -->
            <div class="section-card">
                <h3><i class="fas fa-history"></i> 📋 Smena tarixi (Yopilgan smenalar)</h3>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ochilgan vaqt</th>
                                <th>Yopilgan vaqt</th>
                                <th>Kirim balans</th>
                                <th>Chiqim balans</th>
                                <th>Jami savdo</th>
                                <th>Naqd</th>
                                <th>Terminal</th>
                                <th>Nasiya</th>
                                <th>Holat</th>
                            </tr>
                        </thead>
                        <tbody id="shiftHistoryTable">
                            <tr><td colspan="10" class="text-center">Yuklanmoqda...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="section-card">
                <h3><i class="fas fa-users"></i> Qarzdorlar</h3>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ism</th>
                                <th>Telefon</th>
                                <th>Manzil</th>
                                <th>Qarz</th>
                                <th>Sana</th>
                                <th>Amallar</th>
                            </tr>
                        </thead>
                        <tbody id="debtorsTable">
                            <tr><td colspan="7" class="text-center">Yuklanmoqda...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="section-card">
                <h3><i class="fas fa-list"></i> Savdo ro'yxati</h3>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mahsulot</th>
                                <th>Soni</th>
                                <th>Summa</th>
                                <th>To'lov</th>
                                <th>Vaqt</th>
                            </tr>
                        </thead>
                        <tbody id="reportSalesTable">
                            <tr><td colspan="6" class="text-center">Yuklanmoqda...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    generateReport();
    loadShiftHistory();
    startReportUpdates();
}

// ============================================
// 🔥 REAL VAQTDA YANGILASH
// ============================================
function startReportUpdates() {
    if (reportInterval) {
        clearInterval(reportInterval);
        reportInterval = null;
    }
    
    isReportActive = true;
    
    reportInterval = setInterval(function() {
        if (isReportActive) {
            generateReport();
            loadShiftHistory();
        }
    }, 10000);
    
    console.log('🔄 Hisobot real vaqt rejimida ishlamoqda (10s)');
}

function stopReportUpdates() {
    isReportActive = false;
    if (reportInterval) {
        clearInterval(reportInterval);
        reportInterval = null;
        console.log('⏹ Hisobot updates stopped');
    }
}

// ============================================
// GENERATE REPORT
// ============================================
function generateReport() {
    var date = document.getElementById('reportDate');
    if (!date) return;
    var dateValue = date.value;
    if (!dateValue) return;
    
    // 🔥 Daily report - faqat tanlangan kun uchun
    API.getDailyReport(dateValue).then(function(data) {
        if (data.success) {
            var totalSalesEl = document.getElementById('rTotalSales');
            var totalAmountEl = document.getElementById('rTotalAmount');
            var rCash = document.getElementById('rCash');
            var rTerminal = document.getElementById('rTerminal');
            var rCredit = document.getElementById('rCredit');
            
            if (totalSalesEl) totalSalesEl.textContent = data.data.total_sales || 0;
            if (totalAmountEl) totalAmountEl.textContent = (data.data.total_amount || 0).toLocaleString() + ' so\'m';
            if (rCash) rCash.textContent = (data.data.cash_amount || 0).toLocaleString() + ' so\'m';
            if (rTerminal) rTerminal.textContent = (data.data.terminal_amount || 0).toLocaleString() + ' so\'m';
            if (rCredit) rCredit.textContent = (data.data.credit_amount || 0).toLocaleString() + ' so\'m';
        }
    }).catch(function(err) {
        console.error('Report error:', err);
    });
    
    // 🔥 Sales details - tanlangan kun uchun
    API.getSales(dateValue).then(function(data) {
        if (data.success) {
            var tbody = document.getElementById('reportSalesTable');
            if (!tbody) return;
            
            if (data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Savdolar yo\'q</td></tr>';
            } else {
                var html = '';
                data.data.forEach(function(s, i) {
                    var paymentLabel = s.payment_type || 'cash';
                    var statusClass = paymentLabel === 'credit' ? 'pending' : 'active';
                    html += '<tr>';
                    html += '<td>' + (i + 1) + '</td>';
                    html += '<td>' + (s.product_name || 'N/A') + '</td>';
                    html += '<td>' + s.quantity + '</td>';
                    html += '<td>' + (s.total_price || 0).toLocaleString() + " so'm</td>";
                    html += '<td><span class="badge-status ' + statusClass + '">' + paymentLabel + '</span></td>';
                    html += '<td>' + new Date(s.sale_date).toLocaleString() + '</td>';
                    html += '</tr>';
                });
                tbody.innerHTML = html;
            }
        }
    }).catch(function(err) {
        console.error('Sales details error:', err);
    });
    
    // Debtors
    loadDebtors();
}

// ============================================
// 🔥 SMENA TARIXI (YOPILGAN SMENALAR)
// ============================================
function loadShiftHistory() {
    API.getShiftHistory().then(function(data) {
        var tbody = document.getElementById('shiftHistoryTable');
        if (!tbody) return;
        
        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">Smena tarixi yo\'q</td></tr>';
            return;
        }
        
        var html = '';
        var count = 0;
        data.data.forEach(function(s, i) {
            // 🔥 Faqat yopilgan smenalarni ko'rsatish
            if (s.is_active === 0) {
                count++;
                var opened = s.opened_at ? new Date(s.opened_at).toLocaleString() : '-';
                var closed = s.closed_at ? new Date(s.closed_at).toLocaleString() : '-';
                var openingBalance = (s.opening_balance || 0).toLocaleString() + ' so\'m';
                var closingBalance = (s.closing_balance || 0).toLocaleString() + ' so\'m';
                var totalAmount = (s.total_amount || 0).toLocaleString() + ' so\'m';
                var cashAmount = (s.cash_amount || 0).toLocaleString() + ' so\'m';
                var terminalAmount = (s.terminal_amount || 0).toLocaleString() + ' so\'m';
                var creditAmount = (s.credit_amount || 0).toLocaleString() + ' so\'m';
                
                html += '<tr>';
                html += '<td>' + count + '</td>';
                html += '<td>' + opened + '</td>';
                html += '<td>' + closed + '</td>';
                html += '<td>' + openingBalance + '</td>';
                html += '<td>' + closingBalance + '</td>';
                html += '<td><strong style="color:#27ae60;">' + totalAmount + '</strong></td>';
                html += '<td>' + cashAmount + '</td>';
                html += '<td>' + terminalAmount + '</td>';
                html += '<td>' + creditAmount + '</td>';
                html += '<td><span class="badge-status inactive">🔴 Yopilgan</span></td>';
                html += '</tr>';
            }
        });
        
        if (html === '') {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">Hali yopilgan smena yo\'q</td></tr>';
        } else {
            tbody.innerHTML = html;
        }
    }).catch(function(err) {
        console.error('Shift history error:', err);
        var tbody = document.getElementById('shiftHistoryTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center">Xatolik yuz berdi</td></tr>';
        }
    });
}

// ============================================
// LOAD DEBTORS
// ============================================
function loadDebtors() {
    API.getDebtors().then(function(data) {
        var tbody = document.getElementById('debtorsTable');
        if (!tbody) return;
        
        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Qarzdorlar yo\'q</td></tr>';
            return;
        }
        
        var html = '';
        data.data.forEach(function(d, i) {
            html += '<tr>';
            html += '<td>' + (i + 1) + '</td>';
            html += '<td><strong>' + (d.name || 'N/A') + '</strong></td>';
            html += '<td>' + (d.phone || '-') + '</td>';
            html += '<td>' + (d.address || '-') + '</td>';
            html += '<td style="color:#e74c3c;font-weight:bold;">' + (d.amount || 0).toLocaleString() + " so'm</td>";
            html += '<td>' + (d.created_at ? new Date(d.created_at).toLocaleDateString() : '-') + '</td>';
            html += '<td><button class="btn btn-success btn-sm" onclick="payDebt(' + d.id + ')"><i class="fas fa-check"></i> To\'lash</button></td>';
            html += '</tr>';
        });
        
        tbody.innerHTML = html;
    }).catch(function(err) {
        console.error('Debtors error:', err);
        var tbody = document.getElementById('debtorsTable');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Xatolik yuz berdi</td></tr>';
        }
    });
}

// ============================================
// 🔥 PAY DEBT - TUZATILGAN
// ============================================
function payDebt(id) {
    var amount = prompt('To\'lanadigan summa (so\'m):');
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        showToast('❌ To\'g\'ri summa kiriting!', 'error');
        return;
    }
    
    // Qarzdorni tekshirish
    API.getDebtors().then(function(data) {
        if (data.success && data.data) {
            var debtor = data.data.find(function(d) { return d.id === id; });
            if (!debtor) {
                showToast('❌ Qarzdor topilmadi!', 'error');
                return;
            }
            
            var currentDebt = debtor.amount || 0;
            var payAmount = parseFloat(amount);
            
            if (payAmount > currentDebt) {
                showToast('❌ Qarz miqdoridan ko\'p to\'lay olmaysiz! Qarz: ' + currentDebt.toLocaleString() + ' so\'m', 'error');
                return;
            }
            
            // To'lash so'rovini yuborish
            API.payDebt(id, payAmount).then(function(result) {
                if (result.success) {
                    var remaining = result.data.remaining || 0;
                    if (remaining <= 0) {
                        showToast('✅ Qarz to\'liq to\'landi!', 'success');
                    } else {
                        showToast('✅ Qarz to\'landi! Qolgan: ' + remaining.toLocaleString() + ' so\'m', 'success');
                    }
                    loadDebtors();
                    generateReport();
                } else {
                    showToast('❌ Xatolik: ' + (result.message || 'Noma\'lum xatolik'), 'error');
                }
            }).catch(function(err) {
                showToast('❌ Server xatosi: ' + err.message, 'error');
            });
        }
    }).catch(function(err) {
        showToast('❌ Qarzdor ma\'lumotlarini olishda xatolik!', 'error');
    });
}

// ============================================
// TOAST (agar mavjud bo'lmasa)
// ============================================
if (typeof showToast === 'undefined') {
    function showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() {
            if (toast.parentNode) toast.remove();
        }, 3000);
    }
}