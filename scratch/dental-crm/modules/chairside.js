// ============================================================
// CHAIRSIDE VIEW (DOKTOR PANELİ)
// ============================================================

function renderChairside() {
    const section = document.getElementById('section-chairside');
    if (!section) return;

    // Apply dark mode theme class to body specifically for this section
    document.body.classList.add('chairside-dark-mode');

    // Remove it when navigating away
    const originalNavigate = navigate;
    navigate = function(targetSection) {
        if (targetSection !== 'chairside') {
            document.body.classList.remove('chairside-dark-mode');
        }
        originalNavigate(targetSection);
    };

    // Mock data for the next 3 patients
    const nextPatients = [
        { time: '14:00', name: 'Ayşe Demir', id: '#1004', procedure: 'Kanal Tedavisi (2. Seans)', tooth: '18', duration: '45 dk', alerts: ['Alerji: Penisilin'] },
        { time: '15:00', name: 'Mehmet Kaya', id: '#1002', procedure: 'İmplant Kontrolü', tooth: '36', duration: '15 dk', alerts: ['Sistemik: Hipertansiyon'] },
        { time: '15:30', name: 'Fatma Çelik', id: '#1007', procedure: 'Kompozit Dolgu', tooth: '11, 21', duration: '60 dk', alerts: ['Fobi: Dental Anksiyete'] }
    ];

    // Build Odontogram HTML (Upper & Lower jaws)
    let odontogramHTML = '<div class="odonto-grid">';
    
    // Upper right (11-18) & Upper left (21-28)
    const upperTeeth = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
    const lowerTeeth = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

    const createTooth = (num, statusClass = '') => `
        <div class="chairside-tooth ${statusClass}" onclick="openChairsideQuickTreatment('${num}')">
            <span class="tooth-num">${num}</span>
            <div class="tooth-graphic">
                <div class="tooth-top"></div>
                <div class="tooth-bottom"></div>
                ${['crown', 'implant'].includes(statusClass) ? '<div class="tooth-special-marker"></div>' : ''}
            </div>
        </div>
    `;

    // Start with all teeth empty/clean state except the current target
    const getStatus = (num) => {
        if (num == 18) return 'treatment-target'; // Current goal
        return '';
    };

    odontogramHTML += '<div class="jaw-row upper-jaw">';
    upperTeeth.forEach(num => odontogramHTML += createTooth(num, getStatus(num)));
    odontogramHTML += '</div>';

    odontogramHTML += '<div class="jaw-row lower-jaw">';
    lowerTeeth.forEach(num => odontogramHTML += createTooth(num, getStatus(num)));
    odontogramHTML += '</div></div>';


    section.innerHTML = `
        <div class="chairside-container">
            <!-- Sidebar / Top: Upcoming Patients -->
            <div class="chairside-patients-bar">
                <h3 class="cs-section-title">Sıradaki Hastalar</h3>
                <div class="cs-patient-list">
                    ${nextPatients.map((p, index) => `
                        <div class="cs-patient-card ${index === 0 ? 'active' : ''}">
                            <div class="cs-patient-time">${p.time}</div>
                            <div class="cs-patient-info">
                                <div class="cs-patient-name">${p.name} <span class="cs-patient-id">${p.id}</span></div>
                                <div class="cs-patient-proc">${p.procedure} (Diş: ${p.tooth}) - ${p.duration}</div>
                                ${p.alerts.map(alert => `<div class="cs-alert-badge">⚠️ ${alert}</div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="chairside-main-content">
                <!-- Patient At a Glance Header -->
                <div class="cs-at-a-glance">
                    <div class="cs-glance-left">
                        <h2>Ayşe Demir</h2>
                        <div class="cs-glance-meta">Yaş: 34 | Son Ziyaret: 12 Gün Önce</div>
                    </div>
                    <div class="cs-glance-center">
                        <div class="cs-target-label">Bugünkü Hedef</div>
                        <div class="cs-target-text">Diş 18 - Kanal Tedavisi 2. Seans</div>
                    </div>
                    <div class="cs-glance-right">
                        <button class="btn-chairside-primary" onclick="showToast('Asistan Çağrıldı!', 'success')">🛎️ Asistan Çağır</button>
                    </div>
                </div>

                <div class="cs-grid">
                    <!-- Odontogram Panel -->
                    <div class="cs-panel cs-odontogram-panel">
                        <div class="cs-panel-header">
                            <h3>Klinik Odontogram</h3>
                            <div class="cs-legend">
                                <span class="legend-item"><span class="legend-dot treatment-target"></span> Seçili Hedef</span>
                                <span class="legend-item"><span class="legend-dot filled"></span> Dolgu</span>
                                <span class="legend-item"><span class="legend-dot implant"></span> İmplant</span>
                            </div>
                        </div>
                        <div class="cs-panel-body">
                            ${odontogramHTML}
                        </div>
                        <div class="cs-panel-footer">
                            <p class="form-hint" style="background: rgba(255,255,255,0.05); color: #aaa; border:none; margin:0;">
                                Hızlı işlem eklemek için diş numarasına tıklayın. 
                            </p>
                        </div>
                    </div>

                    <!-- Right Column: Timeline & Media -->
                    <div class="cs-right-col">
                        <!-- Clinical Notes & Timeline -->
                        <div class="cs-panel cs-timeline-panel">
                            <div class="cs-panel-header">
                                <h3>Geçmiş ve Notlar</h3>
                            </div>
                            <div class="cs-panel-body">
                                <div class="timeline cs-timeline">
                                    <div class="timeline-item">
                                        <div class="timeline-date">12 Gün Önce</div>
                                        <div class="timeline-content">18 Nolu Diş Kanal Td. 1. Seans</div>
                                        <div class="timeline-detail">Kök kanalları genişletildi, kalsiyum hidroksit patı konuldu.</div>
                                    </div>
                                    <div class="timeline-item">
                                        <div class="timeline-date">3 Ay Önce</div>
                                        <div class="timeline-content">Genel Muayene & Panoramik Rönt.</div>
                                        <div class="timeline-detail">20'lik diş çekimi tavsiye edildi. 18 numarada derin çürük.</div>
                                    </div>
                                    <div class="timeline-item">
                                        <div class="timeline-date">1 Yıl Önce</div>
                                        <div class="timeline-content">Detartraj & Polisaj</div>
                                        <div class="timeline-detail">Diş taşı temizliği yapıldı.</div>
                                    </div>
                                </div>
                                <div class="cs-secure-note" style="margin-top: 20px;">
                                    <h4 style="font-size: 11px; text-transform:uppercase; color:#888; margin-bottom: 8px;">🔒 Gizli Klinik Not (Sadece Doktor)</h4>
                                    <textarea class="cs-textarea" rows="2" placeholder="Örn: Hasta lokal anesteziye dirençli, ek doz gerekebilir..."></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Media Gallery -->
                        <div class="cs-panel cs-media-panel">
                            <div class="cs-panel-header">
                                <h3>Radyoloji & Medya (Before/After)</h3>
                            </div>
                            <div class="cs-panel-body cs-media-grid">
                                <div class="cs-media-item" onclick="openMediaGallery('https://images.unsplash.com/photo-1606265752439-1ebeb127ffdb?auto=format&fit=crop&q=80&w=800&h=500')">
                                    <div class="cs-media-overlay">Panoramik 🎬</div>
                                    <img src="https://images.unsplash.com/photo-1606265752439-1ebeb127ffdb?auto=format&fit=crop&q=80&w=300" alt="Panoramik">
                                </div>
                                <div class="cs-media-item" onclick="openMediaGallery('https://images.unsplash.com/photo-1598256989467-5509783f91de?auto=format&fit=crop&q=80&w=800&h=500')">
                                    <div class="cs-media-overlay">Periapikal 🎬</div>
                                    <img src="https://images.unsplash.com/photo-1598256989467-5509783f91de?auto=format&fit=crop&q=80&w=300" alt="Periapikal">
                                </div>
                                <div class="cs-media-item" onclick="openMediaGallery('https://images.unsplash.com/photo-1598256989679-b13c1c4f5298?auto=format&fit=crop&q=80&w=800&h=500')">
                                    <div class="cs-media-overlay">İntraoral (Öncesi) 🎬</div>
                                    <img src="https://images.unsplash.com/photo-1598256989679-b13c1c4f5298?auto=format&fit=crop&q=80&w=300" alt="İntraoral">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Chairside Modal Logic
function openChairsideQuickTreatment(toothNumber) {
    const el = document.getElementById('quickTreatmentTargetTooth');
    if (el) el.textContent = toothNumber;
    
    // Animate/open the radial menu or modal
    document.getElementById('modalQuickTreatment').classList.add('open');
}

function saveQuickTreatment() {
    const toothNum = document.getElementById('quickTreatmentTargetTooth').textContent;
    const typeSelect = document.getElementById('quickTreatmentType');
    const type = typeSelect.selectedOptions[0].text;
    const typeValue = typeSelect.value;
    const cost = document.getElementById('quickTreatmentCost').value;
    
    // Find the tooth graphic and add the class based on treatment type
    const toothElements = document.querySelectorAll('.chairside-tooth');
    toothElements.forEach(el => {
        const numSpan = el.querySelector('.tooth-num');
        if (numSpan && numSpan.textContent === toothNum) {
            // Remove previous classes
            el.classList.remove('filled', 'implant', 'crown');
            
            // Add new class based on selection
            if (typeValue.includes('dolgu') || typeValue.includes('kanal')) {
                el.classList.add('filled');
            } else if (typeValue.includes('implant')) {
                el.classList.add('implant');
                if(!el.querySelector('.tooth-special-marker')) {
                  el.querySelector('.tooth-graphic').innerHTML += '<div class="tooth-special-marker"></div>';
                }
            } else if (typeValue.includes('kron')) {
                el.classList.add('crown');
                if(!el.querySelector('.tooth-special-marker')) {
                  el.querySelector('.tooth-graphic').innerHTML += '<div class="tooth-special-marker"></div>';
                }
            }
        }
    });

    closeModal('modalQuickTreatment');
    showToast(`✅ Diş ${toothNum}: ${type} planlandı. Stok ayrıldı.`, 'success');
}

function openMediaGallery(imgUrl) {
    const imgEl = document.getElementById('mediaGalleryImage');
    if (imgEl) imgEl.src = imgUrl;
    document.getElementById('modalMediaGallery').classList.add('open');
}
