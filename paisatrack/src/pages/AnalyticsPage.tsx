import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePaisa } from '../context/PaisaContext';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/seedData';
import {
  buildMonthlyIncomeVsExpenseSeries,
  buildWeeklyIncomeVsExpenseSeries,
  exportTransactionsToCSV,
  formatINR,
} from '../utils/finance';

export function AnalyticsPage() {
  const { state, summary } = usePaisa();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('monthly');

  const chartSeries: { label: string; income: number; expense: number }[] = useMemo(() => {
    if (timeframe === 'weekly') {
      return buildWeeklyIncomeVsExpenseSeries(state.transactions).map(
        ({ label, income, expense }) => ({ label, income, expense })
      );
    }
    return buildMonthlyIncomeVsExpenseSeries(state.transactions, 6).map(
      ({ label, income, expense }) => ({ label, income, expense })
    );
  }, [state.transactions, timeframe]);

  const categoryRows = useMemo(() => {
    const total = summary.monthlyExpenses || 1;
    return EXPENSE_CATEGORIES.map((cat) => {
      const amount = summary.categorySpend[cat] || 0;
      const pct = Math.round((amount / total) * 100);
      return {
        category: cat,
        amount,
        percentage: summary.monthlyExpenses > 0 ? pct : 0,
        color: CATEGORY_COLORS[cat] || '#64748B',
      };
    })
      .filter((r) => r.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [summary.categorySpend, summary.monthlyExpenses]);

  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of state.transactions) {
      if (tx.type === 'expense' && tx.date.startsWith(summary.monthKey)) {
        map[tx.paymentMethod] = (map[tx.paymentMethod] || 0) + tx.amount;
      }
    }
    return Object.entries(map)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [state.transactions, summary.monthKey]);

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              timeframe === 'weekly'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Weekly Report (7 Days)
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('monthly')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              timeframe === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Monthly Report (6 Months)
          </button>
        </div>

        <button
          type="button"
          onClick={() => exportTransactionsToCSV(state.transactions)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Transactions CSV</span>
        </button>
      </div>

      {/* Analytics KPI Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Highest Spending Category
          </div>
          <div className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
            {summary.highestCategory.amount > 0 ? summary.highestCategory.category : 'No Expenses'}
          </div>
          <div className="mt-1 font-mono text-xs tabular-nums text-red-600 dark:text-red-400">
            {formatINR(summary.highestCategory.amount)} this month
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Average Daily Expenditure
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatINR(summary.averageDailyExpense)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Limit: {formatINR(summary.dailySpendingLimit)}/day remaining
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Monthly Savings Rate
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold tabular-nums ${
              summary.savingsRate >= 20
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.savingsRate >= 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {summary.savingsRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Net surplus: {formatINR(summary.netMonthlySavings)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Logged Entries
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {state.transactions.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Ready for CSV export
          </div>
        </div>
      </section>

      {/* Income vs Expense Chart */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {timeframe === 'weekly' ? 'Last 7 Days: Income vs Expense' : '6-Month Income vs Expense'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculated directly from your saved LocalStorage ledger
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-xs bg-red-600" />
              Expense
            </span>
          </div>
        </div>

        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartSeries} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
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
      </section>

      {/* Category Spending Bar + Table & Payment Methods */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Category-wise Spending (This Month)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ranked from highest spend to lowest
          </p>

          {categoryRows.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No category expenses recorded for this month yet.
            </div>
          ) : (
            <>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryRows}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v}`} />
                    <YAxis
                      dataKey="category"
                      type="category"
                      width={88}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip formatter={(val: unknown) => formatINR(Number(val))} />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {categoryRows.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {categoryRows.map((row) => (
                  <div key={row.category} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-xs"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {row.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
                      <span className="text-slate-500 dark:text-slate-400">{row.percentage}%</span>
                      <span className="w-20 text-right font-semibold text-slate-900 dark:text-white">
                        {formatINR(row.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Payment Method Split
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            How you paid this month (UPI, Cash, Card, Bank)
          </p>

          {paymentBreakdown.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No payment records for this month.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {paymentBreakdown.map((item) => {
                const share =
                  summary.monthlyExpenses > 0
                    ? Math.round((item.amount / summary.monthlyExpenses) * 100)
                    : 0;
                return (
                  <div key={item.method}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.method}
                      </span>
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatINR(item.amount)} ({share}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full bg-[#0B1528] dark:bg-emerald-500"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
