import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Edit2,
  Landmark,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ConfirmModal } from '../components/ConfirmModal';
import { usePaisa } from '../context/PaisaContext';
import { INVESTMENT_CATEGORIES, STUDENT_INVESTMENT_OPTIONS } from '../data/seedData';
import { InvestmentCategory, InvestmentItem } from '../types';
import { formatINR, getTodayISO } from '../utils/finance';

type RiskProfile = 'conservative' | 'balanced' | 'growth';

const ALLOCATION_PROFILES: Record<
  RiskProfile,
  {
    label: string;
    description: string;
    splits: { name: string; pct: number; color: string; hint: string }[];
  }
> = {
  conservative: {
    label: 'Conservative Starter',
    description: 'Best if your emergency buffer is still under ₹5,000 or you need funds this year.',
    splits: [
      { name: 'Liquid Fund / Sweep-in FD', pct: 55, color: '#0EA5E9', hint: 'Instant safety net' },
      { name: 'Nifty 50 Index Fund', pct: 30, color: '#10B981', hint: 'Steady equity core' },
      { name: 'Gold ETF', pct: 10, color: '#F59E0B', hint: 'Inflation hedge' },
      { name: 'Direct Stocks', pct: 5, color: '#6366F1', hint: 'Small learning allocation' },
    ],
  },
  balanced: {
    label: 'Balanced Student',
    description: 'Recommended when your monthly expenses are covered and you can invest for 3+ years.',
    splits: [
      { name: 'Nifty 50 / Flexi-Cap Funds', pct: 45, color: '#10B981', hint: 'Diversified growth' },
      { name: 'Liquid Fund / RD', pct: 25, color: '#0EA5E9', hint: 'Semester emergency reserve' },
      { name: 'Direct Stocks (Blue-Chip)', pct: 20, color: '#6366F1', hint: 'Large-cap NSE stocks' },
      { name: 'Gold ETF', pct: 10, color: '#F59E0B', hint: 'Stability hedge' },
    ],
  },
  growth: {
    label: 'Long-Term Growth',
    description: 'For 5+ year horizons when you already hold a solid emergency buffer.',
    splits: [
      { name: 'Index & Flexi-Cap Funds', pct: 50, color: '#10B981', hint: 'Core wealth engine' },
      { name: 'Direct Stocks (Equity)', pct: 30, color: '#6366F1', hint: 'Long-term compounders' },
      { name: 'Liquid Fund Reserve', pct: 10, color: '#0EA5E9', hint: 'Dry powder / buffer' },
      { name: 'Gold ETF', pct: 10, color: '#F59E0B', hint: 'Diversification' },
    ],
  },
};

const INVEST_CATEGORY_COLORS: Record<InvestmentCategory, string> = {
  Stocks: '#6366F1',
  'Index & Mutual Funds': '#10B981',
  'Fixed Deposit / RD': '#0EA5E9',
  'Liquid Fund': '#14B8A6',
  'Gold ETF': '#F59E0B',
};

export function InvestmentsPage() {
  const { state, summary, addInvestment, updateInvestment, deleteInvestment } = usePaisa();

  // Real surplus calculated from current month ledger
  const suggestedExtraCash = Math.max(0, summary.netMonthlySavings);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('balanced');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Moderate' | 'High'>('All');

  // SIP / Compounding simulator
  const [monthlySip, setMonthlySip] = useState<number>(() =>
    suggestedExtraCash >= 500 ? Math.min(5000, Math.round(suggestedExtraCash / 2 / 100) * 100) : 1000
  );
  const [annualReturn, setAnnualReturn] = useState<number>(12);
  const [years, setYears] = useState<number>(5);

  // Portfolio Log Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvestmentItem | null>(null);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState<InvestmentCategory>('Index & Mutual Funds');
  const [invAmount, setInvAmount] = useState('');
  const [invReturnPct, setInvReturnPct] = useState('12');
  const [invDate, setInvDate] = useState(getTodayISO());
  const [invNotes, setInvNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<InvestmentItem | null>(null);

  const totalPortfolioInvested = useMemo(
    () => state.investments.reduce((sum, item) => sum + item.amountInvested, 0),
    [state.investments]
  );

  const weightedReturnPct = useMemo(() => {
    if (totalPortfolioInvested <= 0) return 0;
    const weighted = state.investments.reduce(
      (sum, item) => sum + item.amountInvested * item.expectedReturnPct,
      0
    );
    return Math.round((weighted / totalPortfolioInvested) * 10) / 10;
  }, [state.investments, totalPortfolioInvested]);

  const allocationBasis = suggestedExtraCash > 0 ? suggestedExtraCash : 2000;
  const activeProfile = ALLOCATION_PROFILES[riskProfile];

  const filteredOptions = useMemo(() => {
    if (riskFilter === 'All') return STUDENT_INVESTMENT_OPTIONS;
    return STUDENT_INVESTMENT_OPTIONS.filter((opt) => opt.risk === riskFilter);
  }, [riskFilter]);

  const sipProjectionSeries = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const data: { year: string; invested: number; projectedValue: number }[] = [];

    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const invested = monthlySip * months;
      const projectedValue =
        monthlyRate > 0
          ? Math.round(
              monthlySip *
                ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
                (1 + monthlyRate)
            )
          : invested;
      data.push({
        year: `Yr ${y}`,
        invested,
        projectedValue,
      });
    }
    return data;
  }, [monthlySip, annualReturn, years]);

  const finalProjection = sipProjectionSeries[sipProjectionSeries.length - 1] || {
    invested: 0,
    projectedValue: 0,
  };
  const estimatedGain = Math.max(0, finalProjection.projectedValue - finalProjection.invested);

  const openLogModal = (preset?: {
    name?: string;
    category?: InvestmentCategory;
    returnPct?: number;
    amount?: number;
  }) => {
    setEditingItem(null);
    setInvName(preset?.name || '');
    setInvCategory(preset?.category || 'Stocks');
    setInvAmount(String(preset?.amount || (suggestedExtraCash >= 500 ? 1000 : 500)));
    setInvReturnPct(String(preset?.returnPct || 12));
    setInvDate(getTodayISO());
    setInvNotes('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (item: InvestmentItem) => {
    setEditingItem(item);
    setInvName(item.name);
    setInvCategory(item.category);
    setInvAmount(String(item.amountInvested));
    setInvReturnPct(String(item.expectedReturnPct));
    setInvDate(item.date);
    setInvNotes(item.notes || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = invName.trim();
    const amt = Number(invAmount);
    const ret = Number(invReturnPct);

    if (!cleanName || cleanName.length < 2) {
      setFormError('Enter an investment name (e.g. Nifty 50 Index Fund or Tata Motors).');
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setFormError('Invested amount must be greater than ₹0.');
      return;
    }
    if (!Number.isFinite(ret) || ret < 0 || ret > 50) {
      setFormError('Expected annual return should be between 0% and 50%.');
      return;
    }
    if (!invDate) {
      setFormError('Select a valid date.');
      return;
    }

    if (editingItem) {
      updateInvestment(editingItem.id, {
        name: cleanName,
        category: invCategory,
        amountInvested: Math.round(amt),
        expectedReturnPct: Math.round(ret * 10) / 10,
        date: invDate,
        notes: invNotes.trim() || undefined,
      });
    } else {
      addInvestment({
        name: cleanName,
        category: invCategory,
        amountInvested: Math.round(amt),
        expectedReturnPct: Math.round(ret * 10) / 10,
        date: invDate,
        notes: invNotes.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Surplus & Portfolio Summary Banner */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-[#0B1528] p-5 text-white dark:border-slate-800">
          <div className="text-xs font-medium text-emerald-400">Monthly Investable Surplus</div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
            {formatINR(suggestedExtraCash)}
          </div>
          <p className="mt-1 text-xs text-slate-300">
            {suggestedExtraCash > 0
              ? 'Income minus expenses this month'
              : 'No surplus yet this month — reduce spending to unlock extra cash'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total Portfolio Logged</span>
            <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatINR(totalPortfolioInvested)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {state.investments.length} holding{state.investments.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Weighted Expected Return</span>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {weightedReturnPct}% p.a.
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Blended across your logged assets
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Safety Checklist</span>
              <ShieldCheck className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Keep 2–3 months of hostel &amp; food expenses in a Liquid Fund before buying volatile stocks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openLogModal()}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log New Investment</span>
          </button>
        </div>
      </section>

      {/* Recommended Extra Money Split + SIP Compounding Simulator */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Allocation Split */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                How to Split Extra Money
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sample plan for {formatINR(allocationBasis)}{' '}
                {suggestedExtraCash > 0 ? '(your current surplus)' : '(example surplus)'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['conservative', 'balanced', 'growth'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setRiskProfile(key)}
                className={`rounded-lg px-2 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  riskProfile === key
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {activeProfile.description}
          </p>

          <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeProfile.splits}
                    dataKey="pct"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={2}
                  >
                    {activeProfile.splits.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: unknown) => `${val}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {activeProfile.splits.map((item) => {
                const rupeeShare = Math.round((allocationBasis * item.pct) / 100);
                return (
                  <div key={item.name} className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-xs"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        {formatINR(rupeeShare)}
                      </span>
                    </div>
                    <div className="mt-0.5 pl-4 text-[11px] text-slate-500 dark:text-slate-400">
                      {item.pct}% · {item.hint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIP & Compounding Wealth Simulator */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Student SIP &amp; Stock Compounding Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                See how investing small pocket-money surpluses grows over college and early career
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Projected Value in {years} yr{years > 1 ? 's' : ''}
              </div>
              <div className="font-mono text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatINR(finalProjection.projectedValue)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Monthly Investment</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatINR(monthlySip)}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={10000}
                step={100}
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Expected Return</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {annualReturn}% p.a.
                </span>
              </div>
              <input
                type="range"
                min={6}
                max={18}
                step={0.5}
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Time Horizon</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {years} Year{years > 1 ? 's' : ''}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-600"
              />
            </div>
          </div>

          <div className="mt-4 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sipProjectionSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" strokeOpacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${Math.round(v / 1000)}k`}`}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    formatINR(Number(value)),
                    name === 'projectedValue' ? 'Projected Value' : 'Total Invested',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="projectedValue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#projGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#64748B"
                  strokeWidth={1.5}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">
              Total Invested:{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                {formatINR(finalProjection.invested)}
              </strong>
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              Estimated Wealth Gain:{' '}
              <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                +{formatINR(estimatedGain)}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Where to Invest Extra Money Guide */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Where to Invest Extra Money
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practical options in India for students—from low-risk Liquid Funds to Index Funds &amp; Direct Stocks
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            {(['All', 'Low', 'Moderate', 'High'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  riskFilter === r
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {r === 'All' ? 'All Risk Levels' : `${r} Risk`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredOptions.map((opt) => (
            <div
              key={opt.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {opt.category} · {opt.risk} Risk
                    </div>
                    <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                      {opt.title}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {opt.expectedCAGR}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {opt.summary}
                </p>

                <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-xs dark:border-slate-800">
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-slate-400">Min Start</dt>
                    <dd className="mt-0.5 font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                      {formatINR(opt.minAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-slate-400">Horizon</dt>
                    <dd className="mt-0.5 font-medium text-slate-900 dark:text-white">
                      {opt.horizon}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-500 dark:text-slate-400">Liquidity</dt>
                    <dd className="mt-0.5 truncate font-medium text-slate-900 dark:text-white">
                      {opt.liquidity}
                    </dd>
                  </div>
                </dl>

                <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="font-semibold">Student Playbook:</strong> {opt.studentTip}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  openLogModal({
                    name: opt.title,
                    category: opt.category,
                    returnPct: opt.risk === 'High' ? 13 : opt.risk === 'Moderate' ? 11 : 7,
                    amount: Math.max(opt.minAmount, 500),
                  })
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <span>Track in My Portfolio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tracked Investment Portfolio Log */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              My Tracked Investments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep record of your SIPs, direct stocks, FDs, and emergency funds
            </p>
          </div>
          <button
            type="button"
            onClick={() => openLogModal()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1528] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Holding</span>
          </button>
        </div>

        {state.investments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              No investments logged yet
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pick any option above—such as Nifty 50 Index Funds or Blue-Chip Stocks—to start tracking.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {state.investments.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-xs"
                    style={{ backgroundColor: INVEST_CATEGORY_COLORS[item.category] || '#10B981' }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.category} · Est. {item.expectedReturnPct}% p.a. · {item.date}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatINR(item.amountInvested)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      aria-label={`Edit ${item.name}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.name}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400"
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

      {/* Add / Edit Investment Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Investment' : 'Log Investment'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvestment} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Asset / Fund / Stock Name
                </label>
                <input
                  type="text"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="e.g. Nifty 50 Index Fund or TCS Shares"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={invCategory}
                    onChange={(e) => setInvCategory(e.target.value as InvestmentCategory)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {INVESTMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Amount Invested (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Expected Return (% p.a.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={invReturnPct}
                    onChange={(e) => setInvReturnPct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="SIP date, broker, or holding thesis"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
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
                  {editingItem ? 'Save Changes' : 'Add Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove investment record?"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}" (${formatINR(deleteTarget.amountInvested)}) from your portfolio log?`
            : ''
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteInvestment(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
