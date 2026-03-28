// ============================================================
// AUTOMATION MODULE — Recall, Lead Scoring, Workflow
// ============================================================

function renderAutomation() {
  const html = `
    <div class="page-header">
      <div class="page-title">⚡ Otomasyon İş Akışları</div>
      <div class="page-desc">Recall sistemi, no-show önleme ve tedavi lead scoring algoritması</div>
    </div>

    <!-- Workflow Status Cards -->
    <div class="grid-3 section-gap">
      <div class="kpi-card green">
        <div class="kpi-icon green">🔔</div>
        <div class="kpi-value">${DB.recallQueue.length}</div>
        <div class="kpi-label">Recall Gereken Hasta</div>
        <div class="kpi-change down">↑ ${DB.recallQueue.filter(r => r.status === 'overdue').length} gecikmiş</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-icon orange">🎯</div>
        <div class="kpi-value">${DB.leads.length}</div>
        <div class="kpi-label">Aktif Lead</div>
        <div class="kpi-change up">₺${fmt(DB.leads.reduce((s, l) => s + l.offerAmount, 0))} potansiyel</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-icon blue">📱</div>
        <div class="kpi-value">12</div>
        <div class="kpi-label">Bugün Giden Mesaj</div>
        <div class="kpi-change up">%84 yanıt oranı</div>
      </div>
    </div>

    <!-- Recall System -->
    <div class="card section-gap">
      <div class="card-header">
        <div>
          <div class="card-title">🔔 Recall Sistemi</div>
          <div class="card-subtitle">İmplant/kanal sonrası 6-ay kontrol tetikleyicileri</div>
        </div>
        <button class="btn-primary" onclick="runRecallAll()">⚡ Tümüne Mesaj Gönder</button>
      </div>

      <div style="background:var(--primary-ultra);border-radius:10px;padding:14px;margin-bottom:16px;font-size:12.5px;color:var(--text-secondary);">
        <strong>📋 Recall Mantığı:</strong> Tedavi tamamlanma tarihinden 6 ay sonra otomatik olarak "Kontrol Randevusu" etkinleşir. 
        WhatsApp ile interaktif onay butonu gönderilir. Yanıt yoksa resepsiyona "Kritik Uyarı" düşer.
      </div>

      ${DB.recallQueue.map(r => `
        <div class="action-card ${r.status === 'overdue' ? 'action-card-nshow' : ''}">
          <div class="ac-body">
            <div class="ac-title">
              <span style="font-weight:700;margin-right:8px;">${r.patient}</span>
              <span class="badge ${r.status === 'overdue' ? 'badge-danger' : r.status === 'today' ? 'badge-warning' : 'badge-info'}" style="font-size:10px;">${r.status === 'overdue' ? '⏰ Gecikmiş' : r.status === 'today' ? '📅 Bugün' : '📪 Yakında'}</span>
            </div>
            <div class="ac-sub">
              ${r.treatment} | Tamamlandı: ${r.completedDate} | Recall: ${r.recallDate} | ${r.phone}
            </div>
          </div>
          <div class="ac-actions">
            <button class="ac-btn ac-btn-primary" onclick="sendRecall('${r.patient}')">📱 WhatsApp Gönder</button>
            <button class="ac-btn ac-btn-secondary" onclick="showToast('${r.patient} için randevu oluşturuldu','success')">📅 Randevu Oluştur</button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Lead Scoring -->
    <div class="card section-gap">
      <div class="card-header">
        <div>
          <div class="card-title">🎯 Yarım Kalan Tedaviler – Lead Scoring</div>
          <div class="card-subtitle">Teklif kabul edilmiş ancak randevu alınmamış hastalar</div>
        </div>
      </div>

      <div style="background:var(--primary-ultra);border-radius:10px;padding:14px;margin-bottom:16px;font-size:12.5px;">
        <strong>📊 Lead Score Algoritması:</strong><br>
        • Teklif tutarı yüksek → +puan | • 15+ gün geçmiş → +puan | • WhatsApp yanıt vermemiş → +puan<br>
        <span style="color:var(--danger);font-weight:600">80+: Kritik (Yönetici ara)</span> · 
        <span style="color:var(--warning);font-weight:600">50-79: Orta (Resepsiyon takip)</span> · 
        <span style="color:var(--success);font-weight:600">0-49: Düşük (Sistem hatırlatır)</span>
      </div>

      ${DB.leads.map(l => `
        <div class="action-card ${l.score >= 80 ? 'action-card-nshow' : ''}">
          <div class="ac-body">
            <div class="ac-title">
              <span style="font-weight:700;margin-right:8px;">${l.patient}</span>
              <span class="badge ${l.score >= 80 ? 'badge-danger' : l.score >= 50 ? 'badge-warning' : 'badge-success'}" style="font-size:10px;">Skor: ${l.score}</span>
            </div>
            <div class="ac-sub">
              ${l.treatment} | Teklif: ${fmtMoney(l.offerAmount)} | ${l.daysSince} gün önce
            </div>
          </div>
          <div class="ac-actions">
            <button class="ac-btn ac-btn-primary" onclick="sendToN8n('send-whatsapp-lead', { patient: '${l.patient}' }); showToast('📱 WhatsApp gönderildi: ${l.patient}','success')">📱 WhatsApp</button>
            <button class="ac-btn ac-btn-secondary" onclick="sendToN8n('assign-lead-task', { patient: '${l.patient}', assignedTo: '${l.assignedTo}' }); showToast('Görev ${l.assignedTo} ekibine atandı','success')">👤 Görev Ata</button>
            <button class="ac-btn ac-btn-secondary" onclick="navigate('treatments'); showToast('Tedavi planı açıldı','')">💊 Tedavi Planı Aç</button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Automation Flow -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">🔄 Otomasyon İş Akışı</div>
        <div class="card-subtitle">No-Show Önleme Protokolü</div>
      </div>
      <div class="flow-diagram" style="gap:0;overflow-x:auto;padding:10px 0;">
        <div class="flow-node highlight">📅 Randevu<br><small>-24 saat</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node ai">📱 WhatsApp<br><small>Onay Butonu</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node" style="border-color:var(--success);background:var(--success-light);">✅ Onaylandı<br><small>Sistem günceller</small></div>
        <div class="flow-arrow" style="color:var(--danger)">✗</div>
        <div class="flow-node" style="border-color:var(--warning);background:var(--warning-light);">⏰ 2 saat sonra<br><small>SMS hatırlatma</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node" style="border-color:var(--danger);background:var(--danger-light);">🚨 Kritik Uyarı<br><small>Resepsiyona görev</small></div>
      </div>
    </div>
  `;
  document.getElementById('section-automation').innerHTML = html;
}

function sendRecall(patient) {
  showToast(`📱 Recall mesajı gönderildi: ${patient}`, 'success');
  // N8N Integration: Recall Message
  sendToN8n('send-whatsapp-recall', { patientName: patient });
}
function runRecallAll() {
  DB.recallQueue.forEach(r => {
    sendToN8n('send-whatsapp-recall', { patientName: r.patient });
  });
  showToast(`📱 ${DB.recallQueue.length} hastaya recall mesajı gönderildi!`, 'success');
}
