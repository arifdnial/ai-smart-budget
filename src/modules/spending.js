// ========================================
// Daily Spending Tracker Module
// ========================================

import * as Store from '../store.js';

export function render(data) {
    const todaySpent = Store.getTodaySpent(data);
    const dailyBudget = Store.getDailyBudget(data);
    const safeSpend = Store.getSafeDailySpend(data);
    const remaining = Store.getRemainingBalance(data);
    const todayLeft = Math.max(0, safeSpend - todaySpent);
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = data.spending.filter(s => s.date === today);

    const over = todaySpent > dailyBudget;
    const projected = Store.getProjectedRunOutDate(data);
    const semEnd = new Date();
    semEnd.setDate(semEnd.getDate() + Store.getDaysRemaining(data));

    let warningHTML = '';
    if (over) {
        const overAmt = todaySpent - dailyBudget;
        const daysEarly = projected && projected < semEnd ? Math.floor((semEnd - projected) / (1000 * 60 * 60 * 24)) : 0;
        warningHTML = `
    <div class="alert-box danger">
      <span class="alert-icon">⚠️</span>
      <div class="alert-content">
        <h4>Exceeded Daily Limit by RM${overAmt.toFixed(2)}!</h4>
        <p>You spent RM${todaySpent.toFixed(2)} today vs your limit of RM${dailyBudget.toFixed(2)}.
        ${daysEarly > 0 ? `If this continues, you will run out of money <strong>${daysEarly} days before semester ends</strong>.` : ''}
        Suggest: reduce mamak spending by 20% this week.</p>
      </div>
    </div>`;
    }

    const catOptions = data.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');

    const el = document.getElementById('page-spending');
    el.innerHTML = `
    <div class="page-header">
      <h2>🛒 Daily Spending Tracker</h2>
      <p>Track every ringgit — AI warns you when overspending</p>
    </div>

    ${warningHTML}

    <div class="stats-grid">
      <div class="stat-card ${over ? 'red' : 'green'}">
        <div class="stat-label">Today's Spending</div>
        <div class="stat-value">RM ${todaySpent.toFixed(2)}</div>
        <div class="stat-sub">${over ? '🔴 Over limit!' : '🟢 Within budget'}</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Can Still Spend</div>
        <div class="stat-value">RM ${todayLeft.toFixed(2)}</div>
        <div class="stat-sub">Today's remaining</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Safe Daily Limit</div>
        <div class="stat-value">RM ${safeSpend.toFixed(2)}</div>
        <div class="stat-sub">Adjusted to balance</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Total Remaining</div>
        <div class="stat-value">RM ${remaining.toFixed(2)}</div>
        <div class="stat-sub">${Store.getDaysRemaining(data)} days left</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>➕ Add Expense</h3>
        </div>
        <div class="form-group">
          <label for="sp-amount">Amount (RM)</label>
          <input type="number" id="sp-amount" placeholder="e.g., 12.50" step="0.01" />
        </div>
        <div class="form-group">
          <label for="sp-category">Category</label>
          <select id="sp-category">${catOptions}</select>
        </div>
        <div class="form-group">
          <label for="sp-desc">Description</label>
          <input type="text" id="sp-desc" placeholder="e.g., Nasi lemak mamak" />
        </div>
        <div class="form-group">
          <label for="sp-date">Date</label>
          <input type="date" id="sp-date" value="${today}" />
        </div>
        <button class="btn btn-primary" id="sp-add" style="width:100%;">
          💸 Add Expense
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>📅 Today's Expenses (${todayEntries.length})</h3>
        </div>
        ${todayEntries.length === 0 ? '<p class="text-muted text-center mt-2">No expenses recorded today. Bagus! 👏</p>' : `
        <table class="spending-table">
          <thead><tr><th>Item</th><th>Category</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            ${todayEntries.map((s, i) => {
        const cat = data.categories.find(c => c.id === s.category);
        return `<tr>
                <td>${s.description || '-'}</td>
                <td><span class="category-tag">${cat ? cat.label : s.category}</span></td>
                <td class="amount">-RM${s.amount.toFixed(2)}</td>
                <td><button class="delete-btn" data-spend-idx="${data.spending.indexOf(s)}">🗑</button></td>
              </tr>`;
    }).join('')}
          </tbody>
        </table>`}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>📊 Spending History (Last 7 Days)</h3>
      </div>
      <div class="chart-container">
        <canvas id="spending-history-chart"></canvas>
      </div>
    </div>

    <div class="card mt-2">
      <div class="card-header">
        <h3>📜 All Spending Records</h3>
        <span class="text-muted">${data.spending.length} entries</span>
      </div>
      ${data.spending.length === 0 ? '<p class="text-muted text-center">No records yet.</p>' : `
      <table class="spending-table">
        <thead><tr><th>Date</th><th>Item</th><th>Category</th><th>Amount</th><th></th></tr></thead>
        <tbody>
          ${data.spending.slice().reverse().slice(0, 30).map(s => {
        const cat = data.categories.find(c => c.id === s.category);
        return `<tr>
              <td>${new Date(s.date).toLocaleDateString('ms-MY')}</td>
              <td>${s.description || '-'}</td>
              <td><span class="category-tag">${cat ? cat.label : s.category}</span></td>
              <td class="amount">-RM${s.amount.toFixed(2)}</td>
              <td><button class="delete-btn" data-spend-idx="${data.spending.indexOf(s)}">🗑</button></td>
            </tr>`;
    }).join('')}
        </tbody>
      </table>`}
    </div>
  `;

    renderSpendingChart(data);
}

function renderSpendingChart(data) {
    const ctx = document.getElementById('spending-history-chart');
    if (!ctx) return;

    const labels = [];
    const values = [];
    const limit = [];
    const daily = Store.getDailyBudget(data);

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric' }));
        const dayTotal = data.spending.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.amount, 0);
        values.push(dayTotal);
        limit.push(daily);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Spent (RM)',
                    data: values,
                    backgroundColor: values.map((v, i) => v > limit[i] ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)'),
                    borderColor: values.map((v, i) => v > limit[i] ? '#ef4444' : '#22c55e'),
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.5
                },
                {
                    label: 'Daily Limit (RM)',
                    data: limit,
                    type: 'line',
                    borderColor: '#FFD700',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ba4b8' } },
                x: { grid: { display: false }, ticks: { color: '#9ba4b8' } }
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9ba4b8', font: { family: 'Inter' } } }
            }
        }
    });
}

export function bindEvents(data, saveCallback) {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'sp-add') {
            const amt = parseFloat(document.getElementById('sp-amount')?.value);
            const cat = document.getElementById('sp-category')?.value;
            const desc = document.getElementById('sp-desc')?.value || '';
            const date = document.getElementById('sp-date')?.value || new Date().toISOString().split('T')[0];

            if (!amt || amt <= 0) return;

            data.spending.push({ amount: amt, category: cat, description: desc, date });
            saveCallback(data);
        }

        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn') || e.target;
            const idx = parseInt(btn.dataset.spendIdx);
            if (!isNaN(idx) && idx >= 0 && idx < data.spending.length) {
                data.spending.splice(idx, 1);
                saveCallback(data);
            }
        }
    });
}
