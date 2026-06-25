// ============================================
// BOSQICHLAR (STEPS) - JARAYON KUZATISH
// ============================================

// Bosqichlar holati
var stepStatus = {
    shift: false,
    cart: false,
    payment: false,
    sale: false
};

// ===== BOSQICHLARNI YANGILASH =====
function updateSteps() {
    // 1-bosqich: Smena
    var shiftBtn = document.getElementById('shiftBtn');
    if (shiftBtn) {
        var isOpen = shiftBtn.classList.contains('open');
        updateStepStatus(1, isOpen, isOpen ? '🔓 Ochiq' : '🔒 Yopiq', isOpen ? 'active' : 'inactive');
    }
    
    // 2-bosqich: Mahsulotlar
    var cartItems = document.getElementById('cart-items');
    if (cartItems) {
        var hasItems = cartItems.querySelectorAll('.cart-item').length > 0;
        var count = cartItems.querySelectorAll('.cart-item').length;
        updateStepStatus(2, hasItems, hasItems ? '📦 ' + count + ' ta mahsulot' : '📦 Bo\'sh', hasItems ? 'active' : 'inactive');
    }
    
    // 3-bosqich: To'lov
    var paymentBtn = document.querySelector('.payment-btn.active');
    if (paymentBtn) {
        updateStepStatus(3, true, '💳 ' + paymentBtn.dataset.method, 'active');
    } else {
        updateStepStatus(3, false, '💳 Tanlanmagan', 'inactive');
    }
    
    // 4-bosqich: Savdo
    var cartItemsEl = document.getElementById('cart-items');
    var hasItems = cartItemsEl && cartItemsEl.querySelectorAll('.cart-item').length > 0;
    var hasPayment = document.querySelector('.payment-btn.active');
    var isShiftOpen = document.querySelector('.btn-shift.open');
    var canSale = hasItems && hasPayment && isShiftOpen;
    updateStepStatus(4, canSale, canSale ? '✅ Tayyor' : '⏳ Kutilmoqda', canSale ? 'active' : 'inactive');
}

// ===== BIR BOSQICHNI YANGILASH =====
function updateStepStatus(step, isCompleted, statusText, statusType) {
    var stepItem = document.querySelector('.step-item[data-step="' + step + '"]');
    if (!stepItem) return;
    
    var statusBadge = stepItem.querySelector('.step-status .status-badge');
    
    // Active/Completed class
    stepItem.classList.remove('active', 'completed');
    if (isCompleted) {
        stepItem.classList.add('completed');
    } else if (statusType === 'active') {
        stepItem.classList.add('active');
    }
    
    // Status badge
    if (statusBadge) {
        statusBadge.textContent = statusText;
        statusBadge.className = 'status-badge ' + statusType;
    }
    
    // Keyingi bosqichni faollashtirish
    if (isCompleted && step < 4) {
        var nextStep = document.querySelector('.step-item[data-step="' + (step + 1) + '"]');
        if (nextStep && !nextStep.classList.contains('completed')) {
            nextStep.classList.add('active');
        }
    }
}

// ===== BOSQICHLARNI KO'RSATISH =====
function showSteps() {
    var stepsContainer = document.querySelector('.steps-container');
    if (stepsContainer) {
        stepsContainer.style.display = 'block';
        updateSteps();
    }
}

// ===== BOSQICHLARNI YASHIRISH =====
function hideSteps() {
    var stepsContainer = document.querySelector('.steps-container');
    if (stepsContainer) {
        stepsContainer.style.display = 'none';
    }
}

// ===== BOSQICHGA O'TISH =====
function goToStep(step) {
    var steps = document.querySelectorAll('.step-item');
    steps.forEach(function(item) {
        var num = parseInt(item.dataset.step);
        if (num === step) {
            item.classList.add('active');
        } else if (num < step) {
            item.classList.add('completed');
            item.classList.remove('active');
        } else {
            item.classList.remove('active', 'completed');
        }
    });
}

// ===== AVTOMATIK YANGILASH =====
document.addEventListener('DOMContentLoaded', function() {
    // Har 2 sekundda bosqichlarni yangilash
    setInterval(updateSteps, 2000);
    
    // Bosqichlarni ko'rsatish
    showSteps();
});

// ===== BOSQICH TUGMALARINI KLICK EVENT =====
document.querySelectorAll('.step-item').forEach(function(item) {
    item.addEventListener('click', function() {
        var step = parseInt(this.dataset.step);
        goToStep(step);
        showToast('📌 ' + step + '-bosqichga o\'tildi', 'info');
    });
});