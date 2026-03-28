// ============================================================
// AI CLINICAL NOTES MODULE — LLM-powered structured notes
// ============================================================

const aiNoteSamples = {
  input1: "18'e oklüzal dolgu yapıldı, hasta hafif hassasiyet şikayeti vardı, kanal tutulumu yok görünüyor, 2 hafta sonra kontrol.",
  input2: "36 nolu diş implant yerleştirme başarılı. Kanama minimal. Post-op antibiyotik: amoksisilin 500mg 3x1 5 gün. Ağrı kontrolü için ibuprofen 400mg. 7 günde dikiş kontrolü.",
  input3: "Hasta ortodonti bracketi kırılmış geldi. 22 nolu diş braket yeniden uygulandı. Ark teli ayarlandı. Hasta ağrı yok diyor. 4 hafta sonra kontrol.",
};

const aiNoteOutputs = {
  input1: {
    procedure: "Oklüzal Dolgu – Kompozit",
    tooth: "18",
    doctor: "Dr. Kaya",
    date: "09.03.2026",
    findings: "Diş 18'de oklüzal kavitede kompozit dolgu uygulandı. Post-operatif minimal hassasiyet rapor edildi. Pulpa tutulumu bulgusu tespit edilmedi.",
    instructions: "2 hafta içinde kontrol randevusu alınmalı. Isıya duyarlılık devam ederse kanal tedavisi değerlendirmesi yapılacak.",
    followUp: "2 hafta – Kontrol"
  },
  input2: {
    procedure: "Diş İmplantı Yerleştirme",
    tooth: "36",
    doctor: "Dr. Demir",
    date: "09.03.2026",
    findings: "Diş 36 bölgesine implant başarıyla yerleştirildi. İntraoperatif kanama minimal düzeyde kaldı. Herhangi bir komplikasyon gözlemlenmedi.",
    instructions: "Amoksisilin 500mg kapsül – günde 3 kez, 5 gün. İbuprofen 400mg tablet – gerektiğinde ağrı kontrolü için.",
    followUp: "7 gün – Dikiş kontrolü"
  },
  input3: {
    procedure: "Ortodonti Braket Yenileme",
    tooth: "22",
    doctor: "Dr. Kaya",
    date: "09.03.2026",
    findings: "22 nolu dişte bracket kırığı tespit edildi. Braket yeniden bonding uygulaması ile sabitlendi. Ark teli kuvvetlendirme ayarı yapıldı. Hasta ağrı bildirmedi.",
    instructions: "Sert ve yapışkan gıdalardan kaçınılması önerildi.",
    followUp: "4 hafta – Ortodonti kontrolü"
  }
};

let aiNoteProcessing = false;
let selectedSample = 'input1';
let aiOutput = null;

function renderAINotes() {
  const html = `
    <div class="page-header">
      <div class="page-title">🤖 Klinik Not Asistanı</div>
      <div class="page-desc">Sesli not veya kısa metni standart klinik epikrize dönüştüren LLM asistanı</div>
    </div>

    <div class="grid-2 section-gap">
      <!-- Input Panel -->
      <div>
        <div class="card section-gap">
          <div class="card-header">
            <div class="card-title">📝 Doktor Notu Girişi</div>
            <div class="card-subtitle">Sesli not veya serbest metin</div>
          </div>

          <!-- Sample Buttons -->
          <div style="margin-bottom:10px;">
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px;">Örnek Senaryolar:</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="badge ${selectedSample === 'input1' ? 'badge-info' : 'badge-neutral'}" onclick="loadSample('input1')" style="cursor:pointer;">🦷 Dolgu</button>
              <button class="badge ${selectedSample === 'input2' ? 'badge-info' : 'badge-neutral'}" onclick="loadSample('input2')" style="cursor:pointer;">🔩 İmplant</button>
              <button class="badge ${selectedSample === 'input3' ? 'badge-info' : 'badge-neutral'}" onclick="loadSample('input3')" style="cursor:pointer;">😁 Ortodonti</button>
            </div>
          </div>

          <div class="ai-input-area">
            <textarea id="aiNoteInput" rows="5" placeholder="Doktor notunu buraya yazın veya dikte edin...
Örn: '36 nolu dişe implant yapıldı, hasta toleransı iyiydi...'">
${aiNoteSamples[selectedSample]}</textarea>
            <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
              <button class="btn-primary" onclick="processAINote()" id="aiProcessBtn" style="flex:1">
                🧠 AI ile İşle
              </button>
              <button class="btn-icon" title="Sesi dinle (simüle)" onclick="showToast('🎤 Ses kaydı başlatıldı...','')">🎤</button>
            </div>
          </div>
        </div>

        <!-- LLM Architecture Info -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">⚙️ Teknik Altyapı</div>
          </div>
          <div class="flow-diagram" style="flex-direction:column;gap:6px;">
            ${[
      { icon: '🎤', label: 'Sesli/Metin Girdi', cl: 'highlight' },
      { icon: '🔤', label: 'Whisper API (Transkripsiyon)', cl: 'ai' },
      { icon: '🧠', label: 'GPT-4o mini (Yapılandırma)', cl: 'ai' },
      { icon: '🦷', label: 'Otomatik Odontogram Güncelleme', cl: 'highlight' },
      { icon: '📄', label: 'Epikriz / Hasta Kartına Kayıt', cl: '' }
    ].map((n, i, arr) => `
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div class="flow-node ${n.cl}" style="width:100%;text-align:center;">${n.icon} ${n.label}</div>
                ${i < arr.length - 1 ? '<div style="font-size:18px;color:var(--text-muted)">↓</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Output Panel -->
      <div>
        <div class="card" id="aiOutputPanel">
          ${aiOutput ? renderNoteOutput(aiOutput) : renderNoteEmpty()}
        </div>
      </div>
    </div>
  `;
  document.getElementById('section-ai-notes').innerHTML = html;
}

function renderNoteEmpty() {
  return `
    <div class="card-header">
      <div class="card-title">📋 Yapılandırılmış Epikriz</div>
    </div>
    <div class="empty-state" style="padding:60px 24px;">
      <div class="empty-state-icon">🤖</div>
      <div class="empty-state-text">Notunuzu girin ve "AI ile İşle" butonuna tıklayın</div>
      <div style="font-size:13px;color:var(--text-muted);margin-top:8px;">AI, tıbbi terminolojiyi anlayarak standart epikriz formatına dönüştürür</div>
    </div>`;
}

function renderNoteOutput(o) {
  return `
    <div class="card-header">
      <div class="card-title">📋 Yapılandırılmış Epikriz</div>
      <span class="badge badge-success">✓ AI Doğrulandı</span>
    </div>
    <div class="ai-output-card" style="border:none;padding:0;">
      ${[
      ['🏥 Prosedür', o.procedure],
      ['🦷 Diş', o.tooth + ' numaralı diş'],
      ['👨‍⚕️ Hekim', o.doctor],
      ['📅 Tarih', o.date],
      ['🔍 Klinik Bulgular', o.findings],
      ['💊 Tedavi Talimatları', o.instructions],
      ['📅 Takip', o.followUp]
    ].map(([label, val]) => `
        <div class="structured-field">
          <div class="sf-label">${label}</div>
          <div class="sf-value">${val}</div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top:14px;display:flex;gap:8px;">
      <button class="btn-primary" onclick="showToast('📋 Not hasta kartına işlendi!','success')">✓ Hasta Kartına Kaydet</button>
      <button class="btn-outline" onclick="showToast('Odontogram güncellendi','success')">🦷 Odontograma İşle</button>
      <button class="btn-secondary" onclick="showToast('Not kopyalandı','')">📋 Kopyala</button>
    </div>`;
}

function loadSample(key) {
  selectedSample = key;
  aiOutput = null;
  renderAINotes();
}

function processAINote() {
  const btn = document.getElementById('aiProcessBtn');
  if (!btn) return;
  btn.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div> İşleniyor...`;
  btn.disabled = true;

  const noteText = document.getElementById('aiNoteInput').value;
  // N8N Integration: AI Notes processing webhook
  sendToN8n('process-ai-note', { text: noteText });

  setTimeout(() => {
    aiOutput = aiNoteOutputs[selectedSample];
    document.getElementById('aiOutputPanel').innerHTML = renderNoteOutput(aiOutput);
    if (btn) { btn.innerHTML = '🧠 AI ile İşle'; btn.disabled = false; }
    showToast('✅ Epikriz başarıyla oluşturuldu!', 'success');
  }, 2200);
}
