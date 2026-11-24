import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../data/seedData';
import {
  PaymentMethod,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types';
import { getTodayISO } from '../utils/finance';

interface TransactionModalProps {
  open: boolean;
  initialTransaction?: Transaction | null;
  defaultType?: TransactionType;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
}

export function TransactionModal({
  open,
  initialTransaction,
  defaultType = 'expense',
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialTransaction) {
      setType(initialTransaction.type);
      setTitle(initialTransaction.title);
      setAmount(String(initialTransaction.amount));
      setDate(initialTransaction.date);
      setCategory(initialTransaction.category);
      setPaymentMethod(initialTransaction.paymentMethod);
      setNotes(initialTransaction.notes || '');
    } else {
      setType(defaultType);
      setTitle('');
      setAmount('');
      setDate(getTodayISO());
      setCategory(defaultType === 'income' ? 'Pocket Money' : 'Food');
      setPaymentMethod('UPI');
      setNotes('');
    }
    setError('');
  }, [open, initialTransaction, defaultType]);

  if (!open) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeSwitch = (nextType: TransactionType) => {
    setType(nextType);
    const nextList = nextType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!nextList.includes(category as never)) {
      setCategory(nextList[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const parsedAmount = Number(amount);

    if (!cleanTitle || cleanTitle.length < 2) {
      setError('Please enter a descriptive title (at least 2 characters).');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }
    if (!date) {
      setError('Please choose a valid transaction date.');
      return;
    }

    onSubmit({
      title: cleanTitle,
      amount: Math.round(parsedAmount * 100) / 100,
      type,
      date,
      category,
      paymentMethod,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tx-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2
              id="tx-modal-title"
              className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {initialTransaction ? 'Edit Transaction' : 'Log Transaction'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Updates your balance, charts, and monthly budget immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleTypeSwitch('expense')}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-xs dark:bg-slate-900 dark:text-red-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeSwitch('income')}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Income
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'e.g. Mess dinner or Metro card' : 'e.g. Monthly pocket money'}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none transition-colors focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
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
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Split with hostel roommates, semester lab, etc."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#0B1528] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#0B1528] hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
              }`}
            >
              {initialTransaction ? 'Save Changes' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
