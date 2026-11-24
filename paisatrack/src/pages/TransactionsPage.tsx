import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Edit2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { TransactionModal } from '../components/TransactionModal';
import { usePaisa } from '../context/PaisaContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/seedData';
import { Transaction } from '../types';
import { exportTransactionsToCSV, formatINR } from '../utils/finance';

export function TransactionsPage() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = usePaisa();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const allCategories = useMemo(
    () => Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.transactions
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
        if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;
        if (q) {
          const match =
            tx.title.toLowerCase().includes(q) ||
            tx.category.toLowerCase().includes(q) ||
            tx.paymentMethod.toLowerCase().includes(q) ||
            (tx.notes || '').toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        return a.amount - b.amount;
      });
  }, [state.transactions, search, typeFilter, categoryFilter, paymentFilter, sortBy]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Filtered Income: </span>
            <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatINR(totals.income)}
            </span>
          </div>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Filtered Expenses: </span>
            <span className="font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
              {formatINR(totals.expense)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportTransactionsToCSV(filtered)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTx(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1528] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, category, notes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 md:col-span-3">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              aria-label="Filter by payment method"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort transactions"
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="amount-desc">Highest ₹</option>
              <option value="amount-asc">Lowest ₹</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
              No matching transactions found
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try clearing your search filters or log a new income or expense record.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {(search || typeFilter !== 'all' || categoryFilter !== 'all' || paymentFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setPaymentFilter('all');
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditingTx(null);
                  setModalOpen(true);
                }}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                + Add Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <th className="px-5 py-3.5">Transaction</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
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
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {tx.title}
                          </div>
                          {tx.notes && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {tx.category}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {tx.paymentMethod}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                      {tx.date}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTx(tx);
                            setModalOpen(true);
                          }}
                          aria-label={`Edit ${tx.title}`}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(tx)}
                          aria-label={`Delete ${tx.title}`}
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <TransactionModal
        open={modalOpen}
        initialTransaction={editingTx}
        onClose={() => {
          setModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={(data) => {
          if (editingTx) {
            updateTransaction(editingTx.id, data);
          } else {
            addTransaction(data);
          }
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete transaction?"
        description={
          deleteTarget
            ? `Are you sure you want to remove "${deleteTarget.title}" (${formatINR(deleteTarget.amount)})? Your dashboard balances and charts will recalculate immediately.`
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTransaction(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
