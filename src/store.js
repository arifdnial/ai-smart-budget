// ========================================
// Data Store — LocalStorage-backed
// ========================================

const STORE_KEY = 'smartbudget_data';

const defaultData = {
  profile: {
    name: '',
    source: 'ptptn',
    amount: 3500,
    duration: 4,
    housing: 'hostel',
    loanTotal: 25000,
    cgpa: 3.50,
    semesterStart: null,
    setupDone: false
  },
  categories: [
    { id: 'makan', label: '🍛 Makan', pct: 40 },
    { id: 'rental', label: '🏠 Rental', pct: 25 },
    { id: 'transport', label: '🚗 Transport', pct: 10 },
    { id: 'study', label: '📚 Study Materials', pct: 5 },
    { id: 'entertainment', label: '🎮 Entertainment / Shopee', pct: 10 }
  ],
  spending: [],
  predictions: {
    weeklyPatterns: [],
    riskWeeks: [6, 7, 8],
    shopeeAlerts: ['11.11', '12.12', '9.9']
  },
  settlement: {
    campaigns: [
      { name: 'PTPTN Discount 2026', discount: 15, deadline: '2026-12-31', active: true },
      { name: 'Hari Raya Settlement Promo', discount: 10, deadline: '2026-04-30', active: true }
    ]
  }
};

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults for any missing keys
      return deepMerge(structuredClone(defaultData), parsed);
    }
  } catch (e) {
    console.warn('Store load failed, using defaults', e);
  }
  return structuredClone(defaultData);
}

export function saveStore(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Store save failed', e);
  }
}

export function resetStore() {
  localStorage.removeItem(STORE_KEY);
  return structuredClone(defaultData);
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// --- Computed helpers ---

export function getMonthlyBudget(data) {
  return data.profile.amount / data.profile.duration;
}

export function getDailyBudget(data) {
  const days = data.profile.duration * 30;
  return data.profile.amount / days;
}

export function getTotalSpent(data) {
  return data.spending.reduce((sum, s) => sum + s.amount, 0);
}

export function getRemainingBalance(data) {
  return data.profile.amount - getTotalSpent(data);
}

export function getDaysElapsed(data) {
  if (!data.profile.semesterStart) return 0;
  const start = new Date(data.profile.semesterStart);
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
}

export function getDaysRemaining(data) {
  const totalDays = data.profile.duration * 30;
  return Math.max(0, totalDays - getDaysElapsed(data));
}

export function getSafeDailySpend(data) {
  const remaining = getRemainingBalance(data);
  const daysLeft = getDaysRemaining(data);
  return daysLeft > 0 ? remaining / daysLeft : 0;
}

export function getTodaySpent(data) {
  const today = new Date().toISOString().split('T')[0];
  return data.spending
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.amount, 0);
}

export function getCategorySpent(data, catId) {
  return data.spending
    .filter(s => s.category === catId)
    .reduce((sum, s) => sum + s.amount, 0);
}

export function getSpendingByCategory(data) {
  const result = {};
  for (const cat of data.categories) {
    result[cat.id] = getCategorySpent(data, cat.id);
  }
  return result;
}

export function getRiskLevel(data) {
  const daily = getDailyBudget(data);
  const todaySpent = getTodaySpent(data);
  const remaining = getRemainingBalance(data);
  const totalBudget = data.profile.amount;

  if (remaining < totalBudget * 0.15 || todaySpent > daily * 2) return 'critical';
  if (remaining < totalBudget * 0.35 || todaySpent > daily * 1.2) return 'risky';
  return 'safe';
}

export function getProjectedRunOutDate(data) {
  const remaining = getRemainingBalance(data);
  if (remaining <= 0) return new Date();
  
  // Average daily spend over last 7 days
  const recent = getRecentDailyAvg(data, 7);
  if (recent <= 0) return null;
  
  const daysLeft = remaining / recent;
  const runOut = new Date();
  runOut.setDate(runOut.getDate() + Math.floor(daysLeft));
  return runOut;
}

export function getRecentDailyAvg(data, days = 7) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  
  const recent = data.spending.filter(s => s.date >= cutoffStr);
  if (recent.length === 0) return getDailyBudget(data);
  
  const total = recent.reduce((sum, s) => sum + s.amount, 0);
  return total / days;
}

export function getRepaymentYears(loanTotal, monthlyPayment) {
  if (monthlyPayment <= 0) return Infinity;
  return (loanTotal / monthlyPayment) / 12;
}

export function getInterestSaved(loanTotal, monthlyPaymentLow, monthlyPaymentHigh) {
  // Simplified: assume 1% annual admin fee
  const rate = 0.01;
  const yearsLow = getRepaymentYears(loanTotal, monthlyPaymentLow);
  const yearsHigh = getRepaymentYears(loanTotal, monthlyPaymentHigh);
  const interestLow = loanTotal * rate * yearsLow;
  const interestHigh = loanTotal * rate * yearsHigh;
  return Math.max(0, interestLow - interestHigh);
}
