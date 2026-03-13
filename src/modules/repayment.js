// ========================================
// PTPTN Repayment Simulation Module
// ========================================

import * as Store from '../store.js';

export function render(data) {
    const loan = data.profile.loanTotal;
    const scenarios = [
        { monthly: 100, label: 'Minimum' },
        { monthly: 200, label: 'Standard' },
        { monthly: 300, label: 'Moderate' },
        { monthly: 500, label: 'Aggressive' }
    ];

    const dailySaving3 = 3;
    const yearlyFromSaving = dailySaving3 * 365;

    let scenarioCards = scenarios.map(s => {
        const years = Store.getRepaymentYears(loan, s.monthly);
        const totalPaid = s.monthly * years * 12;
        const color = years > 15 ? 'critical' : years > 8 ? 'risky' : 'safe';
        return `
      <div style="padding:16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);text-align:center;">
        <div class="text-muted" style="font-size:0.75rem;margin-bottom:6px;">${s.label}</div>
        <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--${color});">${years.toFixed(1)}</div>
        <div class="text-muted" style="font-size:0.75rem;">years</div>
        <div style="margin-top:8px;font-size:0.8rem;">RM${s.monthly}/month</div>
        <div class="text-muted" style="font-size:0.72rem;">Total: RM${totalPaid.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
      </div>`;
    }).join('');

    const el = document.getElementById('page-repayment');
    el.innerHTML = `
    <div class="page-header">
      <h2>🏦 PTPTN Repayment Simulation</h2>
      <p>See the future impact of different repayment strategies</p>
    </div>

    <div class="alert-box info">
      <span class="alert-icon">🤖</span>
      <div class="alert-content">
        <h4>AI Insight: Start Saving Now!</h4>
        <p>If you save just <strong>RM${dailySaving3}/day</strong> during your studies, that's <strong>RM${yearlyFromSaving.toLocaleString()}/year</strong>. Over 4 years of study, you could accumulate <strong>RM${(yearlyFromSaving * 4).toLocaleString()}</strong> toward early repayment — potentially saving thousands in the long run!</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card gold">
        <div class="stat-label">Total Loan</div>
        <div class="stat-value">RM ${loan.toLocaleString()}</div>
        <div class="stat-sub">${data.profile.source.toUpperCase()}</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">RM100/month</div>
        <div class="stat-value">${Store.getRepaymentYears(loan, 100).toFixed(1)} yrs</div>
        <div class="stat-sub">Long but manageable</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">RM250/month</div>
        <div class="stat-value">${Store.getRepaymentYears(loan, 250).toFixed(1)} yrs</div>
        <div class="stat-sub">Recommended</div>
      </div>
      <div class="stat-card red">
        <div class="stat-label">Interest Saved</div>
        <div class="stat-value">RM ${Store.getInterestSaved(loan, 100, 500).toFixed(0)}</div>
        <div class="stat-sub">RM500 vs RM100/mo</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>🎛 Custom Simulation</h3>
        </div>
        <div class="form-group">
          <label for="rp-loan">Total Loan Amount (RM)</label>
          <input type="number" id="rp-loan" value="${loan}" />
        </div>
        <div class="slider-group">
          <div class="slider-header">
            <span class="slider-label">Monthly Payment</span>
            <span class="slider-value" id="rp-monthly-val">RM 250</span>
          </div>
          <input type="range" min="50" max="1000" value="250" step="50" id="rp-monthly-slider" />
        </div>
        <div style="margin-top:16px;padding:16px;background:var(--bg-glass);border-radius:var(--radius-md);text-align:center;">
          <div class="text-muted" style="font-size:0.8rem;">Time to Complete</div>
          <div id="rp-result" style="font-family:var(--font-display);font-size:2.2rem;font-weight:800;color:var(--primary);margin:8px 0;">
            ${Store.getRepaymentYears(loan, 250).toFixed(1)} years
          </div>
          <div id="rp-total-paid" class="text-muted" style="font-size:0.82rem;">Total paid: RM${(250 * Store.getRepaymentYears(loan, 250) * 12).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
        </div>
        <button class="btn btn-primary mt-2" id="rp-save" style="width:100%;">💾 Update Loan Amount</button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>📊 Comparison Chart</h3>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${scenarioCards}
        </div>
        <div class="chart-container mt-2">
          <canvas id="repayment-chart"></canvas>
        </div>
      </div>
    </div>
  `;

    // Chart
    const ctx = document.getElementById('repayment-chart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scenarios.map(s => `RM${s.monthly}/mo`),
                datasets: [{
                    label: 'Years to Complete',
                    data: scenarios.map(s => Store.getRepaymentYears(loan, s.monthly)),
                    backgroundColor: ['rgba(239,68,68,0.6)', 'rgba(245,158,11,0.6)', 'rgba(34,197,94,0.6)', 'rgba(139,92,246,0.6)'],
                    borderColor: ['#ef4444', '#f59e0b', '#22c55e', '#8b5cf6'],
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Years', color: '#9ba4b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ba4b8' } },
                    x: { grid: { display: false }, ticks: { color: '#9ba4b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

export function bindEvents(data, saveCallback) {
    document.addEventListener('input', (e) => {
        if (e.target.id === 'rp-monthly-slider') {
            const val = parseInt(e.target.value);
            const loan = parseFloat(document.getElementById('rp-loan')?.value) || data.profile.loanTotal;
            const years = Store.getRepaymentYears(loan, val);
            const totalPaid = val * years * 12;

            const label = document.getElementById('rp-monthly-val');
            const result = document.getElementById('rp-result');
            const totalEl = document.getElementById('rp-total-paid');

            if (label) label.textContent = `RM ${val}`;
            if (result) {
                result.textContent = `${years.toFixed(1)} years`;
                result.style.color = years > 15 ? 'var(--critical)' : years > 8 ? 'var(--risky)' : 'var(--safe)';
            }
            if (totalEl) totalEl.textContent = `Total paid: RM${totalPaid.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'rp-save') {
            const loan = parseFloat(document.getElementById('rp-loan')?.value);
            if (loan && loan > 0) {
                data.profile.loanTotal = loan;
                saveCallback(data);
            }
        }
    });
}
