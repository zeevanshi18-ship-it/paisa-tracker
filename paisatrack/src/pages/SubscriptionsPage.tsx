import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Edit2,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePaisa } from '../context/PaisaContext';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../data/seedData';
import { BillingCycle, ExpenseCategory, PaymentMethod, Subscription } from '../types';
import { formatINR, getTodayISO, sortSubscriptionsByDue } from '../utils/finance';

export function SubscriptionsPage() {
  const {
    state,
    summary,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    markSubscriptionPaid,
  } = usePaisa();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState(getTodayISO());
  const [category, setCategory] = useState<ExpenseCategory>('Entertainment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);

  const sortedSubs = useMemo(
    () => sortSubscriptionsByDue(state.subscriptions),
    [state.subscriptions]
  );

  const upcomingSubs = useMemo(() => {
    const today = getTodayISO();
    return sortedSubs.filter((s) => s.active && s.nextPaymentDate >= today).slice(0, 4);
  }, [sortedSubs]);

  const activeCount = state.subscriptions.filter((s) => s.active).length;

  const openAddModal = () => {
    setEditingSub(null);
    setName('');
    setAmount('');
    setBillingCycle('monthly');
    setNextPaymentDate(getTodayISO());
    setCategory('Entertainment');
    setPaymentMethod('UPI');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(String(sub.amount));
    setBillingCycle(sub.billingCycle);
    setNextPaymentDate(sub.nextPaymentDate);
    setCategory(sub.category);
    setPaymentMethod(sub.paymentMethod);
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const amt = Number(amount);
    if (!cleanName || cleanName.length < 2) {
      setFormError('Enter a subscription name (e.g. Spotify Student).');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setFormError('Amount must be greater than ₹0.');
      return;
    }
    if (!nextPaymentDate) {
      setFormError('Select the next payment date.');
      return;
    }

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name: cleanName,
        amount: Math.round(amt),
        billingCycle,
        nextPaymentDate,
        category,
        paymentMethod,
      });
    } else {
      addSubscription({
        name: cleanName,
        amount: Math.round(amt),
        billingCycle,
        nextPaymentDate,
        category,
        paymentMethod,
        active: true,
      });
    }
    setModalOpen(false);
  };

  const daysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, (m || 1) - 1, d || 1);
    const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `In ${diff} days`;
  };

  return (
    <div className="space-y-6">
      {/* Top KPI & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Monthly Subscription Burn
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {formatINR(summary.monthlySubscriptionTotal)}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / mo</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Plans
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {activeCount}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Share of Monthly Budget
            </div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {state.monthlyBudget > 0
                ? `${Math.round((summary.monthlySubscriptionTotal / state.monthlyBudget) * 100)}%`
                : '0%'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Upcoming Payments Strip */}
      {upcomingSubs.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Upcoming Renewals
            </h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {sub.name}
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatINR(sub.amount)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {sub.nextPaymentDate} · {daysUntil(sub.nextPaymentDate)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => markSubscriptionPaid(sub.id)}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Paid &amp; Log</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Subscriptions List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            Recurring Payments Directory
          </h2>
        </div>

        {sortedSubs.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
              No recurring payments tracked
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add Netflix, Spotify, gym membership, or mobile recharge plans to monitor renewals.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              + Add First Subscription
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-display text-sm font-semibold ${
                        sub.active
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 line-through dark:text-slate-500'
                      }`}
                    >
                      {sub.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      · {sub.billingCycle} · {sub.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {sub.category} · {sub.paymentMethod} · Next due: {sub.nextPaymentDate} (
                    {daysUntil(sub.nextPaymentDate)})
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatINR(sub.amount)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      per {sub.billingCycle === 'monthly' ? 'month' : sub.billingCycle === 'quarterly' ? 'quarter' : 'year'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateSubscription(sub.id, { active: !sub.active })}
                      title={sub.active ? 'Pause subscription' : 'Resume subscription'}
                      aria-label={sub.active ? `Pause ${sub.name}` : `Resume ${sub.name}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      {sub.active ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-emerald-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(sub)}
                      aria-label={`Edit ${sub.name}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(sub)}
                      aria-label={`Delete ${sub.name}`}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add / Edit Subscription Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {editingSub ? 'Edit Subscription' : 'Add Subscription'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Service Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Netflix Mobile, Spotify, Gym"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="199"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Next Payment Date
                  </label>
                  <input
                    type="date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingSub ? 'Save Changes' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove subscription?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}" (${formatINR(deleteTarget.amount)}) from your recurring payments list?`
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteSubscription(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
