// ========================================
// Early Settlement Discount Tracker Module
// ========================================

import * as Store from '../store.js';

export function render(data) {
    const loan = data.profile.loanTotal;
    const campaigns = data.settlement.campaigns;

    let campaignCards = campaigns.map((c, i) => {
        const savings = loan * (c.discount / 100);
        const afterDiscount = loan - savings;
        const daysLeft = Math.max(0, Math.ceil((new Date(c.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
        const urgent = daysLeft < 60;

        return `
    <div class="card" style="margin-bottom:0;">
      <div class="card-header">
        <h3>${c.active ? '🟢' : '⚪'} ${c.name}</h3>
        <span class="status-badge ${urgent ? 'status-critical' : 'status-safe'}">${daysLeft} days left</span>
      </div>
      <div class="stats-grid" style="margin-bottom:12px;">
        <div class="stat-card gold" style="padding:14px;">
          <div class="stat-label">Discount</div>
          <div class="stat-value" style="font-size:1.3rem;">${c.discount}%</div>
        </div>
        <div class="stat-card green" style="padding:14px;">
          <div class="stat-label">You Save</div>
          <div class="stat-value" style="font-size:1.3rem;">RM ${savings.toLocaleString()}</div>
        </div>
        <div class="stat-card blue" style="padding:14px;">
          <div class="stat-label">Pay Only</div>
          <div class="stat-value" style="font-size:1.3rem;">RM ${afterDiscount.toLocaleString()}</div>
        </div>
      </div>
      <div class="text-muted" style="font-size:0.82rem;">
        📅 Deadline: ${new Date(c.deadline).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>`;
    }).join('');

    // Saving target calculation
    const monthlyTarget = loan * 0.1 / 24; // 10% in 2 years
    const dailySave = monthlyTarget / 30;

    const el = document.getElementById('page-settlement');
    el.innerHTML = `
    <div class="page-header">
      <h2>🎯 Early Settlement Discount Tracker</h2>
      <p>Track PTPTN discount campaigns & maximize your savings</p>
    </div>

    <div class="alert-box success">
      <span class="alert-icon">💡</span>
      <div class="alert-content">
        <h4>AI Saving Strategy</h4>
        <p>To take advantage of a 15% discount, you would save <strong>RM${(loan * 0.15).toLocaleString()}</strong>. 
        Start saving <strong>RM${dailySave.toFixed(2)}/day</strong> now to build a settlement fund!</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:20px;">
      ${campaignCards}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>📊 Settlement Savings Comparison</h3>
        </div>
        <div class="chart-container">
          <canvas id="settlement-chart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🎯 Your Saving Target</h3>
        </div>
        <div style="text-align:center;padding:20px 0;">
          <div class="text-muted" style="font-size:0.82rem;">To settle 10% of loan in 2 years</div>
          <div style="font-family:var(--font-display);font-size:2.5rem;font-weight:800;color:var(--primary);margin:12px 0;">
            RM ${dailySave.toFixed(2)}
          </div>
          <div class="text-muted" style="font-size:0.82rem;">per day saving needed</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div class="text-muted" style="font-size:0.72rem;">Monthly</div>
            <div style="font-weight:700;">RM ${monthlyTarget.toFixed(2)}</div>
          </div>
          <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div class="text-muted" style="font-size:0.72rem;">Yearly</div>
            <div style="font-weight:700;">RM ${(monthlyTarget * 12).toFixed(2)}</div>
          </div>
          <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div class="text-muted" style="font-size:0.72rem;">2-Year Total</div>
            <div style="font-weight:700;">RM ${(monthlyTarget * 24).toFixed(2)}</div>
          </div>
          <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div class="text-muted" style="font-size:0.72rem;">% of Loan</div>
            <div style="font-weight:700;">10%</div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Chart
    const ctx = document.getElementById('settlement-chart');
    if (ctx) {
        const discounts = [0, 5, 10, 15, 20];
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: discounts.map(d => `${d}% discount`),
                datasets: [{
                    label: 'Amount to Pay (RM)',
                    data: discounts.map(d => loan * (1 - d / 100)),
                    backgroundColor: discounts.map((_, i) => `rgba(34,197,94,${0.3 + i * 0.15})`),
                    borderColor: '#22c55e',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.5
                }, {
                    label: 'You Save (RM)',
                    data: discounts.map(d => loan * d / 100),
                    backgroundColor: discounts.map((_, i) => `rgba(255,215,0,${0.3 + i * 0.15})`),
                    borderColor: '#FFD700',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, stacked: false, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ba4b8' } },
                    x: { grid: { display: false }, ticks: { color: '#9ba4b8' } }
                },
                plugins: { legend: { position: 'bottom', labels: { color: '#9ba4b8' } } }
            }
        });
    }
}

export function bindEvents(data, saveCallback) {
    // No interactive events needed for now
}
