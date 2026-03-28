// Mock Data for 5 Barbers (Reduced from 10)
let barbers = [
    { id: 'SH-001', name: 'Ahmet Yılmaz', logs: { status: 'success', time: '1 dk önce' }, gCalId: 'ahmet@calendar.google.com' },
    { id: 'SH-002', name: 'Mehmet Kaya', logs: { status: 'success', time: '2 dk önce' }, gCalId: 'mehmet@calendar.google.com' },
    { id: 'SH-003', name: 'Ali Demir', logs: { status: 'error', time: '3 dk önce', message: 'API Quota Exceeded' }, gCalId: 'ali@calendar.google.com' },
    { id: 'SH-004', name: 'Can Çelik', logs: { status: 'success', time: '1 dk önce' }, gCalId: 'can@calendar.google.com' },
    { id: 'SH-005', name: 'Veli Şahin', logs: { status: 'success', time: '4 dk önce' }, gCalId: 'veli@calendar.google.com' },
];

document.addEventListener('DOMContentLoaded', () => {
    refreshAllUI();

    // Search Functionality
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        renderStatusTable(query);
        renderCalendarLinks(query);
    });

    // Appointment Form Submit Handler
    document.getElementById('quickAppointmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveAppointment();
    });

    // New Barber Form Submit Handler
    document.getElementById('newBarberForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addBarber();
    });
});

function refreshAllUI() {
    renderStatusTable();
    populateSelectForm();
    renderCalendarLinks();
}

// Render the 10 Barbers Monitoring Table (with optional filter)
function renderStatusTable(filter = '') {
    const tbody = document.querySelector('#barberStatusTable tbody');
    tbody.innerHTML = '';

    const filteredBarbers = barbers.filter(b => 
        b.name.toLowerCase().includes(filter) || 
        b.id.toLowerCase().includes(filter)
    );

    filteredBarbers.forEach(b => {
        // Appwrite logs verification simulation (Green/Red light)
        const isSuccess = b.logs.status === 'success';
        const indicatorClass = isSuccess ? 'status-green' : 'status-red';
        const indicatorText = isSuccess ? 'Sistem Aktif' : 'Hata Var';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${b.id}</strong></td>
            <td>${b.name}</td>
            <td>
                <span class="status-indicator ${indicatorClass}">
                    <span class="status-dot"></span>
                    ${indicatorText}
                </span>
                ${!isSuccess ? `<br><small style="color:var(--error); margin-top:4px; display:block;"><i class="fa-solid fa-triangle-exclamation"></i> ${b.logs.message}</small>` : ''}
            </td>
            <td><i class="fa-regular fa-clock" style="color:var(--text-light); margin-right:4px;"></i> ${b.logs.time}</td>
            <td>
                <div class="action-group">
                    ${!isSuccess ? `
                        <button class="btn-action-sm btn-restart" onclick="restartSystem('${b.id}')">
                            <i class="fa-solid fa-power-off"></i> Yeniden Başlat
                        </button>
                    ` : ''}
                    <button class="btn-action-sm btn-test" onclick="testWebhook('${b.id}')">
                        <i class="fa-solid fa-flask"></i> Test Et
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Action Simulations
function restartSystem(id) {
    const barber = barbers.find(b => b.id === id);
    confirm(`${barber.name} için sistemi yeniden başlatmak istediğinize emin misiniz? n8n akışı resetlenecektir.`);
    
    // Simulate recovery
    barber.logs.status = 'success';
    barber.logs.time = 'Şimdi';
    renderStatusTable();
    alert(`${barber.name} sistemi başarıyla yeniden başlatıldı.`);
}

function testWebhook(id) {
    const barber = barbers.find(b => b.id === id);
    alert(`${barber.name} için n8n webhook testi gönderiliyor...`);
    
    setTimeout(() => {
        alert('Webhook testi BAŞARILI. Google Calendar ve Appwrite erişimi onaylandı.');
    }, 1000);
}

// Modal Logic
function openBarberModal() {
    document.getElementById('barberModal').style.display = 'block';
}

function closeBarberModal() {
    document.getElementById('barberModal').style.display = 'none';
    document.getElementById('newBarberForm').reset();
}

function addBarber() {
    const id = document.getElementById('nbShopId').value;
    const name = document.getElementById('nbName').value;
    const gCalId = document.getElementById('nbGCalId').value;
    const isActive = document.getElementById('nbIsActive').checked;

    // Duplicate check
    if (barbers.find(b => b.id === id)) {
        alert('Bu Shop ID zaten kullanımda!');
        return;
    }

    const newBarber = {
        id: id,
        name: name,
        gCalId: gCalId,
        logs: { status: 'success', time: 'Yeni eklendi' }
    };

    barbers.push(newBarber);
    refreshAllUI();
    closeBarberModal();
    alert(`${name} başarıyla sisteme eklendi! Google Calendar entegrasyonu hazır.`);
}

// Populate Quick Appointment Form Options
function populateSelectForm() {
    const select = document.getElementById('qBarberId');
    select.innerHTML = '<option value="" disabled selected>Berber Seçin...</option>'; // Clear existing
    barbers.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = `${b.name} (${b.id})`;
        select.appendChild(option);
    });

    // Set today's date and current time as default
    const now = new Date();
    document.getElementById('qDate').valueAsDate = now;
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('qTime').value = `${hours}:${minutes}`;
}

function renderCalendarLinks(filter = '') {
    const container = document.getElementById('calendarLinksContainer');
    container.innerHTML = '';

    const filteredBarbers = barbers.filter(b => 
        b.name.toLowerCase().includes(filter) || 
        b.id.toLowerCase().includes(filter)
    );

    filteredBarbers.forEach(b => {
        const a = document.createElement('a');
        a.className = 'calendar-card';
        // Gerçekte gCalId parametresi ile custom Google Calendar URL'i açılır
        a.href = `https://calendar.google.com/calendar/u/0/r?cid=${b.gCalId}`;
        a.target = '_blank';
        a.innerHTML = `
            <div class="calendar-icon-wrapper">
                <i class="fa-solid fa-calendar-day"></i>
            </div>
            <h4>${b.name}</h4>
            <p>${b.id}</p>
        `;
        container.appendChild(a);
    });
}

function refreshStatus() {
    // Simulate refresh by randomizing connection status slightly
    barbers[2].logs.status = Math.random() > 0.5 ? 'success' : 'error';
    barbers[6].logs.status = Math.random() > 0.5 ? 'success' : 'error';
    
    // Animate table
    const table = document.querySelector('.status-table');
    table.style.opacity = '0.5';
    setTimeout(() => {
        renderStatusTable();
        table.style.opacity = '1';
    }, 400);
}

function saveAppointment() {
    const btn = document.querySelector('#quickAppointmentForm button');
    const originalText = btn.innerHTML;
    
    // Simulate saving
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Kaydediliyor...';
    btn.disabled = true;

    setTimeout(() => {
        alert('Manuel randevu başarıyla Appwrite ve Google Calendar\'a iletildi!');
        document.getElementById('quickAppointmentForm').reset();
        document.getElementById('qDate').valueAsDate = new Date(); // reset date to today
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 1500);
}
