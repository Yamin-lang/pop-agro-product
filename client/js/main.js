// ============================================
// MAIN.JS - ISHGA TUSHIRISH
// ============================================

// ============================================
// LOGIN
// ============================================
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email === 'admin@example.com' && password === '123456') {
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({ name: 'Admin', email: email }));
        document.getElementById('loginError').style.display = 'none';
        showApp();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});

// ============================================
// CHECK LOGIN
// ============================================
function checkLogin() {
    const token = localStorage.getItem('token');
    if (token) {
        showApp();
    }
}

// ============================================
// SHOW APP
// ============================================
function showApp() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
}

// ============================================
// INIT APP
// ============================================
function initApp() {
    const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}');
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    
    // Menu
    const menu = document.getElementById('menuContainer');
    menu.innerHTML = `
        <div class="menu-item active" data-page="dashboard">
            <i class="fas fa-chart-pie"></i>
            <span>Dashboard</span>
        </div>
        <div class="menu-item" data-page="pos">
            <i class="fas fa-shopping-cart"></i>
            <span>Kassa</span>
            <span class="badge">POS</span>
        </div>
        <div class="menu-item" data-page="products">
            <i class="fas fa-boxes"></i>
            <span>Ombor</span>
        </div>
        <div class="menu-item" data-page="reports">
            <i class="fas fa-file-alt"></i>
            <span>Hisobotlar</span>
        </div>
        <div class="menu-item" data-page="settings">
            <i class="fas fa-cog"></i>
            <span>Sozlamalar</span>
        </div>
    `;
    
    // Menu click
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            const page = this.dataset.page;
            loadPage(page);
        });
    });
    
    // Load dashboard
    loadPage('dashboard');
}

// ============================================
// LOAD PAGE
// ============================================
function loadPage(page) {
    const content = document.getElementById('pageContent');
    const titles = {
        dashboard: 'Dashboard <span>Asosiy ko\'rsatkichlar</span>',
        pos: 'Kassa <span>Savdo qilish</span>',
        products: 'Ombor <span>Mahsulotlarni boshqarish</span>',
        reports: 'Hisobotlar <span>Savdo tahlili</span>',
        settings: 'Sozlamalar <span>Tizim sozlamalari</span>'
    };
    
    document.getElementById('pageTitle').innerHTML = titles[page] || 'Sahifa';
    
    switch(page) {
        case 'dashboard': loadDashboard(content); break;
        case 'pos': loadPOS(content); break;
        case 'products': loadProducts(content); break;
        case 'reports': loadReports(content); break;
        case 'settings': loadSettings(content); break;
        default: content.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><p>Sahifa topilmadi</p></div>';
    }
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('Chiqishni xohlaysizmi?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============================================
// AUTO START
// ============================================
document.addEventListener('DOMContentLoaded', checkLogin);