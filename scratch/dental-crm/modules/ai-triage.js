// ============================================================
// AI TRIAGE MODULE — Smart Urgency Classifier
// ============================================================

const triageMessages = [
  { id: 1, from: 'Selma Yıldız', source: 'whatsapp', time: '09:15', message: 'Geçen gece dişim çok ağrıdı, sabah şişti, ne yapabilirim acaba?', urgency: 'high', tag: 'Ağrı/Acil', patientExists: false },
  { id: 2, from: 'Murat Şahin', source: 'webform', time: '09:32', message: 'İmplant fiyatlarınız hakkında bilgi almak istiyorum, sizi nereden referans alabilirim?', urgency: 'low', tag: 'Fiyat Soru', patientExists: false },
  { id: 3, from: 'Ayşe Demir (#1004)', source: 'whatsapp', time: '10:05', message: 'Dün yaptırdığım dolgu düştü sanırım, dişimde boşluk var.', urgency: 'high', tag: 'Komplikasyon', patientExists: true },
  { id: 4, from: 'Hasan Kılıç (#1007)', source: 'whatsapp', time: '11:17', message: 'Randevumu iptal etmek istiyorum bu hafta müsait değilim', urgency: 'mid', tag: 'İptal', patientExists: true },
  { id: 5, from: 'Zeynep Er', source: 'webform', time: '11:45', message: 'Çocuğumu getirmek istiyorum dişleri eğri geliyor, ne kadar sürer ortodonti?', urgency: 'low', tag: 'Bilgi/Danışma', patientExists: false },
];

let selectedTriageId = null;

function renderAITriage() {
  const selected = triageMessages.find(m => m.id === selectedTriageId);
  const html = `
    <div class="page-header">
      <div class="page-title">🔍 AI Smart Triage</div>
      <div class="page-desc">WhatsApp ve web formu mesajlarını aciliyete göre sınıflandıran AI katmanı</div>
    </div>

    <!-- Stats -->
    <div class="grid-3 section-gap">
      <div class="kpi-card purple">
        <div class="kpi-icon purple">📨</div>
        <div class="kpi-value">${triageMessages.length}</div>
        <div class="kpi-label">Bekleyen Mesaj</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-icon" style="background:var(--danger-light)">🚨</div>
        <div class="kpi-value" style="color:var(--danger)">${triageMessages.filter(m => m.urgency === 'high').length}</div>
        <div class="kpi-label">Yüksek Aciliyet</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-icon blue">⚡</div>
        <div class="kpi-value">%96</div>
        <div class="kpi-label">AI Doğruluk Oranı</div>
      </div>
    </div>

    <!-- API Flow -->
    <div class="card section-gap">
      <div class="card-header">
        <div class="card-title">🔄 AI Triage Akış Diyagramı</div>
        <div class="card-subtitle">GPT-4o mini tabanlı sınıflandırma pipeline'ı</div>
      </div>
      <div class="flow-diagram" style="overflow-x:auto;gap:0;padding:10px 0;flex-wrap:nowrap;">
        <div class="flow-node highlight">📱 WhatsApp<br><small>Mesaj Gelir</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node highlight">🌐 Web Form<br><small>Mesaj Gelir</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node ai">🧠 GPT-4o mini<br><small>Metin Analizi</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node" style="border-color:var(--danger);background:var(--danger-light)">🚨 Yüksek<br><small>→ Anında Uyarı</small></div>
        <div class="flow-arrow">|</div>
        <div class="flow-node" style="border-color:var(--warning);background:var(--warning-light)">⚠️ Orta<br><small>→ Resepsiyon</small></div>
        <div class="flow-arrow">|</div>
        <div class="flow-node" style="border-color:var(--info);background:var(--info-light)">💬 Düşük<br><small>→ Chatbot Yanıt</small></div>
        <div class="flow-arrow">→</div>
        <div class="flow-node ai">🏷 CRM Etiketleme<br><small>Otomatik</small></div>
      </div>

      <!-- Prompt Sample -->
      <div style="margin-top:14px;">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">Örnek Sistem Promptu (GPT-4o mini):</div>
        <div class="schema-card" style="white-space:pre-wrap;line-height:1.6;">Sen bir diş kliniği asistanısın. Gelen mesajı analiz et:
1. Aciliyet: "yüksek" (ağrı, şişlik, kanama, kırık diş) | "orta" (iptal, şikayet) | "düşük" (fiyat, bilgi)
2. Kategori etiketini belirle
3. CRM'de hastayı otomatik etiketle
JSON formatında yanıt ver: {"urgency":"high","tag":"Ağrı/Acil","action":"Resepsiyon ara"}</div>
      </div>
    </div>

    <!-- Inbox -->
    <div class="grid-2 section-gap">
      <div>
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">📥 Gelen Mesajlar</div>
        <div class="triage-inbox">
          ${triageMessages.map(m => `
            <div class="triage-item ${selectedTriageId === m.id ? 'selected' : ''}" onclick="selectTriage(${m.id})">
              <div class="triage-source">${m.source === 'whatsapp' ? '📱' : '🌐'}</div>
              <div class="triage-body">
                <div class="triage-sender">${m.from} ${m.patientExists ? '<span class="badge badge-success">Kayıtlı</span>' : '<span class="badge badge-neutral">Yeni</span>'}</div>
                <div class="triage-message">"${m.message.substring(0, 60)}..."</div>
                <div class="triage-time">${m.time} · ${m.source === 'whatsapp' ? 'WhatsApp' : 'Web Form'}</div>
              </div>
              <div class="triage-right">
                <span class="badge ${m.urgency === 'high' ? 'badge-danger' : m.urgency === 'mid' ? 'badge-warning' : 'badge-info'}">
                  ${m.urgency === 'high' ? '🚨 Yüksek' : m.urgency === 'mid' ? '⚠️ Orta' : '💬 Düşük'}
                </span>
                <span style="font-size:11px;color:var(--text-muted)">${m.tag}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Detail Panel -->
      <div>
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">📋 Seçili Mesaj Detayı</div>
        ${selected ? `
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">
              <div>
                <div style="font-weight:700;font-size:15px">${selected.from}</div>
                <div style="font-size:12px;color:var(--text-muted)">${selected.time} · ${selected.source === 'whatsapp' ? '📱 WhatsApp' : '🌐 Web Form'}</div>
              </div>
              <span class="badge ${selected.urgency === 'high' ? 'badge-danger' : selected.urgency === 'mid' ? 'badge-warning' : 'badge-info'}" style="font-size:13px;padding:5px 12px;">
                ${selected.urgency === 'high' ? '🚨 YÜKSEK ACİLİYET' : selected.urgency === 'mid' ? '⚠️ ORTA ACİLİYET' : '💬 DÜŞÜK ACİLİYET'}
              </span>
            </div>
            <div style="background:var(--grey-50);border-radius:10px;padding:14px;margin-bottom:14px;font-size:13.5px;line-height:1.7;border-left:3px solid var(--${selected.urgency === 'high' ? 'danger' : selected.urgency === 'mid' ? 'warning' : 'info'})">
              "${selected.message}"
            </div>
            <div class="structured-field">
              <div class="sf-label">🏷 AI Etiketi</div>
              <div class="sf-value"><span class="badge badge-purple">${selected.tag}</span></div>
            </div>
            <div class="structured-field">
              <div class="sf-label">👤 Hasta</div>
              <div class="sf-value">${selected.patientExists ? '✅ Kayıtlı hasta – CRM\'de güncellendi' : '🆕 Yeni potansiyel hasta – Lead olarak eklendi'}</div>
            </div>
            <div class="structured-field">
              <div class="sf-label">⚡ Aksiyon</div>
              <div class="sf-value">${selected.urgency === 'high' ? '🚨 Resepsiyon hemen arasın' : selected.urgency === 'mid' ? '📋 Resepsiyon takibe alsın' : '🤖 Chatbot otomatik yanıtlar'}</div>
            </div>
            <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
              ${selected.urgency === 'high' ? `<button class="btn-primary" onclick="sendToN8n('send-critical-alert', { patient: '${selected.from}', urgency: '${selected.urgency}' }); showToast('📞 Resepsiyona kritik uyarı düşürüldü!','success')">🚨 Kritik Uyarı Gönder</button>` : ''}
              <button class="btn-outline" onclick="sendToN8n('reply-triage-message', { patient: '${selected.from}' }); showToast('📱 Yanıt gönderildi','success')">📱 Yanıtla</button>
              ${!selected.patientExists ? `<button class="btn-outline" onclick="openNewPatientModal(); showToast('Yeni hasta formu açıldı','')">👤 Hasta Kaydı Oluştur</button>` : ''}
              <button class="btn-secondary" onclick="showToast('Mesaj arşivlendi','')">✓ Kapat</button>
            </div>
          </div>
        ` : `
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">🔍</div>
              <div class="empty-state-text">Bir mesaj seçin</div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:8px;">AI analiz sonuçlarını ve önerilen aksiyonları görün</div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
  document.getElementById('section-ai-triage').innerHTML = html;
}

function selectTriage(id) {
  selectedTriageId = id;
  renderAITriage();
}
