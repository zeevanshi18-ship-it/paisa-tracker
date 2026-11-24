export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Education'
  | 'Hostel'
  | 'Entertainment'
  | 'Bills'
  | 'Healthcare'
  | 'Others';

export type IncomeCategory =
  | 'Pocket Money'
  | 'Freelance'
  | 'Scholarship'
  | 'Part-Time'
  | 'Gift'
  | 'Others';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export type PageId =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'savings'
  | 'investments'
  | 'analytics'
  | 'subscriptions'
  | 'paisabot'
  | 'settings';

export type InvestmentCategory =
  | 'Stocks'
  | 'Index & Mutual Funds'
  | 'Fixed Deposit / RD'
  | 'Liquid Fund'
  | 'Gold ETF';

export interface InvestmentItem {
  id: string;
  name: string;
  category: InvestmentCategory;
  amountInvested: number;
  expectedReturnPct: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  category: TransactionCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  active: boolean;
}

export interface NoSpendChallenge {
  startDate: string | null;
  days: boolean[]; // length 7
}

export interface UserProfile {
  name: string;
  college: string;
  monthlyPocketMoney: number;
  avatarUrl: string;
  darkMode: boolean;
  isEntered: boolean;
}

export interface PaisaState {
  profile: UserProfile;
  transactions: Transaction[];
  monthlyBudget: number;
  categoryBudgets: Record<ExpenseCategory, number>;
  savingsGoals: SavingsGoal[];
  subscriptions: Subscription[];
  investments: InvestmentItem[];
  noSpendChallenge: NoSpendChallenge;
  dismissedAlertIds: string[];
}

export interface BudgetAlert {
  id: string;
  scope: 'overall' | ExpenseCategory;
  severity: 'warning' | 'exceeded';
  spent: number;
  limit: number;
  percentage: number;
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  highlights?: { label: string; value: string }[];
}
