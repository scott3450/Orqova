// ============================================================
// TREATMENTS MODULE — Nakit Akışı (Clean Finance)
// ============================================================

var planRows = [
  { code: 'IMP-01', name: 'İmplant (Tekil)', qty: 2, price: 18000, discount: 0, tooth: '36' },
  { code: 'KRN-01', name: 'Porselen Kaplama (Tekil)', qty: 4, price: 4500, discount: 10, tooth: '12' }
];
var selectedPatientId = 1004;
var installmentStatuses = {};

function renderTreatments() {
  var patient = DB.patients.find(function (p) { return p.id === selectedPatientId; });
  var total = planRows.reduce(function (s, r) { return s + r.qty * r.price * (1 - r.discount / 100); }, 0);
  var origTotal = planRows.reduce(function (s, r) { return s + r.qty * r.price; }, 0);
  var discount = origTotal - total;
  var pName = patient ? patient.name : '—';
  var pId = patient ? patient.id : '—';
  var pStatus = patient ? patient.status : '';

  // patient selector options
  var patOptions = DB.patients.map(function (p) {
    return '<option value="' + p.id + '"' + (p.id === selectedPatientId ? ' selected' : '') + '>' + p.name + ' #' + p.id + '</option>';
  }).join('');

  // treatment rows
  var tRows = buildTreatmentRows();

  // total line
  var discountLine = discount > 0 ? '<span style="font-size:13px;color:var(--text-muted);font-weight:400;">İndirim: <span style="color:var(--success)">-' + fmtMoney(discount) + '</span></span>' : '';

  // installment rows (default 6)
  var iRows = buildInstallmentRows(Math.round(total), 6);

  var sbl = typeof statusBadge === 'function' ? statusBadge(pStatus) : 'badge-neutral';
  var sll = typeof statusLabel === 'function' ? statusLabel(pStatus) : pStatus;

  document.getElementById('section-treatments').innerHTML =
    '<div class="page-header">' +
    '<div class="page-title">💰 Nakit Akışı</div>' +
    '<div class="page-desc">Tedavi teklifi oluştur, ödeme takvimini yönet, tahsilat başlat</div>' +
    '</div>' +

    // Hasta Seçici
    '<div class="card section-gap">' +
    '<div class="flex-between">' +
    '<div style="display:flex;align-items:center;gap:12px;">' +
    '<div class="avatar ' + avatarColor(selectedPatientId) + '" style="width:44px;height:44px;font-size:16px">' + initials(pName) + '</div>' +
    '<div>' +
    '<div style="font-weight:700;font-size:16px;">' + pName + '</div>' +
    '<div style="font-size:12px;color:var(--text-muted)">#' + pId + ' · <span class="badge ' + sbl + '">' + sll + '</span></div>' +
    '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;">' +
    '<select onchange="changePatient(this.value)" style="width:auto;">' + patOptions + '</select>' +
    '<button class="btn-primary print-hide" onclick="printTreatmentPlan()">🖨 PDF</button>' +
    '</div>' +
    '</div>' +
    '</div>' +

    // Tedavi Teklifi
    '<div class="card section-gap" id="treatmentPlanCard">' +
    '<div class="card-header">' +
    '<div>' +
    '<div class="card-title">🦷 Tedavi Teklifi Oluştur</div>' +
    '<div class="card-subtitle">TDB fiyat listesi entegrasyonlu — diş numarası + işlem seç</div>' +
    '</div>' +
    '<button class="btn-outline" onclick="addTreatmentRow()">+ Tedavi Ekle</button>' +
    '</div>' +
    '<div class="treatment-row header"><span>Diş No</span><span>Tedavi</span><span>Adet</span><span>Birim Fiyat</span><span>İndirim</span><span></span></div>' +
    '<div id="treatmentRows">' + tRows + '</div>' +
    '<hr class="divider"/>' +
    '<div class="treatment-total">' + discountLine + '<span style="font-size:13px;color:var(--text-muted);font-weight:400;">Toplam:</span><span style="color:var(--primary-dark);font-size:24px;">' + fmtMoney(Math.round(total)) + '</span></div>' +
    '</div>' +

    // Ödeme Takvimi
    '<div class="card section-gap">' +
    '<div class="card-header">' +
    '<div><div class="card-title">📅 Ödeme Takvimi</div><div class="card-subtitle">Tıklayarak taksit durumunu güncelle</div></div>' +
    '<div style="display:flex;align-items:center;gap:10px;">' +
    '<span style="font-size:13px;font-weight:600;color:var(--text-secondary)">Taksit:</span>' +
    '<select id="installCount" onchange="updateInstPlan(' + Math.round(total) + ')" style="width:auto;">' +
    '<option value="1">Peşin</option>' +
    '<option value="3">3 Taksit</option>' +
    '<option value="6" selected>6 Taksit</option>' +
    '<option value="12">12 Taksit</option>' +
    '</select>' +
    '</div>' +
    '</div>' +
    '<div id="installmentPlan">' + iRows + '</div>' +
    '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--grey-100);">' +
    '<button class="btn-wa-debt" style="margin-top:10px" onclick="sendPayWA(\'' + pName + '\',' + Math.round(total) + ')">' +
    '<span style="font-size:20px;">📲</span>' +
    '<div style="text-align:left;">' +
    '<div style="font-weight:700;font-size:14px;">WhatsApp ile Ödeme Hatırlatması Gönder</div>' +
    '<div style="font-size:12px;opacity:0.85;">' + pName + ' · Toplam: ' + fmtMoney(Math.round(total)) + '</div>' +
    '</div>' +
    '</button>' +
    '</div>' +
    '</div>';
}

function buildTreatmentRows() {
  return planRows.map(function (r, i) {
    var opts = DB.treatments.map(function (t) {
      return '<option value="' + t.code + '"' + (t.code === r.code ? ' selected' : '') + '>' + t.name + '</option>';
    }).join('');
    var rowTotal = fmtMoney(Math.round(r.qty * r.price * (1 - r.discount / 100)));
    var warnLine = r.discount > 20 ? '<span style="color:var(--danger);margin-left:6px;">⚠️ Yönetici Onayı Gerekli</span>' : '';
    return '<div class="treatment-row">' +
      '<input type="text" value="' + (r.tooth || '') + '" placeholder="#Diş" style="width:62px;text-align:center;padding:6px;font-size:13px;" onchange="updateRow(' + i + ',\'tooth\',this.value)" />' +
      '<select onchange="updateRow(' + i + ',\'code\',this.value)" style="font-size:13px;padding:6px 10px;">' + opts + '</select>' +
      '<input type="number" value="' + r.qty + '" min="1" max="32" style="width:60px;text-align:center;padding:6px;" onchange="updateRow(' + i + ',\'qty\',this.value)" />' +
      '<div style="font-weight:700;font-size:14px;">' + fmtMoney(r.price) + '</div>' +
      '<div style="display:flex;align-items:center;gap:4px;"><input type="number" value="' + r.discount + '" min="0" max="30" style="width:54px;text-align:center;padding:6px;" onchange="updateRow(' + i + ',\'discount\',this.value)" /><span style="font-size:12px;color:var(--text-muted)">%</span></div>' +
      '<button class="btn-icon" style="background:var(--danger-light);color:var(--danger);" onclick="removeRow(' + i + ')">✕</button>' +
      '</div>' +
      '<div style="font-size:11.5px;color:var(--text-muted);padding:2px 0 8px;text-align:right;">Satır Toplam: <strong>' + rowTotal + '</strong>' + warnLine + '</div>';
  }).join('');
}

function buildInstallmentRows(total, count) {
  if (count === 1) {
    var paid0 = installmentStatuses['0'] === true;
    return '<div class="installment-row' + (paid0 ? ' paid' : '') + '">' +
      '<span class="inst-num">1.</span>' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">Peşin — 5% indirim uygulandı</div></div>' +
      '<span style="font-weight:700;">' + fmtMoney(Math.round(total * 0.95)) + '</span>' +
      '<button class="inst-toggle' + (paid0 ? ' paid' : '') + '" onclick="toggleInst(\'0\',' + total + ',1)">' + (paid0 ? '✅ Ödendi' : '⏳ Bekliyor') + '</button>' +
      '</div>';
  }
  var installment = Math.round(total / count);
  var base = new Date('2026-03-10');
  var rows = '';
  for (var i = 0; i < count; i++) {
    var d = new Date(base.getFullYear(), base.getMonth() + i, base.getDate());
    var ds = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    var key = String(i);
    var isPaid = installmentStatuses[key] !== undefined ? installmentStatuses[key] : (i === 0);
    rows += '<div class="installment-row' + (isPaid ? ' paid' : '') + '">' +
      '<span class="inst-num">' + (i + 1) + '.</span>' +
      '<div style="flex:1;"><div style="font-size:13px;font-weight:600;">' + (i + 1) + '. Taksit</div><div style="font-size:11.5px;color:var(--text-muted);">' + ds + '</div></div>' +
      '<span style="font-weight:700;">' + fmtMoney(installment) + '</span>' +
      '<button class="inst-toggle' + (isPaid ? ' paid' : '') + '" onclick="toggleInst(\'' + key + '\',' + total + ',' + count + ')">' + (isPaid ? '✅ Ödendi' : '⏳ Bekliyor') + '</button>' +
      '</div>';
  }
  return rows;
}

function toggleInst(key, total, count) {
  var current = installmentStatuses[key] !== undefined ? installmentStatuses[key] : (key === '0');
  installmentStatuses[key] = !current;
  document.getElementById('installmentPlan').innerHTML = buildInstallmentRows(total, count);
  var n = parseInt(key) + 1;
  showToast(installmentStatuses[key] ? '✅ ' + n + '. taksit ödendi olarak işaretlendi' : '↩️ ' + n + '. taksit geri alındı', installmentStatuses[key] ? 'success' : '');
}

function updateInstPlan(total) {
  var count = parseInt(document.getElementById('installCount').value);
  installmentStatuses = {};
  document.getElementById('installmentPlan').innerHTML = buildInstallmentRows(total, count);
}

function sendPayWA(name, total) {
  showToast('📲 Ödeme hatırlatması gönderildi: ' + name + ' — ' + fmtMoney(total), 'success');
}

function updateRow(i, field, val) {
  if (field === 'code') {
    var t = DB.treatments.find(function (t) { return t.code === val; });
    if (t) { planRows[i].code = t.code; planRows[i].name = t.name; planRows[i].price = t.price; }
  } else if (field === 'qty') {
    planRows[i].qty = parseInt(val) || 1;
  } else if (field === 'discount') {
    planRows[i].discount = Math.min(30, parseFloat(val) || 0);
  } else if (field === 'tooth') {
    planRows[i].tooth = val;
  }
  renderTreatments();
}
function removeRow(i) { planRows.splice(i, 1); renderTreatments(); }
function addTreatmentRow() {
  planRows.push({ code: 'DOL-01', name: 'Kompozit Dolgu', qty: 1, price: 800, discount: 0, tooth: '' });
  renderTreatments();
}
function changePatient(id) {
  selectedPatientId = parseInt(id);
  installmentStatuses = {};
  renderTreatments();
}
function printTreatmentPlan() {
  var patient = DB.patients.find(function (p) { return p.id === selectedPatientId; });
  var total = planRows.reduce(function (s, r) { return s + r.qty * r.price * (1 - r.discount / 100); }, 0);
  var rows = planRows.map(function (r) {
    return '<tr><td style="padding:10px;border-bottom:1px solid #eee">' + (r.tooth ? '#' + r.tooth : '—') + '</td>' +
      '<td style="padding:10px;border-bottom:1px solid #eee">' + r.name + '</td>' +
      '<td style="padding:10px;text-align:center;border-bottom:1px solid #eee">' + r.qty + '</td>' +
      '<td style="padding:10px;text-align:right;border-bottom:1px solid #eee;font-weight:700">₺' + fmt(Math.round(r.qty * r.price * (1 - r.discount / 100))) + '</td></tr>';
  }).join('');
  document.getElementById('printArea').innerHTML =
    '<div style="font-family:Inter,sans-serif;padding:40px;max-width:700px;margin:0 auto;">' +
    '<h1 style="color:#2E7D32;font-size:24px;text-align:center;">🦷 Dr. Kaya Kliniği</h1>' +
    '<p style="text-align:center;color:#666;font-size:13px;">Tedavi Teklifi</p><hr style="border:1px solid #E8F5E9;margin:16px 0;"/>' +
    '<h2 style="font-size:16px;">Hasta: ' + (patient ? patient.name : '—') + ' – #' + (patient ? patient.id : '—') + '</h2>' +
    '<p style="font-size:13px;color:#666;">Plan Tarihi: 10 Mart 2026 | Hazırlayan: Dr. Kaya</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:20px;">' +
    '<thead><tr style="background:#E8F5E9;"><th style="padding:10px;text-align:left">Diş</th><th style="padding:10px;text-align:left">Tedavi</th><th style="padding:10px;text-align:center">Adet</th><th style="padding:10px;text-align:right">Toplam</th></tr></thead>' +
    '<tbody>' + rows + '</tbody>' +
    '<tfoot><tr><td colspan="3" style="padding:14px 10px;font-weight:700;font-size:16px">TOPLAM</td><td style="padding:14px 10px;font-weight:800;font-size:18px;color:#2E7D32;text-align:right">₺' + fmt(Math.round(total)) + '</td></tr></tfoot>' +
    '</table></div>';
  window.print();
}
