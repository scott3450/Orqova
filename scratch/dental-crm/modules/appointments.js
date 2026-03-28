// ============================================================
// APPOINTMENTS MODULE — Calendar & Chair Occupancy
// ============================================================

function renderAppointments() {
  const chairs = [1, 2];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  const occupied = DB.appointments.length;
  const total = times.length * chairs.length;
  const occPct = Math.round(occupied / total * 100);

  const html = `
    <div class="page-header">
      <div class="page-title">📅 Randevular & Koltuk Yönetimi</div>
      <div class="page-desc">Günlük çizelge, koltuk doluluk oranı ve no-show takibi</div>
    </div>

    <!-- Stats row -->
    <div class="grid-4 section-gap">
      <div class="kpi-card green">
        <div class="kpi-icon green">✅</div>
        <div class="kpi-value">${DB.appointments.filter(a => a.status === 'confirmed').length}</div>
        <div class="kpi-label">Onaylı Randevu</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-icon orange">⏳</div>
        <div class="kpi-value">${DB.appointments.filter(a => a.status === 'waiting').length}</div>
        <div class="kpi-label">Bekleyenler</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-icon blue">🦷</div>
        <div class="kpi-value">%${occPct}</div>
        <div class="kpi-label">Koltuk Doluluk Oranı</div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-icon" style="background:#FEECEC;">⚠️</div>
        <div class="kpi-value" style="color:var(--danger)">${DB.appointments.filter(a => a.status === 'no_show').length}</div>
        <div class="kpi-label">No-Show</div>
      </div>
    </div>

    <div class="grid-2 section-gap">
      <!-- Calendar Schedule -->
      <div class="card" style="grid-column:1/-1; overflow:hidden;">
        <div class="card-header">
            <div class="card-title">📋 Günlük Çizelge – ${new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          <div style="display:flex; gap:8px;">
            <span class="badge badge-success">● Onaylı</span>
            <span class="badge badge-warning">● Bekliyor</span>
            <span class="badge badge-danger">● No-Show</span>
            <span class="badge badge-neutral">○ Boş</span>
          </div>
        </div>
        <div class="table-wrap">
          <table style="min-width:600px;">
            <thead>
              <tr>
                <th style="width:80px">Saat</th>
                <th>🦷 Koltuk A (Dr. Kaya)</th>
                <th>🦷 Koltuk B (Dr. Demir)</th>
              </tr>
            </thead>
            <tbody id="scheduleBody">
              ${times.map(time => {
    const c1 = DB.appointments.find(a => a.time === time && a.chair === 1);
    const c2 = DB.appointments.find(a => a.time === time && a.chair === 2);
    return `
                  <tr>
                    <td style="font-weight:700;color:var(--text-muted);font-size:12px;">${time}</td>
                    <td>${c1 ? slotHtml(c1) : '<span class="apt-slot empty" onclick="quickBook(1,\'' + time + '\')">+ Randevu Ekle</span>'}</td>
                    <td>${c2 ? slotHtml(c2) : '<span class="apt-slot empty" onclick="quickBook(2,\'' + time + '\')">+ Randevu Ekle</span>'}</td>
                  </tr>`;
  }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- No-Show Handling -->
    ${DB.appointments.filter(a => a.status === 'no_show').length > 0 ? `
    <div class="card" style="border-color:var(--danger);">
      <div class="card-header">
        <div class="card-title" style="color:var(--danger)">⚠️ No-Show Protokolü</div>
        <div class="card-subtitle">Her no-show için aksiyon alınması gerekmektedir</div>
      </div>
      ${DB.appointments.filter(a => a.status === 'no_show').map(a => `
        <div style="background:var(--danger-light);border-radius:10px;padding:16px;margin-bottom:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-weight:700">${a.patient} – ${a.type} (${a.time})</div>
              <div style="font-size:12px;color:var(--text-muted)">No-Show kaydedildi | ${a.doctor}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn-wa-debt" style="padding:8px 16px" onclick="handleNoShowWA('${a.patient}')">📱 WhatsApp Gönder</button>
              <button class="btn-outline" onclick="markNoShowResolved('${a.id}')">✓ Çözüldü İşaretle</button>
              <button class="btn-outline" onclick="showToast('Görev resepsiyona atandı','success')">👤 Resepsiyona Ata</button>
            </div>
          </div>
          <div style="margin-top:10px;font-size:12px;background:white;border-radius:8px;padding:10px 14px;border-left:3px solid var(--danger);">
            <strong>Otomatik Eylem Planı:</strong><br>
            1️⃣ Şu an: WhatsApp "Randevunuzu kaçırdınız" mesajı → Onay İçin Butona Bas<br>
            2️⃣ 2 saat sonra: SMS hatırlatma<br>
            3️⃣ Yanıt gelmezse: Resepsiyona "Kritik Uyarı" düşür
          </div>
        </div>
      `).join('')}
    </div>` : ''}
  `;

  document.getElementById('section-appointments').innerHTML = html;
}

function slotHtml(a) {
  const cls = a.status === 'no_show' ? 'no-show' : a.chair === 1 ? 'occupied-green' : 'occupied-blue';
  return `<div class="apt-slot ${cls}">
    <div style="flex:1">
      <div>${a.patient}</div>
      <div style="font-weight:400;font-size:10.5px;opacity:0.8">${a.type} · ${a.duration}dk</div>
    </div>
    <button onclick="event.stopPropagation();removeAppointment('${a.id}')" style="background:none;border:none;cursor:pointer;opacity:0.6;font-size:12px;padding:0 2px;" title="İptal">✕</button>
  </div>`;
}
function quickBook(chair, time) {
  // Pre-fill and open the book appointment modal
  document.getElementById('bookChair').value = chair;
  document.getElementById('bookTime').value = time;
  document.getElementById('modalBookAppointment').classList.add('open');
}
function handleNoShowWA(patient) {
  showToast(`📱 ${patient}'a WhatsApp mesajı gönderildi`, 'success');
  // N8N Integration: No-Show WhatsApp webhook
  sendToN8n('send-whatsapp-noshow', { patientName: patient });
}
function markNoShowResolved(id) {
  const apt = DB.appointments.find(a => a.id === id);
  if (apt) { apt.status = 'confirmed'; renderAppointments(); showToast('✓ Randevu onaylı olarak güncellendi', 'success'); }
}
function addAppointment() {
  const patientId = parseInt(document.getElementById('bookPatient').value);
  const time = document.getElementById('bookTime').value;
  const chair = parseInt(document.getElementById('bookChair').value);
  const type = document.getElementById('bookType').value;
  const duration = parseInt(document.getElementById('bookDuration').value) || 30;
  const doctor = chair === 1 ? 'Dr. Kaya' : 'Dr. Demir';
  if (!patientId || !time || !chair || !type) { showToast('⚠️ Tüm alanları doldurun', 'error'); return; }
  const conflict = DB.appointments.find(a => a.time === time && a.chair === chair);
  if (conflict) { showToast(`⚠️ ${time} saatinde Koltuk ${chair === 1 ? 'A' : 'B'} zaten dolu!`, 'error'); return; }
  const patient = DB.patients.find(p => p.id === patientId);
  const newId = 'A' + String(Date.now()).slice(-4);
  const apt = { id: newId, patientId, patient: patient.name, time, duration, chair, type, status: 'confirmed', doctor };
  DB.appointments.push(apt);
  closeModal('modalBookAppointment');
  renderAppointments();
  showToast(`✅ ${patient.name} için ${time} randevusu oluşturuldu`, 'success');

  // N8N Integration: Calendar Sync Add
  sendToN8n('sync-calendar-add', { appointment: apt });
}
function removeAppointment(id) {
  const apt = DB.appointments.find(a => a.id === id);
  if (apt) {
    // N8N Integration: Calendar Sync Remove
    sendToN8n('sync-calendar-remove', { appointment: apt });
  }
  DB.appointments = DB.appointments.filter(a => a.id !== id);
  renderAppointments();
  showToast('📅 Randevu iptal edildi', '');
}
