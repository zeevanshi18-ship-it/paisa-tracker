import React, { useState } from 'react';
import {
  Check,
  Download,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  Upload,
} from 'lucide-react';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePaisa } from '../context/PaisaContext';
import { AVATAR_PRESETS } from '../data/seedData';
import { exportTransactionsToCSV } from '../utils/finance';

export function SettingsPage() {
  const {
    state,
    updateProfile,
    setMonthlyBudget,
    resetDemoData,
    logoutToWelcome,
  } = usePaisa();

  const [name, setName] = useState(state.profile.name);
  const [college, setCollege] = useState(state.profile.college);
  const [pocketMoney, setPocketMoney] = useState(String(state.profile.monthlyPocketMoney));
  const [savedToast, setSavedToast] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const parsedPocket = Number(pocketMoney);
    if (!cleanName || cleanName.length < 2) {
      setFormError('Name must be at least 2 characters.');
      return;
    }
    if (!Number.isFinite(parsedPocket) || parsedPocket <= 0) {
      setFormError('Monthly pocket money must be greater than ₹0.');
      return;
    }

    updateProfile({
      name: cleanName,
      college: college.trim() || 'College Student',
      monthlyPocketMoney: Math.round(parsedPocket),
    });
    setMonthlyBudget(Math.round(parsedPocket));
    setFormError('');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleCustomAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024 * 2) {
      setFormError('Please select an image smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ avatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paisatrack-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Profile & Pocket Money Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Student Profile &amp; Allowance
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Updating your monthly pocket money also updates your default monthly budget cap.
        </p>

        {/* Avatar Picker */}
        <div className="mt-6 flex flex-wrap items-center gap-5 border-b border-slate-100 pb-6 dark:border-slate-800">
          <AvatarDisplay
            name={state.profile.name}
            avatarUrl={state.profile.avatarUrl}
            sizeClass="h-16 w-16 text-lg"
          />
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Choose Avatar
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => updateProfile({ avatarUrl: preset.url })}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                    state.profile.avatarUrl === preset.url
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              College &amp; Program
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Monthly Pocket Money (₹)
            </label>
            <input
              type="number"
              min="1"
              value={pocketMoney}
              onChange={(e) => setPocketMoney(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-[#0B1528] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Save Profile Changes
            </button>
            {savedToast && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                Saved to LocalStorage
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Preferences, Export & Data Controls */}
      <section className="space-y-6 lg:col-span-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Appearance
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Switch between crisp daylight mode and low-glare dark mode.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateProfile({ darkMode: false })}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                !state.profile.darkMode
                  ? 'border-[#0B1528] bg-[#0B1528] text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => updateProfile({ darkMode: true })}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                state.profile.darkMode
                  ? 'border-emerald-500 bg-emerald-600 text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Data Backup &amp; Session
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Download your records, reset demo data, or return to the welcome page.
          </p>

          <div className="mt-4 space-y-2.5">
            <button
              type="button"
              onClick={() => exportTransactionsToCSV(state.transactions)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>Export Transactions (CSV)</span>
              <Download className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>Export Full Backup (JSON)</span>
              <Download className="h-4 w-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-100/70 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              <span>Reset Demo Data</span>
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={logoutToWelcome}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>Logout / Return to Welcome Page</span>
              <LogOut className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      <ConfirmModal
        open={resetModalOpen}
        title="Reset all demo data?"
        description="This will restore the default student transactions, budgets, savings goals, and subscriptions, replacing any custom entries."
        confirmLabel="Reset Data"
        onCancel={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setResetModalOpen(false);
        }}
      />
    </div>
  );
}
