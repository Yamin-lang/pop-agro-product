// ===== EMPLOYEES FUNCTIONS =====

let allEmployees = [];

// Xodimlarni yuklash
function loadEmployees() {
    const tbody = document.getElementById('employee-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Yuklanmoqda...</td></tr>';
    
    API.getEmployees()
        .then(response => {
            if (response.success) {
                allEmployees = response.data;
                renderEmployees(allEmployees);
            }
        })
        .catch(err => {
            console.error('Error loading employees:', err);
            // Demo ma'lumotlar
            const demoEmployees = [
                { id: 1, name: 'Ali Valiyev', phone: '+998901234567', position: 'kassir', checkInTime: '2026-06-24 09:00' },
                { id: 2, name: 'Zarina Karimova', phone: '+998902345678', position: 'sotuvchi', checkInTime: '2026-06-24 09:30' },
                { id: 3, name: 'Bekzod Rahimov', phone: '+998903456789', position: 'omborchi', checkInTime: null },
            ];
            allEmployees = demoEmployees;
            renderEmployees(demoEmployees);
        });
}

// Xodimlarni ko'rsatish
function renderEmployees(employees) {
    const tbody = document.getElementById('employee-table-body');
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666;padding:30px;">Xodimlar topilmadi</td></tr>';
        return;
    }
    
    const positionLabels = {
        'kassir': 'Kassir 💰',
        'sotuvchi': 'Sotuvchi 🛒',
        'omborchi': 'Omborchi 📦',
        'menejer': 'Menejer 👔'
    };
    
    tbody.innerHTML = employees.map((emp, index) => {
        const isCheckedIn = emp.checkInTime !== null && emp.checkInTime !== undefined;
        const checkInDisplay = emp.checkInTime ? new Date(emp.checkInTime).toLocaleTimeString('uz-UZ') : '-';
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${emp.name}</strong></td>
                <td>${emp.phone || '-'}</td>
                <td><span class="badge position">${positionLabels[emp.position] || emp.position}</span></td>
                <td>${checkInDisplay}</td>
                <td>
                    <span class="status-badge ${isCheckedIn ? 'active' : 'inactive'}">
                        ${isCheckedIn ? '✅ Ishda' : '❌ Kelmagan'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        ${!isCheckedIn ? `
                            <button class="btn-checkin" onclick="checkIn(${emp.id})" title="Kelgan vaqti">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn-edit" onclick="editEmployee(${emp.id})" title="Tahrirlash">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteEmployee(${emp.id})" title="O'chirish">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== XODIM QO'SHISH =====

function showAddEmployeeModal() {
    const html = `
        <h2 style="margin-bottom:20px;"><i class="fas fa-user-plus" style="color:#2e7d32;"></i> Yangi xodim qo'shish</h2>
        <form id="employeeForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Ismi *</label>
                    <input type="text" id="e-name" required placeholder="Ali Valiyev">
                </div>
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="text" id="e-phone" placeholder="+998901234567">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lavozim *</label>
                    <select id="e-position" required>
                        <option value="kassir">Kassir</option>
                        <option value="sotuvchi">Sotuvchi</option>
                        <option value="omborchi">Omborchi</option>
                        <option value="menejer">Menejer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Maosh</label>
                    <input type="number" id="e-salary" placeholder="1500000">
                </div>
            </div>
            <button type="submit" class="btn-submit">
                <i class="fas fa-save"></i> Saqlash
            </button>
        </form>
    `;
    
    showModal(html);
    
    document.getElementById('employeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEmployee();
    });
}

// Xodimni saqlash
function saveEmployee() {
    const data = {
        name: document.getElementById('e-name').value,
        phone: document.getElementById('e-phone').value,
        position: document.getElementById('e-position').value,
        salary: parseFloat(document.getElementById('e-salary').value) || 0
    };
    
    API.createEmployee(data)
        .then(response => {
            if (response.success) {
                closeModal();
                showToast('Xodim muvaffaqiyatli qo\'shildi!', 'success');
                loadEmployees();
            } else {
                showToast(response.message || 'Xatolik yuz berdi!', 'error');
            }
        })
        .catch(err => {
            console.error('Error saving employee:', err);
            showToast('Xodim qo\'shilmadi!', 'error');
        });
}

// ===== CHECK-IN =====

function checkIn(id) {
    const employee = allEmployees.find(e => e.id === id);
    if (!employee) return;
    
    if (confirm(`${employee.name} ishga keldi deb belgilash?`)) {
        API.checkIn(id)
            .then(response => {
                if (response.success) {
                    showToast(`${employee.name} ishga keldi! ✅`, 'success');
                    loadEmployees();
                } else {
                    showToast(response.message || 'Xatolik yuz berdi!', 'error');
                }
            })
            .catch(err => {
                console.error('Error checking in:', err);
                showToast('Xatolik yuz berdi!', 'error');
            });
    }
}

// ===== XODIMNI TAHRIRLASH =====

function editEmployee(id) {
    const employee = allEmployees.find(e => e.id === id);
    if (!employee) return;
    
    const html = `
        <h2 style="margin-bottom:20px;"><i class="fas fa-edit" style="color:#ff6f00;"></i> Xodimni tahrirlash</h2>
        <form id="editEmployeeForm" class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Ismi *</label>
                    <input type="text" id="e-name-edit" value="${employee.name}" required>
                </div>
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="text" id="e-phone-edit" value="${employee.phone || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Lavozim *</label>
                    <select id="e-position-edit" required>
                        <option value="kassir" ${employee.position === 'kassir' ? 'selected' : ''}>Kassir</option>
                        <option value="sotuvchi" ${employee.position === 'sotuvchi' ? 'selected' : ''}>Sotuvchi</option>
                        <option value="omborchi" ${employee.position === 'omborchi' ? 'selected' : ''}>Omborchi</option>
                        <option value="menejer" ${employee.position === 'menejer' ? 'selected' : ''}>Menejer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Maosh</label>
                    <input type="number" id="e-salary-edit" value="${employee.salary || 0}">
                </div>
            </div>
            <button type="submit" class="btn-submit">
                <i class="fas fa-save"></i> Yangilash
            </button>
        </form>
    `;
    
    showModal(html);
    
    document.getElementById('editEmployeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateEmployee(id);
    });
}

// Xodimni yangilash
function updateEmployee(id) {
    const data = {
        name: document.getElementById('e-name-edit').value,
        phone: document.getElementById('e-phone-edit').value,
        position: document.getElementById('e-position-edit').value,
        salary: parseFloat(document.getElementById('e-salary-edit').value) || 0
    };
    
    API.updateEmployee(id, data)
        .then(response => {
            if (response.success) {
                closeModal();
                showToast('Xodim yangilandi!', 'success');
                loadEmployees();
            } else {
                showToast(response.message || 'Xatolik yuz berdi!', 'error');
            }
        })
        .catch(err => {
            console.error('Error updating employee:', err);
            showToast('Xodim yangilanmadi!', 'error');
        });
}

// ===== XODIMNI O'CHIRISH =====

function deleteEmployee(id) {
    const employee = allEmployees.find(e => e.id === id);
    if (!employee) return;
    
    if (confirm(`"${employee.name}" xodimini o'chirmoqchimisiz?`)) {
        API.deleteEmployee(id)
            .then(response => {
                if (response.success) {
                    showToast('Xodim o\'chirildi!', 'info');
                    loadEmployees();
                } else {
                    showToast(response.message || 'Xatolik yuz berdi!', 'error');
                }
            })
            .catch(err => {
                console.error('Error deleting employee:', err);
                showToast('Xodim o\'chirilmadi!', 'error');
            });
    }
}

// Sahifa yuklanganda
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('employees').classList.contains('active')) {
        loadEmployees();
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (this.dataset.page === 'employees') {
                setTimeout(loadEmployees, 100);
            }
        });
    });
});