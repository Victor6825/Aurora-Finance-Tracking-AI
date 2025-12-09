import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArchiveRestore, ChevronDown, Sparkles, X } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type LiveCategory = 'All' | 'Groceries' | 'Housing' | 'Income' | 'Transport' | 'Subscriptions' | 'Other';

type LiveSort = 'newest' | 'amount-desc' | 'category';

interface LiveTransaction {
  id: number;
  name: string;
  category: Exclude<LiveCategory, 'All'>;
  amount: number;
  time: string;
  note: string;
  sortIndex: number; // higher = newer
}

const LIVE_TRANSACTIONS: LiveTransaction[] = [
  {
    id: 1,
    name: 'Whole Foods Market',
    category: 'Groceries',
    amount: -82.35,
    time: '2h ago',
    note: '+12% vs usual',
    sortIndex: 100,
  },
  {
    id: 2,
    name: 'Rent – Skyline Lofts',
    category: 'Housing',
    amount: -1480,
    time: 'Yesterday',
    note: 'Stable',
    sortIndex: 40,
  },
  {
    id: 3,
    name: 'Stripe • Freelance payout',
    category: 'Income',
    amount: 2350,
    time: 'Yesterday',
    note: '+1 new client',
    sortIndex: 85,
  },
  {
    id: 4,
    name: 'Tesla Supercharger',
    category: 'Transport',
    amount: -24.9,
    time: '3d ago',
    note: 'EV efficiency +6%',
    sortIndex: 70,
  },
  {
    id: 5,
    name: 'Netflix',
    category: 'Subscriptions',
    amount: -15.99,
    time: '4d ago',
    note: 'Clustered billing',
    sortIndex: 60,
  },
  {
    id: 6,
    name: 'Uber',
    category: 'Transport',
    amount: -18.4,
    time: '4d ago',
    note: '+21% vs typical week',
    sortIndex: 55,
  },
  {
    id: 7,
    name: 'High-yield vault top-up',
    category: 'Income',
    amount: -300,
    time: '6d ago',
    note: 'Savings automation rule',
    sortIndex: 40,
  },
];

function getLiveTransactionInsight(tx: LiveTransaction): string {
  if (tx.category === 'Groceries') {
    return 'Groceries are trending above your recent baseline. Dialing this back slightly would keep you on target.';
  }
  if (tx.category === 'Housing') {
    return 'Housing appears stable relative to prior months. Aurora is monitoring for rent or fee changes.';
  }
  if (tx.category === 'Income') {
    return 'Income event detected. Consider routing a portion into savings or your investment sleeve.';
  }
  if (tx.category === 'Transport') {
    return 'Mobility spend is mildly elevated. If this persists, we can suggest adjustments to keep burn steady.';
  }
  if (tx.category === 'Subscriptions') {
    return 'Subscription activity is clustered. Periodic audits here can unlock easy savings.';
  }
  return 'Transaction aligns with your typical pattern. No anomalies detected.';
}

interface CashFlowPoint {
  label: string;
  inflow: number;
  outflow: number;
}

const BASE_CASH_FLOW_POINTS: CashFlowPoint[] = [
  { label: 'Now-30m', inflow: 0, outflow: 45 },
  { label: 'Now-25m', inflow: 220, outflow: 24 },
  { label: 'Now-20m', inflow: 0, outflow: 18 },
  { label: 'Now-15m', inflow: 0, outflow: 64 },
  { label: 'Now-10m', inflow: 0, outflow: 36 },
  { label: 'Now-5m', inflow: 520, outflow: 28 },
  { label: 'Now', inflow: 0, outflow: 82 },
  { label: '+5m', inflow: 180, outflow: 20 },
  { label: '+10m', inflow: 0, outflow: 32 },
  { label: '+15m', inflow: 0, outflow: 16 },
  { label: '+20m', inflow: 260, outflow: 22 },
  { label: '+25m', inflow: 0, outflow: 40 },
];

interface LiveSuggestion {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
}

const LIVE_SUGGESTIONS: LiveSuggestion[] = [
  {
    id: 'suggest-1',
    title: 'Pause media subscriptions',
    description: '4 clustered streaming and media charges detected in the last 24 hours.',
    actionLabel: 'Audit subscriptions',
  },
  {
    id: 'suggest-2',
    title: 'Move $300 into your vault',
    description:
      'A recent income event leaves roughly $320 unallocated after bills and goals for this week.',
    actionLabel: 'Move $300 to vault',
  },
  {
    id: 'suggest-3',
    title: 'Smooth out transport spikes',
    description:
      'Transport spend is ~21% above your typical pattern. A soft cap or off-peak routing could stabilise burn.',
    actionLabel: 'Tune transport rules',
  },
];

function PulseGraph({ riskScore }: { riskScore: number }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const clampedScore = Math.min(Math.max(riskScore, 0), 100);
  // Keep amplitude changes subtle so the wave feels like a steady river
  const intensity = 0.95 + (clampedScore / 100) * 0.35;

  return (
    <div
      className="relative h-16 w-full overflow-hidden rounded-xl bg-slate-950/80 ring-1 ring-sky-500/40 shadow-[0_0_28px_rgba(56,189,248,0.45)] sm:h-20"
      aria-hidden="true"
    >
      <svg viewBox="0 0 160 40" className="h-full w-full">
        <defs>
          <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 20 Q 10 10 20 20 T 40 20 T 60 20 T 80 20 T 100 20 T 120 20 T 140 20 T 160 20"
          stroke="url(#pulseGradient)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 10"
          style={{ originY: 0.5 }}
          initial={{ strokeDashoffset: 0, opacity: 0.85 }}
          animate={
            prefersReducedMotion
              ? { strokeDashoffset: 0, opacity: 0.9 }
              : { strokeDashoffset: -120, opacity: [0.8, 1, 0.8], scaleY: intensity }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'linear',
                  opacity: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
                }
          }
        />
      </svg>
    </div>
  );
}

export function LiveFlowPage() {
  const [category, setCategory] = useState<LiveCategory>('All');
  const [sortBy, setSortBy] = useState<LiveSort>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>(LIVE_TRANSACTIONS);
  const [archivedTransactions, setArchivedTransactions] = useState<LiveTransaction[]>([]);
  const [flowSeries, setFlowSeries] = useState<CashFlowPoint[]>(() =>
    BASE_CASH_FLOW_POINTS.slice(0, 7),
  );
  const flowIndexRef = useRef<number>(7);
  const [suggestions, setSuggestions] = useState<LiveSuggestion[]>(LIVE_SUGGESTIONS);
  const [archivedSuggestions, setArchivedSuggestions] = useState<LiveSuggestion[]>([]);
  const [riskScore, setRiskScore] = useState(18);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveSelection, setArchiveSelection] = useState<string[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowSeries((current) => {
        const nextIndex = flowIndexRef.current % BASE_CASH_FLOW_POINTS.length;
        const nextPoint = BASE_CASH_FLOW_POINTS[nextIndex];
        flowIndexRef.current = nextIndex + 1;

        const updated = [...current, nextPoint];
        return updated.length > 12 ? updated.slice(updated.length - 12) : updated;
      });
    }, 900);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!flowSeries.length) return;
    const netValues = flowSeries.map((point) => point.inflow - point.outflow);
    const mean =
      netValues.reduce((sum, value) => sum + value, 0) / netValues.length || 0;
    const variance =
      netValues.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) /
        netValues.length || 0;
    const stdev = Math.sqrt(variance);
    const normalized = Math.min(stdev / 300, 1);
    const score = Math.round(normalized * 100);
    setRiskScore(score);
  }, [flowSeries]);

  const filteredAndSorted = useMemo(() => {
    let items = liveTransactions;
    if (category !== 'All') {
      items = items.filter((tx) => tx.category === category);
    }

    const sorted = [...items];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.sortIndex - a.sortIndex);
    } else if (sortBy === 'amount-desc') {
      sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    } else if (sortBy === 'category') {
      sorted.sort((a, b) => a.category.localeCompare(b.category));
    }
    return sorted;
  }, [category, sortBy, liveTransactions]);

  const handleDismissSuggestion = (id: string, mode: 'dismiss' | 'archive' = 'dismiss') => {
    setSuggestions((previous) => {
      const suggestionToArchive =
        mode === 'archive' ? previous.find((item) => item.id === id) : undefined;

      if (suggestionToArchive && mode === 'archive') {
        setArchivedSuggestions((archived) =>
          archived.some((item) => item.id === id) ? archived : [...archived, suggestionToArchive],
        );
      }

      return previous.filter((suggestion) => suggestion.id !== id);
    });
  };

  const handleArchiveTransaction = (id: number) => {
    const txToArchive = liveTransactions.find((item) => item.id === id);
    if (!txToArchive) return;

    setLiveTransactions((previous) => previous.filter((item) => item.id !== id));
    setArchivedTransactions((previous) =>
      previous.some((item) => item.id === id) ? previous : [...previous, txToArchive],
    );
    setExpandedId((current) => (current === id ? null : current));
  };

  const handleToggleArchiveSelection = (selectionId: string) => {
    setArchiveSelection((current) =>
      current.includes(selectionId)
        ? current.filter((value) => value !== selectionId)
        : [...current, selectionId],
    );
  };

  const handleRestoreSelected = () => {
    if (!archiveSelection.length) return;
    setArchivedTransactions((previous) => {
      const toRestore = previous.filter((item) => archiveSelection.includes(`tx-${item.id}`));
      if (toRestore.length) {
        setLiveTransactions((live) => [...toRestore, ...live]);
      }
      return previous.filter((item) => !archiveSelection.includes(`tx-${item.id}`));
    });

    setArchivedSuggestions((previous) => {
      const toRestore = previous.filter((item) => archiveSelection.includes(`sg-${item.id}`));
      if (toRestore.length) {
        setSuggestions((current) => [...toRestore, ...current]);
      }
      return previous.filter((item) => !archiveSelection.includes(`sg-${item.id}`));
    });

    setArchiveSelection([]);
    setIsArchiveOpen(false);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 px-4 py-5 md:px-8 md:py-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
              LIVE FLOW
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">Real-time Cash Flow</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              A stream-first view of every inflow and outflow Aurora is watching across your accounts.
            </p>
          </div>
          <div className="card-3d card-3d-hover flex items-center gap-3 rounded-2xl px-4 py-3 text-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
              <Activity className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-50">Live event stream</p>
              <p className="text-[11px] text-slate-400">Optimized for real-time feeds and anomaly alerts.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-4 lg:items-start">
          <motion.section
            className="card-3d card-3d-hover flex flex-col rounded-2xl px-4 py-4 sm:px-5 sm:py-5 lg:col-span-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                  Real-time cash flow
                </p>
                <p className="mt-1 text-[13px] text-slate-400">
                  Overlay of inflows and outflows as Aurora ingests live events.
                </p>
              </div>
              <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400 sm:mt-0">
                <div className="flex items-center gap-1">
                  <span
                    className="h-1.5 w-4 rounded-full bg-emerald-400/80"
                    aria-hidden="true"
                  />
                  <span>Inflow</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-4 rounded-full bg-rose-400/80" aria-hidden="true" />
                  <span>Outflow</span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2 sm:px-4 sm:py-3">
              <div className="h-40 w-full" aria-label="Real-time cash flow graph">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={flowSeries}
                    margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#1f2937',
                        borderRadius: 12,
                        fontSize: 11,
                        color: '#E5E7EB',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value) => (
                        <span style={{ color: '#9CA3AF' }}>{value}</span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="inflow"
                      name="Inflow"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="linear"
                    />
                    <Line
                      type="monotone"
                      dataKey="outflow"
                      name="Outflow"
                      stroke="#fb7185"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive
                      animationDuration={900}
                      animationEasing="linear"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                  Live transaction feed
                </p>
                <p className="mt-1 text-[13px] text-slate-400">
                  Stream of recent charges, payouts, and automations as Aurora scores your activity.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
                  <span className="text-slate-400">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LiveCategory)}
                    className="bg-transparent text-emerald-200 focus:outline-none"
                  >
                    {['All', 'Groceries', 'Housing', 'Income', 'Transport', 'Subscriptions', 'Other'].map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-2 py-1">
                  <span className="text-slate-400">Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as LiveSort)}
                    className="bg-transparent text-emerald-200 focus:outline-none"
                  >
                    <option value="newest" className="bg-slate-900 text-slate-100">
                      Newest
                    </option>
                    <option value="amount-desc" className="bg-slate-900 text-slate-100">
                      Largest amount
                    </option>
                    <option value="category" className="bg-slate-900 text-slate-100">
                      Category
                    </option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsArchiveOpen((open) => !open)}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-500/70 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-100 hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70"
                  aria-expanded={isArchiveOpen}
                  aria-controls="liveflow-archive-panel"
                >
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  Unarchive Items
                </button>
              </div>
            </div>

            {isArchiveOpen && (
              <div
                id="liveflow-archive-panel"
                className="mt-3 rounded-2xl border border-slate-800/80 bg-slate-950/90 px-3 py-3 text-[11px] text-slate-200 sm:px-4"
                role="dialog"
                aria-modal="false"
                aria-label="Archived transactions"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Archived items
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {archivedTransactions.length || archivedSuggestions.length
                        ? 'Select items to restore.'
                        : 'No archived items available to restore.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsArchiveOpen(false)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700/80 bg-slate-950/80 text-slate-400 hover:border-slate-500 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70"
                    aria-label="Close archived items panel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {(archivedTransactions.length > 0 || archivedSuggestions.length > 0) && (
                  <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1 scroll-soft">
                    {archivedTransactions.map((tx) => {
                      const selectionId = `tx-${tx.id}`;
                      return (
                        <label
                          key={tx.id}
                          className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 px-2 py-2 text-left hover:border-emerald-400/70 hover:bg-slate-900/80"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-950 text-emerald-400 focus:ring-emerald-500"
                            checked={archiveSelection.includes(selectionId)}
                            onChange={() => handleToggleArchiveSelection(selectionId)}
                            aria-label={`Select ${tx.name} to restore`}
                          />
                          <div className="flex-1">
                            <p className="flex items-center justify-between gap-2 text-[11px] text-slate-100">
                              <span className="truncate">{tx.name}</span>
                              <span
                                className={`whitespace-nowrap ${
                                  tx.amount < 0 ? 'text-rose-300' : 'text-emerald-300'
                                }`}
                              >
                                {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                              </span>
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {tx.category} · {tx.time}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                    {archivedSuggestions.map((suggestion) => {
                      const selectionId = `sg-${suggestion.id}`;
                      return (
                        <label
                          key={`sg-${suggestion.id}`}
                          className="flex items-start gap-2 rounded-xl border border-slate-800/80 bg-slate-950/80 px-2 py-2 text-left hover:border-emerald-400/70 hover:bg-slate-900/80"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-950 text-emerald-400 focus:ring-emerald-500"
                            checked={archiveSelection.includes(selectionId)}
                            onChange={() => handleToggleArchiveSelection(selectionId)}
                            aria-label={`Select suggestion ${suggestion.title} to restore`}
                          />
                          <div className="flex-1">
                            <p className="flex items-center justify-between gap-2 text-[11px] text-slate-100">
                              <span className="truncate">{suggestion.title}</span>
                              <span className="whitespace-nowrap text-[10px] text-sky-300">
                                AI suggestion
                              </span>
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {suggestion.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                {(archivedTransactions.length > 0 || archivedSuggestions.length > 0) && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-500">
                      Restoring moves items back into the live stream and AI suggestion panels.
                    </p>
                    <button
                      type="button"
                      onClick={handleRestoreSelected}
                      disabled={!archiveSelection.length}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        archiveSelection.length
                          ? 'bg-emerald-500/90 text-slate-950 shadow-[0_0_22px_rgba(16,185,129,0.7)] hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80'
                          : 'cursor-not-allowed bg-slate-800/80 text-slate-500'
                      }`}
                    >
                      Restore selected
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1 text-xs scroll-soft">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-2">
                          <div className="h-3 w-40 rounded bg-slate-700/70" />
                          <div className="h-3 w-28 rounded bg-slate-800/70" />
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="ml-auto h-3 w-16 rounded bg-slate-700/70" />
                          <div className="ml-auto h-3 w-24 rounded bg-slate-800/70" />
                        </div>
                      </div>
                    </div>
                  ))
                : filteredAndSorted.map((tx) => {
                    const isExpanded = expandedId === tx.id;
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={() =>
                          setExpandedId((current) => (current === tx.id ? null : tx.id))
                        }
                        className="cursor-pointer rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-3 text-xs hover:border-emerald-400/60 hover:bg-slate-900/80 card-3d-hover"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-100">{tx.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {tx.category} · {tx.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <p
                                className={`text-sm font-semibold ${
                                  tx.amount < 0 ? 'text-rose-300' : 'text-emerald-300'
                                }`}
                              >
                                {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId((current) =>
                                    current === tx.id ? null : tx.id,
                                  );
                                }}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 text-slate-400 transition-colors hover:border-emerald-400/80 hover:text-emerald-200"
                                aria-label={
                                  isExpanded
                                    ? 'Collapse transaction details'
                                    : 'Expand transaction details'
                                }
                              >
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-400">{tx.note}</p>
                          </div>
                        </div>
                        <motion.div
                          initial={false}
                          animate={
                            isExpanded
                              ? { opacity: 1, height: 'auto', marginTop: 8 }
                              : { opacity: 0, height: 0, marginTop: 0 }
                          }
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          className="overflow-hidden text-[11px] text-slate-300"
                        >
                          <div className="border-t border-slate-800/80 pt-2">
                            <p className="text-slate-300">
                              <span className="font-semibold text-slate-100">Merchant:</span>{' '}
                              {tx.name}
                            </p>
                            <p className="mt-1 text-slate-300">
                              <span className="font-semibold text-slate-100">Category:</span>{' '}
                              {tx.category}
                            </p>
                            <p className="mt-1 text-slate-300">
                              <span className="font-semibold text-slate-100">Amount:</span>{' '}
                              {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                            </p>
                            <p className="mt-1 text-slate-300">
                              <span className="font-semibold text-slate-100">When:</span> {tx.time}
                            </p>
                            <p className="mt-1 text-slate-300">
                              <span className="font-semibold text-slate-100">Signal:</span> {tx.note}
                            </p>
                            <p className="mt-2 text-[10px] text-emerald-200/90">
                              Aurora:
                              <span className="ml-1 text-slate-200">
                                {getLiveTransactionInsight(tx)}
                              </span>
                            </p>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleArchiveTransaction(tx.id);
                                }}
                                className="rounded-full border border-slate-700/80 px-3 py-1 text-[10px] text-slate-300 hover:border-emerald-400/80 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                              >
                                Archive from live feed
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
            </div>
          </motion.section>

          <section
            className="card-3d card-3d-hover rounded-2xl px-4 py-4 text-xs text-slate-300 sm:px-5 sm:py-5"
            aria-label="AI suggestions based on recent activity"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <PulseGraph riskScore={riskScore} />
              </div>
              <div
                className="mt-1 flex flex-col items-start text-[11px] text-slate-300 sm:mt-0 sm:items-end"
                role="group"
                aria-label="Live risk score"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                  Risk score
                </p>
                <p className="mt-0.5 text-sm font-semibold text-sky-200">
                  {riskScore}
                  <span className="text-[11px] text-slate-400">/100</span>
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">lower is better</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                  AI suggestions
                </p>
                <p className="mt-1 text-sm text-slate-100">
                  Aurora is scanning your stream for savings and risk moves.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-[11px] text-slate-300" aria-label="AI suggestion list">
              {suggestions.map((suggestion) => (
                <motion.li
                  key={suggestion.id}
                  layout
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-slate-950/90 to-sky-500/10 px-3 py-2 shadow-[0_0_24px_rgba(16,185,129,0.6)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-50">{suggestion.title}</p>
                      <p className="mt-1 text-[11px] text-slate-200">{suggestion.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismissSuggestion(suggestion.id, 'dismiss')}
                      className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/60 bg-slate-950/80 text-slate-300 hover:border-emerald-400 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                      aria-label={`Dismiss suggestion: ${suggestion.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {suggestion.actionLabel && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_26px_rgba(16,185,129,0.8)] hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                      >
                        {suggestion.actionLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissSuggestion(suggestion.id, 'archive')}
                        className="rounded-full border border-slate-700/80 px-2.5 py-1 text-[10px] text-slate-300 hover:border-slate-500 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70"
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </motion.li>
              ))}
              {suggestions.length === 0 && (
                <li className="rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-400">
                  No active suggestions. As new patterns appear in your stream, Aurora will surface them here.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
