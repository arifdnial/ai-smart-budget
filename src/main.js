// Main Entry Point — AI Smart Budget for UTHM Students
import './style.css';
import { loadStore, saveStore } from './store.js';
import * as Dashboard from './modules/dashboard.js';
import * as Allowance from './modules/allowance.js';
import * as Categories from './modules/categories.js';
import * as Spending from './modules/spending.js';
import * as Repayment from './modules/repayment.js';
import * as Settlement from './modules/settlement.js';
import * as Mara from './modules/mara.js';
import * as Predictions from './modules/predictions.js';
import * as AiChat from './modules/ai-chat.js';

let data = loadStore();
let currentPage = 'dashboard';

// Module map
const modules = {
  dashboard: Dashboard, allowance: Allowance, categories: Categories,
  spending: Spending, repayment: Repayment, settlement: Settlement,
  mara: Mara, predictions: Predictions
};

// Save and re-render
function save(d) {
  data = d;
  saveStore(data);
  renderPage(currentPage);
  updateSidebar();
}

// Render page
function renderPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  if (modules[page]) modules[page].render(data);
  currentPage = page;
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
}

// Update sidebar name
function updateSidebar() {
  const nameEl = document.getElementById('sidebar-user-name');
  if (nameEl && data.profile.name) nameEl.textContent = data.profile.name;
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    renderPage(page);
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  });
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
hamburger?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
});
overlay?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
});

// Onboarding
const modal = document.getElementById('onboarding-modal');
const obSubmit = document.getElementById('ob-submit');

if (data.profile.setupDone) {
  modal.classList.add('hidden');
}

obSubmit?.addEventListener('click', () => {
  data.profile.name = document.getElementById('ob-name')?.value || 'Student';
  data.profile.source = document.getElementById('ob-source')?.value || 'ptptn';
  data.profile.amount = parseFloat(document.getElementById('ob-amount')?.value) || 3500;
  data.profile.duration = parseInt(document.getElementById('ob-duration')?.value) || 4;
  data.profile.housing = document.getElementById('ob-housing')?.value || 'hostel';
  data.profile.loanTotal = parseFloat(document.getElementById('ob-loan')?.value) || 25000;
  data.profile.cgpa = parseFloat(document.getElementById('ob-cgpa')?.value) || 3.50;
  data.profile.semesterStart = new Date().toISOString().split('T')[0];
  data.profile.setupDone = true;
  saveStore(data);
  modal.classList.add('hidden');
  renderPage('dashboard');
  updateSidebar();
});

// Bind all module events
Allowance.bindEvents(data, save);
Categories.bindEvents(data, save);
Spending.bindEvents(data, save);
Repayment.bindEvents(data, save);
Mara.bindEvents(data, save);
Predictions.bindEvents(data, save);
Settlement.bindEvents(data, save);

// Init AI Chat
AiChat.init(data);

// Initial render
if (data.profile.setupDone) {
  renderPage('dashboard');
  updateSidebar();
}
