import React, { useMemo, useRef, useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { usePaisa } from '../context/PaisaContext';
import { EXPENSE_CATEGORIES } from '../data/seedData';
import { ChatMessage } from '../types';
import { formatINR } from '../utils/finance';

const SUGGESTED_QUESTIONS = [
  'Where am I spending the most?',
  'Where should I invest my extra money?',
  'How much did I spend this month?',
  'How much can I save?',
  'Which category exceeds my budget?',
  'What is my daily spending limit?',
];

export function PaisaBotPage() {
  const { state, summary } = usePaisa();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-bot',
      sender: 'bot',
      timestamp: 'Now',
      text: `Hi ${state.profile.name.split(' ')[0]}! I am PaisaBot, your offline student finance assistant. Everything I answer comes directly from your saved PaisaTrack ledger. Tap a question below or ask about your spending, budgets, savings, or subscriptions.`,
    },
  ]);

  const generateBotReply = useMemo(() => {
    return (query: string): Omit<ChatMessage, 'id' | 'sender' | 'timestamp'> => {
      const q = query.toLowerCase();

      const exceededCats = EXPENSE_CATEGORIES.filter((cat) => {
        const limit = state.categoryBudgets[cat] || 0;
        const spent = summary.categorySpend[cat] || 0;
        return limit > 0 && spent > limit;
      });

      const warningCats = EXPENSE_CATEGORIES.filter((cat) => {
        const limit = state.categoryBudgets[cat] || 0;
        const spent = summary.categorySpend[cat] || 0;
        return limit > 0 && spent <= limit && spent >= limit * 0.8;
      });

      // 1. Highest spending category
      if (q.includes('most') || q.includes('highest') || q.includes('top category')) {
        const { category, amount } = summary.highestCategory;
        if (amount === 0) {
          return {
            text: 'You have not logged any expenses for the current month yet, so there is no top spending category.',
          };
        }
        const pct =
          summary.monthlyExpenses > 0
            ? Math.round((amount / summary.monthlyExpenses) * 100)
            : 0;
        return {
          text: `Your highest spending category this month is ${category}, accounting for ${pct}% of your monthly expenses. Consider checking if small impulse orders or recurring dues inside ${category} can be trimmed.`,
          highlights: [
            { label: 'Top Category', value: category },
            { label: 'Spent This Month', value: formatINR(amount) },
            { label: 'Share of Spend', value: `${pct}%` },
          ],
        };
      }

      // 2. Exceeded or warning categories
      if (q.includes('exceed') || q.includes('over budget') || q.includes('limit') && q.includes('category')) {
        if (exceededCats.length === 0 && warningCats.length === 0) {
          return {
            text: 'Great news! None of your 9 expense categories have exceeded their monthly budget or crossed the 80% warning mark.',
            highlights: [
              { label: 'Monthly Spent', value: formatINR(summary.monthlyExpenses) },
              { label: 'Monthly Cap', value: formatINR(state.monthlyBudget) },
            ],
          };
        }
        const exceededLines = exceededCats.map(
          (c) =>
            `${c} (${formatINR(summary.categorySpend[c])} spent vs ${formatINR(state.categoryBudgets[c])} limit)`
        );
        const warningLines = warningCats.map(
          (c) =>
            `${c} (${Math.round((summary.categorySpend[c] / state.categoryBudgets[c]) * 100)}% used)`
        );

        return {
          text: [
            exceededLines.length > 0
              ? `Exceeded categories: ${exceededLines.join('; ')}.`
              : 'No categories have exceeded 100% yet.',
            warningLines.length > 0
              ? `Approaching limit (80%+): ${warningLines.join('; ')}.`
              : '',
          ]
            .filter(Boolean)
            .join(' '),
          highlights: exceededCats.slice(0, 3).map((c) => ({
            label: `${c} Overrun`,
            value: `+${formatINR(summary.categorySpend[c] - state.categoryBudgets[c])}`,
          })),
        };
      }

      // 3. How much spent this month
      if (q.includes('spend this month') || q.includes('spent this month') || q.includes('total expense')) {
        const pct =
          state.monthlyBudget > 0
            ? Math.round((summary.monthlyExpenses / state.monthlyBudget) * 100)
            : 0;
        return {
          text: `You have spent ${formatINR(summary.monthlyExpenses)} so far this month, which is ${pct}% of your ${formatINR(state.monthlyBudget)} monthly budget. Your average daily burn is ${formatINR(summary.averageDailyExpense)}/day.`,
          highlights: [
            { label: 'Month Expenses', value: formatINR(summary.monthlyExpenses) },
            { label: 'Remaining Budget', value: formatINR(summary.remainingBudget) },
            { label: 'Avg Daily Spend', value: formatINR(summary.averageDailyExpense) },
          ],
        };
      }

      // 4. How much can I save
      if (q.includes('save') || q.includes('savings')) {
        const net = summary.netMonthlySavings;
        const projectedSafeSave = Math.max(
          0,
          Math.round(summary.remainingBudget * 0.4)
        );
        return {
          text:
            net > 0
              ? `Based on this month's income (${formatINR(summary.monthlyIncome)}) minus expenses (${formatINR(summary.monthlyExpenses)}), your current monthly surplus is ${formatINR(net)} (${summary.savingsRate}% savings rate). You also have ${formatINR(summary.totalGoalSavings)} saved across ${state.savingsGoals.length} goals.`
              : `Your expenses this month currently exceed your logged monthly income by ${formatINR(Math.abs(net))}. Try trimming ${summary.highestCategory.category} or starting the 7-Day No-Spend Challenge to rebuild a surplus.`,
          highlights: [
            { label: 'Monthly Surplus', value: formatINR(net) },
            { label: 'Savings Rate', value: `${summary.savingsRate}%` },
            { label: 'Suggested Buffer', value: formatINR(projectedSafeSave) },
          ],
        };
      }

      // 5. Daily spending limit
      if (q.includes('daily') || q.includes('per day') || q.includes('today')) {
        return {
          text: `With ${formatINR(Math.max(0, summary.remainingBudget))} remaining across ${summary.remainingDays} day(s) left in the month, your safe daily spending limit is ${formatINR(summary.dailySpendingLimit)}/day.`,
          highlights: [
            { label: 'Daily Limit', value: `${formatINR(summary.dailySpendingLimit)}/day` },
            { label: 'Days Remaining', value: String(summary.remainingDays) },
          ],
        };
      }

      // 6. Subscriptions
      if (q.includes('subscription') || q.includes('netflix') || q.includes('spotify') || q.includes('recurring')) {
        const activeSubs = state.subscriptions.filter((s) => s.active);
        return {
          text: `You have ${activeSubs.length} active recurring subscription(s) totaling roughly ${formatINR(summary.monthlySubscriptionTotal)}/month (${activeSubs.map((s) => `${s.name}: ${formatINR(s.amount)}`).join(', ') || 'none'}).`,
          highlights: [
            { label: 'Monthly Subscriptions', value: formatINR(summary.monthlySubscriptionTotal) },
            { label: 'Active Plans', value: String(activeSubs.length) },
          ],
        };
      }

      // 7. Investments, stocks, SIPs, extra money
      if (
        q.includes('invest') ||
        q.includes('stock') ||
        q.includes('sip') ||
        q.includes('mutual fund') ||
        q.includes('extra money') ||
        q.includes('nifty')
      ) {
        const surplus = Math.max(0, summary.netMonthlySavings);
        const totalInvested = state.investments.reduce((s, i) => s + i.amountInvested, 0);
        const stockSuggestion = Math.round(surplus * 0.2);
        const indexSuggestion = Math.round(surplus * 0.45);
        const liquidSuggestion = Math.round(surplus * 0.25);

        return {
          text:
            surplus > 0
              ? `You currently have ${formatINR(surplus)} in monthly surplus (plus ${formatINR(totalInvested)} already tracked in your portfolio). A balanced student split is putting ~45% (${formatINR(indexSuggestion)}) into a Nifty 50 Index Fund SIP, ~25% (${formatINR(liquidSuggestion)}) into a Liquid Fund emergency buffer, ~20% (${formatINR(stockSuggestion)}) into long-term Blue-Chip Stocks, and ~10% into Gold ETFs.`
              : `You currently have ${formatINR(totalInvested)} in tracked investments, but no net surplus yet this month. First build a surplus by staying under your ${formatINR(state.monthlyBudget)} cap, then start with a ₹500/month Nifty 50 Index Fund SIP or Liquid Fund before picking direct stocks.`,
          highlights: [
            { label: 'Monthly Surplus', value: formatINR(surplus) },
            { label: 'Portfolio Logged', value: formatINR(totalInvested) },
            { label: 'Suggested Index SIP', value: surplus > 0 ? formatINR(indexSuggestion) : '₹500/mo' },
          ],
        };
      }

      // 8. Health score / balance / specific category lookup
      const matchedCategory = EXPENSE_CATEGORIES.find((cat) => q.includes(cat.toLowerCase()));
      if (matchedCategory) {
        const spent = summary.categorySpend[matchedCategory] || 0;
        const limit = state.categoryBudgets[matchedCategory] || 0;
        return {
          text: `For ${matchedCategory} this month, you have spent ${formatINR(spent)} against a budget of ${formatINR(limit)}.`,
          highlights: [
            { label: `${matchedCategory} Spent`, value: formatINR(spent) },
            { label: 'Budget Limit', value: formatINR(limit) },
            { label: 'Remaining', value: formatINR(limit - spent) },
          ],
        };
      }

      // Default helpful snapshot
      return {
        text: `Here is your live snapshot: Total Balance is ${formatINR(summary.totalBalance)}, Monthly Expenses are ${formatINR(summary.monthlyExpenses)}, and your Financial Health Score is ${summary.healthScore}/100. Ask me about your top spending category, budget overruns, daily limit, or how much you can save.`,
        highlights: [
          { label: 'Balance', value: formatINR(summary.totalBalance) },
          { label: 'Health Score', value: `${summary.healthScore}/100` },
          { label: 'Top Category', value: summary.highestCategory.category },
        ],
      };
    };
  }, [state, summary]);

  const sendMessage = (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean) return;

    const nowLabel = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: nowLabel,
    };

    const reply = generateBotReply(clean);
    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: reply.text,
      highlights: reply.highlights,
      timestamp: nowLabel,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Main Chat Panel */}
      <div className="flex h-[calc(100vh-13rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-8">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B1528] text-emerald-400 dark:bg-emerald-600 dark:text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                PaisaBot Financial Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rule-based insights computed from your live local data
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  msg.sender === 'bot'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'bg-[#0B1528] text-white dark:bg-slate-700'
                }`}
              >
                {msg.sender === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0B1528] text-white dark:bg-emerald-600'
                    : 'border border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200'
                }`}
              >
                <p>{msg.text}</p>

                {msg.highlights && msg.highlights.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-200/80 pt-3 dark:border-slate-800 sm:grid-cols-3">
                    {msg.highlights.map((h) => (
                      <div key={h.label} className="rounded-lg bg-white p-2 dark:bg-slate-900">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {h.label}
                        </div>
                        <div className="font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                          {h.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-1.5 text-[10px] opacity-60">{msg.timestamp}</div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input Box */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-100 p-4 dark:border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Food spend, budget overruns, savings, or daily limit..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>

      {/* Suggested Prompts Sidebar */}
      <aside className="space-y-4 lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Suggested Questions
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Click any prompt for an instant breakdown from your ledger.
          </p>

          <div className="mt-4 space-y-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-left text-xs font-medium text-slate-800 transition-colors hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/30"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Live Data Scope
          </h3>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Transactions Analyzed</dt>
              <dd className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                {state.transactions.length}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Monthly Spend</dt>
              <dd className="font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
                {formatINR(summary.monthlyExpenses)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Daily Limit</dt>
              <dd className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatINR(summary.dailySpendingLimit)}/day
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
