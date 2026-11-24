import React, { useState } from 'react';
import { Calendar, Edit2, PiggyBank, Plus, PlusCircle, Trash2, X } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePaisa } from '../context/PaisaContext';
import { SavingsGoal } from '../types';
import { formatINR, getTodayISO } from '../utils/finance';

export function SavingsGoalsPage() {
  const {
    state,
    summary,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
  } = usePaisa();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [formError, setFormError] = useState('');

  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribError, setContribError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate(getTodayISO());
    setFormError('');
    setGoalModalOpen(true);
  };

  const openEditModal = (g: SavingsGoal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setTargetDate(g.targetDate);
    setFormError('');
    setGoalModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const target = Number(targetAmount);
    const current = Number(currentAmount || 0);

    if (!cleanTitle || cleanTitle.length < 2) {
      setFormError('Please enter a goal title.');
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      setFormError('Target amount must be greater than ₹0.');
      return;
    }
    if (!Number.isFinite(current) || current < 0) {
      setFormError('Saved amount cannot be negative.');
      return;
    }
    if (!targetDate) {
      setFormError('Please choose a target date.');
      return;
    }

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, {
        title: cleanTitle,
        targetAmount: Math.round(target),
        currentAmount: Math.round(current),
        targetDate,
      });
    } else {
      addSavingsGoal({
        title: cleanTitle,
        targetAmount: Math.round(target),
        currentAmount: Math.round(current),
        targetDate,
      });
    }
    setGoalModalOpen(false);
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribGoal) return;
    const amt = Number(contribAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setContribError('Enter a valid amount greater than ₹0.');
      return;
    }
    contributeToGoal(contribGoal.id, Math.round(amt));
    setContribGoal(null);
    setContribAmount('');
    setContribError('');
  };

  const totalTarget = state.savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const overallGoalPct =
    totalTarget > 0 ? Math.min(100, Math.round((summary.totalGoalSavings / totalTarget) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Saved Across Goals
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatINR(summary.totalGoalSavings)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Combined Target
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatINR(totalTarget)}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Overall Completion
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {overallGoalPct}%
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {state.savingsGoals.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900">
          <PiggyBank className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">
            No savings goals yet
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create a goal for an emergency buffer, laptop upgrade, or college trip.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {state.savingsGoals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isComplete = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Target: {goal.targetDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(goal)}
                        aria-label={`Edit ${goal.title}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(goal)}
                        aria-label={`Delete ${goal.title}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatINR(goal.currentAmount)}
                      </span>
                      <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                        / {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isComplete ? 'Goal Achieved!' : `${formatINR(remaining)} left to go`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContribGoal(goal);
                      setContribAmount('500');
                      setContribError('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Money</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {goalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Noise-Cancelling Headphones"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Already Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {contribGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Add Savings to {contribGoal.title}
              </h3>
              <button
                type="button"
                onClick={() => setContribGoal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddMoney} className="mt-4 space-y-4">
              {contribError && <p className="text-xs text-red-600">{contribError}</p>}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Amount to Deposit (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
                <div className="mt-2 flex gap-2">
                  {[200, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setContribAmount(String(preset))}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 font-mono text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContribGoal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Add to Savings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete savings goal?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}" (${formatINR(deleteTarget.currentAmount)} saved)? This action cannot be undone.`
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteSavingsGoal(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
