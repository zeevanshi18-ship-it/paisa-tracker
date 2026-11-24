import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, ShieldAlert } from 'lucide-react';
import { usePaisa } from '../context/PaisaContext';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/seedData';
import { ExpenseCategory } from '../types';
import { formatINR } from '../utils/finance';

export function BudgetPlannerPage() {
  const { state, summary, setMonthlyBudget, setCategoryBudget } = usePaisa();

  const [editingMonthly, setEditingMonthly] = useState(false);
  const [monthlyInput, setMonthlyInput] = useState(String(state.monthlyBudget));
  const [monthlyError, setMonthlyError] = useState('');

  const [editingCat, setEditingCat] = useState<ExpenseCategory | null>(null);
  const [catInput, setCatInput] = useState('');
  const [catError, setCatError] = useState('');

  const overallPct =
    state.monthlyBudget > 0 ? Math.round((summary.monthlyExpenses / state.monthlyBudget) * 100) : 0;

  const totalAllocatedCategories = EXPENSE_CATEGORIES.reduce(
    (sum, cat) => sum + (state.categoryBudgets[cat] || 0),
    0
  );

  const handleSaveMonthly = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(monthlyInput);
    if (!Number.isFinite(val) || val <= 0) {
      setMonthlyError('Enter a valid monthly budget greater than ₹0.');
      return;
    }
    setMonthlyBudget(Math.round(val));
    setEditingMonthly(false);
    setMonthlyError('');
  };

  const handleSaveCategory = (e: React.FormEvent, cat: ExpenseCategory) => {
    e.preventDefault();
    const val = Number(catInput);
    if (!Number.isFinite(val) || val < 0) {
      setCatError('Budget must be ₹0 or greater.');
      return;
    }
    setCategoryBudget(cat, Math.round(val));
    setEditingCat(null);
    setCatError('');
  };

  return (
    <div className="space-y-6">
      {/* Overall Monthly Budget Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Monthly Spending Cap
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Combined category allocations: {formatINR(totalAllocatedCategories)} across 9 buckets
            </p>
          </div>

          {!editingMonthly ? (
            <button
              type="button"
              onClick={() => {
                setMonthlyInput(String(state.monthlyBudget));
                setMonthlyError('');
                setEditingMonthly(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Monthly Budget</span>
            </button>
          ) : (
            <form onSubmit={handleSaveMonthly} className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                min="1"
                value={monthlyInput}
                onChange={(e) => setMonthlyInput(e.target.value)}
                className="w-36 rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                aria-label="Monthly budget amount"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingMonthly(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {monthlyError && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{monthlyError}</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">Monthly Budget</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatINR(state.monthlyBudget)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">Spent This Month</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {formatINR(summary.monthlyExpenses)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">Remaining Budget</div>
            <div
              className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
                summary.remainingBudget >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatINR(summary.remainingBudget)}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400">Overall Utilization</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
              {overallPct}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all ${
                overallPct > 100
                  ? 'bg-red-600'
                  : overallPct >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>

          {overallPct > 100 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>
                Alert: You have exceeded your monthly budget by{' '}
                {formatINR(summary.monthlyExpenses - state.monthlyBudget)}.
              </span>
            </div>
          )}

          {overallPct >= 80 && overallPct <= 100 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Warning: {overallPct}% of your monthly budget has been used. Pace daily spending at{' '}
                {formatINR(summary.dailySpendingLimit)}/day.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Category Budgets Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Category Budgets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatic warnings trigger at 80% usage and alerts when a limit is exceeded.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {EXPENSE_CATEGORIES.map((cat) => {
            const limit = state.categoryBudgets[cat] || 0;
            const spent = summary.categorySpend[cat] || 0;
            const remaining = limit - spent;
            const pct = limit > 0 ? Math.round((spent / limit) * 100) : spent > 0 ? 100 : 0;
            const isExceeded = limit > 0 ? spent > limit : spent > 0;
            const isWarning = !isExceeded && limit > 0 && pct >= 80;
            const isEditing = editingCat === cat;

            return (
              <div
                key={cat}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-xs"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] || '#64748B' }}
                      />
                      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                        {cat}
                      </h3>
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(cat);
                          setCatInput(String(limit));
                          setCatError('');
                        }}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        Edit Limit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveCategory(e, cat)} className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={catInput}
                          onChange={(e) => setCatInput(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCat(null)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                      {catError && <p className="text-xs text-red-600">{catError}</p>}
                    </form>
                  ) : (
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                          {formatINR(spent)}
                        </span>
                        <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                          of {formatINR(limit)}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                        {pct}%
                      </span>
                    </div>
                  )}

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full transition-all ${
                        isExceeded
                          ? 'bg-red-600'
                          : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span
                    className={`font-mono font-medium tabular-nums ${
                      remaining < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {remaining >= 0
                      ? `${formatINR(remaining)} left`
                      : `Over by ${formatINR(Math.abs(remaining))}`}
                  </span>

                  {isExceeded ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Exceeded</span>
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>80%+ Used</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>On Track</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
