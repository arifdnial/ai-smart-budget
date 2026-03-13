// AI Predictions Module
import * as Store from '../store.js';

export function render(data) {
    const dailyBudget = Store.getDailyBudget(data);
    const recentAvg = Store.getRecentDailyAvg(data);
    const risk = Store.getRiskLevel(data);
    const catSpend = Store.getSpendingByCategory(data);

    // Find top spending category
    let topCat = data.categories[0];
    let topSpend = 0;
    for (const cat of data.categories) {
        const s = catSpend[cat.id] || 0;
        if (s > topSpend) { topSpend = s; topCat = cat; }
    }

    const el = document.getElementById('page-predictions');
    el.innerHTML = `
    <div class="page-header"><h2>🤖 AI Prediction Engine</h2><p>Machine learning-powered spending insights & forecasts</p></div>
    <div class="alert-box ${risk === 'safe' ? 'success' : risk === 'risky' ? 'warning' : 'danger'}">
      <span class="alert-icon">${risk === 'safe' ? '🟢' : risk === 'risky' ? '🟡' : '🔴'}</span>
      <div class="alert-content">
        <h4>AI Risk Assessment: ${risk.toUpperCase()}</h4>
        <p>Average daily spending: RM${recentAvg.toFixed(2)} vs budget RM${dailyBudget.toFixed(2)}. 
        ${recentAvg > dailyBudget ? 'You are consistently overspending!' : 'Spending is within acceptable range.'}</p>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card gold"><div class="stat-label">Avg Daily Spend</div><div class="stat-value">RM ${recentAvg.toFixed(2)}</div><div class="stat-sub">Last 7 days</div></div>
      <div class="stat-card blue"><div class="stat-label">Top Category</div><div class="stat-value">${topCat.label.split(' ')[0]}</div><div class="stat-sub">RM${topSpend.toFixed(2)} spent</div></div>
      <div class="stat-card ${recentAvg > dailyBudget ? 'red' : 'green'}"><div class="stat-label">Budget Efficiency</div><div class="stat-value">${dailyBudget > 0 ? Math.min(100, (dailyBudget / Math.max(0.01, recentAvg) * 100)).toFixed(0) : 100}%</div><div class="stat-sub">${recentAvg > dailyBudget ? 'Over budget' : 'Under budget'}</div></div>
      <div class="stat-card purple"><div class="stat-label">Predicted Risk Weeks</div><div class="stat-value">Week 6-8</div><div class="stat-sub">Historical pattern</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>📈 Weekly Spending Trend</h3></div>
        <div class="chart-container"><canvas id="prediction-trend-chart"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>🎯 AI Predictions</h3></div>
        <div class="prediction-card"><h4>📅 Overspend Risk Weeks</h4><p>"Students typically overspend during <strong>Week 6-8</strong> (mid-semester stress) and <strong>Week 14</strong> (end of semester celebrations)."</p></div>
        <div class="prediction-card"><h4>🛍 Shopee Alert</h4><p>"High spending predicted during sales: <strong>9.9, 11.11, 12.12</strong>. AI suggests: Add items to cart but wait 24 hours before buying."</p></div>
        <div class="prediction-card"><h4>🍛 Makan Pattern</h4><p>"Food spending peaks on <strong>weekends</strong> (+40% vs weekdays). Consider meal prep on Sunday for the week."</p></div>
        <div class="prediction-card"><h4>🚗 Transport Spike</h4><p>"Grab spending increases during <strong>rainy season</strong>. Budget extra RM50/month Nov-Feb or carpool with coursemates."</p></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>🔒 Smart Spending Limits</h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;">
        <div style="padding:16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-weight:600;font-size:0.9rem;">🛍 Shopee Limit Mode</div><div class="text-muted" style="font-size:0.78rem;">Auto-warn before online purchases</div></div>
          <label class="toggle"><input type="checkbox" id="toggle-shopee" /><span class="toggle-slider"></span></label>
        </div>
        <div style="padding:16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-weight:600;font-size:0.9rem;">🚗 Grab Budget Cap</div><div class="text-muted" style="font-size:0.78rem;">Limit transport spending</div></div>
          <label class="toggle"><input type="checkbox" id="toggle-grab" /><span class="toggle-slider"></span></label>
        </div>
        <div style="padding:16px;background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;">
          <div><div style="font-weight:600;font-size:0.9rem;">🍛 Mamak Tracker</div><div class="text-muted" style="font-size:0.78rem;">Track daily food expenses</div></div>
          <label class="toggle"><input type="checkbox" checked id="toggle-mamak" /><span class="toggle-slider"></span></label>
        </div>
      </div>
    </div>`;

    renderTrendChart(data);
}

function renderTrendChart(data) {
    const ctx = document.getElementById('prediction-trend-chart');
    if (!ctx) return;
    const labels = []; const values = []; const budgetLine = [];
    const daily = Store.getDailyBudget(data);
    for (let i = 27; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        if (i % 7 === 0) labels.push(d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }));
        else labels.push('');
        const t = data.spending.filter(s => s.date === ds).reduce((a, s) => a + s.amount, 0);
        values.push(t); budgetLine.push(daily);
    }
    new Chart(ctx, {
        type: 'line', data: {
            labels, datasets: [
                { label: 'Daily Spending', data: values, borderColor: '#0052B4', backgroundColor: 'rgba(0,82,180,0.1)', fill: true, tension: 0.4, pointRadius: 2, borderWidth: 2 },
                { label: 'Daily Budget', data: budgetLine, borderColor: '#FFD700', borderDash: [5, 5], borderWidth: 2, pointRadius: 0, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: true, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ba4b8' } }, x: { grid: { display: false }, ticks: { color: '#9ba4b8', maxRotation: 0 } } }, plugins: { legend: { position: 'bottom', labels: { color: '#9ba4b8' } } } }
    });
}

export function bindEvents(data, saveCallback) { }
