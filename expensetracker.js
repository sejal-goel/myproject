// HTML references
const balanceEl = document.getElementById('balance');
const form = document.getElementById('transaction-form');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const list = document.getElementById('transaction-list');

// Load from localStorage or initialize
let data = JSON.parse(localStorage.getItem("expenseData")) || {
  transactions: [],
  monthlyHistory: {},
  lastMonth: getCurrentMonth()
};

// Utility functions
function getWeekNumber(date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentWeek() {
  const now = new Date();
  return `${now.getFullYear()}-W${getWeekNumber(now)}`;
}

// Reset monthly data if a new month has started
function checkMonthReset() {
  const currentMonth = getCurrentMonth();
  if (data.lastMonth !== currentMonth) {
    // Calculate last month's totals
    const lastMonthTransactions = data.transactions.filter(tx => tx.date.startsWith(data.lastMonth));
    const categoryTotals = {};

    lastMonthTransactions.forEach(tx => {
      if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
      categoryTotals[tx.category] += tx.amount;
    });

    data.monthlyHistory[data.lastMonth] = categoryTotals;

    // Clear current month's transactions
    data.transactions = [];
    data.lastMonth = currentMonth;

    saveData();
  }
}

// Save current state
function saveData() {
  localStorage.setItem("expenseData", JSON.stringify(data));
}

// Add transaction to memory and UI
function addTransaction(category, amount) {
  const transaction = {
    category,
    amount,
    date: new Date().toISOString()
  };
  data.transactions.push(transaction);
  saveData();
  updateUI();
}

// Calculate and show totals
function updateUI() {
  list.innerHTML = '';
  let total = 0;

  data.transactions.forEach(tx => {
    total += tx.amount;

    const li = document.createElement('li');
    li.innerHTML = `<strong>${tx.category}</strong>: ₹${tx.amount}`;
    li.classList.add(tx.amount < 0 ? 'expense' : 'income');
    list.appendChild(li);
  });

  balanceEl.textContent = total;
  balanceEl.classList.toggle('negative', total < 0);
}

// Weekly and monthly totals by category
function getTotalsByPeriod(period) {
  const now = new Date();
  const periodKey = period === 'month' ? getCurrentMonth() : getCurrentWeek();
  const totals = {};

  data.transactions.forEach(tx => {
    const date = new Date(tx.date);
    const txPeriod = period === 'month'
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : `${date.getFullYear()}-W${getWeekNumber(date)}`;

    if (txPeriod === periodKey) {
      if (!totals[tx.category]) totals[tx.category] = 0;
      totals[tx.category] += tx.amount;
    }
  });

  return totals;
}

// Display totals in console (you can render them in HTML too)
function logCategoryTotals() {
  console.log("🗓 Weekly Totals", getTotalsByPeriod('week'));
  console.log("📆 Monthly Totals", getTotalsByPeriod('month'));
  console.log("📜 History:", data.monthlyHistory);
}

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const category = categorySelect.value;
  const amount = parseFloat(amountInput.value);

  if (!category || isNaN(amount)) return;

  addTransaction(category, amount);
  amountInput.value = '';
  categorySelect.value = '';
});

// Initialize
checkMonthReset();
updateUI();
logCategoryTotals();
