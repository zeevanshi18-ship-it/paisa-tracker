import { EXPENSE_CATEGORIES } from '../data/seedData';
import {
  BillingCycle,
  BudgetAlert,
  ExpenseCategory,
  PaisaState,
  Subscription,
  Transaction,
} from '../types';

export function formatINR(amount: number, showDecimals = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(safe);
}

export function getCurrentMonthKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) return monthKey;
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
  });
}

export function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function getRemainingDaysInMonth(date = new Date()): number {
  const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(1, totalDays - date.getDate() + 1);
}

export function getDaysElapsedInMonth(date = new Date()): number {
  return Math.max(1, date.getDate());
}

export function computeDashboardSummary(state: PaisaState) {
  const monthKey = getCurrentMonthKey();
  const currentMonthTx = state.transactions.filter((t) => t.date.startsWith(monthKey));

  const totalIncomeAllTime = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpensesAllTime = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncomeAllTime - totalExpensesAllTime;

  const monthlyIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGoalSavings = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const netMonthlySavings = monthlyIncome - monthlyExpenses;

  const remainingBudget = state.monthlyBudget - monthlyExpenses;
  const remainingDays = getRemainingDaysInMonth();
  const dailySpendingLimit = remainingBudget > 0 ? Math.round(remainingBudget / remainingDays) : 0;

  const daysElapsed = getDaysElapsedInMonth();
  const averageDailyExpense = Math.round(monthlyExpenses / daysElapsed);

  const savingsRate =
    monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;

  // Category spend map for current month
  const categorySpend: Record<ExpenseCategory, number> = {
    Food: 0,
    Shopping: 0,
    Travel: 0,
    Education: 0,
    Hostel: 0,
    Entertainment: 0,
    Bills: 0,
    Healthcare: 0,
    Others: 0,
  };

  for (const tx of currentMonthTx) {
    if (tx.type === 'expense') {
      const cat = EXPENSE_CATEGORIES.includes(tx.category as ExpenseCategory)
        ? (tx.category as ExpenseCategory)
        : 'Others';
      categorySpend[cat] += tx.amount;
    }
  }

  let highestCategory: { category: ExpenseCategory; amount: number } = {
    category: 'Food',
    amount: 0,
  };
  for (const cat of EXPENSE_CATEGORIES) {
    if (categorySpend[cat] > highestCategory.amount) {
      highestCategory = { category: cat, amount: categorySpend[cat] };
    }
  }

  // Monthly subscription normalized cost
  const monthlySubscriptionTotal = state.subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'quarterly') return sum + Math.round(s.amount / 3);
      return sum + Math.round(s.amount / 12);
    }, 0);

  // Budget Alerts (>= 80% warning, > 100% exceeded)
  const budgetAlerts: BudgetAlert[] = [];
  if (state.monthlyBudget > 0) {
    const overallPct = Math.round((monthlyExpenses / state.monthlyBudget) * 100);
    if (overallPct > 100) {
      budgetAlerts.push({
        id: `overall-exceeded-${monthKey}`,
        scope: 'overall',
        severity: 'exceeded',
        spent: monthlyExpenses,
        limit: state.monthlyBudget,
        percentage: overallPct,
        message: `Monthly budget exceeded by ${formatINR(monthlyExpenses - state.monthlyBudget)} (${overallPct}% used).`,
      });
    } else if (overallPct >= 80) {
      budgetAlerts.push({
        id: `overall-warning-${monthKey}`,
        scope: 'overall',
        severity: 'warning',
        spent: monthlyExpenses,
        limit: state.monthlyBudget,
        percentage: overallPct,
        message: `${overallPct}% of your monthly budget is used. ${formatINR(remainingBudget)} left.`,
      });
    }
  }

  for (const cat of EXPENSE_CATEGORIES) {
    const limit = state.categoryBudgets[cat] || 0;
    const spent = categorySpend[cat] || 0;
    if (limit > 0) {
      const pct = Math.round((spent / limit) * 100);
      if (pct > 100) {
        budgetAlerts.push({
          id: `cat-exceeded-${cat}-${monthKey}`,
          scope: cat,
          severity: 'exceeded',
          spent,
          limit,
          percentage: pct,
          message: `${cat} exceeded its ${formatINR(limit)} budget (${formatINR(spent)} spent).`,
        });
      } else if (pct >= 80) {
        budgetAlerts.push({
          id: `cat-warning-${cat}-${monthKey}`,
          scope: cat,
          severity: 'warning',
          spent,
          limit,
          percentage: pct,
          message: `${cat} has reached ${pct}% of its ${formatINR(limit)} limit.`,
        });
      }
    }
  }

  // Financial Health Score (0 - 100)
  // 1. Budget discipline (40 pts)
  const budgetRatio = state.monthlyBudget > 0 ? monthlyExpenses / state.monthlyBudget : 1;
  const budgetScore =
    budgetRatio <= 0.8
      ? 40
      : budgetRatio <= 1
        ? Math.round(40 - (budgetRatio - 0.8) * 100)
        : Math.max(0, Math.round(20 - (budgetRatio - 1) * 40));

  // 2. Savings rate (30 pts) - 20%+ savings rate earns full 30 pts
  const clampedSavings = Math.max(0, savingsRate);
  const savingsScore = Math.min(30, Math.round((clampedSavings / 25) * 30));

  // 3. Category compliance (15 pts)
  const exceededCats = budgetAlerts.filter((a) => a.scope !== 'overall' && a.severity === 'exceeded').length;
  const categoryScore = Math.max(0, 15 - exceededCats * 4);

  // 4. Goals & Habits (15 pts)
  const totalTarget = state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const goalRatio = totalTarget > 0 ? Math.min(1, totalGoalSavings / totalTarget) : 0.5;
  const challengeDaysCompleted = state.noSpendChallenge.days.filter(Boolean).length;
  const habitScore = Math.round(goalRatio * 10 + (challengeDaysCompleted / 7) * 5);

  const healthScore = Math.min(100, Math.max(0, budgetScore + savingsScore + categoryScore + habitScore));

  return {
    monthKey,
    totalBalance,
    totalIncomeAllTime,
    totalExpensesAllTime,
    monthlyIncome,
    monthlyExpenses,
    totalGoalSavings,
    netMonthlySavings,
    remainingBudget,
    remainingDays,
    dailySpendingLimit,
    averageDailyExpense,
    savingsRate,
    categorySpend,
    highestCategory,
    monthlySubscriptionTotal,
    budgetAlerts,
    healthScore,
    healthBreakdown: {
      budgetScore,
      savingsScore,
      categoryScore,
      habitScore,
    },
  };
}

export function buildDailySpendingSeries(transactions: Transaction[], monthKey = getCurrentMonthKey()) {
  const [year, month] = monthKey.split('-').map(Number);
  const now = new Date();
  const maxDay =
    year === now.getFullYear() && month === now.getMonth() + 1
      ? now.getDate()
      : new Date(year, month, 0).getDate();

  const dayTotals: Record<number, number> = {};
  for (let d = 1; d <= maxDay; d++) {
    dayTotals[d] = 0;
  }

  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date.startsWith(monthKey)) {
      const day = Number(tx.date.split('-')[2]);
      if (day >= 1 && day <= maxDay) {
        dayTotals[day] += tx.amount;
      }
    }
  }

  let cumulative = 0;
  return Object.entries(dayTotals).map(([dayStr, amount]) => {
    cumulative += amount;
    return {
      day: `D${dayStr}`,
      dayNum: Number(dayStr),
      amount,
      cumulative,
    };
  });
}

export function buildMonthlyIncomeVsExpenseSeries(transactions: Transaction[], monthsCount = 6) {
  const now = new Date();
  const buckets: Record<string, { monthKey: string; label: string; income: number; expense: number }> = {};

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = getCurrentMonthKey(d);
    buckets[key] = {
      monthKey: key,
      label: getMonthLabel(key),
      income: 0,
      expense: 0,
    };
  }

  for (const tx of transactions) {
    const key = tx.date.slice(0, 7);
    if (buckets[key]) {
      if (tx.type === 'income') buckets[key].income += tx.amount;
      else buckets[key].expense += tx.amount;
    }
  }

  return Object.values(buckets);
}

export function buildWeeklyIncomeVsExpenseSeries(transactions: Transaction[]) {
  const days: { date: string; label: string; income: number; expense: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    days.push({ date: iso, label, income: 0, expense: 0 });
  }

  const byDate = Object.fromEntries(days.map((d) => [d.date, d]));
  for (const tx of transactions) {
    if (byDate[tx.date]) {
      if (tx.type === 'income') byDate[tx.date].income += tx.amount;
      else byDate[tx.date].expense += tx.amount;
    }
  }

  return days;
}

export function advanceBillingDate(dateISO: string, cycle: BillingCycle): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const base = new Date(y || 2026, (m || 1) - 1, d || 1);
  if (cycle === 'monthly') base.setMonth(base.getMonth() + 1);
  else if (cycle === 'quarterly') base.setMonth(base.getMonth() + 3);
  else base.setFullYear(base.getFullYear() + 1);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(
    base.getDate()
  ).padStart(2, '0')}`;
}

export function sortSubscriptionsByDue(subscriptions: Subscription[]): Subscription[] {
  return [...subscriptions].sort((a, b) => a.nextPaymentDate.localeCompare(b.nextPaymentDate));
}

export function exportTransactionsToCSV(transactions: Transaction[], filename = 'paisatrack-transactions.csv') {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount (INR)', 'Notes'];
  const escapeCell = (val: string | number | undefined) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((tx) =>
      [tx.date, tx.title, tx.type, tx.category, tx.paymentMethod, tx.amount, tx.notes || '']
        .map(escapeCell)
        .join(',')
    );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
