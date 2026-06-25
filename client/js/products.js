// ============================================
// PRODUCTS.JS - OMBOR (TO'LIQ TUZATILGAN)
// ============================================

// ============================================
// 🔥 API_BASE ni tekshirish va sozlash
// ============================================
if (typeof API_BASE === 'undefined') {
    var API_BASE = (function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
        if (window.location.hostname.includes('vercel.app')) {
            return window.location.origin + '/api';
        }
        return window.location.origin + '/api';
    })();
    console.log('📦 API_BASE set in products.js:', API_BASE);
} else {
    console.log('📦 API_BASE from global:', API_BASE);
}

// 🔥 API_BASE ni qayta tekshirish - agar /api bo'lmasa qo'shish
if (API_BASE && !API_BASE.includes('/api') && !API_BASE.endsWith('/api')) {
    API_BASE = API_BASE + '/api';
    console.log('📦 API_BASE fixed:', API_BASE);
}

var editingProductId = null;

function loadProducts(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="products-container">
            <div class="section-header">
                <h2><i class="fas fa-boxes"></i> Mahsulotlar</h2>
                <button class="btn btn-primary" onclick="showAddProduct()">
                    <i class="fas fa-plus"></i> Mahsulot qo'shish
                </button>
            </div>
            
            <div class="product-form" id="productForm" style="display:none;">
                <h3 id="productFormTitle">Yangi mahsulot</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Mahsulot nomi *</label>
                        <input type="text" id="pName" placeholder="Nomi">
                    </div>
                    <div class="form-group">
                        <label>Mahsulot kodi</label>
                        <input type="text" id="pCode" placeholder="Kod">
                    </div>
                    <div class="form-group">
                        <label>Kelish narxi</label>
                        <input type="number" id="pCostPrice" placeholder="Kelish narxi" oninput="calcMargin()">
                    </div>
                    <div class="form-group">
                        <label>Sotish narxi *</label>
                        <input type="number" id="pSellPrice" placeholder="Sotish narxi" oninput="calcMargin()">
                    </div>
                    <div class="form-group">
                        <label>Marja</label>
                        <input type="text" id="pMargin" readonly style="background:#f0f2f5;font-weight:bold;">
                    </div>
                    <div class="form-group">
                        <label>Miqdor</label>
                        <input type="number" id="pQuantity" placeholder="Miqdor">
                    </div>
                    <div class="form-group">
                        <label>Birlik</label>
                        <select id="pUnit">
                            <option value="dona">Dona</option>
                            <option value="kg">Kg</option>
                            <option value="m">Metr</option>
                            <option value="litr">Litr</option>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Rasm</label>
                        <input type="file" id="pImage" accept="image/*">
                        <div id="currentImage" style="display:none;margin-top:5px;">
                            <img id="currentImagePreview" style="max-width:100px;border-radius:8px;max-height:100px;object-fit:cover;">
                            <p style="font-size:12px;color:#888;margin-top:2px;">Joriy rasm</p>
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-success" onclick="saveProduct()"><i class="fas fa-save"></i> Saqlash</button>
                    <button class="btn btn-danger" onclick="hideAddProduct()"><i class="fas fa-times"></i> Bekor</button>
                </div>
            </div>
            
            <div class="products-table">
                <table>
                    <thead>
                        <tr>
                            <th>Rasm</th>
                            <th>Nomi</th>
                            <th>Kod</th>
                            <th>Kelish</th>
                            <th>Sotish</th>
                            <th>Marja</th>
                            <th>Miqdor</th>
                            <th>Birlik</th>
                            <th>Amallar</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                        <tr><td colspan="9" style="text-align:center;padding:30px;">⏳ Yuklanmoqda...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    loadProductsTable();
}

// ============================================
// CALC MARGIN
// ============================================
function calcMargin() {
    var costInput = document.getElementById('pCostPrice');
    var sellInput = document.getElementById('pSellPrice');
    var marginEl = document.getElementById('pMargin');
    
    if (!costInput || !sellInput || !marginEl) return;
    
    var cost = parseFloat(costInput.value) || 0;
    var sell = parseFloat(sellInput.value) || 0;
    
    if (cost > 0 && sell > 0) {
        var margin = ((sell - cost) / cost * 100).toFixed(1);
        marginEl.value = margin + '%';
        marginEl.style.color = margin > 0 ? '#27ae60' : '#e74c3c';
    } else {
        marginEl.value = '';
        marginEl.style.color = '#333';
    }
}

// ============================================
// SHOW/HIDE FORM
// ============================================
function showAddProduct() {
    editingProductId = null;
    var titleEl = document.getElementById('productFormTitle');
    var formEl = document.getElementById('productForm');
    var imageEl = document.getElementById('currentImage');
    
    if (titleEl) titleEl.textContent = '➕ Yangi mahsulot';
    if (formEl) formEl.style.display = 'block';
    if (imageEl) imageEl.style.display = 'none';
    
    clearProductForm();
    var form = document.getElementById('productForm');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
}

function hideAddProduct() {
    var formEl = document.getElementById('productForm');
    if (formEl) formEl.style.display = 'none';
    clearProductForm();
    editingProductId = null;
}

function clearProductForm() {
    var fields = ['pName', 'pCode', 'pCostPrice', 'pSellPrice', 'pQuantity', 'pMargin', 'pImage'];
    fields.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    var unitEl = document.getElementById('pUnit');
    if (unitEl) unitEl.value = 'dona';
    
    var imageEl = document.getElementById('currentImage');
    if (imageEl) imageEl.style.display = 'none';
}

// ============================================
// SAVE PRODUCT
// ============================================
function saveProduct() {
    var nameInput = document.getElementById('pName');
    var sellInput = document.getElementById('pSellPrice');
    
    if (!nameInput || !sellInput) return;
    
    var name = nameInput.value.trim();
    var sellPrice = sellInput.value;
    
    if (!name || !sellPrice) {
        showToast('❌ Nomi va sotish narxi majburiy!', 'error');
        return;
    }
    
    var data = {
        name: name,
        code: document.getElementById('pCode') ? document.getElementById('pCode').value.trim() : '',
        cost_price: parseFloat(document.getElementById('pCostPrice') ? document.getElementById('pCostPrice').value : 0) || 0,
        price: parseFloat(sellPrice),
        quantity: parseFloat(document.getElementById('pQuantity') ? document.getElementById('pQuantity').value : 0) || 0,
        unit: document.getElementById('pUnit') ? document.getElementById('pUnit').value : 'dona'
    };
    
    // Rasmni olish
    var fileInput = document.getElementById('pImage');
    var file = fileInput ? fileInput.files[0] : null;
    
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            data.image = e.target.result;
            sendProduct(data);
        };
        reader.readAsDataURL(file);
    } else if (editingProductId) {
        var currentImg = document.getElementById('currentImagePreview');
        if (currentImg && currentImg.src && currentImg.src !== '') {
            data.image = currentImg.src;
        }
        sendProduct(data);
    } else {
        sendProduct(data);
    }
}

// ============================================
// SEND PRODUCT - TUZATILGAN!
// ============================================
function sendProduct(data) {
    var method = editingProductId ? 'PUT' : 'POST';
    var url = editingProductId 
        ? API_BASE + '/products/' + editingProductId 
        : API_BASE + '/products';
    
    console.log('📤 SEND PRODUCT - URL:', url);
    console.log('📤 Method:', method);
    console.log('📤 Data:', data);
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(function(response) {
        console.log('📥 Response status:', response.status);
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        return response.json();
    })
    .then(function(result) {
        console.log('📥 Response:', result);
        if (result.success) {
            showToast(editingProductId ? '✅ Mahsulot yangilandi!' : '✅ Mahsulot qo\'shildi!', 'success');
            hideAddProduct();
            loadProductsTable();
            if (typeof loadPOSProducts === 'function') {
                loadPOSProducts();
            }
        } else {
            showToast('❌ Xatolik: ' + (result.message || 'Noma\'lum xatolik'), 'error');
        }
    })
    .catch(function(err) {
        console.error('❌ Server xatosi:', err);
        showToast('❌ Server xatosi: ' + err.message, 'error');
    });
}

// ============================================
// EDIT PRODUCT
// ============================================
function editProduct(id) {
    console.log('✏️ Edit product - ID:', id);
    console.log('📤 Fetching from:', API_BASE + '/products');
    
    fetch(API_BASE + '/products')
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(data) {
            if (data.success && data.data) {
                var product = data.data.find(function(p) { return p.id === id; });
                if (!product) {
                    showToast('❌ Mahsulot topilmadi!', 'error');
                    return;
                }
                
                editingProductId = id;
                var titleEl = document.getElementById('productFormTitle');
                if (titleEl) titleEl.textContent = '✏️ Mahsulotni tahrirlash';
                
                var formEl = document.getElementById('productForm');
                if (formEl) formEl.style.display = 'block';
                
                document.getElementById('pName').value = product.name || '';
                document.getElementById('pCode').value = product.code || '';
                document.getElementById('pCostPrice').value = product.cost_price || 0;
                document.getElementById('pSellPrice').value = product.price || 0;
                document.getElementById('pQuantity').value = product.quantity || 0;
                document.getElementById('pUnit').value = product.unit || 'dona';
                
                calcMargin();
                
                var currentImage = document.getElementById('currentImage');
                var currentImagePreview = document.getElementById('currentImagePreview');
                
                if (product.image && currentImagePreview) {
                    currentImagePreview.src = product.image;
                    if (currentImage) currentImage.style.display = 'block';
                } else {
                    if (currentImage) currentImage.style.display = 'none';
                }
                
                var form = document.getElementById('productForm');
                if (form) form.scrollIntoView({ behavior: 'smooth' });
                
                showToast('✏️ Tahrirlash rejimi: ' + product.name, 'info');
            }
        })
        .catch(function(err) {
            console.error('❌ Edit error:', err);
            showToast('❌ Mahsulotni yuklashda xatolik: ' + err.message, 'error');
        });
}

// ============================================
// DELETE PRODUCT
// ============================================
function deleteProduct(id) {
    if (!confirm('Mahsulotni o\'chirishni xohlaysizmi?')) return;
    
    var url = API_BASE + '/products/' + id;
    console.log('🗑️ DELETE - URL:', url);
    
    fetch(url, {
        method: 'DELETE'
    })
    .then(function(r) {
        console.log('📥 Response status:', r.status);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    })
    .then(function(data) {
        if (data.success) {
            showToast('✅ Mahsulot o\'chirildi!', 'success');
            loadProductsTable();
            if (typeof loadPOSProducts === 'function') {
                loadPOSProducts();
            }
        } else {
            showToast('❌ Xatolik: ' + (data.message || 'Noma\'lum xatolik'), 'error');
        }
    })
    .catch(function(err) {
        console.error('❌ Delete error:', err);
        showToast('❌ O\'chirishda xatolik: ' + err.message, 'error');
    });
}

// ============================================
// LOAD PRODUCTS TABLE - TUZATILGAN!
// ============================================
function loadProductsTable() {
    var url = API_BASE + '/products';
    console.log('📤 Mahsulotlar yuklanmoqda - URL:', url);
    
    fetch(url)
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) {
                throw new Error('HTTP ' + r.status);
            }
            return r.json();
        })
        .then(function(data) {
            console.log('📥 Mahsulotlar yuklandi, soni:', data.data ? data.data.length : 0);
            renderProductsTable(data.data || []);
        })
        .catch(function(err) {
            console.error('❌ Load products error:', err);
            var tbody = document.getElementById('productsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:#e74c3c;">❌ Yuklashda xatolik: ' + err.message + '</td></tr>';
            }
        });
}

// ============================================
// RENDER PRODUCTS TABLE
// ============================================
function renderProductsTable(products) {
    var tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;">📭 Mahsulotlar mavjud emas</td></tr>';
        return;
    }
    
    var html = '';
    products.forEach(function(p) {
        var margin = p.cost_price ? (((p.price - p.cost_price) / p.cost_price * 100).toFixed(1)) : '-';
        var marginColor = p.price > p.cost_price ? '#27ae60' : '#e74c3c';
        
        html += '<tr>';
        html += '<td>';
        if (p.image) {
            html += '<img src="' + p.image + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">';
        } else {
            html += '<div style="width:40px;height:40px;background:#f0f2f5;border-radius:6px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-box"></i></div>';
        }
        html += '</td>';
        html += '<td><strong>' + escapeHtml(p.name || 'N/A') + '</strong></td>';
        html += '<td>' + escapeHtml(p.code || '-') + '</td>';
        html += '<td>' + ((p.cost_price || 0).toLocaleString()) + '</td>';
        html += '<td>' + ((p.price || 0).toLocaleString()) + '</td>';
        html += '<td style="color:' + marginColor + ';font-weight:bold;">' + margin + '%</td>';
        html += '<td>' + (p.quantity || 0) + '</td>';
        html += '<td>' + escapeHtml(p.unit || 'dona') + '</td>';
        html += '<td>';
        html += '<button class="btn btn-primary btn-sm" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button> ';
        html += '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>';
        html += '</td>';
        html += '</tr>';
    });
    
    tbody.innerHTML = html;
}

// ============================================
// ESCAPE HTML
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// POS MAHSULOTLARINI YUKLASH
// ============================================
function loadPOSProducts() {
    console.log('📤 POS mahsulotlar yuklanmoqda...');
    
    var url = API_BASE + '/products';
    fetch(url)
        .then(function(r) {
            console.log('📥 Response status:', r.status);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function(data) {
            console.log('📥 POS mahsulotlar yuklandi, soni:', data.data ? data.data.length : 0);
            renderPOSProducts(data.data || []);
        })
        .catch(function(err) {
            console.error('❌ Load POS products error:', err);
        });
}

// ============================================
// RENDER POS PRODUCTS
// ============================================
function renderPOSProducts(products) {
    var container = document.getElementById('posProductGrid');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Mahsulotlar mavjud emas</div>';
        return;
    }
    
    var html = '';
    products.forEach(function(p) {
        html += '<div class="pos-product" onclick="addToCart(' + p.id + ')">';
        html += '<div class="product-image">';
        if (p.image) {
            html += '<img src="' + p.image + '" alt="' + p.name + '">';
        } else {
            html += '<i class="fas fa-box"></i>';
        }
        html += '</div>';
        html += '<div class="product-name">' + escapeHtml(p.name || 'N/A') + '</div>';
        html += '<div class="product-price">' + (p.price || 0).toLocaleString() + ' so\'m</div>';
        html += '<div class="product-qty">' + (p.quantity || 0) + ' dona</div>';
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// ============================================
// TOAST
// ============================================
if (typeof showToast === 'undefined') {
    function showToast(message, type) {
        type = type || 'success';
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        var icons = { success: '✅ ', error: '❌ ', warning: '⚠️ ', info: 'ℹ️ ' };
        toast.textContent = (icons[type] || 'ℹ️ ') + message;
        toast.style.cssText = 'position:fixed;bottom:30px;right:30px;padding:14px 24px;border-radius:10px;color:#fff;font-weight:500;z-index:9999;animation:slideIn 0.4s ease;box-shadow:0 10px 40px rgba(0,0,0,0.2);font-size:14px;max-width:400px;';
        var colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#4f46e5' };
        toast.style.background = colors[type] || '#4f46e5';
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(30px)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
        }, 3000);
    }
}

console.log('✅ Products.js loaded - API_BASE:', API_BASE);