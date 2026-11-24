import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createInitialSeedState } from '../data/seedData';
import {
  ExpenseCategory,
  InvestmentItem,
  PageId,
  PaisaState,
  SavingsGoal,
  Subscription,
  Transaction,
  UserProfile,
} from '../types';
import { advanceBillingDate, computeDashboardSummary, getTodayISO } from '../utils/finance';

const STORAGE_KEY = 'paisatrack_app_state_v1';

interface PaisaContextValue {
  state: PaisaState;
  summary: ReturnType<typeof computeDashboardSummary>;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;
  setMonthlyBudget: (amount: number) => void;
  setCategoryBudget: (category: ExpenseCategory, amount: number) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<Omit<SavingsGoal, 'id'>>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id'>>) => void;
  deleteSubscription: (id: string) => void;
  markSubscriptionPaid: (id: string) => void;
  addInvestment: (item: Omit<InvestmentItem, 'id'>) => void;
  updateInvestment: (id: string, updates: Partial<Omit<InvestmentItem, 'id'>>) => void;
  deleteInvestment: (id: string) => void;
  toggleNoSpendDay: (dayIndex: number) => void;
  resetNoSpendChallenge: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  dismissAlert: (alertId: string) => void;
  enterDashboard: (customSetup?: { name?: string; college?: string; monthlyPocketMoney?: number }) => void;
  logoutToWelcome: () => void;
  resetDemoData: () => void;
}

const PaisaContext = createContext<PaisaContextValue | null>(null);

function loadStateFromStorage(): PaisaState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSeedState(false);
    const parsed = JSON.parse(raw) as Partial<PaisaState>;
    const fallback = createInitialSeedState(false);
    return {
      ...fallback,
      ...parsed,
      profile: {
        ...fallback.profile,
        ...(parsed.profile || {}),
      },
      categoryBudgets: {
        ...fallback.categoryBudgets,
        ...(parsed.categoryBudgets || {}),
      },
      noSpendChallenge: parsed.noSpendChallenge || fallback.noSpendChallenge,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : fallback.transactions,
      savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : fallback.savingsGoals,
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : fallback.subscriptions,
      investments: Array.isArray(parsed.investments) ? parsed.investments : fallback.investments,
      dismissedAlertIds: Array.isArray(parsed.dismissedAlertIds) ? parsed.dismissedAlertIds : [],
    };
  } catch {
    return createInitialSeedState(false);
  }
}

export function PaisaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PaisaState>(() => loadStateFromStorage());
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Sync LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors gracefully
    }
  }, [state]);

  // Sync Dark Mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.profile.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.profile.darkMode]);

  const summary = useMemo(() => computeDashboardSummary(state), [state]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const setMonthlyBudget = (amount: number) => {
    setState((prev) => ({
      ...prev,
      monthlyBudget: Math.max(0, amount),
    }));
  };

  const setCategoryBudget = (category: ExpenseCategory, amount: number) => {
    setState((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [category]: Math.max(0, amount),
      },
    }));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, newGoal],
    }));
  };

  const updateSavingsGoal = (id: string, updates: Partial<Omit<SavingsGoal, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteSavingsGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
    }));
  };

  const contributeToGoal = (id: string, amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      ),
    }));
  };

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...sub,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      subscriptions: [...prev.subscriptions, newSub],
    }));
  };

  const updateSubscription = (id: string, updates: Partial<Omit<Subscription, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubscription = (id: string) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((s) => s.id !== id),
    }));
  };

  const addInvestment = (item: Omit<InvestmentItem, 'id'>) => {
    const newItem: InvestmentItem = {
      ...item,
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      investments: [newItem, ...prev.investments],
    }));
  };

  const updateInvestment = (id: string, updates: Partial<Omit<InvestmentItem, 'id'>>) => {
    setState((prev) => ({
      ...prev,
      investments: prev.investments.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
    }));
  };

  const deleteInvestment = (id: string) => {
    setState((prev) => ({
      ...prev,
      investments: prev.investments.filter((inv) => inv.id !== id),
    }));
  };

  const markSubscriptionPaid = (id: string) => {
    setState((prev) => {
      const target = prev.subscriptions.find((s) => s.id === id);
      if (!target) return prev;
      const loggedTx: Transaction = {
        id: `tx-sub-${Date.now()}`,
        title: `${target.name} Renewal`,
        amount: target.amount,
        type: 'expense',
        date: getTodayISO(),
        category: target.category,
        paymentMethod: target.paymentMethod,
        notes: `Recurring ${target.billingCycle} subscription payment`,
      };
      return {
        ...prev,
        transactions: [loggedTx, ...prev.transactions],
        subscriptions: prev.subscriptions.map((s) =>
          s.id === id
            ? { ...s, nextPaymentDate: advanceBillingDate(s.nextPaymentDate, s.billingCycle) }
            : s
        ),
      };
    });
  };

  const toggleNoSpendDay = (dayIndex: number) => {
    setState((prev) => {
      const days = [...prev.noSpendChallenge.days];
      days[dayIndex] = !days[dayIndex];
      return {
        ...prev,
        noSpendChallenge: {
          startDate: prev.noSpendChallenge.startDate || getTodayISO(),
          days,
        },
      };
    });
  };

  const resetNoSpendChallenge = () => {
    setState((prev) => ({
      ...prev,
      noSpendChallenge: {
        startDate: getTodayISO(),
        days: [false, false, false, false, false, false, false],
      },
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
      },
    }));
  };

  const dismissAlert = (alertId: string) => {
    setState((prev) => ({
      ...prev,
      dismissedAlertIds: [...prev.dismissedAlertIds, alertId],
    }));
  };

  const enterDashboard = (customSetup?: {
    name?: string;
    college?: string;
    monthlyPocketMoney?: number;
  }) => {
    setState((prev) => ({
      ...prev,
      monthlyBudget:
        customSetup?.monthlyPocketMoney && customSetup.monthlyPocketMoney > 0
          ? customSetup.monthlyPocketMoney
          : prev.monthlyBudget,
      profile: {
        ...prev.profile,
        name: customSetup?.name?.trim() || prev.profile.name,
        college: customSetup?.college?.trim() || prev.profile.college,
        monthlyPocketMoney:
          customSetup?.monthlyPocketMoney && customSetup.monthlyPocketMoney > 0
            ? customSetup.monthlyPocketMoney
            : prev.profile.monthlyPocketMoney,
        isEntered: true,
      },
    }));
    setActivePage('dashboard');
  };

  const logoutToWelcome = () => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        isEntered: false,
      },
    }));
  };

  const resetDemoData = () => {
    const fresh = createInitialSeedState(true);
    fresh.profile.darkMode = state.profile.darkMode;
    setState(fresh);
    setActivePage('dashboard');
  };

  return (
    <PaisaContext.Provider
      value={{
        state,
        summary,
        activePage,
        setActivePage,
        quickAddOpen,
        setQuickAddOpen,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setMonthlyBudget,
        setCategoryBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        markSubscriptionPaid,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        toggleNoSpendDay,
        resetNoSpendChallenge,
        updateProfile,
        dismissAlert,
        enterDashboard,
        logoutToWelcome,
        resetDemoData,
      }}
    >
      {children}
    </PaisaContext.Provider>
  );
}

export function usePaisa() {
  const ctx = useContext(PaisaContext);
  if (!ctx) throw new Error('usePaisa must be used within PaisaProvider');
  return ctx;
}
