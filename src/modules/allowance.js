// ========================================
// Allowance Setup Module
// ========================================

import * as Store from '../store.js';

export function render(data) {
    const monthly = Store.getMonthlyBudget(data);
    const daily = Store.getDailyBudget(data);
    const totalDays = data.profile.duration * 30;

    const el = document.getElementById('page-allowance');
    el.innerHTML = `
    <div class="page-header">
      <h2>💰 Semester Allowance Breakdown</h2>
      <p>AI auto-distribution of your ${data.profile.source.toUpperCase()} allowance</p>
    </div>

    <div class="alert-box info">
      <span class="alert-icon">🤖</span>
      <div class="alert-content">
        <h4>AI Recommendation</h4>
        <p>Based on your RM${data.profile.amount.toLocaleString()} allowance over ${data.profile.duration} months, you should not spend more than <strong>RM${daily.toFixed(2)} per day</strong> to survive the full semester.</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card gold">
        <div class="stat-label">Total Allowance</div>
        <div class="stat-value">RM ${data.profile.amount.toLocaleString()}</div>
        <div class="stat-sub">${data.profile.source.toUpperCase()} per semester</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Monthly Budget</div>
        <div class="stat-value">RM ${monthly.toFixed(2)}</div>
        <div class="stat-sub">÷ ${data.profile.duration} months</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Daily Budget</div>
        <div class="stat-value">RM ${daily.toFixed(2)}</div>
        <div class="stat-sub">÷ ${totalDays} days</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Weekly Budget</div>
        <div class="stat-value">RM ${(daily * 7).toFixed(2)}</div>
        <div class="stat-sub">7 days allowance</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>✏️ Edit Allowance Details</h3>
        </div>
        <div class="form-group">
          <label for="aw-source">Allowance Source</label>
          <select id="aw-source">
            <option value="ptptn" ${data.profile.source === 'ptptn' ? 'selected' : ''}>PTPTN</option>
            <option value="mara" ${data.profile.source === 'mara' ? 'selected' : ''}>MARA</option>
            <option value="jpa" ${data.profile.source === 'jpa' ? 'selected' : ''}>JPA</option>
            <option value="other" ${data.profile.source === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="aw-amount">Semester Amount (RM)</label>
          <input type="number" id="aw-amount" value="${data.profile.amount}" />
        </div>
        <div class="form-group">
          <label for="aw-duration">Semester Duration (months)</label>
          <input type="number" id="aw-duration" value="${data.profile.duration}" />
        </div>
        <div class="form-group">
          <label for="aw-housing">Housing Type</label>
          <select id="aw-housing">
            <option value="hostel" ${data.profile.housing === 'hostel' ? 'selected' : ''}>Hostel (Kolej Kediaman)</option>
            <option value="rental" ${data.profile.housing === 'rental' ? 'selected' : ''}>Sewa Luar</option>
          </select>
        </div>
        <button class="btn btn-primary" id="aw-save">💾 Save Changes</button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>📊 Breakdown Visualization</h3>
        </div>
        <div class="chart-container">
          <canvas id="allowance-chart"></canvas>
        </div>
        <div class="mt-2">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.82rem;">
            <div style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);">
              <div class="text-muted">Week 1-4</div>
              <div style="font-weight:700;">RM${monthly.toFixed(2)}</div>
            </div>
            <div style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);">
              <div class="text-muted">Week 5-8</div>
              <div style="font-weight:700;">RM${monthly.toFixed(2)}</div>
            </div>
            <div style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);">
              <div class="text-muted">Week 9-12</div>
              <div style="font-weight:700;">RM${monthly.toFixed(2)}</div>
            </div>
            <div style="padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);">
              <div class="text-muted">Week 13-16</div>
              <div style="font-weight:700;">RM${(data.profile.amount - monthly * 3).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Chart
    const ctx = document.getElementById('allowance-chart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: data.profile.duration }, (_, i) => `Month ${i + 1}`),
                datasets: [{
                    label: 'Monthly Budget (RM)',
                    data: Array.from({ length: data.profile.duration }, () => monthly),
                    backgroundColor: 'rgba(255,215,0,0.5)',
                    borderColor: '#FFD700',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ba4b8', font: { family: 'Inter' } } },
                    x: { grid: { display: false }, ticks: { color: '#9ba4b8', font: { family: 'Inter' } } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

export function bindEvents(data, saveCallback) {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'aw-save') {
            const src = document.getElementById('aw-source');
            const amt = document.getElementById('aw-amount');
            const dur = document.getElementById('aw-duration');
            const hsg = document.getElementById('aw-housing');
            if (src && amt && dur && hsg) {
                data.profile.source = src.value;
                data.profile.amount = parseFloat(amt.value) || 3500;
                data.profile.duration = parseInt(dur.value) || 4;
                data.profile.housing = hsg.value;
                saveCallback(data);
            }
        }
    });
}
