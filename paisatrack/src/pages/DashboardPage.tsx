import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  Flame,
  Lightbulb,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePaisa } from '../context/PaisaContext';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES, STUDENT_MONEY_TIPS } from '../data/seedData';
import {
  buildDailySpendingSeries,
  buildMonthlyIncomeVsExpenseSeries,
  formatINR,
} from '../utils/finance';

export function DashboardPage() {
  const {
    state,
    summary,
    setActivePage,
    setQuickAddOpen,
    toggleNoSpendDay,
    resetNoSpendChallenge,
  } = usePaisa();

  const [tipIndex, setTipIndex] = useState(() => {
    const dayOfMonth = new Date().getDate();
    return dayOfMonth % STUDENT_MONEY_TIPS.length;
  });

  // Daily spending limit interactive simulator state
  const [calcBudget, setCalcBudget] = useState(String(Math.max(0, summary.remainingBudget)));
  const [calcDays, setCalcDays] = useState(String(summary.remainingDays));
  const [showCalcSimulator, setShowCalcSimulator] = useState(false);

  const dailySeries = useMemo(
    () => buildDailySpendingSeries(state.transactions, summary.monthKey),
    [state.transactions, summary.monthKey]
  );

  const monthlyComparison = useMemo(
    () => buildMonthlyIncomeVsExpenseSeries(state.transactions, 5),
    [state.transactions]
  );

  const pieData = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => ({
      name: cat,
      value: summary.categorySpend[cat] || 0,
      color: CATEGORY_COLORS[cat] || '#94A3B8',
    })).filter((d) => d.value > 0);
  }, [summary.categorySpend]);

  const recentTransactions = useMemo(
    () =>
      [...state.transactions]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [state.transactions]
  );

  const challengeCompletedCount = state.noSpendChallenge.days.filter(Boolean).length;
  const activeTip = STUDENT_MONEY_TIPS[tipIndex];

  const simDailyLimit = useMemo(() => {
    const b = Number(calcBudget);
    const d = Number(calcDays);
    if (!Number.isFinite(b) || !Number.isFinite(d) || b <= 0 || d <= 0) return 0;
    return Math.round(b / d);
  }, [calcBudget, calcDays]);

  const healthLabel =
    summary.healthScore >= 80
      ? 'Strong Discipline'
      : summary.healthScore >= 60
        ? 'On Track'
        : 'Needs Attention';

  return (
    <div className="space-y-6">
      {/* Welcome Banner + Health Score + Daily Spending Limit */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-[#0B1528] p-6 text-white dark:border-slate-800 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-400">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-white">
                Welcome back, {state.profile.name.split(' ')[0]}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {summary.remainingBudget >= 0
                  ? `You have ${formatINR(summary.remainingBudget)} remaining in your monthly budget across ${summary.remainingDays} days.`
                  : `You have exceeded your monthly budget by ${formatINR(Math.abs(summary.remainingBudget))}. Review category limits below.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0"
            >
              + Log Expense
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Daily Spending Limit</span>
                <button
                  type="button"
                  onClick={() => {
                    setCalcBudget(String(Math.max(0, summary.remainingBudget)));
                    setCalcDays(String(summary.remainingDays));
                    setShowCalcSimulator((v) => !v);
                  }}
                  className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:underline"
                >
                  <Calculator className="h-3 w-3" />
                  <span>{showCalcSimulator ? 'Hide Calculator' : 'Calculator'}</span>
                </button>
              </div>
              <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
                {formatINR(summary.dailySpendingLimit)}
                <span className="text-xs font-normal text-slate-400"> / day</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Average spent so far: {formatINR(summary.averageDailyExpense)}/day
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400">Monthly Budget Usage</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold tabular-nums text-white">
                  {state.monthlyBudget > 0
                    ? `${Math.round((summary.monthlyExpenses / state.monthlyBudget) * 100)}%`
                    : '0%'}
                </span>
                <span className="text-xs text-slate-400">
                  of {formatINR(state.monthlyBudget)}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all ${
                    summary.monthlyExpenses > state.monthlyBudget
                      ? 'bg-red-500'
                      : summary.monthlyExpenses >= state.monthlyBudget * 0.8
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      state.monthlyBudget > 0
                        ? Math.round((summary.monthlyExpenses / state.monthlyBudget) * 100)
                        : 0
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {showCalcSimulator && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <div className="text-xs font-semibold text-slate-200">
                Daily Spending Limit Simulator
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] text-slate-400">Available Funds (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={calcBudget}
                    onChange={(e) => setCalcBudget(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs tabular-nums text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400">Days Left</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={calcDays}
                    onChange={(e) => setCalcDays(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs tabular-nums text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="text-[11px] text-slate-400">Safe Daily Cap</div>
                  <div className="font-mono text-lg font-bold tabular-nums text-emerald-400">
                    {formatINR(simDailyLimit)}/day
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Health Score Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Financial Health Score</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {summary.healthScore}
                </span>
                <span className="font-mono text-sm text-slate-500 dark:text-slate-400">/ 100</span>
              </div>
            </div>
            <div
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                summary.healthScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : summary.healthScore >= 60
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
              }`}
            >
              {healthLabel}
            </div>
          </div>

          <div className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Budget Adherence</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-200">
                {summary.healthBreakdown.budgetScore} / 40
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Monthly Savings Rate ({summary.savingsRate}%)</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-200">
                {summary.healthBreakdown.savingsScore} / 30
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Category Guardrails</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-200">
                {summary.healthBreakdown.categoryScore} / 15
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Goals &amp; 7-Day Challenge</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-200">
                {summary.healthBreakdown.habitScore} / 15
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Budget Warning Banner if any */}
      {summary.budgetAlerts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-3.5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>{summary.budgetAlerts.length} Budget Alert{summary.budgetAlerts.length > 1 ? 's' : ''}:</strong>{' '}
              {summary.budgetAlerts[0].message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('budgets')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline dark:text-amber-300"
          >
            <span>Inspect Budgets</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 5 Core KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Balance</span>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatINR(summary.totalBalance)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Net ledger balance
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Income</span>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatINR(summary.monthlyIncome)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            This month · All-time {formatINR(summary.totalIncomeAllTime)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Expenses</span>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
            {formatINR(summary.monthlyExpenses)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            This month · All-time {formatINR(summary.totalExpensesAllTime)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Savings</span>
            <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatINR(summary.totalGoalSavings)}
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{state.savingsGoals.length} active goal{state.savingsGoals.length === 1 ? '' : 's'}</span>
            <button
              type="button"
              onClick={() => setActivePage('investments')}
              className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Invest Extra →
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Remaining Budget</span>
            <Target className="h-4 w-4 text-slate-400" />
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              summary.remainingBudget >= 0
                ? 'text-slate-900 dark:text-white'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {formatINR(summary.remainingBudget)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monthly cap {formatINR(state.monthlyBudget)}
          </div>
        </div>
      </section>

      {/* Charts Row: Monthly Spending Graph + Income vs Expense Chart */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily expenditure throughout the current month
              </p>
            </div>
            <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400">
              {formatINR(summary.monthlyExpenses)} total
            </span>
          </div>

          <div className="mt-5 h-64 w-full">
            {dailySeries.some((d) => d.amount > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [formatINR(Number(value)), 'Spent']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#DC2626"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No expenses logged this month yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Income vs Expense
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last 5 months comparison
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('analytics')}
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Full Report
            </button>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    formatINR(Number(value)),
                    name === 'income' ? 'Income' : 'Expense',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" fill="#16A34A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Pie Chart + Recent Transactions */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Category Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current month expense distribution
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('budgets')}
              className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Set Limits
            </button>
          </div>

          {pieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              Log an expense to see your category split.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown) => formatINR(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {pieData.slice(0, 6).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatINR(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest activity across UPI, Cash, Card &amp; Bank
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('transactions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No transactions yet. Click Quick Add to log your first expense.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {tx.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.paymentMethod}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatINR(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Extra Features Row: 7-Day No-Spend Challenge + Financial Tip of the Day */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4" />
                <span>7-Day No-Spend Challenge</span>
              </div>
              <h3 className="mt-1 font-display text-base font-semibold text-slate-900 dark:text-white">
                Skip non-essential impulse spends for 7 days
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {challengeCompletedCount} of 7 days completed — check off each day you stick to essentials only.
              </p>
            </div>
            <button
              type="button"
              onClick={resetNoSpendChallenge}
              title="Reset 7-day challenge"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {state.noSpendChallenge.days.map((done, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleNoSpendDay(idx)}
                className={`flex flex-col items-center justify-center rounded-xl border py-3 transition-colors ${
                  done
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                }`}
              >
                <span className="text-[11px] font-medium">D{idx + 1}</span>
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full">
                  {done ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Lightbulb className="h-4 w-4" />
                <span>Financial Tip of the Day · {activeTip.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setTipIndex((i) => (i + 1) % STUDENT_MONEY_TIPS.length)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-400 dark:hover:text-white"
              >
                Next Tip
              </button>
            </div>
            <h3 className="mt-2 font-display text-base font-semibold text-slate-900 dark:text-white">
              {activeTip.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {activeTip.detail}
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">
              Tip {tipIndex + 1} of {STUDENT_MONEY_TIPS.length}
            </span>
            <button
              type="button"
              onClick={() => setActivePage('paisabot')}
              className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Ask PaisaBot for advice →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
