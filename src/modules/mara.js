// ========================================
// MARA Allowance Risk Control Module
// ========================================

import * as Store from '../store.js';

export function render(data) {
    const cgpa = data.profile.cgpa;
    const isMara = data.profile.source === 'mara';
    const riskLevel = cgpa < 2.0 ? 'critical' : cgpa < 2.5 ? 'danger' : cgpa < 3.0 ? 'warning' : 'safe';

    const riskLabels = {
        critical: { label: '🔴 CRITICAL', badge: 'status-critical', msg: 'Allowance will be TERMINATED! Immediate action required.' },
        danger: { label: '🔴 HIGH RISK', badge: 'status-critical', msg: 'Risk of allowance termination if CGPA drops further below 2.50.' },
        warning: { label: '🟡 MODERATE', badge: 'status-risky', msg: 'CGPA is approaching danger zone. Focus on studies!' },
        safe: { label: '🟢 SAFE', badge: 'status-safe', msg: 'CGPA is in good standing. Keep up the great work!' }
    };

    const risk = riskLabels[riskLevel];
    const cgpaPct = Math.min(100, (cgpa / 4.0) * 100);

    const el = document.getElementById('page-mara');
    el.innerHTML = `
    <div class="page-header">
      <h2>🎓 ${isMara ? 'MARA' : 'Academic'} Allowance Risk Control</h2>
      <p>Monitor CGPA & protect your allowance</p>
    </div>

    ${riskLevel === 'critical' || riskLevel === 'danger' ? `
    <div class="alert-box danger">
      <span class="alert-icon">⚠️</span>
      <div class="alert-content">
        <h4>MARA Allowance at Risk!</h4>
        <p>${risk.msg} Suggested action: <strong>reduce part-time work hours & focus on study</strong>. 
        Consider getting a tutor or joining study groups to improve grades quickly.</p>
      </div>
    </div>` : ''}

    <div class="stats-grid">
      <div class="stat-card ${riskLevel === 'safe' ? 'green' : riskLevel === 'warning' ? 'gold' : 'red'}">
        <div class="stat-label">Current CGPA</div>
        <div class="stat-value">${cgpa.toFixed(2)}</div>
        <div class="stat-sub">${risk.label}</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-label">Minimum Required</div>
        <div class="stat-value">2.50</div>
        <div class="stat-sub">MARA requirement</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">CGPA Buffer</div>
        <div class="stat-value">${(cgpa - 2.5).toFixed(2)}</div>
        <div class="stat-sub">${cgpa >= 2.5 ? 'Above minimum' : 'BELOW minimum!'}</div>
      </div>
      <div class="stat-card gold">
        <div class="stat-label">Allowance Source</div>
        <div class="stat-value">${data.profile.source.toUpperCase()}</div>
        <div class="stat-sub">RM${data.profile.amount.toLocaleString()}/sem</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <h3>📊 CGPA Risk Meter</h3>
          <span class="${risk.badge}">${risk.label}</span>
        </div>
        <div style="position:relative;padding:20px 0;">
          <div class="risk-meter" style="height:16px;">
            <div class="risk-meter-fill" style="width:${cgpaPct}%;background:linear-gradient(90deg,${cgpa < 2.0 ? 'var(--critical)' : cgpa < 2.5 ? 'var(--critical),var(--risky)' : cgpa < 3.0 ? 'var(--risky),var(--safe)' : 'var(--safe),#4ade80)'});"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
            <span>0.00</span>
            <span style="color:var(--critical);">2.00</span>
            <span style="color:var(--risky);">2.50</span>
            <span style="color:var(--safe);">3.00</span>
            <span>4.00</span>
          </div>
        </div>

        <div style="margin-top:12px;">
          <div class="form-group">
            <label for="mara-cgpa">Update CGPA</label>
            <input type="number" id="mara-cgpa" step="0.01" min="0" max="4" value="${cgpa}" />
          </div>
          <button class="btn btn-primary" id="mara-save" style="width:100%;">💾 Update CGPA</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>🤖 AI Study-Life Balance Advisor</h3>
        </div>
        <div class="prediction-card">
          <h4>📚 Study Recommendations</h4>
          <p>${cgpa < 2.5
            ? 'URGENT: Dedicate minimum 6 hours/day to study. Drop part-time work temporarily. Visit lecturers during consultation hours. Join study groups immediately.'
            : cgpa < 3.0
                ? 'Increase study hours to 4-5 hours/day. Balance part-time work to max 10 hours/week. Focus on weak subjects first.'
                : cgpa < 3.5
                    ? 'You\'re doing well! Maintain 3-4 hours of study daily. Consider tutoring others for extra income (RM15-25/hr).'
                    : 'Excellent! You can safely do part-time work while maintaining grades. Consider applying for dean\'s list scholarship. 🏆'}</p>
        </div>
        <div class="prediction-card">
          <h4>💼 Part-Time Work Guidance</h4>
          <p>${cgpa < 2.5
            ? '⚠️ STOP part-time work immediately. Your allowance is at risk — losing it would be far worse financially than any part-time income.'
            : cgpa < 3.0
                ? 'Limit to weekends only, max 8 hours/week. Prioritize flexible jobs like food delivery or freelancing.'
                : 'Safe to work 10-15 hours/week. Good options: tutoring, freelance design/coding, campus job.'}</p>
        </div>
        <div class="prediction-card">
          <h4>💰 Financial Impact</h4>
          <p>${isMara
            ? `Your MARA allowance of RM${data.profile.amount.toLocaleString()}/semester is ${cgpa < 2.5 ? 'AT RISK' : 'SECURE'}. ${cgpa < 2.5 ? 'If terminated, you lose RM' + (data.profile.amount * (8 - data.profile.duration) / data.profile.duration).toLocaleString() + ' in remaining semesters!' : 'Keep your CGPA above 2.50 to maintain this funding.'}`
            : `Even though you're not on MARA, maintaining high CGPA opens scholarship opportunities worth RM1,000-5,000/year.`}</p>
        </div>
      </div>
    </div>
  `;
}

export function bindEvents(data, saveCallback) {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'mara-save') {
            const cgpa = parseFloat(document.getElementById('mara-cgpa')?.value);
            if (!isNaN(cgpa) && cgpa >= 0 && cgpa <= 4) {
                data.profile.cgpa = cgpa;
                saveCallback(data);
            }
        }
    });
}
