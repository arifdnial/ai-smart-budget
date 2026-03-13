// ========================================
// Dashboard Module
// ========================================

import * as Store from '../store.js';
import { getAIAdvice } from '../ai-engine.js';

let charts = {};

export function render(data) {
    const remaining = Store.getRemainingBalance(data);
    const dailyBudget = Store.getDailyBudget(data);
    const safeSpend = Store.getSafeDailySpend(data);
    const monthlyBudget = Store.getMonthlyBudget(data);
    const todaySpent = Store.getTodaySpent(data);
    const totalSpent = Store.getTotalSpent(data);
    const daysLeft = Store.getDaysRemaining(data);
    const risk = Store.getRiskLevel(data);
    const pctUsed = data.profile.amount > 0 ? (totalSpent / data.profile.amount * 100) : 0;

    const riskLabels = { safe: '🟢 Safe', risky: '🟡 Risky', critical: '🔴 Critical' };
    const riskClass = risk;

    // AI Advice
    const advice = getAIAdvice(data);
    let adviceHTML = '';
    for (const a of advice) {
        adviceHTML += `<div class="alert-box ${a.type}"><span class="alert-icon">${a.icon}</span><div class="alert-content"><h4>${a.title}</h4><p>${a.text}</p></div></div>`;
    }

    const el = document.getElementById('page-dashboard');
    el.innerHTML = `
    <div class="page-header">
      <h2>📊 Smart Dashboard</h2>
      <p>AI-powered overview of your semester finances</p>
    </div>

    ${adviceHTML}

    <div class="stats-grid">
      <div class="stat-card gold">
        <div class="stat-label">Semester Balance</div>
        <div class="stat-value">RM ${remaining.toFixed(2)}</div>
        <div class="stat-sub">${pctUsed.toFixed(0)}% used of RM${data.profile.amount.toLocaleString()}</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Safe Daily Spend</div>
        <div class="stat-value">RM ${safeSpend.toFixed(2)}</div>
        <div class="stat-sub">${daysLeft} days remaining</div>
      </div>
      <div class="stat-card ${todaySpent > dailyBudget ? 'red' : 'green'}">
        <div class="stat-label">Today's Spending</div>
        <div class="stat-value">RM ${todaySpent.toFixed(2)}</div>
        <div class="stat-sub">Limit: RM${dailyBudget.toFixed(2)}/day</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Monthly Budget</div>
        <div class="stat-value">RM ${monthlyBudget.toFixed(2)}</div>
        <div class="stat-sub">${data.profile.source.toUpperCase()} allowance</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>📈 Budget Usage</h3>
          <span class="status-badge status-${riskClass}">${riskLabels[risk]}</span>
        </div>
        <div class="chart-container">
          <canvas id="budget-chart"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🗂 Category Breakdown</h3>
        </div>
        <div class="chart-container">
          <canvas id="category-chart"></canvas>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>⚡ Overspending Risk Meter</h3>
        </div>
        <div style="text-align:center;margin-bottom:12px;">
          <span class="status-badge status-${riskClass}" style="font-size:1rem;padding:8px 20px;">${riskLabels[risk]}</span>
        </div>
        <div class="risk-meter">
          <div class="risk-meter-fill ${riskClass}"></div>
        </div>
        <p class="text-muted mt-2" style="font-size:0.82rem;text-align:center;">
          ${risk === 'safe' ? 'Your spending is under control. Keep it up! 💪' :
            risk === 'risky' ? 'Spending is getting tight. Consider reducing non-essentials.' :
                'URGENT: Budget critically low. Activate Emergency Mode!'}
        </p>
      </div>
      <div class="card">
        <div class="card-header">
          <h3>🏦 Loan Repayment Preview</h3>
        </div>
        <div class="stat-value" style="font-size:1.3rem;margin-bottom:8px;">RM ${data.profile.loanTotal.toLocaleString()}</div>
        <p class="text-muted mb-2" style="font-size:0.82rem;">Total ${data.profile.source.toUpperCase()} loan</p>
        <div style="display:flex;gap:10px;">
          <div style="flex:1;padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">RM100/mo</div>
            <div style="font-weight:700;color:var(--critical);">${Store.getRepaymentYears(data.profile.loanTotal, 100).toFixed(0)} years</div>
          </div>
          <div style="flex:1;padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">RM250/mo</div>
            <div style="font-weight:700;color:var(--risky);">${Store.getRepaymentYears(data.profile.loanTotal, 250).toFixed(0)} years</div>
          </div>
          <div style="flex:1;padding:10px;background:var(--bg-glass);border-radius:var(--radius-sm);text-align:center;">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:4px;">RM500/mo</div>
            <div style="font-weight:700;color:var(--safe);">${Store.getRepaymentYears(data.profile.loanTotal, 500).toFixed(0)} years</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📅 Recent Spending History</h3>
      </div>
      ${data.spending.length === 0 ? '<p class="text-muted text-center mt-2">No spending recorded yet. Go to Daily Spending to add entries.</p>' : `
      <table class="spending-table">
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
        <tbody>
          ${data.spending.slice(-10).reverse().map(s => {
                    const cat = data.categories.find(c => c.id === s.category);
                    return `<tr>
              <td>${new Date(s.date).toLocaleDateString('ms-MY')}</td>
              <td><span class="category-tag">${cat ? cat.label : s.category}</span></td>
              <td>${s.description || '-'}</td>
              <td class="amount">-RM${s.amount.toFixed(2)}</td>
            </tr>`;
                }).join('')}
        </tbody>
      </table>`}
    </div>
  `;

    renderCharts(data);
}

function renderCharts(data) {
    // Destroy old charts
    Object.values(charts).forEach(c => c.destroy());
    charts = {};

    const totalSpent = Store.getTotalSpent(data);
    const remaining = Store.getRemainingBalance(data);

    // Budget usage doughnut
    const budgetCtx = document.getElementById('budget-chart');
    if (budgetCtx) {
        charts.budget = new Chart(budgetCtx, {
            type: 'doughnut',
            data: {
                labels: ['Spent', 'Remaining'],
                datasets: [{
                    data: [totalSpent, Math.max(0, remaining)],
                    backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(34,197,94,0.7)'],
                    borderColor: ['rgba(239,68,68,1)', 'rgba(34,197,94,1)'],
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#9ba4b8', padding: 15, font: { family: 'Inter' } } }
                }
            }
        });
    }

    // Category breakdown
    const catCtx = document.getElementById('category-chart');
    if (catCtx) {
        const catSpend = Store.getSpendingByCategory(data);
        const colors = ['#FFD700', '#0052B4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
        charts.category = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: data.categories.map(c => c.label.split(' ').slice(1).join(' ')),
                datasets: [{
                    data: data.categories.map(c => catSpend[c.id] || 0.01),
                    backgroundColor: colors.map(c => c + 'bb'),
                    borderColor: colors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%',
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#9ba4b8', padding: 10, font: { family: 'Inter', size: 11 } } }
                }
            }
        });
    }
}
