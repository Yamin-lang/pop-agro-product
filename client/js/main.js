// ============================================
// MAIN.JS - ISHGA TUSHIRISH
// ============================================

// ============================================
// LOGIN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;
            
            if (email === 'admin@example.com' && password === '123456') {
                localStorage.setItem('token', 'demo-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify({ name: 'Admin', email: email }));
                var errorEl = document.getElementById('loginError');
                if (errorEl) errorEl.style.display = 'none';
                showApp();
            } else {
                var errorEl = document.getElementById('loginError');
                if (errorEl) errorEl.style.display = 'block';
            }
        });
    }
    
    checkLogin();
});

// ============================================
// CHECK LOGIN
// ============================================
function checkLogin() {
    var token = localStorage.getItem('token');
    if (token) {
        showApp();
    }
}

// ============================================
// SHOW APP
// ============================================
function showApp() {
    var loginPage = document.getElementById('loginPage');
    var app = document.getElementById('app');
    if (loginPage) loginPage.classList.add('hidden');
    if (app) app.classList.remove('hidden');
    initApp();
}

// ============================================
// INIT APP
// ============================================
function initApp() {
    var user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}');
    var userName = document.getElementById('userName');
    var userAvatar = document.getElementById('userAvatar');
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
    
    // Menu
    var menu = document.getElementById('menuContainer');
    if (menu) {
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
    }
    
    // Menu click
    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.menu-item').forEach(function(m) {
                m.classList.remove('active');
            });
            this.classList.add('active');
            var page = this.dataset.page;
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
    var content = document.getElementById('pageContent');
    if (!content) return;
    
    var titles = {
        dashboard: 'Dashboard <span>Asosiy ko\'rsatkichlar</span>',
        pos: 'Kassa <span>Savdo qilish</span>',
        products: 'Ombor <span>Mahsulotlarni boshqarish</span>',
        reports: 'Hisobotlar <span>Savdo tahlili</span>',
        settings: 'Sozlamalar <span>Tizim sozlamalari</span>'
    };
    
    var titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.innerHTML = titles[page] || 'Sahifa';
    
    try {
        switch(page) {
            case 'dashboard':
                if (typeof loadDashboard === 'function') {
                    loadDashboard(content);
                } else {
                    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Dashboard yuklanmoqda...</p></div>';
                }
                break;
            case 'pos':
                if (typeof loadPOS === 'function') {
                    loadPOS(content);
                } else {
                    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Kassa yuklanmoqda...</p></div>';
                }
                break;
            case 'products':
                if (typeof loadProducts === 'function') {
                    loadProducts(content);
                } else {
                    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Ombor yuklanmoqda...</p></div>';
                }
                break;
            case 'reports':
                if (typeof loadReports === 'function') {
                    loadReports(content);
                } else {
                    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Hisobotlar yuklanmoqda...</p></div>';
                }
                break;
            case 'settings':
                if (typeof loadSettings === 'function') {
                    loadSettings(content);
                } else {
                    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Sozlamalar yuklanmoqda...</p></div>';
                }
                break;
            default:
                content.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><p>Sahifa topilmadi</p></div>';
        }
    } catch(e) {
        console.error('Page load error:', e);
        content.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><p>Xatolik yuz berdi: ' + e.message + '</p></div>';
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

// ============================================
// GLOBAL FUNKSIYALAR (Boshqa fayllar uchun)
// ============================================
window.refreshDashboard = function() {
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
        showToast('✅ Dashboard yangilandi', 'success');
    }
};

console.log('✅ Main.js loaded');