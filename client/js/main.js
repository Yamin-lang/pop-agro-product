// ============================================
// MAIN.JS - ISHGA TUSHIRISH (TO'LIQ TUZATILGAN)
// ============================================

// ============================================
// 🔥 API_BASE ni tekshirish
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
    console.log('📦 API_BASE set in main.js:', API_BASE);
} else {
    console.log('📦 API_BASE from global:', API_BASE);
}

// ============================================
// LOGIN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Main.js loaded - DOM ready');
    console.log('📦 API_BASE:', API_BASE);
    
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;
            
            console.log('📤 Login attempt - Email:', email);
            
            if (email === 'admin@example.com' && password === '123456') {
                localStorage.setItem('token', 'demo-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify({ name: 'Admin', email: email }));
                var errorEl = document.getElementById('loginError');
                if (errorEl) errorEl.style.display = 'none';
                showApp();
            } else {
                var errorEl = document.getElementById('loginError');
                if (errorEl) errorEl.style.display = 'block';
                console.log('❌ Login failed');
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
        console.log('✅ Token found, showing app');
        showApp();
    } else {
        console.log('🔴 No token found, showing login');
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
    console.log('🔄 Initializing app...');
    
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
        console.log('✅ Menu loaded');
    }
    
    // Menu click
    document.querySelectorAll('.menu-item').forEach(function(item) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.menu-item').forEach(function(m) {
                m.classList.remove('active');
            });
            this.classList.add('active');
            var page = this.dataset.page;
            console.log('📄 Menu clicked - page:', page);
            loadPage(page);
        });
    });
    
    // Load dashboard
    loadPage('dashboard');
}

// ============================================
// LOAD PAGE - TUZATILGAN
// ============================================
function loadPage(page) {
    var content = document.getElementById('pageContent');
    if (!content) {
        console.error('❌ pageContent element not found');
        return;
    }
    
    console.log('📄 Loading page:', page);
    console.log('📦 API_BASE:', API_BASE);
    
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
                    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Dashboard yuklanmoqda...</p></div>';
                    console.warn('⚠️ loadDashboard function not found');
                }
                break;
            case 'pos':
                if (typeof loadPOS === 'function') {
                    loadPOS(content);
                } else {
                    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Kassa yuklanmoqda...</p></div>';
                    console.warn('⚠️ loadPOS function not found');
                }
                break;
            case 'products':
                if (typeof loadProducts === 'function') {
                    loadProducts(content);
                } else {
                    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Ombor yuklanmoqda...</p></div>';
                    console.warn('⚠️ loadProducts function not found');
                }
                break;
            case 'reports':
                if (typeof loadReports === 'function') {
                    loadReports(content);
                } else {
                    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Hisobotlar yuklanmoqda...</p></div>';
                    console.warn('⚠️ loadReports function not found');
                }
                break;
            case 'settings':
                if (typeof loadSettings === 'function') {
                    loadSettings(content);
                } else {
                    content.innerHTML = '<div class="loading"><div class="spinner"></div><p>Sozlamalar yuklanmoqda...</p></div>';
                    console.warn('⚠️ loadSettings function not found');
                }
                break;
            default:
                content.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><p>Sahifa topilmadi</p></div>';
        }
    } catch(e) {
        console.error('❌ Page load error:', e);
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
// TOAST NOTIFICATION - TUZATILGAN
// ============================================
function showToast(message, type) {
    type = type || 'success';
    console.log('📤 Toast:', message, 'Type:', type);
    
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    var icons = {
        success: '✅ ',
        error: '❌ ',
        warning: '⚠️ ',
        info: 'ℹ️ '
    };
    toast.textContent = (icons[type] || 'ℹ️ ') + message;
    
    // Stilni qo'llash
    toast.style.cssText = 'position:fixed;bottom:30px;right:30px;padding:14px 24px;border-radius:10px;color:#fff;font-weight:500;z-index:9999;animation:slideIn 0.4s ease;box-shadow:0 10px 40px rgba(0,0,0,0.2);font-size:14px;max-width:400px;';
    
    var colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#4f46e5'
    };
    toast.style.background = colors[type] || '#4f46e5';
    
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.4s ease';
        setTimeout(function() {
            if (toast.parentNode) toast.remove();
        }, 400);
    }, 3000);
}

// ============================================
// GLOBAL FUNKSIYALAR (Boshqa fayllar uchun)
// ============================================
window.refreshDashboard = function() {
    console.log('🔄 refreshDashboard called');
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
        showToast('✅ Dashboard yangilandi', 'success');
    } else {
        console.warn('⚠️ loadDashboardData function not found');
    }
};

// ============================================
// API_BASE ni global qilish
// ============================================
window.API_BASE = API_BASE;

console.log('✅ Main.js loaded - API_BASE:', API_BASE);