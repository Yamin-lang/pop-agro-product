// ============================================
// PRODUCTS.JS - OMBOR (TO'LIQ)
// ============================================

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
                        <label>Birlik (kg/dona/m)</label>
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
                        <tr><td colspan="9" class="text-center">Yuklanmoqda...</td></tr>
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
    var cost = parseFloat(document.getElementById('pCostPrice').value) || 0;
    var sell = parseFloat(document.getElementById('pSellPrice').value) || 0;
    var marginEl = document.getElementById('pMargin');
    
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
    document.getElementById('productFormTitle').textContent = '➕ Yangi mahsulot';
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('currentImage').style.display = 'none';
    clearProductForm();
    document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
}

function hideAddProduct() {
    document.getElementById('productForm').style.display = 'none';
    clearProductForm();
    editingProductId = null;
}

function clearProductForm() {
    document.getElementById('pName').value = '';
    document.getElementById('pCode').value = '';
    document.getElementById('pCostPrice').value = '';
    document.getElementById('pSellPrice').value = '';
    document.getElementById('pQuantity').value = '';
    document.getElementById('pMargin').value = '';
    document.getElementById('pImage').value = '';
    document.getElementById('pUnit').value = 'dona';
    document.getElementById('currentImage').style.display = 'none';
}

// ============================================
// SAVE PRODUCT (CREATE + UPDATE)
// ============================================
function saveProduct() {
    var name = document.getElementById('pName').value.trim();
    var sellPrice = document.getElementById('pSellPrice').value;
    
    if (!name || !sellPrice) {
        showToast('❌ Nomi va sotish narxi majburiy!', 'error');
        return;
    }
    
    var data = {
        name: name,
        code: document.getElementById('pCode').value.trim(),
        cost_price: parseFloat(document.getElementById('pCostPrice').value) || 0,
        price: parseFloat(sellPrice),
        quantity: parseFloat(document.getElementById('pQuantity').value) || 0,
        unit: document.getElementById('pUnit').value
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
        // Tahrirlashda rasm o'zgarmasa, eski rasmni saqlash
        var currentImg = document.getElementById('currentImagePreview');
        if (currentImg && currentImg.src) {
            data.image = currentImg.src;
        }
        sendProduct(data);
    } else {
        sendProduct(data);
    }
}

function sendProduct(data) {
    var method = editingProductId ? 'PUT' : 'POST';
    var url = editingProductId ? API_BASE + '/products/' + editingProductId : API_BASE + '/products';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
        if (result.success) {
            showToast(editingProductId ? '✅ Mahsulot yangilandi!' : '✅ Mahsulot qo\'shildi!', 'success');
            hideAddProduct();
            loadProductsTable();
        } else {
            showToast('❌ Xatolik: ' + (result.message || 'Noma\'lum xatolik'), 'error');
        }
    })
    .catch(function(err) {
        showToast('❌ Server xatosi: ' + err.message, 'error');
    });
}

// ============================================
// 🔥 EDIT PRODUCT - TAHRIRLASH
// ============================================
function editProduct(id) {
    API.getProducts().then(function(data) {
        if (data.success && data.data) {
            var product = data.data.find(function(p) { return p.id === id; });
            if (!product) {
                showToast('❌ Mahsulot topilmadi!', 'error');
                return;
            }
            
            editingProductId = id;
            document.getElementById('productFormTitle').textContent = '✏️ Mahsulotni tahrirlash';
            document.getElementById('productForm').style.display = 'block';
            
            // Ma'lumotlarni formaga yozish
            document.getElementById('pName').value = product.name || '';
            document.getElementById('pCode').value = product.code || '';
            document.getElementById('pCostPrice').value = product.cost_price || 0;
            document.getElementById('pSellPrice').value = product.price || 0;
            document.getElementById('pQuantity').value = product.quantity || 0;
            document.getElementById('pUnit').value = product.unit || 'dona';
            
            // Marjani hisoblash
            calcMargin();
            
            // Rasmni ko'rsatish
            var currentImage = document.getElementById('currentImage');
            var currentImagePreview = document.getElementById('currentImagePreview');
            
            if (product.image) {
                currentImagePreview.src = product.image;
                currentImage.style.display = 'block';
            } else {
                currentImage.style.display = 'none';
            }
            
            document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
            showToast('✏️ Tahrirlash rejimi: ' + product.name, 'info');
        }
    });
}

// ============================================
// DELETE PRODUCT
// ============================================
function deleteProduct(id) {
    if (!confirm('Mahsulotni o\'chirishni xohlaysizmi?')) return;
    
    API.deleteProduct(id).then(function(data) {
        if (data.success) {
            showToast('✅ Mahsulot o\'chirildi!', 'success');
            loadProductsTable();
        } else {
            showToast('❌ Xatolik: ' + data.message, 'error');
        }
    });
}

// ============================================
// LOAD PRODUCTS TABLE
// ============================================
function loadProductsTable() {
    API.getProducts().then(function(data) {
        var tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        if (!data.success || data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Mahsulotlar yo\'q</td></tr>';
            return;
        }
        
        var html = '';
        data.data.forEach(function(p) {
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
            html += '<td><strong>' + (p.name || 'N/A') + '</strong></td>';
            html += '<td>' + (p.code || '-') + '</td>';
            html += '<td>' + ((p.cost_price || 0).toLocaleString()) + '</td>';
            html += '<td>' + ((p.price || 0).toLocaleString()) + '</td>';
            html += '<td style="color:' + marginColor + ';font-weight:bold;">' + margin + '%</td>';
            html += '<td>' + (p.quantity || 0) + '</td>';
            html += '<td>' + (p.unit || 'dona') + '</td>';
            html += '<td>';
            html += '<button class="btn btn-primary btn-sm" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button> ';
            html += '<button class="btn btn-danger btn-sm" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button>';
            html += '</td>';
            html += '</tr>';
        });
        
        tbody.innerHTML = html;
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