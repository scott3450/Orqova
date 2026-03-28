// ============================================================
// BI DASHBOARD MODULE — Executive KPIs & Charts
// ============================================================

let biCharts = {};

function renderBI() {
  const d = DB.biData;
  const html = `
    <div class="page-header">
      <div class="page-title">📈 İş Zekası – Executive Dashboard</div>
      <div class="page-desc">Klinik karlılığı, hasta değeri ve büyüme stratejisi KPI'ları</div>
    </div>

    <!-- KPI Cards -->
    <div class="grid-4 section-gap">
      <div class="kpi-card green">
        <div class="kpi-icon green">⭐</div>
        <div class="kpi-value">${fmtMoney(d.ltv)}</div>
        <div class="kpi-label">Ortalama LTV</div>
        <div class="card-subtitle" style="margin-top:6px;">Hasta başı ömür boyu gelir</div>
        <div class="kpi-change up">↑ %12 geçen yıla göre</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-icon blue">💸</div>
        <div class="kpi-value">${fmtMoney(d.cac)}</div>
        <div class="kpi-label">CAC – Müşteri Edinim Maliyeti</div>
        <div class="card-subtitle" style="margin-top:6px;">LTV/CAC oranı: ${(d.ltv / d.cac).toFixed(1)}x</div>
        <div class="kpi-change down">↓ %8 optimize edildi</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-icon orange">🦷</div>
        <div class="kpi-value">%${d.chairEfficiency}</div>
        <div class="kpi-label">Koltuk Verimliliği</div>
        <div class="card-subtitle" style="margin-top:6px;">Saatlik üretim kapasitesi</div>
        <div class="kpi-change up">↑ %4 bu ay</div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-icon purple">🔄</div>
        <div class="kpi-value">%${d.conversionRate}</div>
        <div class="kpi-label">Tedaviye Dönüşüm</div>
        <div class="card-subtitle" style="margin-top:6px;">Muayene → Tedavi oranı</div>
        <div class="kpi-change up">↑ %5 bu ay</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid-2 section-gap">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📊 Aylık Ciro Trendi</div>
            <div class="card-subtitle">Son 12 ay (₺)</div>
          </div>
          <span class="badge badge-success">▲ %14 YoY</span>
        </div>
        <canvas id="biRevenueChart" height="220"></canvas>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🥧 Kategori Bazlı Ciro</div>
            <div class="card-subtitle">Tedavi türüne göre dağılım</div>
          </div>
        </div>
        <canvas id="biCategoryChart" height="220"></canvas>
      </div>
    </div>

    <!-- Top Patients + Schema -->
    <div class="grid-2 section-gap">
      <!-- Top 5 by LTV -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🏆 En Değerli Hastalar (LTV)</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Hasta</th><th>LTV</th><th>Son Ziyaret</th></tr></thead>
            <tbody>
              ${[...DB.patients].sort((a, b) => b.ltv - a.ltv).slice(0, 5).map((p, i) => `
                <tr>
                  <td style="font-weight:800;color:${i === 0 ? '#F9A825' : i === 1 ? '#9E9E9E' : i === 2 ? '#8D6E63' : 'var(--text-muted)'};">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.'}
                  </td>
                  <td><div class="avatar-cell"><div class="avatar ${avatarColor(p.id)}">${initials(p.name)}</div><span style="font-weight:600">${p.name}</span></div></td>
                  <td style="font-weight:700;color:var(--primary)">${fmtMoney(p.ltv)}</td>
                  <td style="color:var(--text-muted);font-size:12px">${p.lastVisit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Data Architecture info -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🏗 Veri Mimarisi</div>
          <div class="card-subtitle">Supabase uyumlu şema özeti</div>
        </div>
        <div class="schema-card">
patients        → id, name, phone, dob, blood, status
appointments    → id, patient_id, time, chair, status  
treatments      → id, patient_id, code, price, status
payments        → id, patient_id, amount, method, date
audit_logs      → id, user_id, action, table, row_id
encryption      → AES-256 at rest (Supabase RLS)</div>
        <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
          <span class="badge badge-success">✓ KVKK Uyumlu</span>
          <span class="badge badge-info">✓ Audit Log</span>
          <span class="badge badge-purple">✓ Encryption at Rest</span>
          <span class="badge badge-success">✓ Supabase Ready</span>
        </div>
      </div>
    </div>
  `;
  document.getElementById('section-bi').innerHTML = html;
  setTimeout(() => initBICharts(), 100);
}

function initBICharts() {
  // Destroy old charts
  ['biRevenueChart', 'biCategoryChart'].forEach(id => {
    if (biCharts[id]) { biCharts[id].destroy(); delete biCharts[id]; }
  });

  const d = DB.biData;

  // Revenue Line Chart
  const ctx1 = document.getElementById('biRevenueChart');
  if (ctx1) {
    biCharts.biRevenueChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: d.months,
        datasets: [{
          label: 'Aylık Ciro (₺)',
          data: d.monthly,
          borderColor: '#3DAA6C',
          backgroundColor: 'rgba(61,170,108,0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3DAA6C',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: '#F0F0F0' }, ticks: { callback: v => '₺' + new Intl.NumberFormat('tr-TR').format(v), font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  // Category Bar Chart
  const ctx2 = document.getElementById('biCategoryChart');
  if (ctx2) {
    const cats = Object.entries(d.categoryRevenue);
    biCharts.biCategoryChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: cats.map(c => c[0]),
        datasets: [{
          label: 'Ciro (₺)',
          data: cats.map(c => c[1]),
          backgroundColor: ['#3DAA6C', '#1E88E5', '#FB8C00', '#8E24AA', '#00897B', '#E53935'],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F0F0F0' }, ticks: { callback: v => '₺' + new Intl.NumberFormat('tr-TR').format(v), font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    });
  }
}
