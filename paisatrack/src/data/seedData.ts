import { ExpenseCategory, IncomeCategory, InvestmentCategory, PaisaState, PaymentMethod } from '../types';

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  'Stocks',
  'Index & Mutual Funds',
  'Fixed Deposit / RD',
  'Liquid Fund',
  'Gold ETF',
];

export const STUDENT_INVESTMENT_OPTIONS: {
  id: string;
  title: string;
  category: InvestmentCategory;
  risk: 'Low' | 'Moderate' | 'High';
  minAmount: number;
  expectedCAGR: string;
  horizon: string;
  liquidity: string;
  summary: string;
  studentTip: string;
}[] = [
  {
    id: 'inv-opt-index',
    title: 'Nifty 50 Index Fund / ETF',
    category: 'Index & Mutual Funds',
    risk: 'Moderate',
    minAmount: 100,
    expectedCAGR: '11% – 13% p.a.',
    horizon: '5+ Years',
    liquidity: '2–3 Business Days',
    summary:
      'Tracks India’s top 50 blue-chip companies automatically with very low expense ratios.',
    studentTip:
      'Best starting point for college students—start a ₹500/month SIP from leftover pocket money.',
  },
  {
    id: 'inv-opt-stocks',
    title: 'Direct Stocks (Large-Cap / Blue-Chip)',
    category: 'Stocks',
    risk: 'High',
    minAmount: 100,
    expectedCAGR: '12% – 15% p.a.',
    horizon: '3 – 7+ Years',
    liquidity: 'Instant Market Hours (T+1)',
    summary:
      'Own shares directly in established Indian companies listed on NSE/BSE using a SEBI-registered demat account.',
    studentTip:
      'Keep direct stocks to 15–25% of extra funds while learning fundamentals; avoid intraday or F&O trading.',
  },
  {
    id: 'inv-opt-flexi',
    title: 'Flexi-Cap Equity Mutual Fund',
    category: 'Index & Mutual Funds',
    risk: 'High',
    minAmount: 500,
    expectedCAGR: '12% – 14% p.a.',
    horizon: '5+ Years',
    liquidity: '2–3 Business Days',
    summary:
      'Professionally managed basket spanning large, mid, and small-cap Indian businesses.',
    studentTip:
      'Ideal when you want diversification across sectors without picking individual stocks every month.',
  },
  {
    id: 'inv-opt-liquid',
    title: 'Liquid Mutual Fund / Sweep-in FD',
    category: 'Liquid Fund',
    risk: 'Low',
    minAmount: 500,
    expectedCAGR: '6.5% – 7.2% p.a.',
    horizon: '1 – 12 Months',
    liquidity: 'Same Day / T+1',
    summary:
      'Invests in ultra-short-term treasury bills and money market instruments with minimal volatility.',
    studentTip:
      'Park semester exam fees, hackathon prize money, or your emergency buffer here instead of idle cash.',
  },
  {
    id: 'inv-opt-rd',
    title: 'Student Recurring Deposit (RD) / PPF',
    category: 'Fixed Deposit / RD',
    risk: 'Low',
    minAmount: 100,
    expectedCAGR: '6.8% – 7.5% p.a.',
    horizon: '1 – 15 Years',
    liquidity: 'Fixed Term (Penalty on early exit)',
    summary:
      'Guaranteed bank or government-backed returns with zero market price swings.',
    studentTip:
      'Great for guaranteed short-term targets like next year’s hostel deposit or laptop fund.',
  },
  {
    id: 'inv-opt-gold',
    title: 'Gold ETF / Sovereign Gold',
    category: 'Gold ETF',
    risk: 'Moderate',
    minAmount: 100,
    expectedCAGR: '8% – 10% p.a.',
    horizon: '3+ Years',
    liquidity: 'T+1 via Exchange',
    summary:
      'Digital units backed by 99.5% pure gold without storage worries or making charges.',
    studentTip:
      'Allocate 5–10% of extra savings as an inflation hedge alongside equity funds.',
  },
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Shopping',
  'Travel',
  'Education',
  'Hostel',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Others',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Pocket Money',
  'Freelance',
  'Scholarship',
  'Part-Time',
  'Gift',
  'Others',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Card',
  'Bank Transfer',
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#0EA5E9',
  Hostel: '#6366F1',
  Travel: '#F59E0B',
  Education: '#10B981',
  Shopping: '#EC4899',
  Entertainment: '#8B5CF6',
  Bills: '#64748B',
  Healthcare: '#EF4444',
  Others: '#94A3B8',
};

export const AVATAR_PRESETS = [
  {
    id: 'male-portrait',
    label: 'Aarav Preset',
    url: '/src/assets/images/avatar_student_male_1795536131002.jpg',
  },
  {
    id: 'female-portrait',
    label: 'Ananya Preset',
    url: '/src/assets/images/avatar_student_female_1795536130725.jpg',
  },
  {
    id: 'initials',
    label: 'Initials Monogram',
    url: 'initials',
  },
];

export const STUDENT_MONEY_TIPS: { title: string; detail: string; category: string }[] = [
  {
    title: 'Use student ID discounts before paying full price',
    detail: 'Verify your college email on Spotify, GitHub Student Pack, Notion, and transit passes to cut recurring monthly bills by 40–70%.',
    category: 'Subscriptions',
  },
  {
    title: 'Batch your canteen & cafe UPI orders',
    detail: 'Small ₹40–₹90 impulse UPI taps add up to ₹2,000+ a month. Set a strict daily chai-and-snacks cap.',
    category: 'Food',
  },
  {
    title: 'Apply the 48-hour rule to online shopping',
    detail: 'Leave non-essential items in your cart for 48 hours. Nearly 60% of student impulse buys lose urgency after two days.',
    category: 'Shopping',
  },
  {
    title: 'Park pocket money in a separate savings bucket on Day 1',
    detail: 'Move 15–20% of your monthly allowance into your Savings Goals on the 1st of every month before discretionary spending begins.',
    category: 'Savings',
  },
  {
    title: 'Split hostel & group travel via UPI right away',
    detail: 'Log shared cab rides and group meals immediately so unsettled IOUs do not distort your personal monthly budget.',
    category: 'Travel',
  },
  {
    title: 'Audit auto-renewing OTT trials every Sunday',
    detail: 'Pause subscriptions you have not opened in 14 days and rotate one streaming platform per month during semester exams.',
    category: 'Entertainment',
  },
];

function formatOffsetDate(daysAgo: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonthDate(monthsAgo: number, day: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.min(day, 28));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatFutureDate(daysAhead: number): string {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createInitialSeedState(entered = false): PaisaState {
  const today = new Date();
  const currentDay = today.getDate();

  // Ensure current-month transactions stay inside the current month cleanly
  const safeDay = (preferredDay: number) => {
    const clamped = Math.min(preferredDay, currentDay);
    return formatMonthDate(0, Math.max(1, clamped));
  };

  return {
    profile: {
      name: 'Aarav Sharma',
      college: 'NIT Trichy · B.Tech',
      monthlyPocketMoney: 12000,
      avatarUrl: '/src/assets/images/avatar_student_male_1795536131002.jpg',
      darkMode: false,
      isEntered: entered,
    },
    monthlyBudget: 12000,
    categoryBudgets: {
      Hostel: 4500,
      Food: 3000,
      Travel: 900,
      Education: 1200,
      Shopping: 1000,
      Entertainment: 600,
      Bills: 500,
      Healthcare: 400,
      Others: 400,
    },
    transactions: [
      // Current month transactions
      {
        id: 'tx-c1',
        title: 'Monthly Pocket Money',
        amount: 12000,
        type: 'income',
        date: formatMonthDate(0, 1),
        category: 'Pocket Money',
        paymentMethod: 'Bank Transfer',
        notes: 'Allowance from home for monthly hostel & personal expenses',
      },
      {
        id: 'tx-c2',
        title: 'Hostel Mess & Room Fee',
        amount: 4500,
        type: 'expense',
        date: safeDay(2),
        category: 'Hostel',
        paymentMethod: 'UPI',
        notes: 'Monthly mess dining + hostel maintenance',
      },
      {
        id: 'tx-c3',
        title: 'UI Design Freelance Task',
        amount: 3200,
        type: 'income',
        date: safeDay(5),
        category: 'Freelance',
        paymentMethod: 'UPI',
        notes: 'Landing page wireframe for campus startup',
      },
      {
        id: 'tx-c4',
        title: 'Campus Canteen & Filter Coffee',
        amount: 420,
        type: 'expense',
        date: formatOffsetDate(1),
        category: 'Food',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-c5',
        title: 'Engineering Reference Books & Printouts',
        amount: 950,
        type: 'expense',
        date: safeDay(6),
        category: 'Education',
        paymentMethod: 'Card',
        notes: 'Lab manual + Xerox spiral binding',
      },
      {
        id: 'tx-c6',
        title: 'Metro Pass & Auto Share',
        amount: 680,
        type: 'expense',
        date: formatOffsetDate(3),
        category: 'Travel',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-c7',
        title: 'Zomato Late-Night Study Order',
        amount: 640,
        type: 'expense',
        date: formatOffsetDate(2),
        category: 'Food',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-c8',
        title: 'Campus Mart Hoodie',
        amount: 1150,
        type: 'expense',
        date: safeDay(9),
        category: 'Shopping',
        paymentMethod: 'Card',
        notes: 'Department winter hoodie',
      },
      {
        id: 'tx-c9',
        title: 'Jio 5G Student Recharge',
        amount: 349,
        type: 'expense',
        date: safeDay(4),
        category: 'Bills',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-c10',
        title: 'Weekend Movie & Popcorn',
        amount: 510,
        type: 'expense',
        date: formatOffsetDate(4),
        category: 'Entertainment',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-c11',
        title: 'Pharmacy Vitamins & First Aid',
        amount: 240,
        type: 'expense',
        date: safeDay(8),
        category: 'Healthcare',
        paymentMethod: 'Cash',
      },
      {
        id: 'tx-c12',
        title: 'South Indian Mess Extra & Fruit Bowl',
        amount: 1450,
        type: 'expense',
        date: formatOffsetDate(0),
        category: 'Food',
        paymentMethod: 'UPI',
      },
      // Previous month transactions for rich monthly comparisons
      {
        id: 'tx-p1',
        title: 'Monthly Pocket Money',
        amount: 12000,
        type: 'income',
        date: formatMonthDate(1, 1),
        category: 'Pocket Money',
        paymentMethod: 'Bank Transfer',
      },
      {
        id: 'tx-p2',
        title: 'Tutoring Junior Batch',
        amount: 2000,
        type: 'income',
        date: formatMonthDate(1, 14),
        category: 'Part-Time',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-p3',
        title: 'Hostel Mess Fee',
        amount: 4500,
        type: 'expense',
        date: formatMonthDate(1, 3),
        category: 'Hostel',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-p4',
        title: 'Food & Mess Extras',
        amount: 2650,
        type: 'expense',
        date: formatMonthDate(1, 12),
        category: 'Food',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-p5',
        title: 'Semester Exam Stationery',
        amount: 780,
        type: 'expense',
        date: formatMonthDate(1, 18),
        category: 'Education',
        paymentMethod: 'Cash',
      },
      {
        id: 'tx-p6',
        title: 'Bus Ticket Home',
        amount: 920,
        type: 'expense',
        date: formatMonthDate(1, 22),
        category: 'Travel',
        paymentMethod: 'Card',
      },
      {
        id: 'tx-p7',
        title: 'Mobile & Wi-Fi Share',
        amount: 499,
        type: 'expense',
        date: formatMonthDate(1, 9),
        category: 'Bills',
        paymentMethod: 'UPI',
      },
      // 2 months ago
      {
        id: 'tx-p2-1',
        title: 'Monthly Pocket Money',
        amount: 11500,
        type: 'income',
        date: formatMonthDate(2, 1),
        category: 'Pocket Money',
        paymentMethod: 'Bank Transfer',
      },
      {
        id: 'tx-p2-2',
        title: 'Hostel & Mess',
        amount: 4500,
        type: 'expense',
        date: formatMonthDate(2, 4),
        category: 'Hostel',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-p2-3',
        title: 'Food & Cafes',
        amount: 2900,
        type: 'expense',
        date: formatMonthDate(2, 16),
        category: 'Food',
        paymentMethod: 'UPI',
      },
      {
        id: 'tx-p2-4',
        title: 'Lab Coat & Calculators',
        amount: 1350,
        type: 'expense',
        date: formatMonthDate(2, 11),
        category: 'Education',
        paymentMethod: 'Card',
      },
    ],
    savingsGoals: [
      {
        id: 'goal-1',
        title: 'Emergency Semester Buffer',
        targetAmount: 10000,
        currentAmount: 6500,
        targetDate: formatFutureDate(75),
      },
      {
        id: 'goal-2',
        title: 'Laptop RAM & SSD Upgrade',
        targetAmount: 6500,
        currentAmount: 4200,
        targetDate: formatFutureDate(45),
      },
      {
        id: 'goal-3',
        title: 'Goa Post-Exam Trip Fund',
        targetAmount: 8000,
        currentAmount: 2800,
        targetDate: formatFutureDate(110),
      },
    ],
    subscriptions: [
      {
        id: 'sub-1',
        name: 'Spotify Student',
        amount: 59,
        billingCycle: 'monthly',
        nextPaymentDate: formatFutureDate(4),
        category: 'Entertainment',
        paymentMethod: 'UPI',
        active: true,
      },
      {
        id: 'sub-2',
        name: 'Jio 5G Prepaid Plan',
        amount: 349,
        billingCycle: 'monthly',
        nextPaymentDate: formatFutureDate(11),
        category: 'Bills',
        paymentMethod: 'UPI',
        active: true,
      },
      {
        id: 'sub-3',
        name: 'Campus Gym Membership',
        amount: 600,
        billingCycle: 'monthly',
        nextPaymentDate: formatFutureDate(2),
        category: 'Healthcare',
        paymentMethod: 'Cash',
        active: true,
      },
      {
        id: 'sub-4',
        name: 'Netflix Mobile Plan',
        amount: 149,
        billingCycle: 'monthly',
        nextPaymentDate: formatFutureDate(18),
        category: 'Entertainment',
        paymentMethod: 'Card',
        active: true,
      },
    ],
    investments: [
      {
        id: 'inv-1',
        name: 'Nifty 50 Index Fund SIP',
        category: 'Index & Mutual Funds',
        amountInvested: 3000,
        expectedReturnPct: 12,
        date: formatMonthDate(1, 5),
        notes: 'Monthly student SIP from freelance savings',
      },
      {
        id: 'inv-2',
        name: 'Blue-Chip Equity Basket (Direct Stocks)',
        category: 'Stocks',
        amountInvested: 1800,
        expectedReturnPct: 14,
        date: formatMonthDate(0, 6),
        notes: 'Long-term large-cap NSE shares',
      },
      {
        id: 'inv-3',
        name: 'Liquid Fund Emergency Parking',
        category: 'Liquid Fund',
        amountInvested: 2500,
        expectedReturnPct: 7,
        date: formatMonthDate(1, 15),
        notes: 'Safe T+1 accessible buffer',
      },
    ],
    noSpendChallenge: {
      startDate: formatOffsetDate(2),
      days: [true, true, true, false, false, false, false],
    },
    dismissedAlertIds: [],
  };
}
