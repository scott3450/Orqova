// ============================================================
// DASHBOARD MODULE — Komuta Merkezi
// ============================================================

function renderDashboard() {
  const totalSlots = 8;
  const usedSlots = DB.appointments.length;
  const occupancy = Math.round((usedSlots / totalSlots) * 100);
  const pct = Math.min(Math.round((DB.todayRevenue / DB.todayTarget) * 100), 100);

  const noShows = DB.appointments.filter(a => a.status === 'no_show');
  const waitingApts = DB.appointments.filter(a => a.status === 'waiting');
  const unpaidPatients = DB.patients.filter(p => p.balance < 0);
  const criticalCount = noShows.length + waitingApts.length;

  const actionItems = [
    ...noShows.map(a => ({
      type: 'no_show',
      title: a.patient,
      sub: a.time + ' · ' + a.type + ' · ' + a.doctor,
      id: String(a.id),
      patient: a.patient
    })),
    ...unpaidPatients.map(p => ({
      type: 'unpaid',
      title: p.name,
      sub: 'Açık Bakiye: ' + fmtMoney(Math.abs(p.balance)),
      id: String(p.id),
      patient: p.name
    }))
  ];

  const now = new Date('2026-03-10');
  const sortedApts = DB.appointments.slice().sort((a, b) => a.time.localeCompare(b.time));

  function aptBadge(status) {
    if (status === 'confirmed') return 'badge-success';
    if (status === 'no_show') return 'badge-danger';
    return 'badge-warning';
  }
  function aptBadgeLabel(status) {
    if (status === 'confirmed') return 'Onaylı';
    if (status === 'no_show') return 'No-Show';
    if (status === 'waiting') return 'Bekliyor';
    return status;
  }

  document.getElementById('section-dashboard').innerHTML = `
    <!-- ===== ÜST BANT ===== -->
    <div class="command-band">

      <div class="command-metric">
        <div class="cm-top">
          <span class="cm-icon">🦷</span>
          <span class="cm-label">Koltuk Doluluk</span>
        </div>
        <div class="cm-value">${occupancy}<span class="cm-unit">%</span></div>
        <div class="cm-sub">${usedSlots}/${totalSlots} slot dolu</div>
        <button class="cm-action-btn" onclick="navigate('appointments')">Bekleme Listesi →</button>
      </div>

      <div class="command-metric highlight">
        <div class="cm-top">
          <span class="cm-icon">💰</span>
          <span class="cm-label">Günlük Ciro</span>
        </div>
        <div class="cm-value">${fmtMoney(DB.todayRevenue)}</div>
        <div class="cm-sub">Hedef: ${fmtMoney(DB.todayTarget)}</div>
        <div class="cm-progress-mini">
          <div class="cm-progress-fill" id="miniProgressBar" style="width:0%"></div>
        </div>
      </div>

      <div class="command-metric ${criticalCount > 0 ? 'danger' : ''}">
        <div class="cm-top">
          <span class="cm-icon">${criticalCount > 0 ? '🚨' : '✅'}</span>
          <span class="cm-label">Kritik Aksiyon</span>
        </div>
        <div class="cm-value">${criticalCount}</div>
        <div class="cm-sub">
          ${noShows.length > 0 ? '<span class="cm-badge red">' + noShows.length + ' No-Show</span>' : ''}
          ${waitingApts.length > 0 ? '<span class="cm-badge orange">' + waitingApts.length + ' Bekliyor</span>' : ''}
          ${criticalCount === 0 ? 'Tüm sistemler normal' : ''}
        </div>
      </div>

    </div>

    <!-- ===== MERKEZ: AKSİYON KARTLARI ===== -->
    <div class="section-gap">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div style="font-size:15px;font-weight:800;color:var(--text-default);">⚡ Aksiyon Gerektiren Durumlar</div>
        ${actionItems.length > 0 ? '<span class="badge badge-danger">' + actionItems.length + ' açık</span>' : ''}
      </div>

      ${actionItems.length === 0
      ? `<div class="empty-action-state">
            <div style="font-size:40px;margin-bottom:10px;">✅</div>
            <div style="font-size:16px;font-weight:700;color:var(--success)">Bugün kritik durum yok!</div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">Tüm randevular onaylı, bekleyen aksiyon bulunmuyor.</div>
          </div>`
      : actionItems.map(item => `
          <div class="action-card ${item.type === 'no_show' ? 'action-card-nshow' : 'action-card-unpaid'}">
            <div class="ac-body">
              <div class="ac-title">
                <span style="font-weight:700;margin-right:8px;">${item.title}</span>
                <span class="badge ${item.type === 'no_show' ? 'badge-danger' : 'badge-warning'}" style="font-size:10px;">${item.type === 'no_show' ? 'No-Show' : 'Açık Bakiye'}</span>
              </div>
              <div class="ac-sub">${item.sub}</div>
            </div>
            <div class="ac-actions">
              <button class="ac-btn ac-btn-secondary" onclick="dashWA('${item.patient}')">📱 WhatsApp</button>
              ${item.type === 'no_show'
          ? '<button class="ac-btn ac-btn-secondary" onclick="navigate(\'appointments\')">Yeniden Planla</button>'
          : '<button class="ac-btn ac-btn-secondary" onclick="navigate(\'treatments\')">Ödeme Al</button>'}
            </div>
          </div>`).join('')
    }
    </div>


    <!-- ===== BUGÜNKÜ RANDEVULAR ===== -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">📋 Bugünkü Program</div>
          <div class="card-subtitle">${DB.appointments.length} randevu planlandı</div>
        </div>
        <button class="btn-outline" onclick="navigate('appointments')">Tümü →</button>
      </div>
      <div>
        ${sortedApts.map(a => `
          <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--grey-100);">
            <div style="min-width:48px;text-align:center;">
              <div style="font-size:14px;font-weight:800;color:var(--primary)">${a.time}</div>
              <div style="font-size:10px;color:var(--text-muted)">${a.duration}dk</div>
            </div>
            <div class="avatar ${avatarColor(a.patientId)}" style="width:32px;height:32px;font-size:11px;">${initials(a.patient)}</div>
            <div style="flex:1;">
              <div style="font-weight:600;font-size:13px;">${a.patient}</div>
              <div style="font-size:11.5px;color:var(--text-muted);">${a.type} · ${a.doctor}</div>
            </div>
            <span class="badge ${aptBadge(a.status)}">${aptBadgeLabel(a.status)}</span>
          </div>`).join('')}
      </div>
    </div>
  `;

  setTimeout(() => {
    const bar = document.getElementById('miniProgressBar');
    if (bar) bar.style.width = pct + '%';
  }, 300);
}

function dashWA(patient) {
  showToast('📱 WhatsApp mesajı gönderildi: ' + patient, 'success');
}
