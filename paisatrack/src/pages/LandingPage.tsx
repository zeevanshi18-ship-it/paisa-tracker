import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  PiggyBank,
  ShieldCheck,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import { usePaisa } from '../context/PaisaContext';
import { formatINR } from '../utils/finance';

export function LandingPage() {
  const { state, enterDashboard } = usePaisa();
  const [setupOpen, setSetupOpen] = useState(false);
  const [nameInput, setNameInput] = useState(state.profile.name);
  const [collegeInput, setCollegeInput] = useState(state.profile.college);
  const [pocketInput, setPocketInput] = useState(String(state.profile.monthlyPocketMoney));
  const [formError, setFormError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleStartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    const parsedBudget = Number(pocketInput);
    if (!cleanName || cleanName.length < 2) {
      setFormError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setFormError('Please enter a valid monthly pocket money amount in ₹.');
      return;
    }
    enterDashboard({
      name: cleanName,
      college: collegeInput.trim() || 'College Student',
      monthlyPocketMoney: Math.round(parsedBudget),
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight text-[#0B1528] dark:text-white whitespace-nowrap shrink-0"
          >
            PaisaTrack
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a
              href="#capabilities"
              className="transition-colors hover:text-[#0B1528] hover:underline dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="transition-colors hover:text-[#0B1528] hover:underline dark:hover:text-white whitespace-nowrap shrink-0"
            >
              How it Works
            </a>
            <a
              href="#student-tools"
              className="transition-colors hover:text-[#0B1528] hover:underline dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Student Tools
            </a>
            <a
              href="#paisabot-preview"
              className="transition-colors hover:text-[#0B1528] hover:underline dark:hover:text-white whitespace-nowrap shrink-0"
            >
              PaisaBot
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => enterDashboard()}
              className="rounded-xl bg-[#0B1528] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Split Section */}
      <section id="top" className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
                Built for college students in India · INR (₹) Native · 100% LocalStorage
              </p>
              <h1
                className="mt-4 font-display font-extrabold tracking-tight text-[#0B1528] dark:text-white"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)', lineHeight: 1.08, textWrap: 'balance' }}
              >
                Your Money. Your Control.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                Track pocket money, daily UPI canteen spends, hostel mess fees, and semester
                savings goals in one clean workspace—with live budget guardrails and instant
                answers from PaisaBot.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSetupOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 whitespace-nowrap shrink-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => enterDashboard()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <span>Explore Demo Dashboard</span>
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Instant setup · Zero sign-up friction</span>
                <span aria-hidden="true">·</span>
                <span>Preloaded with realistic campus ledger</span>
                <span aria-hidden="true">·</span>
                <span>Works offline in your browser</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              {!imgError ? (
                <img
                  src="/src/assets/images/hero_student_fintech_1795536131190.jpg"
                  alt="Indian college student managing coursework and personal finances at a sunlit library desk"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover lg:h-full"
                />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-[#0B1528] to-slate-800 p-8 text-center text-white">
                  <Wallet className="h-12 w-12 text-emerald-400" />
                  <p className="mt-4 font-display text-lg font-semibold">PaisaTrack Student Ledger</p>
                  <p className="mt-1 text-sm text-slate-300">Pocket money, UPI logs, and savings goals</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent p-6">
                <div className="flex flex-wrap items-end justify-between gap-4 text-white">
                  <div>
                    <div className="text-xs font-medium text-emerald-300">Live Campus Workspace</div>
                    <div className="mt-0.5 font-display text-base font-semibold">
                      Every rupee accounted for across UPI, Cash &amp; Card
                    </div>
                  </div>
                  <div className="font-mono text-sm font-semibold tabular-nums text-white">
                    Sample Budget: {formatINR(state.monthlyBudget)}/mo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Proof / Capability Strip below Hero Split */}
        <div className="mt-10 grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/70 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Expense Categories</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              9 Campus Buckets
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Food, Hostel, Travel, Education, Bills &amp; more
            </p>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Smart Guardrails</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              80% &amp; 100% Alerts
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Automatic warnings before you overspend
            </p>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Daily Pacing</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              Real-Time Limit
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Safe daily spend based on remaining days
            </p>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Data Privacy</div>
            <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              100% LocalStorage
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Export CSV or JSON backups anytime
            </p>
          </div>
        </div>
      </section>

      {/* Asymmetric Capabilities Grid */}
      <section id="capabilities" className="border-t border-slate-200 bg-slate-50/50 py-16 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#0B1528] dark:text-white sm:text-3xl">
              Everything required to stretch monthly pocket money without guesswork
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Built around how students in India actually spend—from morning filter coffee UPI taps
              to semester hostel fees and shared cab rides.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-semibold">01. Live Dashboard &amp; Analytics</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white">
                Instant visibility across balance, burn rate, and category splits
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Every time you log or edit a transaction, your daily spending curve, Income vs.
                Expense comparison, category pie breakdown, and Financial Health Score recalculate
                immediately.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Payment Tracking</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    UPI, Cash, Card &amp; Bank
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Reporting Cadence</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    Weekly &amp; Monthly Views
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Portable Records</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    One-Click CSV Export
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <Target className="h-5 w-5" />
                <span className="text-xs font-semibold">02. Budget Guardrails</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white">
                80% warnings before month-end crunch
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Set an overall monthly cap and individual limits for Food, Hostel, Travel, and
                Shopping. PaisaTrack flags approaching limits at 80% and overruns past 100%.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                <PiggyBank className="h-5 w-5" />
                <span className="text-xs font-semibold">03. Savings Goals &amp; Subscriptions</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white">
                Save for gear, trips &amp; recurring renewals
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Track target dates for laptop upgrades or emergency buffers, and keep Spotify,
                mobile recharges, and gym dues from catching you off guard.
              </p>
            </div>

            <div
              id="paisabot-preview"
              className="rounded-2xl border border-slate-200 bg-[#0B1528] p-6 text-white dark:border-slate-800 lg:col-span-2"
            >
              <div className="flex items-center gap-3 text-emerald-400">
                <Bot className="h-5 w-5" />
                <span className="text-xs font-semibold">04. Built-In PaisaBot Assistant</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold text-white">
                Ask plain questions about your real numbers—no external AI keys required
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Query your saved LocalStorage ledger anytime: find out where you are spending the
                most, which category exceeded its budget, how much you spent this month, and how
                much you can safely save.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-emerald-300">
                <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5">
                  &ldquo;Where am I spending the most?&rdquo;
                </span>
                <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5">
                  &ldquo;Which category exceeds my budget?&rdquo;
                </span>
                <span className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5">
                  &ldquo;How much can I save?&rdquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow & Student Tools */}
      <section id="workflow" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="student-tools" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-display text-2xl font-bold text-[#0B1528] dark:text-white">
                How PaisaTrack works in 3 steps
              </h2>
              <ol className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B1528] font-mono text-xs font-bold text-white dark:bg-emerald-600">
                    01
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Set your monthly pocket money &amp; category limits
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Start with our realistic student template or enter your own allowance and
                      hostel/food budget.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B1528] font-mono text-xs font-bold text-white dark:bg-emerald-600">
                    02
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Log expenses in seconds with Quick Add
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Record UPI, Cash, Card, or Bank Transfers from any page and watch your daily
                      limit adjust automatically.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B1528] font-mono text-xs font-bold text-white dark:bg-emerald-600">
                    03
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Build habits with the 7-Day No-Spend Challenge &amp; Health Score
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Track your financial health out of 100, review weekly analytics, and fund your
                      savings goals.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/70">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Ready to take control?</span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#0B1528] dark:text-white">
                  Jump straight into your student finance command center
                </h2>
                <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Preloaded with realistic campus demo data you can reset anytime</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Light and Dark modes designed for late-night study sessions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Zero accounts, zero API keys, instant browser persistence</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSetupOpen(true)}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  Personalize &amp; Get Started
                </button>
                <button
                  type="button"
                  onClick={() => enterDashboard()}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  Continue as {state.profile.name.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <div className="font-display font-semibold text-slate-800 dark:text-slate-200">
            PaisaTrack · Your Money. Your Control.
          </div>
          <div>Designed for Indian college students · All data stored locally in your browser</div>
        </div>
      </footer>

      {/* Quick Get Started Setup Modal */}
      {setupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Set Up Your Student Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personalize your dashboard before entering.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSetupOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close setup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStartSubmit} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Your Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  College / Course
                </label>
                <input
                  type="text"
                  value={collegeInput}
                  onChange={(e) => setCollegeInput(e.target.value)}
                  placeholder="e.g. Delhi University · B.Com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Monthly Pocket Money / Budget (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  value={pocketInput}
                  onChange={(e) => setPocketInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSetupOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Launch Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
