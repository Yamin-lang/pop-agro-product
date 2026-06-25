// ============================================
// SETTINGS.JS - SOZLAMALAR
// ============================================

function loadSettings(container) {
    container.innerHTML = `
        <div class="settings-container">
            <div class="section-card">
                <h3><i class="fas fa-cog"></i> Tizim sozlamalari</h3>
                <div class="settings-form">
                    <div class="form-group">
                        <label>Dastur nomi</label>
                        <input type="text" id="appName" value="Pop Agro Product">
                    </div>
                    <div class="form-group">
                        <label>Valyuta</label>
                        <input type="text" id="appCurrency" value="UZS">
                    </div>
                    <div class="form-group">
                        <label>Kassa nomi</label>
                        <input type="text" id="cashierName" value="Asosiy kassa">
                    </div>
                    <button class="btn btn-primary" onclick="saveSettings()"><i class="fas fa-save"></i> Saqlash</button>
                    <div id="settingsResult" style="margin-top:15px;"></div>
                </div>
            </div>
            
            <div class="section-card">
                <h3><i class="fas fa-database"></i> Ma'lumotlar</h3>
                <div class="settings-actions">
                    <button class="btn btn-warning" onclick="backupData()"><i class="fas fa-download"></i> Zaxira olish</button>
                    <button class="btn btn-danger" onclick="clearData()"><i class="fas fa-trash"></i> Tozalash</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SAVE SETTINGS
// ============================================
function saveSettings() {
    const settings = {
        appName: document.getElementById('appName').value,
        currency: document.getElementById('appCurrency').value,
        cashierName: document.getElementById('cashierName').value
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    document.getElementById('settingsResult').innerHTML = '<div style="color:#27ae60;font-weight:bold;">✅ Sozlamalar saqlandi!</div>';
}

// ============================================
// BACKUP DATA
// ============================================
function backupData() {
    const data = {
        products: [],
        sales: [],
        settings: JSON.parse(localStorage.getItem('settings') || '{}')
    };
    
    // Products
    API.getProducts().then(p => {
        data.products = p.data || [];
        // Sales
        API.getSales(new Date().toISOString().split('T')[0]).then(s => {
            data.sales = s.data || [];
            downloadBackup(data);
        });
    });
}

function downloadBackup(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('✅ Zaxira yuklandi!', 'success');
}

// ============================================
// CLEAR DATA
// ============================================
function clearData() {
    if (!confirm('Barcha ma\'lumotlarni o\'chirishni xohlaysizmi? Bu amalni qaytarib bo\'lmaydi!')) return;
    if (!confirm('Haqiqatan ham o\'chirilsinmi?')) return;
    
    localStorage.clear();
    showToast('🗑️ Ma\'lumotlar tozalandi', 'warning');
    setTimeout(() => window.location.reload(), 1000);
}