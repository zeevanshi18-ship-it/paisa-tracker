import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Bot,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PiggyBank,
  Plus,
  Settings,
  Sun,
  Target,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { usePaisa } from '../context/PaisaContext';
import { PageId } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

const NAV_ITEMS: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Budget Planner', icon: Target },
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'subscriptions', label: 'Subscriptions', icon: CalendarClock },
  { id: 'paisabot', label: 'PaisaBot', icon: Bot },
  { id: 'settings', label: 'Profile & Settings', icon: Settings },
];

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your pocket money, spending & limits' },
  transactions: { title: 'Transactions', subtitle: 'Log, search and manage all income & expenses' },
  budgets: { title: 'Budget Planner', subtitle: 'Monthly cap and category-wise spending guardrails' },
  savings: { title: 'Savings Goals', subtitle: 'Track progress toward college milestones & buffers' },
  investments: { title: 'Investments', subtitle: 'Stocks, index funds & safe places to grow extra money' },
  analytics: { title: 'Analytics', subtitle: 'Weekly, monthly & category insights with CSV export' },
  subscriptions: { title: 'Subscriptions', subtitle: 'Recurring student plans, recharges & due dates' },
  paisabot: { title: 'PaisaBot', subtitle: 'Instant rule-based answers from your real ledger' },
  settings: { title: 'Profile & Settings', subtitle: 'Personal details, theme, backup & demo controls' },
};

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const {
    state,
    summary,
    activePage,
    setActivePage,
    setQuickAddOpen,
    updateProfile,
    dismissAlert,
    logoutToWelcome,
  } = usePaisa();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const activeAlerts = summary.budgetAlerts.filter(
    (a) => !state.dismissedAlertIds.includes(a.id)
  );

  const pageMeta = PAGE_TITLES[activePage];

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[#0B1528] text-slate-200">
      {/* Brand Block */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-5">
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-tight text-white">
              PaisaTrack
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Your Money. Your Control.
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Primary Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'budgets' && activeAlerts.length > 0 && (
                <span className="ml-auto font-mono text-xs font-semibold text-amber-400">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Card & Welcome Return */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-3">
          <AvatarDisplay name={state.profile.name} avatarUrl={state.profile.avatarUrl} sizeClass="h-9 w-9 text-xs" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {state.profile.name}
            </div>
            <div className="truncate text-xs text-slate-400">
              {state.profile.college}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={logoutToWelcome}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Back to Welcome</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw]">{SidebarContent}</aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                {pageMeta.title}
              </h1>
              <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
                {pageMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Dark/Light Quick Switch */}
            <button
              type="button"
              onClick={() => updateProfile({ darkMode: !state.profile.darkMode })}
              aria-label={state.profile.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={state.profile.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              {state.profile.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Budget Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAlertsOpen((v) => !v)}
                aria-label="Budget notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <Bell className="h-4 w-4" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 font-mono text-[10px] font-bold text-white">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {alertsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setAlertsOpen(false)}
                  />
                  <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                      <span className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                        Budget Notifications
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAlertsOpen(false);
                          setActivePage('budgets');
                        }}
                        className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Manage Budgets
                      </button>
                    </div>

                    {activeAlerts.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        All categories are comfortably under 80% of their budget limits.
                      </div>
                    ) : (
                      <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto">
                        {activeAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`rounded-xl border p-3 text-xs ${
                              alert.severity === 'exceeded'
                                ? 'border-red-200 bg-red-50/70 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
                                : 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <div>
                                  <div className="font-semibold">
                                    {alert.severity === 'exceeded' ? 'Budget Exceeded' : '80% Warning'} ·{' '}
                                    {alert.scope === 'overall' ? 'Monthly Total' : alert.scope}
                                  </div>
                                  <p className="mt-0.5 leading-relaxed opacity-90">
                                    {alert.message}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => dismissAlert(alert.id)}
                                aria-label="Dismiss notification"
                                className="rounded p-0.5 opacity-60 hover:opacity-100"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick-Add Expense Button */}
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="flex h-10 items-center gap-1.5 rounded-xl bg-[#0B1528] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              onClick={() => setActivePage('settings')}
              title="Open Profile & Settings"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 py-1 pl-1.5 pr-2.5 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 md:flex"
            >
              <AvatarDisplay
                name={state.profile.name}
                avatarUrl={state.profile.avatarUrl}
                sizeClass="h-7 w-7 text-[11px]"
              />
              <span className="max-w-28 truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                {state.profile.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
