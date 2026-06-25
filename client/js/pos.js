// ============================================
// POS.JS - KASSA (REAL PRINTER BILAN)
// ============================================

var cart = [];
var shiftActive = false;
var currentShift = null;
var selectedPrinter = 'XP-80C';
var paymentType = 'cash';

// ============================================
// LOAD POS
// ============================================
function loadPOS(container) {
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    container.innerHTML = `
        <div class="pos-container">
            <!-- SHIFT -->
            <div class="pos-shift">
                <div class="shift-status">
                    <span class="status-dot ${shiftActive ? 'open' : 'closed'}"></span>
                    <span id="shiftStatus">${shiftActive ? '🟢 Smena ochiq' : '🔴 Smena yopiq'}</span>
                    <span id="shiftBalance">${shiftActive && currentShift ? (currentShift.opening_balance || 0).toLocaleString() + ' so\'m' : '0 so\'m'}</span>
                </div>
                <div class="shift-controls">
                    <input type="number" id="shiftAmount" placeholder="Balans" style="width:140px;">
                    <button class="btn btn-success btn-sm" onclick="openShift()"><i class="fas fa-play"></i> Ochish</button>
                    <button class="btn btn-danger btn-sm" onclick="closeShift()"><i class="fas fa-stop"></i> Yopish</button>
                </div>
            </div>
            
            <!-- PRINTER PANEL -->
            <div class="printer-panel">
                <div class="printer-header">
                    <i class="fas fa-print"></i>
                    <span>Printer</span>
                    <span class="printer-status" id="printerStatus">● Tayyor</span>
                </div>
                <div class="printer-controls">
                    <select id="printerSelect" class="printer-select">
                        <option value="XP-80C">XP-80C</option>
                        <option value="XP-58">XP-58</option>
                        <option value="XP-90">XP-90</option>
                        <option value="Epson-TM88">Epson TM-88</option>
                    </select>
                    <button class="btn btn-primary btn-sm" onclick="testPrinter()">
                        <i class="fas fa-file-alt"></i> Test
                    </button>
                    <button class="btn btn-success btn-sm" onclick="printReceipt()">
                        <i class="fas fa-print"></i> Chop etish
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="printDailyReport()">
                        <i class="fas fa-chart-bar"></i> Kunlik
                    </button>
                </div>
                <div class="printer-preview" id="printerPreview" style="display:none;">
                    <div class="preview-header">
                        <span>📄 Chek oldindan ko'rish</span>
                        <button class="btn-close-preview" onclick="closePreview()">×</button>
                    </div>
                    <div class="preview-content" id="previewContent">
                        <pre style="font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; padding: 10px;">Chek tayyor...</pre>
                    </div>
                </div>
            </div>
            
            <!-- POS MAIN -->
            <div class="pos-main">
                <!-- LEFT: PRODUCTS -->
                <div class="pos-products">
                    <div class="pos-search">
                        <input type="text" id="posSearch" placeholder="🔍 Mahsulot qidirish (nomi yoki kod)" oninput="filterPOSProducts()">
                        <div class="barcode-input">
                            <i class="fas fa-barcode"></i>
                            <input type="text" id="barcodeInput" placeholder="Shtrix-kodni skanerlang..." onkeydown="if(event.key==='Enter'){barcodeSearch()}">
                        </div>
                    </div>
                    <div class="pos-product-grid" id="posProductGrid">
                        <div class="loading-small"><i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...</div>
                    </div>
                </div>
                
                <!-- RIGHT: CART -->
                <div class="pos-cart">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> Savatcha</h3>
                        <span class="cart-count" id="cartCount">0</span>
                    </div>
                    
                    <div class="cart-items" id="cartItems">
                        <div class="empty-cart">
                            <i class="fas fa-shopping-basket"></i>
                            <p>Savatcha bo'sh</p>
                            <small>Mahsulot qo'shing</small>
                        </div>
                    </div>
                    
                    <div class="cart-total">
                        <div class="total-row">
                            <span>Jami:</span>
                            <span id="cartTotal">0 so'm</span>
                        </div>
                        <div class="total-row">
                            <span>Chegirma:</span>
                            <input type="number" id="discountInput" placeholder="0" oninput="updateCartTotal()" style="width:80px;">
                            <span>so'm</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>Umumiy:</span>
                            <span id="cartGrandTotal">0 so'm</span>
                        </div>
                    </div>
                    
                    <div class="payment-section">
                        <div class="payment-type">
                            <button class="btn-payment active" data-type="cash" onclick="setPaymentType('cash')">
                                <i class="fas fa-money-bill-wave"></i> Naqd
                            </button>
                            <button class="btn-payment" data-type="terminal" onclick="setPaymentType('terminal')">
                                <i class="fas fa-credit-card"></i> Terminal
                            </button>
                            <button class="btn-payment" data-type="credit" onclick="setPaymentType('credit')">
                                <i class="fas fa-file-invoice"></i> Nasiya
                            </button>
                        </div>
                        
                        <div id="creditForm" style="display:none; margin-top:10px;">
                            <input type="text" id="debtorName" placeholder="Ism">
                            <input type="text" id="debtorAddress" placeholder="Manzil">
                            <input type="text" id="debtorPhone" placeholder="Telefon">
                        </div>
                        
                        <button class="btn-pay" onclick="processSale()">
                            <i class="fas fa-check"></i> Savdoni tugatish
                        </button>
                    </div>
                    
                    <!-- 🔥 QAYTARISH TUGMASI -->
                    <div class="return-section">
                        <button class="btn btn-danger btn-block" onclick="openReturnModal()">
                            <i class="fas fa-undo-alt"></i> Mahsulotni qaytarib olish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(function() {
        loadPOSProducts();
        checkShiftStatus();
        updatePrinterStatus();
    }, 100);
}

// ============================================
// PRINTER FUNKSIYALARI
// ============================================
function updatePrinterStatus() {
    var status = document.getElementById('printerStatus');
    if (status) {
        status.textContent = '● Tayyor';
        status.style.color = '#22c55e';
    }
}

function testPrinter() {
    var printer = document.getElementById('printerSelect') ? document.getElementById('printerSelect').value : 'XP-80C';
    showToast('🖨️ Printer test yuborilmoqda...', 'info');
    
    var testText = '═'.repeat(32) + '\n';
    testText += '     🌾 POP AGRO PRODUCT\n';
    testText += '     PRINTER TEST\n';
    testText += '     ' + new Date().toLocaleString() + '\n';
    testText += '═'.repeat(32) + '\n';
    testText += '  ✅ Printer ishlayapti!\n';
    testText += '═'.repeat(32) + '\n';
    
    updatePreview(testText);
    printViaWindows(testText, 'Printer Test');
    
    setTimeout(function() {
        showToast('✅ Printer test muvaffaqiyatli!', 'success');
    }, 1000);
}

// ============================================
// REAL PRINTER - WINDOWS PRINTER PANELI
// ============================================
function printReceipt() {
    if (cart.length === 0) {
        showToast('Savatcha bo\'sh!', 'error');
        return;
    }
    
    var printer = document.getElementById('printerSelect') ? document.getElementById('printerSelect').value : 'XP-80C';
    var subtotal = cart.reduce(function(s, c) { return s + (c.price || 0) * (c.quantity || 0); }, 0);
    var discountInput = document.getElementById('discountInput');
    var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
    var total = Math.max(0, subtotal - discount);
    
    // Chek matnini tayyorlash
    var receipt = '';
    receipt += '═'.repeat(32) + '\n';
    receipt += '        🌾 POP AGRO PRODUCT\n';
    receipt += '        ' + new Date().toLocaleString() + '\n';
    receipt += '═'.repeat(32) + '\n';
    receipt += '  Mahsulot     Soni  Narxi\n';
    receipt += '─'.repeat(32) + '\n';
    
    cart.forEach(function(c) {
        var name = (c.name || 'N/A').substring(0, 15);
        var qty = String(c.quantity || 0).padStart(4);
        var price = ((c.price || 0) * (c.quantity || 0)).toLocaleString();
        receipt += '  ' + name.padEnd(12) + ' ' + qty + '  ' + price.padStart(10) + " so'm\n";
    });
    
    receipt += '─'.repeat(32) + '\n';
    receipt += '  Jami:              ' + subtotal.toLocaleString() + " so'm\n";
    if (discount > 0) {
        receipt += '  Chegirma:          -' + discount.toLocaleString() + " so'm\n";
    }
    receipt += '─'.repeat(32) + '\n';
    receipt += '  UMUMIY:            ' + total.toLocaleString() + " so'm\n";
    receipt += '═'.repeat(32) + '\n';
    receipt += '  Rahmat! Xush kelibsiz!\n';
    receipt += '═'.repeat(32) + '\n';
    
    // Oldindan ko'rish
    updatePreview(receipt);
    
    // REAL PRINTER - WINDOWS PRINTER DIALOG
    printViaWindows(receipt, 'Pop Agro - Chek');
}

// ============================================
// WINDOWS PRINTER DIALOG ORQALI CHOP ETISH
// ============================================
function printViaWindows(text, title) {
    title = title || 'Pop Agro - Chop etish';
    
    // Chop etish uchun yangi oyna ochish
    var printWindow = window.open('', '_blank', 'width=500,height=700,scrollbars=yes');
    if (!printWindow) {
        showToast('❌ Chop etish oynasi ochilmadi! Pop-up bloklangan.', 'error');
        return;
    }
    
    // Chop etish oynasiga kontent yozish
    printWindow.document.write('<!DOCTYPE html>');
    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<meta charset="UTF-8">');
    printWindow.document.write('<style>');
    printWindow.document.write('* { margin: 0; padding: 0; box-sizing: border-box; }');
    printWindow.document.write('body { font-family: "Courier New", monospace; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }');
    printWindow.document.write('.receipt-wrapper { background: white; max-width: 380px; width: 100%; padding: 30px; border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }');
    printWindow.document.write('.receipt-wrapper .receipt-title { text-align: center; font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #1a1a2e; }');
    printWindow.document.write('.receipt-wrapper .receipt-title span { color: #f59e0b; }');
    printWindow.document.write('.receipt-wrapper pre { font-size: 14px; white-space: pre-wrap; font-family: "Courier New", monospace; line-height: 1.6; background: #fafafa; padding: 15px; border-radius: 8px; border: 1px solid #e8ecf1; }');
    printWindow.document.write('.btn-group { display: flex; gap: 12px; margin-top: 20px; justify-content: center; flex-wrap: wrap; }');
    printWindow.document.write('.btn-group button { padding: 12px 30px; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 600; transition: all 0.3s; }');
    printWindow.document.write('.btn-group .btn-print { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }');
    printWindow.document.write('.btn-group .btn-print:hover { transform: scale(1.03); box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4); }');
    printWindow.document.write('.btn-group .btn-close { background: #ef4444; color: white; }');
    printWindow.document.write('.btn-group .btn-close:hover { transform: scale(1.03); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }');
    printWindow.document.write('.printer-info { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 12px; }');
    printWindow.document.write('.printer-info i { margin-right: 5px; }');
    printWindow.document.write('@media print {');
    printWindow.document.write('  body { background: white; padding: 0; min-height: auto; }');
    printWindow.document.write('  .receipt-wrapper { box-shadow: none; border-radius: 0; padding: 15px; max-width: 100%; }');
    printWindow.document.write('  .btn-group { display: none !important; }');
    printWindow.document.write('  .printer-info { display: none !important; }');
    printWindow.document.write('  .receipt-wrapper pre { border: none; background: white; padding: 10px; }');
    printWindow.document.write('}');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="receipt-wrapper">');
    printWindow.document.write('<div class="receipt-title">🌾 <span>Pop Agro</span> Product</div>');
    printWindow.document.write('<pre>' + text + '</pre>');
    printWindow.document.write('<div class="btn-group">');
    printWindow.document.write('<button class="btn-print" onclick="window.print()"><i class="fas fa-print"></i> 🖨️ Chop etish</button>');
    printWindow.document.write('<button class="btn-close" onclick="window.close()"><i class="fas fa-times"></i> ❌ Yopish</button>');
    printWindow.document.write('</div>');
    printWindow.document.write('<div class="printer-info"><i class="fas fa-info-circle"></i> Printer: ' + (document.getElementById('printerSelect') ? document.getElementById('printerSelect').value : 'XP-80C') + '</div>');
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Chop etish dialogini avtomatik ochish
    setTimeout(function() {
        printWindow.focus();
        try {
            printWindow.print();
        } catch(e) {
            console.log('Print dialog error:', e);
        }
    }, 600);
    
    showToast('🖨️ Printer oynasi ochildi!', 'info');
}

// ============================================
// KUNLIK HISOBOT - WINDOWS PRINTER
// ============================================
function printDailyReport() {
    var today = new Date().toISOString().split('T')[0];
    showToast('📊 Kunlik hisobot tayyorlanmoqda...', 'info');
    
    API.getSales(today).then(function(data) {
        if (data.success) {
            var report = '';
            report += '═'.repeat(32) + '\n';
            report += '    📊 KUNLIK HISOBOT\n';
            report += '    ' + new Date().toLocaleString() + '\n';
            report += '═'.repeat(32) + '\n';
            
            var cash = data.data.filter(function(s) { return s.payment_type === 'cash'; });
            var terminal = data.data.filter(function(s) { return s.payment_type === 'terminal'; });
            var credit = data.data.filter(function(s) { return s.payment_type === 'credit'; });
            
            var cashTotal = cash.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
            var terminalTotal = terminal.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
            var creditTotal = credit.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
            var totalAll = data.data.reduce(function(s, item) { return s + (item.total_price || 0); }, 0);
            
            report += '  Jami savdolar: ' + data.data.length + '\n';
            report += '  Naqd: ' + cashTotal.toLocaleString() + " so'm\n";
            report += '  Terminal: ' + terminalTotal.toLocaleString() + " so'm\n";
            report += '  Nasiya: ' + creditTotal.toLocaleString() + " so'm\n";
            report += '─'.repeat(32) + '\n';
            report += '  JAMI: ' + totalAll.toLocaleString() + " so'm\n";
            report += '═'.repeat(32) + '\n';
            
            updatePreview(report);
            printViaWindows(report, 'Pop Agro - Kunlik Hisobot');
            showToast('✅ Kunlik hisobot tayyor!', 'success');
        } else {
            showToast('❌ Hisobot olishda xatolik!', 'error');
        }
    });
}

function updatePreview(text) {
    var preview = document.getElementById('printerPreview');
    var content = document.getElementById('previewContent');
    
    if (preview) preview.style.display = 'block';
    
    if (content) {
        content.innerHTML = '<pre style="font-family: \'Courier New\', monospace; font-size: 13px; white-space: pre-wrap; word-break: break-all; padding: 10px;">' + text + '</pre>';
    }
}

function closePreview() {
    var preview = document.getElementById('printerPreview');
    if (preview) preview.style.display = 'none';
}

// ============================================
// PAYMENT TYPE
// ============================================
function setPaymentType(type) {
    paymentType = type;
    var btns = document.querySelectorAll('.btn-payment');
    btns.forEach(function(b) { b.classList.remove('active'); });
    var activeBtn = document.querySelector('.btn-payment[data-type="' + type + '"]');
    if (activeBtn) activeBtn.classList.add('active');
    var creditForm = document.getElementById('creditForm');
    if (creditForm) {
        creditForm.style.display = type === 'credit' ? 'flex' : 'none';
    }
}

// ============================================
// BARCODE SCAN
// ============================================
function barcodeSearch() {
    var input = document.getElementById('barcodeInput');
    if (!input) return;
    var code = input.value.trim();
    if (!code) return;
    
    var products = document.querySelectorAll('.pos-product');
    var found = false;
    
    products.forEach(function(item) {
        var itemCode = item.dataset.code || '';
        if (itemCode === code) {
            item.click();
            found = true;
            input.value = '';
        }
    });
    
    if (!found) {
        showToast('❌ Mahsulot topilmadi!', 'error');
        input.value = '';
    }
}

// ============================================
// LOAD POS PRODUCTS
// ============================================
function loadPOSProducts() {
    API.getProducts().then(function(data) {
        if (data.success && data.data) {
            renderPOSProducts(data.data);
        } else {
            var grid = document.getElementById('posProductGrid');
            if (grid) grid.innerHTML = '<div class="empty-state">Mahsulotlar yo\'q</div>';
        }
    }).catch(function(err) {
        console.error('Load products error:', err);
        var grid = document.getElementById('posProductGrid');
        if (grid) grid.innerHTML = '<div class="empty-state">Xatolik yuz berdi</div>';
    });
}

function renderPOSProducts(products) {
    var grid = document.getElementById('posProductGrid');
    if (!grid) return;
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="empty-state">Mahsulotlar yo\'q</div>';
        return;
    }
    
    var html = '';
    products.forEach(function(p) {
        html += '<div class="pos-product" onclick="addToCart(' + p.id + ')" data-name="' + (p.name || '').toLowerCase() + '" data-code="' + (p.code || '').toLowerCase() + '">';
        html += '<div class="product-image">';
        if (p.image) {
            html += '<img src="' + p.image + '" alt="' + p.name + '">';
        } else {
            html += '<i class="fas fa-box"></i>';
        }
        html += '</div>';
        html += '<div class="product-info">';
        html += '<div class="product-name">' + (p.name || 'N/A') + '</div>';
        html += '<div class="product-price">' + (p.price || 0).toLocaleString() + " so'm</div>";
        html += '<div class="product-qty">Qolgan: ' + (p.quantity || 0) + '</div>';
        html += '</div>';
        html += '</div>';
    });
    
    grid.innerHTML = html;
}

// ============================================
// FILTER POS PRODUCTS
// ============================================
function filterPOSProducts() {
    var search = document.getElementById('posSearch');
    if (!search) return;
    var query = search.value.toLowerCase();
    var items = document.querySelectorAll('.pos-product');
    items.forEach(function(item) {
        var name = item.dataset.name || '';
        var code = item.dataset.code || '';
        var match = name.indexOf(query) !== -1 || code.indexOf(query) !== -1;
        item.style.display = match ? 'block' : 'none';
    });
}

// ============================================
// CART - MINUSGA ISHLAMAYDI
// ============================================
function addToCart(productId) {
    API.getProducts().then(function(data) {
        if (data.success && data.data) {
            var product = data.data.find(function(p) { return p.id === productId; });
            if (!product) {
                showToast('❌ Mahsulot topilmadi!', 'error');
                return;
            }
            
            var availableQty = product.quantity || 0;
            var existing = cart.find(function(c) { return c.id === productId; });
            var cartQty = existing ? existing.quantity : 0;
            
            if (cartQty + 1 > availableQty) {
                showToast('❌ Mahsulot yetarli emas! Qolgan: ' + availableQty, 'error');
                return;
            }
            
            if (availableQty <= 0) {
                showToast('❌ Mahsulot tugagan!', 'error');
                return;
            }
            
            if (existing) {
                existing.quantity = (existing.quantity || 0) + 1;
            } else {
                cart.push({ 
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
            updateCartUI();
            showToast('✅ ' + product.name + ' savatchaga qo\'shildi! (' + (cartQty + 1) + '/' + availableQty + ')', 'success');
            updateReceiptPreview();
        }
    });
}

function removeFromCart(productId) {
    var item = cart.find(function(c) { return c.id === productId; });
    if (item) {
        showToast('❌ ' + item.name + ' savatchadan olib tashlandi', 'warning');
    }
    cart = cart.filter(function(c) { return c.id !== productId; });
    updateCartUI();
    updateReceiptPreview();
}

function changeQuantity(productId, delta) {
    var item = cart.find(function(c) { return c.id === productId; });
    if (!item) return;
    
    API.getProducts().then(function(data) {
        if (data.success && data.data) {
            var product = data.data.find(function(p) { return p.id === productId; });
            if (!product) return;
            
            var availableQty = product.quantity || 0;
            var newQty = (item.quantity || 0) + delta;
            
            if (delta > 0 && newQty > availableQty) {
                showToast('❌ Mahsulot yetarli emas! Qolgan: ' + availableQty, 'error');
                return;
            }
            
            if (newQty <= 0) {
                removeFromCart(productId);
                return;
            }
            
            item.quantity = newQty;
            updateCartUI();
            updateReceiptPreview();
        }
    });
}

function updateCartUI() {
    var items = document.getElementById('cartItems');
    var count = document.getElementById('cartCount');
    var total = document.getElementById('cartTotal');
    
    var totalItems = cart.reduce(function(s, c) { return s + (c.quantity || 0); }, 0);
    if (count) count.textContent = totalItems;
    
    if (!items) return;
    
    if (cart.length === 0) {
        items.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket"></i><p>Savatcha bo\'sh</p><small>Mahsulot qo\'shing</small></div>';
        if (total) total.textContent = '0 so\'m';
        var grandTotal = document.getElementById('cartGrandTotal');
        if (grandTotal) grandTotal.textContent = '0 so\'m';
        return;
    }
    
    var html = '';
    cart.forEach(function(c) {
        html += '<div class="cart-item">';
        html += '<span class="item-name">' + (c.name || 'N/A') + '</span>';
        html += '<div class="item-controls">';
        html += '<button onclick="changeQuantity(' + c.id + ', -1)">−</button>';
        html += '<span>' + (c.quantity || 0) + '</span>';
        html += '<button onclick="changeQuantity(' + c.id + ', 1)">+</button>';
        html += '</div>';
        html += '<span class="item-total">' + ((c.price || 0) * (c.quantity || 0)).toLocaleString() + " so'm</span>";
        html += '<span class="item-remove" onclick="removeFromCart(' + c.id + ')">×</span>';
        html += '</div>';
    });
    
    items.innerHTML = html;
    updateCartTotal();
    updateReceiptPreview();
}

function updateCartTotal() {
    var subtotal = cart.reduce(function(s, c) { return s + (c.price || 0) * (c.quantity || 0); }, 0);
    var discountInput = document.getElementById('discountInput');
    var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
    var total = Math.max(0, subtotal - discount);
    
    var cartTotal = document.getElementById('cartTotal');
    var cartGrandTotal = document.getElementById('cartGrandTotal');
    
    if (cartTotal) cartTotal.textContent = subtotal.toLocaleString() + ' so\'m';
    if (cartGrandTotal) cartGrandTotal.textContent = total.toLocaleString() + ' so\'m';
}

// ============================================
// RECEIPT PREVIEW
// ============================================
function updateReceiptPreview() {
    var items = document.getElementById('previewItems');
    if (!items) return;
    
    if (cart.length === 0) {
        items.innerHTML = '<div class="empty-preview">Savatcha bo\'sh</div>';
        return;
    }
    
    var subtotal = cart.reduce(function(s, c) { return s + (c.price || 0) * (c.quantity || 0); }, 0);
    var discountInput = document.getElementById('discountInput');
    var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
    var total = Math.max(0, subtotal - discount);
    
    var html = '';
    cart.forEach(function(c) {
        var name = (c.name || 'N/A').substring(0, 15);
        var qty = c.quantity || 0;
        var price = ((c.price || 0) * qty).toLocaleString();
        html += '<div class="receipt-item">';
        html += '<span>' + name + '</span>';
        html += '<span>' + qty + ' × ' + (c.price || 0).toLocaleString() + '</span>';
        html += '<span>' + price + " so'm</span>";
        html += '</div>';
    });
    
    items.innerHTML = html;
    
    var totalEl = document.getElementById('previewTotal');
    if (totalEl) {
        totalEl.textContent = total.toLocaleString() + ' so\'m';
    }
}

// ============================================
// 🔥 QAYTARIB OLISH (RETURN) - KOD BO'YICHA QIDIRISH
// ============================================

// Qaytarish modal oynasini ochish
function openReturnModal() {
    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'returnModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-undo-alt"></i> Mahsulotni qaytarib olish</h3>
                <button class="modal-close" onclick="closeReturnModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Mahsulot kodi</label>
                    <input type="text" id="returnProductCode" placeholder="Mahsulot kodini kiriting" class="form-control">
                    <small style="color:#888;font-size:12px;">Mahsulot kodini kiriting va Enter bosing</small>
                </div>
                <div id="returnProductInfo" class="product-info-box" style="display:none;">
                    <h4>Mahsulot ma'lumoti:</h4>
                    <p><strong>ID:</strong> <span id="returnProductId">-</span></p>
                    <p><strong>Nomi:</strong> <span id="returnProductName">-</span></p>
                    <p><strong>Narxi:</strong> <span id="returnProductPrice">-</span></p>
                    <p><strong>Qolgan:</strong> <span id="returnProductStock">-</span></p>
                    <p><strong>Kod:</strong> <span id="returnProductCodeDisplay">-</span></p>
                </div>
                <div class="form-group">
                    <label>Miqdor</label>
                    <input type="number" id="returnQuantity" placeholder="Miqdor" class="form-control" value="1">
                </div>
                <div class="form-group">
                    <label>Sabab</label>
                    <select id="returnReason" class="form-control">
                        <option value="Sifatli emas">Sifatli emas</option>
                        <option value="Muddati o'tgan">Muddati o'tgan</option>
                        <option value="Noto'g'ri mahsulot">Noto'g'ri mahsulot</option>
                        <option value="Mijoz bekor qildi">Mijoz bekor qildi</option>
                        <option value="Boshqa">Boshqa</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Savdo ID (ixtiyoriy)</label>
                    <input type="number" id="returnSaleId" placeholder="Savdo ID (agar ma'lum bo'lsa)" class="form-control">
                </div>
                <button class="btn btn-danger btn-block" onclick="processReturn()">
                    <i class="fas fa-undo-alt"></i> Qaytarib olish
                </button>
                <div id="returnResult" style="margin-top:10px;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 🔥 Kod bo'yicha qidirish - Enter bosilganda
    document.getElementById('returnProductCode').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchProductByCode(this.value.trim());
        }
    });
}

// Qaytarish modal oynasini yopish
function closeReturnModal() {
    var modal = document.getElementById('returnModal');
    if (modal) modal.remove();
}

// 🔥 Mahsulotni kod bo'yicha qidirish
function searchProductByCode(code) {
    var resultDiv = document.getElementById('returnResult');
    
    if (!code) {
        document.getElementById('returnProductInfo').style.display = 'none';
        if (resultDiv) resultDiv.innerHTML = '';
        return;
    }
    
    API.getProducts().then(function(data) {
        if (data.success && data.data) {
            // Kod bo'yicha qidirish (katta-kichik harflarga bog'liq emas)
            var product = data.data.find(function(p) { 
                return p.code && p.code.toLowerCase() === code.toLowerCase(); 
            });
            
            if (product) {
                document.getElementById('returnProductId').textContent = product.id;
                document.getElementById('returnProductName').textContent = product.name || 'N/A';
                document.getElementById('returnProductPrice').textContent = (product.price || 0).toLocaleString() + ' so\'m';
                document.getElementById('returnProductStock').textContent = product.quantity || 0;
                document.getElementById('returnProductCodeDisplay').textContent = product.code || '-';
                document.getElementById('returnProductInfo').style.display = 'block';
                document.getElementById('returnQuantity').value = 1;
                document.getElementById('returnQuantity').focus();
                if (resultDiv) resultDiv.innerHTML = '<div class="alert alert-success">✅ Mahsulot topildi: ' + product.name + '</div>';
            } else {
                document.getElementById('returnProductInfo').style.display = 'none';
                if (resultDiv) resultDiv.innerHTML = '<div class="alert alert-danger">❌ Mahsulot topilmadi! Kod: ' + code + '</div>';
            }
        }
    });
}

// Qaytarib olish funksiyasi
function processReturn() {
    var productId = document.getElementById('returnProductId').textContent;
    var quantity = document.getElementById('returnQuantity').value;
    var reason = document.getElementById('returnReason').value;
    var saleId = document.getElementById('returnSaleId').value;
    var resultDiv = document.getElementById('returnResult');
    
    if (!productId || productId === '-') {
        resultDiv.innerHTML = '<div class="alert alert-danger">❌ Avval mahsulotni qidiring!</div>';
        return;
    }
    
    if (!quantity || quantity <= 0) {
        resultDiv.innerHTML = '<div class="alert alert-danger">❌ Miqdor kiritilishi shart!</div>';
        return;
    }
    
    // Mahsulotni tekshirish
    API.getProducts().then(function(data) {
        if (data.success && data.data) {
            var product = data.data.find(function(p) { return p.id == productId; });
            if (!product) {
                resultDiv.innerHTML = '<div class="alert alert-danger">❌ Mahsulot topilmadi!</div>';
                return;
            }
            
            // Qaytarish ma'lumotlarini tayyorlash
            var returnData = {
                product_id: parseInt(productId),
                quantity: parseFloat(quantity),
                price: product.price || 0,
                total_price: (product.price || 0) * parseFloat(quantity),
                reason: reason || 'Boshqa',
                returned_by: 'Admin',
                sale_id: saleId ? parseInt(saleId) : null
            };
            
            // Qaytarish so'rovini yuborish
            API.returnProduct(returnData).then(function(response) {
                if (response.success) {
                    resultDiv.innerHTML = '<div class="alert alert-success">✅ ' + quantity + ' dona ' + product.name + ' qaytarib olindi!</div>';
                    // Sahifani yangilash
                    loadPOSProducts();
                    updateCartUI();
                    // Modalni yopish
                    setTimeout(function() {
                        closeReturnModal();
                    }, 2000);
                } else {
                    resultDiv.innerHTML = '<div class="alert alert-danger">❌ Xatolik: ' + (response.message || 'Noma\'lum xatolik') + '</div>';
                }
            }).catch(function(err) {
                resultDiv.innerHTML = '<div class="alert alert-danger">❌ Server xatosi: ' + err.message + '</div>';
            });
        }
    });
}

// ============================================
// PROCESS SALE
// ============================================
function processSale() {
    if (cart.length === 0) {
        showToast('❌ Savatcha bo\'sh!', 'error');
        return;
    }
    
    if (!shiftActive) {
        showToast('❌ Avval smena oching!', 'error');
        return;
    }
    
    var checkPromises = cart.map(function(item) {
        return API.getProducts().then(function(data) {
            if (data.success && data.data) {
                var product = data.data.find(function(p) { return p.id === item.id; });
                if (!product) {
                    showToast('❌ Mahsulot topilmadi: ' + item.name, 'error');
                    return false;
                }
                if ((product.quantity || 0) < (item.quantity || 0)) {
                    showToast('❌ ' + item.name + ' yetarli emas! Qolgan: ' + product.quantity, 'error');
                    return false;
                }
                return true;
            }
            return false;
        });
    });
    
    Promise.all(checkPromises).then(function(results) {
        if (results.every(function(r) { return r === true; })) {
            executeSale();
        } else {
            showToast('❌ Savdoni bajarib bo\'lmadi!', 'error');
        }
    });
}

function executeSale() {
    var subtotal = cart.reduce(function(s, c) { return s + (c.price || 0) * (c.quantity || 0); }, 0);
    var discountInput = document.getElementById('discountInput');
    var discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
    var total = Math.max(0, subtotal - discount);
    
    var saleData = {
        items: cart.map(function(c) { return { product_id: c.id, quantity: c.quantity || 0, price: c.price || 0 }; }),
        total: total,
        discount: discount,
        payment_type: paymentType,
        shift_id: currentShift ? currentShift.id : null
    };
    
    if (paymentType === 'credit') {
        var name = document.getElementById('debtorName');
        var address = document.getElementById('debtorAddress');
        var phone = document.getElementById('debtorPhone');
        
        if (!name || !name.value.trim()) {
            showToast('❌ Nasiya uchun ism kiritilishi shart!', 'error');
            return;
        }
        if (!phone || !phone.value.trim()) {
            showToast('❌ Nasiya uchun telefon kiritilishi shart!', 'error');
            return;
        }
        saleData.debtor = { 
            name: name.value.trim(), 
            address: address ? address.value.trim() : '', 
            phone: phone.value.trim() 
        };
    }
    
    API.addSale(saleData).then(function(data) {
        if (data.success) {
            showToast('✅ Savdo muvaffaqiyatli!', 'success');
            printReceipt();
            
            cart = [];
            var discountInput = document.getElementById('discountInput');
            if (discountInput) discountInput.value = '';
            updateCartUI();
            loadPOSProducts();
            
            if (paymentType === 'credit') {
                var name = document.getElementById('debtorName');
                var address = document.getElementById('debtorAddress');
                var phone = document.getElementById('debtorPhone');
                if (name) name.value = '';
                if (address) address.value = '';
                if (phone) phone.value = '';
            }
            
            setTimeout(function() { closePreview(); }, 2000);
        } else {
            showToast('❌ Xatolik: ' + (data.message || 'Noma\'lum xatolik'), 'error');
        }
    }).catch(function(err) {
        showToast('❌ Server xatosi: ' + err.message, 'error');
    });
}

// ============================================
// SHIFT
// ============================================
function checkShiftStatus() {
    API.getCurrentShift().then(function(data) {
        if (data.success && data.data) {
            shiftActive = true;
            currentShift = data.data;
            var statusEl = document.getElementById('shiftStatus');
            var balanceEl = document.getElementById('shiftBalance');
            var dotEl = document.querySelector('.status-dot');
            if (statusEl) {
                statusEl.textContent = '🟢 Smena ochiq';
                statusEl.style.color = '#22c55e';
            }
            if (dotEl) {
                dotEl.className = 'status-dot open';
            }
            if (balanceEl) {
                balanceEl.textContent = (data.data.opening_balance || 0).toLocaleString() + ' so\'m';
            }
        } else {
            shiftActive = false;
            currentShift = null;
            var statusEl = document.getElementById('shiftStatus');
            var dotEl = document.querySelector('.status-dot');
            if (statusEl) {
                statusEl.textContent = '🔴 Smena yopiq';
                statusEl.style.color = '#ef4444';
            }
            if (dotEl) {
                dotEl.className = 'status-dot closed';
            }
        }
    }).catch(function(err) {
        console.error('Shift check error:', err);
    });
}

function openShift() {
    var amountInput = document.getElementById('shiftAmount');
    var amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    API.openShift(amount).then(function(data) {
        if (data.success) {
            showToast('✅ Smena ochildi!', 'success');
            if (amountInput) amountInput.value = '';
            checkShiftStatus();
        } else {
            showToast('❌ Xatolik: ' + (data.message || 'Noma\'lum xatolik'), 'error');
        }
    });
}

function closeShift() {
    var amountInput = document.getElementById('shiftAmount');
    var amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
    if (!confirm('Smenani yopishni xohlaysizmi?')) return;
    
    API.closeShift(amount).then(function(data) {
        if (data.success) {
            showToast('✅ Smena yopildi!', 'success');
            if (amountInput) amountInput.value = '';
            checkShiftStatus();
            printDailyReport();
        } else {
            showToast('❌ Xatolik: ' + (data.message || 'Noma\'lum xatolik'), 'error');
        }
    });
}

// ============================================
// TOAST
// ============================================
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