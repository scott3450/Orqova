// ============================================================
// PATIENTS MODULE — Unified Patient View
// ============================================================

let patientSearch = '';
let patientStatusFilter = '';
let patientSort = { col: null, dir: 1 };
let selectedPatient = null;
var patientNoteProcessing = false;

// ---- helpers defined here so treatments.js can also use them ----
function statusBadge(s) {
  var m = { active: 'badge-success', recall: 'badge-warning', pending_treatment: 'badge-info', inactive: 'badge-neutral', no_show: 'badge-danger' };
  return m[s] || 'badge-neutral';
}
function statusLabel(s) {
  var m = { active: '✅ Aktif', recall: '🔔 Recall', pending_treatment: '⏳ Tedavi Bekleyen', inactive: '💤 Pasif', no_show: '❌ No-Show' };
  return m[s] || s;
}
function calcAge(dob) {
  return new Date().getFullYear() - new Date(dob).getFullYear();
}

function sortIcon(col) {
  if (patientSort.col !== col) return '<span style="opacity:.3;margin-left:4px;">⇅</span>';
  return patientSort.dir === 1 ? '<span style="margin-left:4px;">↑</span>' : '<span style="margin-left:4px;">↓</span>';
}

function renderPatients() {
  var filtered = DB.patients.filter(function (p) {
    var matchSearch = (
      p.name.toLowerCase().indexOf(patientSearch.toLowerCase()) !== -1 ||
      p.phone.indexOf(patientSearch) !== -1 ||
      String(p.id).indexOf(patientSearch) !== -1
    );
    var matchStatus = (patientStatusFilter === '' || p.status === patientStatusFilter);
    return matchSearch && matchStatus;
  });

  if (patientSort.col) {
    filtered = filtered.slice().sort(function (a, b) {
      if (patientSort.col === 'name') {
        return a.name.toLocaleLowerCase('tr').localeCompare(b.name.toLocaleLowerCase('tr'), 'tr') * patientSort.dir;
      }
      if (patientSort.col === 'status') {
        var order = { active: 1, recall: 2, pending_treatment: 3, no_show: 4, inactive: 5 };
        return ((order[a.status] || 99) - (order[b.status] || 99)) * patientSort.dir;
      }
      if (patientSort.col === 'ltv') {
        return (a.ltv - b.ltv) * patientSort.dir;
      }
      return 0;
    });
  }

  var statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'active', label: 'Aktif' },
    { value: 'recall', label: 'Recall Gereken' },
    { value: 'pending_treatment', label: 'Tedavi Bekleyen' },
    { value: 'inactive', label: 'Pasif' },
    { value: 'no_show', label: 'No-Show' }
  ];

  var selectOptions = statusOptions.map(function (o) {
    return '<option value="' + o.value + '"' + (patientStatusFilter === o.value ? ' selected' : '') + '>' + o.label + '</option>';
  }).join('');

  var tableRows = '';
  if (filtered.length === 0) {
    tableRows = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">🦷</div><div class="empty-state-text">Hasta bulunamadı</div></div></td></tr>';
  } else {
    filtered.forEach(function (p) {
      var isSelected = selectedPatient && selectedPatient.id === p.id;
      var balanceTxt = p.balance < 0 ? fmtMoney(p.balance) : '✓ Kapalı';
      var balanceColor = p.balance < 0 ? 'var(--danger)' : 'var(--success)';
      tableRows += '<tr style="cursor:pointer;' + (isSelected ? 'background:var(--primary-ultra);' : '') + '" onclick="openPatientDetail(' + p.id + ')">' +
        '<td><div style="font-weight:600;">' + p.name + '</div><div style="font-size:11.5px;color:var(--text-muted);">#' + p.id + '</div></td>' +
        '<td>' + p.phone + '</td>' +
        '<td>' + p.lastVisit + '</td>' +
        '<td><span class="badge ' + statusBadge(p.status) + '">' + statusLabel(p.status) + '</span></td>' +
        '<td style="color:' + balanceColor + ';font-weight:700;">' + balanceTxt + '</td>' +
        '<td style="font-weight:700;">' + fmtMoney(p.ltv) + '</td>' +
        '<td><button class="btn-outline" onclick="event.stopPropagation();openPatientDetail(' + p.id + ')" style="padding:4px 8px;font-size:11px;">İncele</button></td>' +
        '</tr>';
    });
  }

  var unifiedPanel = selectedPatient ? buildUnifiedView(selectedPatient) : '';

  document.getElementById('section-patients').innerHTML =
    '<div class="page-header">' +
    '<div class="page-title">👤 Hasta Yönetimi</div>' +
    '<div class="page-desc">Hasta seç → Kimlik, tedavi, AI notu ve finansal özet tek ekranda</div>' +
    '</div>' +
    '<div class="filter-bar">' +
    '<div class="search-box">' +
    '<span class="search-icon">🔍</span>' +
    '<input type="text" placeholder="Ad, telefon veya ID ile ara..." value="' + patientSearch + '" oninput="searchPatients(this.value)" />' +
    '</div>' +
    '<select onchange="filterByStatus(this.value)" style="width:auto;min-width:160px;">' + selectOptions + '</select>' +
    '<button class="btn-primary" onclick="openNewPatientModal()">+ Yeni Hasta</button>' +
    '</div>' +
    unifiedPanel +
    '<div class="card">' +
    '<div class="table-wrap">' +
    '<table>' +
    '<thead><tr>' +
    '<th style="cursor:pointer;user-select:none;" onclick="sortPatients(\'name\')">Hasta' + sortIcon('name') + '</th>' +
    '<th>Telefon</th>' +
    '<th>Son Ziyaret</th>' +
    '<th style="cursor:pointer;user-select:none;" onclick="sortPatients(\'status\')">Durum' + sortIcon('status') + '</th>' +
    '<th>Bakiye</th>' +
    '<th style="cursor:pointer;user-select:none;" onclick="sortPatients(\'ltv\')">LTV' + sortIcon('ltv') + '</th>' +
    '<th>İşlem</th>' +
    '</tr></thead>' +
    '<tbody>' + tableRows + '</tbody>' +
    '</table>' +
    '</div>' +
    '</div>';
}

function buildUnifiedView(p) {
  var teeth = [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48];
  var upper = teeth.slice(0, 16);
  var lower = teeth.slice(16);

  var patPays = DB.payments.filter(function (pay) { return pay.patientId === p.id; });
  var totalPaid = patPays.reduce(function (s, pay) { return s + pay.amount; }, 0);

  var triageScore = Math.min(99, Math.round((p.ltv / 300) + (p.status === 'active' ? 20 : p.status === 'recall' ? 10 : 0) + 50));
  var triageLabel = triageScore >= 80 ? 'Yüksek Sadakat' : triageScore >= 60 ? 'Orta Sadakat' : 'Düşük Aktivite';
  var triageColor = triageScore >= 80 ? 'var(--success)' : triageScore >= 60 ? 'var(--warning)' : 'var(--danger)';
  var triageDesc = triageScore >= 80 ? 'Sadık hasta. Düzenli kontrol öncelikli.' : triageScore >= 60 ? 'Orta segment. Recall ile aktive edilebilir.' : 'Hareketsiz hasta. Reaksivasyon kampanyası öneriliyor.';

  var upperTeeth = upper.map(function (t) {
    return '<div class="tooth ' + (p.teeth[t] || '') + '" title="' + t + '" onclick="cycleTooth(this,' + p.id + ',' + t + ')">' + t + '</div>';
  }).join('');
  var lowerTeeth = lower.map(function (t) {
    return '<div class="tooth ' + (p.teeth[t] || '') + '" title="' + t + '" onclick="cycleTooth(this,' + p.id + ',' + t + ')">' + t + '</div>';
  }).join('');

  var treatmentTimeline = '';
  if (p.treatments.length === 0) {
    treatmentTimeline = '<div style="color:var(--text-muted);font-size:13px;">Henüz tedavi kaydı yok.</div>';
  } else {
    p.treatments.forEach(function (t) {
      treatmentTimeline += '<div class="timeline-item"><div class="timeline-date">2025–2026</div><div class="timeline-content">' + t + '</div></div>';
    });
  }

  var payHistory = '';
  patPays.slice().reverse().slice(0, 3).forEach(function (pay) {
    payHistory += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--grey-100);font-size:13px;">' +
      '<div><div style="font-weight:600;">' + pay.note + '</div><div style="color:var(--text-muted);font-size:11.5px;">' + pay.date + ' · ' + pay.method + '</div></div>' +
      '<span style="font-weight:700;color:var(--success);">+' + fmtMoney(pay.amount) + '</span>' +
      '</div>';
  });

  var aptRows = '';
  DB.appointments.filter(function (a) { return a.patientId === p.id; }).forEach(function (a) {
    var ab = a.status === 'confirmed' ? 'badge-success' : a.status === 'no_show' ? 'badge-danger' : 'badge-warning';
    var al = a.status === 'confirmed' ? 'Onaylı' : a.status === 'no_show' ? 'No-Show' : 'Bekliyor';
    aptRows += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--grey-100);font-size:13px;">' +
      '<span style="font-weight:700;color:var(--primary);min-width:44px;">' + a.time + '</span>' +
      '<div style="flex:1;"><div style="font-weight:600;">' + a.type + '</div><div style="color:var(--text-muted);font-size:11.5px;">' + a.doctor + '</div></div>' +
      '<span class="badge ' + ab + '">' + al + '</span></div>';
  });

  return '<div class="unified-patient-view">' +
    '<div class="upv-header">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<div>' +
    '<div style="font-size:18px;font-weight:800;">' + p.name + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted);">#' + p.id + ' · <span class="badge ' + statusBadge(p.status) + '">' + statusLabel(p.status) + '</span></div>' +
    '</div>' +
    '</div>' +
    '<button class="btn-secondary" onclick="closePatientDetail()">← Listeye Dön</button>' +
    '</div>' +
    '<div class="upv-grid">' +

    // LEFT COL
    '<div class="upv-col">' +
    '<div class="upv-section-title">🪪 Kimlik & Tıbbi Özet</div>' +
    '<div class="upv-info-row"><span class="upv-lbl">📞 Telefon</span><span class="upv-val">' + p.phone + '</span></div>' +
    '<div class="upv-info-row"><span class="upv-lbl">🎂 Yaş</span><span class="upv-val">' + calcAge(p.dob) + ' yaş</span></div>' +
    '<div class="upv-info-row"><span class="upv-lbl">🩸 Kan Grubu</span><span class="upv-val">' + p.blood + '</span></div>' +
    '<div class="upv-info-row"><span class="upv-lbl">⚧ Cinsiyet</span><span class="upv-val">' + (p.gender === 'E' ? '♂ Erkek' : '♀ Kadın') + '</span></div>' +
    '<div class="upv-info-row"><span class="upv-lbl">📣 Referans</span><span class="upv-val">' + p.ref + '</span></div>' +
    '<div class="upv-info-row"><span class="upv-lbl">📅 Son Ziyaret</span><span class="upv-val">' + p.lastVisit + '</span></div>' +
    '<div class="upv-divider"></div>' +
    '<div class="upv-section-title" style="margin-top:0">⚡ Hızlı İşlem</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;">' +
    '<button class="btn-wa-apt" style="justify-content:center; width:100%;" onclick="showToast(\'📱 WhatsApp açılıyor...\',\'\')">💬 WhatsApp Gönder</button>' +
    '<button class="btn-outline" onclick="navigate(\'appointments\');closePatientDetail()">📅 Randevu Oluştur</button>' +
    '<button class="btn-outline" onclick="setTreatmentPatient(' + p.id + ');navigate(\'treatments\');closePatientDetail()">💰 Teklif Oluştur</button>' +
    '</div>' +
    '</div>' +

    // MIDDLE COL
    '<div class="upv-col">' +
    '<div class="upv-section-title">🦷 Odontogram</div>' +
    '<div class="odontogram" style="margin-bottom:16px;">' +
    '<div class="tooth-row">' + upperTeeth + '</div>' +
    '<div class="tooth-row">' + lowerTeeth + '</div>' +
    '<div class="odonto-legend">' +
    '<div class="legend-item"><div class="legend-dot" style="background:var(--primary-xlight);border-color:var(--primary)"></div>Dolgu</div>' +
    '<div class="legend-item"><div class="legend-dot" style="background:#FFF9C4;border-color:#F9A825"></div>Kron</div>' +
    '<div class="legend-item"><div class="legend-dot" style="background:var(--danger-light);border-color:var(--danger)"></div>Eksik</div>' +
    '<div class="legend-item"><div class="legend-dot" style="background:#EDE9FE;border-color:#7C3AED"></div>İmplant</div>' +
    '</div>' +
    '</div>' +
    '<div class="upv-divider"></div>' +
    '<div class="upv-section-title" style="margin-top:0">📋 Tedavi Geçmişi</div>' +
    '<div class="timeline" style="margin-bottom:16px;">' + treatmentTimeline + '</div>' +
    '<div class="upv-divider"></div>' +
    '<div class="upv-section-title" style="margin-top:0">🤖 AI Not Asistanı</div>' +
    '<textarea id="aiNoteInput' + p.id + '" rows="3" placeholder="Doktor notunu buraya gir..." style="width:100%;box-sizing:border-box;font-size:13px;padding:10px;border:1px solid var(--grey-200);border-radius:8px;resize:vertical;"></textarea>' +
    '<button class="btn-primary" style="margin-top:8px;width:100%;" onclick="summarizeNote(' + p.id + ')">🤖 AI ile Özetle</button>' +
    '<div id="aiNoteOut' + p.id + '" style="display:none;margin-top:12px;background:var(--primary-ultra);border-radius:8px;padding:12px;font-size:13px;color:var(--primary-dark);"></div>' +
    '</div>' +

    // RIGHT COL
    '<div class="upv-col">' +
    '<div class="upv-section-title">💳 Finansal Durum</div>' +
    '<div class="upv-finance-card">' +
    '<div class="ufc-row"><span class="ufc-lbl">LTV</span><span class="ufc-val primary">' + fmtMoney(p.ltv) + '</span></div>' +
    '<div class="ufc-row"><span class="ufc-lbl">Toplam Ödeme</span><span class="ufc-val success">' + fmtMoney(totalPaid) + '</span></div>' +
    '<div class="ufc-row"><span class="ufc-lbl">Açık Bakiye</span><span class="ufc-val ' + (p.balance < 0 ? 'danger' : 'success') + '">' + (p.balance < 0 ? fmtMoney(Math.abs(p.balance)) + ' borçlu' : '✓ Kapalı') + '</span></div>' +
    '</div>' +
    (patPays.length > 0 ? '<div class="upv-section-title">🧾 Son Ödemeler</div>' + payHistory : '') +
    '<div class="upv-divider"></div>' +
    '<div class="upv-section-title" style="margin-top:0">🔬 AI Triyaj Analizi</div>' +
    '<div class="triage-score-card">' +
    '<div class="triage-score-num" style="color:' + triageColor + ';">' + triageScore + '</div>' +
    '<div class="triage-score-bar-wrap"><div class="triage-score-bar" style="width:' + triageScore + '%;background:' + triageColor + ';"></div></div>' +
    '<div class="triage-label" style="color:' + triageColor + ';">' + triageLabel + '</div>' +
    '<div style="font-size:11.5px;color:var(--text-muted);margin-top:8px;">' + triageDesc + '</div>' +
    '</div>' +
    '<div class="upv-divider"></div>' +
    '<div class="upv-section-title" style="margin-top:0">🦷 Randevular</div>' +
    (aptRows || '<div style="font-size:13px;color:var(--text-muted);">Planlı randevu yok.</div>') +
    '</div>' +

    '</div>' +
    '</div>';
}

function cycleTooth(el, patientId, tooth) {
  var states = ['', 'filled', 'crown', 'missing', 'implant'];
  var cur = el.className.replace('tooth', '').trim();
  var idx = states.indexOf(cur);
  el.className = 'tooth ' + states[(idx + 1) % states.length];
}

function summarizeNote(patientId) {
  if (patientNoteProcessing) return;
  var input = document.getElementById('aiNoteInput' + patientId);
  var output = document.getElementById('aiNoteOut' + patientId);
  if (!input || !input.value.trim()) { showToast('⚠️ Lütfen önce bir not girin', 'error'); return; }
  patientNoteProcessing = true;
  var btn = input.nextElementSibling;
  btn.textContent = '⏳ Analiz ediliyor...';
  btn.disabled = true;
  setTimeout(function () {
    var note = input.value.trim();
    var toothMatch = note.match(/\d{2}/);
    output.innerHTML = '📝 <strong>AI Özeti:</strong> Hasta ' + (toothMatch ? '#' + toothMatch[0] + " no'lu dişte" : 'ilgili bölgede') + ' şikayet bildirdi. Tedavi planı oluşturulması önerildi.';
    output.style.display = 'block';
    btn.textContent = '✅ Özetlendi';
    btn.disabled = false;
    patientNoteProcessing = false;
    showToast('🤖 AI notu özetlendi', 'success');
  }, 1400);
}

function setTreatmentPatient(id) {
  if (typeof selectedPatientId !== 'undefined') selectedPatientId = id;
}

function searchPatients(val) { patientSearch = val; renderPatients(); }
function filterByStatus(val) { patientStatusFilter = val; renderPatients(); }
function sortPatients(col) {
  if (patientSort.col === col) { patientSort.dir *= -1; }
  else { patientSort.col = col; patientSort.dir = 1; }
  renderPatients();
}
function openPatientDetail(id) {
  selectedPatient = DB.patients.find(function (p) { return p.id === id; });
  patientNoteProcessing = false;
  renderPatients();
  setTimeout(function () {
    var panel = document.querySelector('.unified-patient-view');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}
function closePatientDetail() {
  selectedPatient = null;
  renderPatients();
}
