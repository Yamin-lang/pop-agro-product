// ============================================
// APP.JS - QO'SHIMCHA FUNKSIYALAR
// ============================================

console.log('✅ App.js loaded successfully');

// Umumiy yordamchi funksiyalar
function formatPrice(amount) {
    return (amount || 0).toLocaleString() + ' so\'m';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('uz-UZ');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('uz-UZ');
}

// DOM elementni xavfsiz olish
function getEl(id) {
    return document.getElementById(id);
}

// Number ni xavfsiz olish
function safeNumber(val, def = 0) {
    const num = parseFloat(val);
    return isNaN(num) ? def : num;
}