// ========================================
// Smart Category Distribution Module
// ========================================

import * as Store from '../store.js';

export function render(data) {
    const catSpend = Store.getSpendingByCategory(data);

    let catHTML = '';
    for (const cat of data.categories) {
        const allocated = (cat.pct / 100) * data.profile.amount;
        const spent = catSpend[cat.id] || 0;
        const pctUsed = allocated > 0 ? (spent / allocated * 100) : 0;
        const status = pctUsed > 100 ? 'critical' : pctUsed > 75 ? 'risky' : 'safe';

        catHTML += `
      <div class="card" style="margin-bottom:0;">
        <div class="card-header" style="margin-bottom:10px;">
          <h3>${cat.label}</h3>
          <span class="status-badge status-${status}">${pctUsed.toFixed(0)}% used</span>
        </div>
        <div class="slider-group">
          <div class="slider-header">
            <span class="slider-label">Allocation</span>
            <span class="slider-value" id="cat-pct-val-${cat.id}">${cat.pct}% — RM${allocated.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="60" value="${cat.pct}" id="cat-slider-${cat.id}" data-cat="${cat.id}" class="cat-slider" />
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.min(100, pctUsed)}%;background:${status === 'safe' ? 'linear-gradient(90deg,var(--safe),#4ade80)' : status === 'risky' ? 'linear-gradient(90deg,var(--risky),#fbbf24)' : 'linear-gradient(90deg,var(--critical),#f87171)'}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-top:4px;">
          <span class="text-muted">Spent: RM${spent.toFixed(2)}</span>
          <span class="text-muted">Budget: RM${allocated.toFixed(2)}</span>
        </div>
      </div>
    `;
    }

    const totalPct = data.categories.reduce((s, c) => s + c.pct, 0);

    const el = document.getElementById('page-categories');
    el.innerHTML = `
    <div class="page-header">
      <h2>📋 Smart Category Distribution</h2>
      <p>AI-suggested spending allocation — Malaysian student style 🇲🇾</p>
    </div>

    ${data.profile.housing === 'hostel' ? `
    <div class="alert-box info">
      <span class="alert-icon">🏠</span>
      <div class="alert-content">
        <h4>Hostel Student Detected</h4>
        <p>Since you stay in kolej kediaman, rental allocation can be redirected. AI suggests: increase Makan to 50% and reduce Rental to 15% (for utilities/laundry).</p>
      </div>
    </div>` : `
    <div class="alert-box warning">
      <span class="alert-icon">🏠</span>
      <div class="alert-content">
        <h4>Sewa Luar Student</h4>
        <p>Rental is your biggest expense. AI suggests keeping at least 25-30% for rent to avoid issues. Consider finding housemates to split costs.</p>
      </div>
    </div>`}

    <div class="card mb-2">
      <div class="card-header">
        <h3>⚙️ Total Allocation</h3>
        <span class="status-badge ${totalPct === 100 ? 'status-safe' : 'status-risky'}" id="total-pct-badge">${totalPct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${Math.min(100, totalPct)}%;${totalPct > 100 ? 'background:linear-gradient(90deg,var(--critical),#f87171)' : ''}" id="total-pct-bar"></div>
      </div>
      <p class="text-muted mt-1" style="font-size:0.8rem;" id="total-pct-msg">
        ${totalPct === 100 ? '✅ Perfect allocation!' : totalPct < 100 ? `⚠️ ${100 - totalPct}% unallocated — consider distributing.` : `🔴 Over-allocated by ${totalPct - 100}%! Reduce some categories.`}
      </p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
      ${catHTML}
    </div>

    <div class="mt-2">
      <button class="btn btn-secondary" id="cat-reset">🔄 Reset to AI Defaults</button>
      <button class="btn btn-primary" id="cat-save" style="margin-left:8px;">💾 Save Allocation</button>
    </div>
  `;
}

export function bindEvents(data, saveCallback) {
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('cat-slider')) {
            const catId = e.target.dataset.cat;
            const val = parseInt(e.target.value);
            const cat = data.categories.find(c => c.id === catId);
            if (cat) {
                cat.pct = val;
                const allocated = (val / 100) * data.profile.amount;
                const label = document.getElementById(`cat-pct-val-${catId}`);
                if (label) label.textContent = `${val}% — RM${allocated.toFixed(2)}`;

                // Update total
                const totalPct = data.categories.reduce((s, c) => s + c.pct, 0);
                const badge = document.getElementById('total-pct-badge');
                const bar = document.getElementById('total-pct-bar');
                const msg = document.getElementById('total-pct-msg');
                if (badge) {
                    badge.textContent = `${totalPct}%`;
                    badge.className = `status-badge ${totalPct === 100 ? 'status-safe' : 'status-risky'}`;
                }
                if (bar) bar.style.width = `${Math.min(100, totalPct)}%`;
                if (msg) msg.textContent = totalPct === 100 ? '✅ Perfect allocation!' : totalPct < 100 ? `⚠️ ${100 - totalPct}% unallocated.` : `🔴 Over-allocated by ${totalPct - 100}%!`;
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.id === 'cat-save') {
            saveCallback(data);
        }
        if (e.target.id === 'cat-reset') {
            data.categories = [
                { id: 'makan', label: '🍛 Makan', pct: 40 },
                { id: 'rental', label: '🏠 Rental', pct: data.profile.housing === 'hostel' ? 15 : 25 },
                { id: 'transport', label: '🚗 Transport', pct: 10 },
                { id: 'study', label: '📚 Study Materials', pct: 5 },
                { id: 'entertainment', label: '🎮 Entertainment / Shopee', pct: data.profile.housing === 'hostel' ? 15 : 10 }
            ];
            saveCallback(data);
        }
    });
}
