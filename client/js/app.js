// ============================================
// APP.JS - QO'SHIMCHA FUNKSIYALAR
// ============================================

console.log('✅ App.js loaded');

// Formatlash funksiyalari
function formatPrice(amount) {
    return (amount || 0).toLocaleString() + ' so\'m';
}

function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('uz-UZ');
}

function formatDateTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleString('uz-UZ');
}

// Xavfsiz number olish
function safeNumber(val, def = 0) {
    const num = parseFloat(val);
    return isNaN(num) ? def : num;
}

// Toast xabarlar
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}