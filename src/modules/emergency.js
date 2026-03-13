// Emergency Mode Module
import * as Store from '../store.js';

const SCENARIOS = [
    { id: 'laptop', icon: '💻', label: 'Laptop Rosak', cost: 500, desc: 'Laptop repair needed' },
    { id: 'balik', icon: '🚌', label: 'Balik Kampung', cost: 150, desc: 'Emergency ticket home' },
    { id: 'banjir', icon: '🌊', label: 'Banjir Season', cost: 300, desc: 'Flood damage' },
    { id: 'medical', icon: '🏥', label: 'Medical', cost: 200, desc: 'Medical bills' },
    { id: 'phone', icon: '📱', label: 'Phone Rosak', cost: 300, desc: 'Phone repair' },
    { id: 'academic', icon: '📝', label: 'Academic Fees', cost: 200, desc: 'Unexpected fees' }
];

export function render(data) {
    const remaining = Store.getRemainingBalance(data);
    const dailyBudget = Store.getDailyBudget(data);
    const daysLeft = Store.getDaysRemaining(data);
    const emergencyAlloc = (data.categories.find(c => c.id === 'emergency')?.pct / 100) * data.profile.amount;
    const emergencyLeft = Math.max(0, emergencyAlloc - Store.getCategorySpent(data, 'emergency'));
    const isActive = data.emergencyMode;
    const activeScenario = isActive ? SCENARIOS.find(s => s.id === data.emergencyScenario) : null;
    const emergencyCost = activeScenario ? activeScenario.cost : 0;
    const survivalBudget = isActive ? (remaining - emergencyCost) : remaining;
    const survivalDaily = isActive && daysLeft > 0 ? survivalBudget / daysLeft : dailyBudget;

    const el = document.getElementById('page-emergency');
    el.className = `page${isActive ? ' emergency-active' : ''}`;
    el.innerHTML = `
    <div class="page-header"><h2>🚨 Emergency Mode</h2><p>Malaysian reality — life happens. AI helps you survive.</p></div>
    ${isActive ? `<div class="alert-box danger"><span class="alert-icon">🚨</span><div class="alert-content"><h4>EMERGENCY ACTIVE: ${activeScenario?.label}</h4><p>Budget recalculated. New daily limit: <strong>RM${survivalDaily.toFixed(2)}</strong>. Emergency cost: RM${emergencyCost}.</p></div></div>` : `<div class="alert-box info"><span class="alert-icon">💡</span><div class="alert-content"><h4>No Emergency Active</h4><p>Tap a scenario below to simulate an emergency.</p></div></div>`}
    <div class="stats-grid">
      <div class="stat-card ${isActive ? 'red' : 'green'}"><div class="stat-label">Emergency Fund</div><div class="stat-value">RM ${emergencyLeft.toFixed(2)}</div><div class="stat-sub">of RM${emergencyAlloc.toFixed(2)}</div></div>
      <div class="stat-card blue"><div class="stat-label">${isActive ? 'Survival' : 'Normal'} Daily</div><div class="stat-value">RM ${survivalDaily.toFixed(2)}</div><div class="stat-sub">${isActive ? 'Emergency' : 'Regular'} rate</div></div>
      <div class="stat-card gold"><div class="stat-label">Balance After</div><div class="stat-value">RM ${survivalBudget.toFixed(2)}</div><div class="stat-sub">${daysLeft} days left</div></div>
      <div class="stat-card purple"><div class="stat-label">Emergency Cost</div><div class="stat-value">RM ${emergencyCost}</div><div class="stat-sub">${activeScenario?.desc || 'None'}</div></div>
    </div>
    <div class="card mb-2"><div class="card-header"><h3>⚡ Emergency Scenarios</h3></div>
      <div class="emergency-scenarios">${SCENARIOS.map(s => `<button class="emergency-btn" data-scenario="${s.id}"><span class="em-icon">${s.icon}</span><span class="em-label">${s.label}</span><span class="text-muted" style="font-size:0.72rem;display:block;margin-top:4px;">~RM${s.cost}</span></button>`).join('')}</div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-header"><h3>🤖 AI Emergency Plan</h3></div>
        ${isActive ? `<div class="prediction-card"><h4>🔒 Freeze Recommendations</h4><p>Stop: Entertainment, Shopee, Grab. Cook at home — nasi goreng < RM3.</p></div><div class="prediction-card"><h4>💰 Recovery</h4><p>Stick to RM${survivalDaily.toFixed(2)}/day to recover in ${Math.ceil(emergencyCost / (dailyBudget - survivalDaily + 0.01))} days.</p></div><div class="prediction-card"><h4>🆘 Help</h4><p>UTHM emergency fund, family help, sell unused items, tutoring.</p></div>` : `<div class="prediction-card"><h4>🛡 Prevention</h4><p>Build emergency fund to RM500. Save RM5/day extra. Keep insurance updated.</p></div>`}
      </div>
      <div class="card"><div class="card-header"><h3>🎛 Controls</h3></div>
        ${isActive ? `<button class="btn btn-success" id="em-deactivate" style="width:100%">✅ Deactivate Emergency</button><button class="btn btn-secondary mt-1" id="em-log-cost" style="width:100%">💸 Log Cost (RM${emergencyCost})</button>` : `<p class="text-muted text-center">Select a scenario above to activate.</p>`}
      </div>
    </div>`;
}

export function bindEvents(data, saveCallback) {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.emergency-btn');
        if (btn) { data.emergencyMode = true; data.emergencyScenario = btn.dataset.scenario; saveCallback(data); return; }
        if (e.target.id === 'em-deactivate') { data.emergencyMode = false; data.emergencyScenario = null; saveCallback(data); }
        if (e.target.id === 'em-log-cost') {
            const s = SCENARIOS.find(s => s.id === data.emergencyScenario);
            if (s) { data.spending.push({ amount: s.cost, category: 'emergency', description: `Emergency: ${s.label}`, date: new Date().toISOString().split('T')[0] }); data.emergencyMode = false; data.emergencyScenario = null; saveCallback(data); }
        }
    });
}
