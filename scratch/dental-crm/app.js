// ============================================================
// APP.JS — Main router, navigation, modal & toast utilities
// ============================================================

// Current section
let currentSection = 'dashboard';

const sectionTitles = {
    'dashboard': 'Günlük Dashboard',
    'patients': 'Hasta Yönetimi',
    'appointments': 'Randevular & Koltuk',
    'treatments': 'Tedavi Planı & Finans',
    'automation': 'Otomasyon İş Akışları',
    'bi': 'İş Zekası – Executive',
    'ai-notes': 'Klinik Not Asistanı',
    'ai-triage': 'AI Smart Triage',
    'chairside': 'Doktor Paneli (Chairside)'
};

const sectionRenderers = {
    'dashboard': renderDashboard,
    'patients': renderPatients,
    'appointments': renderAppointments,
    'treatments': renderTreatments,
    'automation': renderAutomation,
    'bi': renderBI,
    'ai-notes': renderAINotes,
    'ai-triage': renderAITriage,
    'chairside': typeof renderChairside !== 'undefined' ? renderChairside : () => {}
};

function navigate(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Show target section
    const sectionEl = document.getElementById('section-' + section);
    const navEl = document.getElementById('nav-' + section);
    if (sectionEl) sectionEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    // Update title
    document.getElementById('topbarTitle').textContent = sectionTitles[section] || section;

    // Render section content
    currentSection = section;
    if (sectionRenderers[section]) {
        sectionRenderers[section]();
    }

    // Close mobile sidebar
    closeMobileSidebar();
}

// Sidebar nav click handlers
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(this.dataset.section);
    });
});

// Mobile sidebar
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
});
sidebarOverlay.addEventListener('click', closeMobileSidebar);

function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
}

// Sidebar toggle logic for desktop/tablet
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const toggleIcon = document.getElementById('toggleIcon');

if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        if (document.body.classList.contains('sidebar-collapsed')) {
            toggleIcon.textContent = '▶';
            document.body.classList.remove('sidebar-expanded');
        } else {
            toggleIcon.textContent = '◀';
            document.body.classList.add('sidebar-expanded');
        }
    });
}

// Auto collapse on tablet (769px - 1024px)
function handleDeviceResize() {
    if (window.innerWidth <= 1024 && window.innerWidth > 768) {
        if (!document.body.classList.contains('sidebar-expanded')) {
            document.body.classList.add('sidebar-collapsed');
            if (toggleIcon) toggleIcon.textContent = '▶';
        }
    } else if (window.innerWidth > 1024) {
        if (!document.body.classList.contains('sidebar-collapsed') && !document.body.classList.contains('sidebar-expanded')) {
            // Default desktop state
            document.body.classList.remove('sidebar-collapsed');
            if (toggleIcon) toggleIcon.textContent = '◀';
        }
    }
}
window.addEventListener('resize', handleDeviceResize);
document.addEventListener('DOMContentLoaded', handleDeviceResize);
handleDeviceResize();

// ============================================================
// MODALS
// ============================================================
function openNewPatientModal() {
    document.getElementById('modalNewPatient').classList.add('open');
}
function openQuickPayModal() {
    document.getElementById('modalQuickPay').classList.add('open');
}
function openBookAppointmentModal() {
    initBookModal();
    document.getElementById('modalBookAppointment').classList.add('open');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}
// Close modal on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', function (e) {
        if (e.target === this) closeModal(this.id);
    });
});

function saveNewPatient() {
    const name = document.getElementById('newPatientName').value.trim();
    const phone = document.getElementById('newPatientPhone').value.trim();
    if (!name || !phone) {
        showToast('⚠️ Ad ve telefon zorunludur', 'error');
        return;
    }
    const newId = Math.max(...DB.patients.map(p => p.id)) + 1;
    DB.patients.push({
        id: newId,
        name,
        phone,
        dob: document.getElementById('newPatientDOB').value || '2000-01-01',
        gender: 'E',
        blood: '?',
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'active',
        balance: 0,
        ltv: 0,
        treatments: [],
        ref: document.getElementById('newPatientRef').value,
        teeth: {}
    });
    closeModal('modalNewPatient');
    showToast(`✅ ${name} sisteme eklendi! #${newId}`, 'success');
    if (currentSection === 'patients') renderPatients();
    if (currentSection === 'dashboard') renderDashboard();
}

function processPayment() {
    const amount = parseFloat(document.getElementById('qpAmount').value);
    if (!amount || amount <= 0) {
        showToast('⚠️ Geçerli bir tutar girin', 'error');
        return;
    }
    DB.todayRevenue += amount;
    const payment = { id: 'P' + Date.now(), patientId: 1001, date: new Date().toISOString().split('T')[0], amount, method: 'Nakit', note: document.getElementById('qpNote').value || 'Hızlı ödeme', type: 'income' };
    DB.payments.push(payment);
    closeModal('modalQuickPay');
    showToast(`✅ ₺${fmt(amount)} ödeme alındı`, 'success');

    // N8N Integration: Finance & E-Invoice
    sendToN8n('create-invoice', { payment });

    if (currentSection === 'dashboard') renderDashboard();
    if (currentSection === 'treatments') renderTreatments();
}

// ============================================================
// TOAST
// ============================================================
let toastTimer;
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ============================================================
// N8N INTEGRATION UTILITY
// ============================================================
async function sendToN8n(webhookPath, data) {
    const baseUrl = 'https://n8n.yourdomain.com/webhook/'; // Replace with your actual n8n webhook URL
    const url = baseUrl + webhookPath;
    try {
        // In a real environment, you would use:
        /*
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, timestamp: new Date().toISOString() })
        });
        if (!response.ok) throw new Error('N8n error');
        */
        console.log(`[n8n Webhook Triggered] ${webhookPath}`, data);
        return true;
    } catch (error) {
        console.error(`[n8n Webhook Error] Failed to trigger ${webhookPath}`, error);
        return false;
    }
}

// ============================================================
// INIT
// ============================================================
function setTopbarDate() {
    const d = new Date();
    const str = d.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const el = document.getElementById('topbarDate');
    if (el) el.textContent = str;
}

// Pay method radio click styles
document.querySelectorAll('.pay-method').forEach(label => {
    label.addEventListener('click', function () {
        document.querySelectorAll('.pay-method').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Initialize
function initBookModal() {
    const sel = document.getElementById('bookPatient');
    if (!sel) return;
    sel.innerHTML = DB.patients.map(p => `<option value="${p.id}">${p.name} #${p.id}</option>`).join('');
}

setTopbarDate();
initBookModal();
try {
    navigate('dashboard');
} catch (e) {
    console.error('DentCRM init error:', e);
    document.getElementById('section-dashboard').innerHTML =
        '<div style="padding:32px;background:#FFEBEE;border-radius:12px;margin:24px;border:2px solid #EF5350;">' +
        '<h2 style="color:#C62828;font-family:monospace;">🚨 JavaScript Hatası</h2>' +
        '<pre style="margin-top:12px;font-size:13px;color:#B71C1C;white-space:pre-wrap;">' + (e.stack || e.message) + '</pre>' +
        '</div>';
    document.getElementById('section-dashboard').classList.add('active');
}
