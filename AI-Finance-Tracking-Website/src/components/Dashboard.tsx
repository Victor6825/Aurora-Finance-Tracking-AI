import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CreditCard,
  LineChart,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HeroSection } from './HeroSection';

const balanceTrend = [
  { month: 'Jan', current: 4200, projected: 4700 },
  { month: 'Feb', current: 4350, projected: 4920 },
  { month: 'Mar', current: 4620, projected: 5280 },
  { month: 'Apr', current: 4890, projected: 5630 },
  { month: 'May', current: 5120, projected: 5920 },
  { month: 'Jun', current: 5380, projected: 6280 },
];

const categorySpending = [
  { name: 'Housing', value: 1200 },
  { name: 'Food', value: 640 },
  { name: 'Transport', value: 310 },
  { name: 'Subscriptions', value: 220 },
  { name: 'Leisure', value: 280 },
  { name: 'Other', value: 190 },
];

const transactions = [
  {
    id: 1,
    name: 'Whole Foods Market',
    category: 'Groceries',
    amount: -82.35,
    time: '2h ago',
    flag: '+12% vs usual',
  },
  {
    id: 2,
    name: 'Rent – Skyline Lofts',
    category: 'Housing',
    amount: -1480,
    time: 'Yesterday',
    flag: 'Stable',
  },
  {
    id: 3,
    name: 'Stripe • Freelance payout',
    category: 'Income',
    amount: 2350,
    time: 'Yesterday',
    flag: '+1 new client',
  },
  {
    id: 4,
    name: 'Tesla Supercharger',
    category: 'Transport',
    amount: -24.9,
    time: '3d ago',
    flag: 'EV efficiency +6%',
  },
  {
    id: 5,
    name: 'Netflix',
    category: 'Subscriptions',
    amount: -15.99,
    time: '4d ago',
    flag: 'Clustered billing',
  },
];

const aiInsights = [
  {
    title: 'Spending efficiency this month',
    value: '+18.4%',
    tone: 'positive',
    description: 'Your net cash flow is on track to beat last month by 18.4%.',
  },
  {
    title: 'Anomaly detection',
    value: '3 events',
    tone: 'neutral',
    description: 'Slight uptick in food + mobility. No critical risk detected.',
  },
  {
    title: 'Savings runway',
    value: '7.2 months',
    tone: 'neutral',
    description: 'At current burn, runway extended by ~0.6 months vs last quarter.',
  },
];

const recommendations = [
  {
    title: 'Shift idle cash into high-yield vault',
    impact: '+$84.21 / month',
    detail: 'Move $4,000 from low-interest checking into a 4.8% APY savings vault.',
  },
  {
    title: 'Cap food delivery at $120',
    impact: 'Save $65.30 / month',
    detail: 'You are trending 32% above your 3-month baseline for deliveries.',
  },
  {
    title: 'Round-up auto-invest to 2x',
    impact: '+$2,430 / 12 months',
    detail: 'Doubling round-ups keeps your risk flat while compounding faster.',
  },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 px-4 py-5 md:px-8 md:py-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <HeroSection onGetStarted={() => navigate('/ai-chat')} />
        <HeaderSection />
        <CopilotPanel />
        <TopStats />
        <MainGrid />
      </div>
    </main>
  );
}

function HeaderSection() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
          AI FINANCE COMMAND CENTER
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50 sm:text-3xl md:text-[2.1rem]">
          One pane of glass for every financial signal you care about.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Real-time expense tracking, predictive analytics, and savings intelligence rendered
          through an always-on AI co-pilot.
        </p>
      </div>
      <motion.button
        type="button"
        onClick={() => navigate('/ai-chat')}
        className="relative group card-3d card-3d-hover flex items-center gap-3 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
        title="Tap to ask anything about your finances"
        aria-label="Open AI chat – Chat with Aurora about your finances"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/35 via-emerald-400/40 to-cyan-500/35 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500 text-slate-950 shadow-[0_0_34px_rgba(56,189,248,0.9)] sm:h-11 sm:w-11">
          <motion.div
            className="flex items-center justify-center"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.div>
          <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.95)]">
            AI
          </span>
        </div>
        <div className="relative leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-200/90">
            Ask AI Now
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-50 sm:text-[0.9rem]">
            Chat with Aurora
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-200/90 group-hover:text-emerald-100">
            Tap to ask anything about your money, spending, or goals.
          </p>
        </div>
      </motion.button>
    </div>
  );
}

function CopilotPanel() {
  return (
    <motion.section
      className="card-3d card-3d-hover flex flex-col gap-3 rounded-2xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 shadow-neon">
          <Brain className="h-5 w-5 text-slate-950" />
          <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.95)]">
            AI
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200/90">
            AURORA • AI CO-PILOT
          </p>
          <p className="mt-1 text-sm text-slate-100">
            "I'm tracking your cash flow, highlighting anomalies, and simulating savings moves so you
            don't have to."
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Today I see <span className="text-emerald-300">strong inflows</span>, a
            <span className="text-sky-300"> stable burn rate</span>, and a
            <span className="text-emerald-300"> clear path</span> to extend your runway.
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3 sm:mt-0">
        <div className="rounded-xl bg-slate-900/80 px-3 py-2 text-[11px] text-slate-300">
          <p className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.95)]" />
            Re-scoring transactions every 15s
          </p>
          <p className="mt-1 text-[10px] text-slate-400">Green = opportunity • Red = risk • Blue = stable</p>
        </div>
      </div>
    </motion.section>
  );
}

function TopStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        icon={CreditCard}
        label="Net position"
        primary="$18,420.37"
        delta="+$1,280.14"
        deltaTone="positive"
        subtitle="vs last 30 days"
      />
      <StatCard
        icon={LineChart}
        label="Projected 90-day balance"
        primary="$24,980.00"
        delta="+18.4%"
        deltaTone="positive"
        subtitle="AI forecast • medium confidence"
      />
      <StatCard
        icon={PiggyBank}
        label="Automated savings"
        primary="$640.00 / mo"
        delta="+$120.00"
        deltaTone="neutral"
        subtitle="3 new rules suggested"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  primary: string;
  delta: string;
  deltaTone: 'positive' | 'negative' | 'neutral';
  subtitle: string;
}

function StatCard({ icon: Icon, label, primary, delta, deltaTone, subtitle }: StatCardProps) {
  const DeltaIcon = deltaTone === 'negative' ? ArrowDownRight : ArrowUpRight;
  const deltaColor =
    deltaTone === 'positive'
      ? 'text-emerald-300'
      : deltaTone === 'negative'
      ? 'text-rose-300'
      : 'text-sky-300';

  const toneGlowClass =
    deltaTone === 'positive'
      ? 'glow-positive'
      : deltaTone === 'negative'
      ? 'glow-negative'
      : 'glow-neutral';

  return (
    <motion.article
      className={`card-3d card-3d-hover flex flex-col gap-3 rounded-2xl px-4 py-4 ${toneGlowClass}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Icon className="h-4 w-4 text-emerald-300/90" />
          <span className="font-medium uppercase tracking-[0.23em]">{label}</span>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
          LIVE
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-slate-50">{primary}</p>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className={`flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[11px] ${deltaColor}`}>
          <DeltaIcon className="h-3 w-3" />
          <span className="font-semibold">{delta}</span>
        </div>
      </div>
    </motion.article>
  );
}

type SentimentMode = 'confidence' | 'sentiment' | 'risk';

function SentimentPulseWidget() {
  const modes: Array<{
    id: SentimentMode;
    label: string;
    value: string;
    tone: 'positive' | 'neutral' | 'negative';
    description: string;
    detail: string;
  }> = [
    {
      id: 'confidence',
      label: 'Model confidence',
      value: '92% sure',
      tone: 'positive',
      description: 'Aurora is highly confident in your 90‑day cash flow projection.',
      detail: 'Signals are stable across income, rent, and recurring subscriptions.',
    },
    {
      id: 'sentiment',
      label: 'Financial sentiment',
      value: 'Balanced',
      tone: 'neutral',
      description: 'Spending is trending slightly up, but inflows are keeping pace.',
      detail: 'Watch food delivery and mobility to preserve your current runway.',
    },
    {
      id: 'risk',
      label: 'Risk surface',
      value: 'Low',
      tone: 'positive',
      description: 'No critical anomalies detected across connected accounts.',
      detail: 'Aurora is scanning for fraud spikes, failed debits, and card abuse.',
    },
  ];

  const [activeId, setActiveId] = useState<SentimentMode>('confidence');
  const active = modes.find((m) => m.id === activeId) ?? modes[0];

  const toneGlowClass =
    active.tone === 'positive'
      ? 'glow-positive'
      : active.tone === 'negative'
      ? 'glow-negative'
      : 'glow-neutral';

  return (
    <motion.section
      className={`card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5 ${toneGlowClass}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 shadow-neon sm:h-28 sm:w-28"
            animate={{ scale: [1, 1.06, 1], opacity: [0.95, 1, 0.95] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute inset-2 rounded-full border border-emerald-200/70"
              animate={{ opacity: [0.8, 0.2, 0.8], scale: [1, 1.16, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#22c55e,#38bdf8,#6366f1,#22c55e)] opacity-40 blur-md"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-950/80">
                AI PULSE
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{active.value}</p>
            </div>
          </motion.div>

          <div className="space-y-1 text-xs sm:text-[13px]">
            <p className="font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
              AURORA SENTIMENT
            </p>
            <p className="text-sm font-medium text-slate-50 sm:text-base">{active.label}</p>
            <p className="text-slate-300">{active.description}</p>
            <p className="text-[11px] text-slate-400">{active.detail}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3 md:mt-0 md:items-end">
          <div className="flex gap-2 text-[10px] sm:text-[11px]">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveId(mode.id)}
                className={`rounded-full border px-3 py-1 font-semibold uppercase tracking-[0.18em] transition-colors ${
                  mode.id === active.id
                    ? 'border-emerald-400 bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.9)]'
                    : 'border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-emerald-400/70 hover:text-emerald-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            Pulse intensity reflects Aurora&apos;s confidence and risk balance in your current trajectory.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function AIIntelligenceCore() {
  const [isExpanded, setIsExpanded] = useState(false);

  const coreMetrics = {
    confidence: '92.7%',
    latency: '42 ms',
    health: 'Stable',
    insights: '12 active signals',
    training: 'Nightly • next cycle in 3h',
  };

  return (
    <>
      <motion.section
        className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5 glow-neutral"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        whileHover={{ translateY: -4 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.div
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 shadow-neon sm:h-28 sm:w-28"
              animate={{ scale: [1, 1.04, 1], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-3 rounded-full border border-emerald-200/60"
                animate={{ opacity: [0.8, 0.3, 0.8], scale: [1, 1.15, 1] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-1 rounded-full bg-[conic-gradient(from_120deg_at_50%_50%,#22c55e,#38bdf8,#e5e7eb,#22c55e)] opacity-35 blur-md"
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative flex flex-col items-center justify-center text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-950/90">
                  INTEL CORE
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">{coreMetrics.confidence}</p>
                <p className="mt-0.5 text-[10px] text-slate-900/80">prediction confidence</p>
              </div>
            </motion.div>

            <div className="space-y-1 text-xs sm:text-[13px]">
              <p className="font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                AURORA INTELLIGENCE CORE
              </p>
              <p className="text-sm font-medium text-slate-50 sm:text-base">
                Real-time readout of model health, latency, and active insights.
              </p>
              <p className="text-[11px] text-slate-400">
                Aurora continuously scores your graph for drift, anomalies, and savings opportunities while
                keeping latency low enough for live guidance.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:mt-0 md:items-end">
            <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs">
              <div className="rounded-xl border border-emerald-400/50 bg-slate-950/70 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                  SYSTEM HEALTH
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">{coreMetrics.health}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">Latency {coreMetrics.latency}</p>
              </div>
              <div className="rounded-xl border border-sky-400/40 bg-slate-950/70 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
                  ACTIVE INSIGHTS
                </p>
                <p className="mt-1 text-sm font-semibold text-sky-300">{coreMetrics.insights}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">Streaming across all accounts.</p>
              </div>
              <div className="rounded-xl border border-indigo-400/40 bg-slate-950/70 px-3 py-2 col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300/90">
                  TRAINING CYCLE
                </p>
                <p className="mt-1 text-sm font-semibold text-indigo-300">{coreMetrics.training}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Incremental updates keep the model fresh without sacrificing stability.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200 hover:bg-emerald-400/20"
            >
              Expand intelligence panel
            </button>
          </div>
        </div>
      </motion.section>

      {isExpanded && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
            aria-label="Close AI intelligence panel"
            onClick={() => setIsExpanded(false)}
          />
          <motion.div
            className="relative z-10 w-full max-w-4xl rounded-3xl border border-slate-700/80 bg-slate-950/95 px-5 py-5 sm:px-7 sm:py-7 card-3d card-3d-hover"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/90">
                  AURORA • INTELLIGENCE CORE STATUS
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-50">
                  Live model telemetry and AI system health.
                </p>
                <p className="mt-2 text-[13px] text-slate-300">
                  Use this surface to plug in deeper monitoring—per-feature drift, training timelines,
                  and explainability traces—without disturbing the main dashboard layout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 hover:border-emerald-400/80 hover:text-emerald-200"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-400/60 bg-slate-950/80 px-4 py-3 text-xs text-slate-200">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                  Prediction confidence
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">{coreMetrics.confidence}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Weighted across your top signals with conservative calibration to avoid over-confidence.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-400/50 bg-slate-950/80 px-4 py-3 text-xs text-slate-200">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
                  Runtime latency
                </p>
                <p className="mt-2 text-2xl font-semibold text-sky-300">{coreMetrics.latency}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  End-to-end time from event ingestion to surfaced recommendation.
                </p>
              </div>
              <div className="rounded-2xl border border-indigo-400/60 bg-slate-950/80 px-4 py-3 text-xs text-slate-200">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300/90">
                  Training cadence
                </p>
                <p className="mt-2 text-sm font-semibold text-indigo-300">{coreMetrics.training}</p>
                <p className="mt-2 text-[11px] text-slate-400">
                  Ideal for plugging in your own pipeline metadata and evaluation dashboards.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function MainGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
      <div className="space-y-5 lg:col-span-2">
        <SentimentPulseWidget />
        <section className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-6 sm:py-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                  PREDICTIVE BALANCE CURVE
                </p>
                <p className="text-xs text-slate-400">Projected cash position over the next 6 months.</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-slate-900/70 p-1 text-[10px]">
              {['1M', '3M', '6M'].map((label, i) => (
                <button
                  key={label}
                  className={`rounded-full px-2 py-1 font-semibold tracking-[0.14em] ${
                    i === 2
                      ? 'bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(52,211,153,0.9)]'
                      : 'text-slate-300 hover:text-emerald-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="currentBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="projectedBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(51,65,85,0.7)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(51,65,85,0.7)' }}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(51,65,85,0.7)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.6)',
                    padding: '8px 10px',
                    fontSize: 11,
                    color: '#e5e7eb',
                  }}
                  labelStyle={{ fontSize: 11, color: '#a5b4fc', marginBottom: 4 }}
                  cursor={{ stroke: 'rgba(148,163,184,0.6)', strokeDasharray: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fill="url(#projectedBalance)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#22c55e"
                  strokeWidth={2.2}
                  fill="url(#currentBalance)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {aiInsights.map((insight) => (
            <motion.article
              key={insight.title}
              className={`card-3d card-3d-hover rounded-2xl px-4 py-4 text-xs ${
                insight.tone === 'positive'
                  ? 'glow-positive'
                  : insight.tone === 'negative'
                  ? 'glow-negative'
                  : 'glow-neutral'
              }`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                AI INSIGHT
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">{insight.title}</p>
              <p className="mt-3 text-2xl font-semibold text-emerald-300">{insight.value}</p>
              <p className="mt-2 text-[11px] text-slate-400">{insight.description}</p>
            </motion.article>
          ))}
        </section>

        <AIIntelligenceCore />
      </div>

      <div className="space-y-5">
        <section className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/90">
                  AI RECOMMENDATIONS
                </p>
                <p className="text-xs text-slate-400">Curated levers to optimize your savings and yield.</p>
              </div>
            </div>
          </header>
          <div className="mt-4 space-y-3">
            {recommendations.map((rec) => (
              <motion.div
                key={rec.title}
                className="flex items-start justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3 py-3 text-xs card-3d-hover"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div>
                  <p className="font-semibold text-slate-50">{rec.title}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{rec.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-emerald-300">{rec.impact}</p>
                  <button className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 hover:bg-emerald-400/15 hover:text-emerald-200">
                    Simulate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <LineChart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200/90">
                  CATEGORY DRIFT
                </p>
                <p className="text-xs text-slate-400">Where your spending has moved in the last 30 days.</p>
              </div>
            </div>
          </header>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySpending} barSize={20}>
                <CartesianGrid stroke="rgba(51,65,85,0.7)" vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(51,65,85,0.7)' }}
                />
                <YAxis
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(51,65,85,0.7)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.6)',
                    padding: '8px 10px',
                    fontSize: 11,
                    color: '#e5e7eb',
                  }}
                  labelStyle={{ fontSize: 11, color: '#a5b4fc', marginBottom: 4 }}
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill="url(#categoryDrift)"
                />
                <defs>
                  <linearGradient id="categoryDrift" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/90">
                  LIVE CASH FLOW
                </p>
                <p className="text-xs text-slate-400">Recent inflows and outflows across your accounts.</p>
              </div>
            </div>
          </header>
          <ul className="mt-3 space-y-2 text-xs">
            {transactions.slice(0, 4).map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2 hover:border-emerald-400/60 hover:bg-slate-900/80"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">{tx.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {tx.category} · {tx.time}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.amount < 0 ? 'text-rose-300' : 'text-emerald-300'
                    }`}
                  >
                    {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{tx.flag}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/live-flow')}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200 hover:bg-emerald-400/20 hover:text-emerald-50"
            >
              See more live flow
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
