import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Grid3X3,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';

type CohortDimension = 'category' | 'merchant' | 'time';
type TimeSeriesMetric = 'savings' | 'volume';

interface DrilldownInsight {
  source: 'overview' | 'cohort' | 'correlation' | 'timeseries' | 'anomaly';
  title: string;
  description: string;
  bullets: string[];
}

const cohortByCategoryData = [
  { cohort: 'Essentials', avgSpend: 3200, avgSavings: 540, users: 120 },
  { cohort: 'Growth', avgSpend: 4800, avgSavings: 910, users: 75 },
  { cohort: 'Lean', avgSpend: 2100, avgSavings: 780, users: 54 },
  { cohort: 'Premium', avgSpend: 7200, avgSavings: 1350, users: 31 },
];

const cohortByMerchantData = [
  { cohort: 'SaaS-heavy', avgSpend: 1800, avgSavings: 260, users: 64 },
  { cohort: 'Ops-heavy', avgSpend: 3900, avgSavings: 620, users: 42 },
  { cohort: 'Marketplace', avgSpend: 5200, avgSavings: 870, users: 26 },
  { cohort: 'Hybrid', avgSpend: 3400, avgSavings: 710, users: 58 },
];

const cohortByTimeData = [
  { cohort: 'Morning spenders', avgSpend: 2400, avgSavings: 690, users: 38 },
  { cohort: 'Evening spenders', avgSpend: 4100, avgSavings: 530, users: 52 },
  { cohort: 'Weekend-heavy', avgSpend: 3600, avgSavings: 610, users: 34 },
  { cohort: 'Balanced', avgSpend: 2900, avgSavings: 740, users: 66 },
];

const timeSeriesData = [
  { month: 'Jan', savings: 3200, volume: 180, income: 9800, spending: 6600 },
  { month: 'Feb', savings: 3500, volume: 192, income: 10200, spending: 6900 },
  { month: 'Mar', savings: 4100, volume: 210, income: 9750, spending: 6200 },
  { month: 'Apr', savings: 3900, volume: 204, income: 10120, spending: 6400 },
  { month: 'May', savings: 4300, volume: 226, income: 10900, spending: 6600 },
  { month: 'Jun', savings: 4700, volume: 239, income: 11120, spending: 6450 },
];

const correlationVariables = ['Income', 'Spending', 'Savings', 'Subscriptions'] as const;
type CorrelationVariable = (typeof correlationVariables)[number];

const correlationMatrix: Record<CorrelationVariable, Record<CorrelationVariable, number>> = {
  Income: {
    Income: 1,
    Spending: 0.68,
    Savings: 0.74,
    Subscriptions: 0.21,
  },
  Spending: {
    Income: 0.68,
    Spending: 1,
    Savings: -0.42,
    Subscriptions: 0.57,
  },
  Savings: {
    Income: 0.74,
    Spending: -0.42,
    Savings: 1,
    Subscriptions: -0.28,
  },
  Subscriptions: {
    Income: 0.21,
    Spending: 0.57,
    Savings: -0.28,
    Subscriptions: 1,
  },
};

type AnomalySeverity = 'low' | 'medium' | 'high';

interface Anomaly {
  id: string;
  label: string;
  type: string;
  severity: AnomalySeverity;
  score: number;
  timeRange: string;
  explanation: string;
}

const anomalyGrid: Anomaly[] = [
  {
    id: 'anom-01',
    label: 'Spending spike · Cloud infrastructure',
    type: 'Merchant outlier',
    severity: 'high',
    score: 0.94,
    timeRange: 'Last 7 days',
    explanation: 'Cloud provider spend jumped 48% week-over-week, driven by GPU usage in a single region.',
  },
  {
    id: 'anom-02',
    label: 'Unusual subscription churn pattern',
    type: 'Subscription anomaly',
    severity: 'medium',
    score: 0.81,
    timeRange: 'Last 30 days',
    explanation:
      'Cancellation rates spiked for mid-tier plans while enterprise cohorts remained stable, suggesting pricing friction.',
  },
  {
    id: 'anom-03',
    label: 'Negative working capital window',
    type: 'Cash flow risk',
    severity: 'medium',
    score: 0.77,
    timeRange: 'This quarter',
    explanation:
      'Payables are being settled 9 days faster than receivables, temporarily compressing runway despite healthy topline.',
  },
  {
    id: 'anom-04',
    label: 'Idle savings above policy band',
    type: 'Savings opportunity',
    severity: 'low',
    score: 0.72,
    timeRange: 'Last 60 days',
    explanation:
      'Excess cash is accumulating in low-yield accounts, exceeding your configured reserve band by ~18%.',
  },
];

function correlationColorClasses(value: number) {
  if (value > 0.7) {
    return 'border-emerald-500/60 bg-emerald-500/25 text-emerald-50 shadow-[0_0_22px_rgba(16,185,129,0.7)]';
  }
  if (value > 0.4) {
    return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100';
  }
  if (value < -0.7) {
    return 'border-rose-500/60 bg-rose-500/25 text-rose-50 shadow-[0_0_22px_rgba(244,63,94,0.7)]';
  }
  if (value < -0.4) {
    return 'border-rose-400/50 bg-rose-500/10 text-rose-100';
  }
  return 'border-slate-700/80 bg-slate-900/70 text-slate-200';
}

function severityBadgeConfig(severity: AnomalySeverity) {
  if (severity === 'high') {
    return {
      label: 'High',
      classes:
        'border-rose-500/70 bg-rose-500/15 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.7)]',
    };
  }
  if (severity === 'medium') {
    return {
      label: 'Medium',
      classes:
        'border-amber-400/70 bg-amber-500/15 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.6)]',
    };
  }
  return {
    label: 'Low',
    classes: 'border-sky-400/70 bg-sky-500/15 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.6)]',
  };
}

export function AnalyticsPage() {
  const [cohortDimension, setCohortDimension] = useState<CohortDimension>('category');
  const [timeMetric, setTimeMetric] = useState<TimeSeriesMetric>('savings');
  const [drilldown, setDrilldown] = useState<DrilldownInsight>({
    source: 'overview',
    title: 'AI-assisted analytics overview',
    description:
      'Select any cohort, correlation cell, time-series, or anomaly to see how Aurora would narrate the pattern for humans. This is a placeholder for your AI-powered explanation layer.',
    bullets: [
      'Use cohorts to compare behaviour across categories, merchants, and time windows.',
      'Scan the correlation matrix for strong positive or negative relationships between metrics.',
      'Watch time-series experiments for shifts in savings rate and transaction volume.',
      'Review anomalies as a triage queue for risk, opportunity, and optimisation.',
    ],
  });

  const cohortData = useMemo(() => {
    if (cohortDimension === 'merchant') return cohortByMerchantData;
    if (cohortDimension === 'time') return cohortByTimeData;
    return cohortByCategoryData;
  }, [cohortDimension]);

  const timeSeriesMetricLabel = timeMetric === 'savings' ? 'Monthly savings' : 'Transaction volume';

  const handleCohortDrilldown = (label: string) => {
    setDrilldown({
      source: 'cohort',
      title: `Cohort focus · ${label}`,
      description:
        'Aurora can segment your ledger into cohorts and explain why this group behaves differently from the baseline.',
      bullets: [
        'Compare average spend, savings rate, and ticket size versus global median.',
        'Highlight merchants or categories that over-index for this cohort.',
        'Surface seasonality or time-of-day effects specific to this segment.',
      ],
    });
  };

  const handleCorrelationDrilldown = (
    row: CorrelationVariable,
    col: CorrelationVariable,
    value: number,
  ) => {
    setDrilldown({
      source: 'correlation',
      title: `Correlation · ${row} ↔ ${col}`,
      description:
        'Correlation does not equal causation, but Aurora can walk you through which levers appear to move together in your data.',
      bullets: [
        `Estimated correlation: ${value.toFixed(2)} between ${row.toLowerCase()} and ${col.toLowerCase()}.`,
        'Identify scenarios where tightening one variable (like subscriptions) may unlock changes in another (like savings).',
        'Propose experiments to validate or falsify this relationship over the next few weeks.',
      ],
    });
  };

  const handleTimeSeriesDrilldown = (metric: TimeSeriesMetric) => {
    setDrilldown({
      source: 'timeseries',
      title: `Time-series experiment · ${
        metric === 'savings' ? 'Savings rate' : 'Transaction volume'
      }`,
      description:
        'Aurora can treat your financial history as a lab for experiments, tracking how interventions show up in the timeline.',
      bullets: [
        'Mark key events such as pricing changes, new markets, or hiring plans on the chart.',
        'Quantify uplift or drag relative to a synthetic control baseline.',
        'Suggest follow-up experiments to stabilise or amplify the observed effect.',
      ],
    });
  };

  const handleAnomalyDrilldown = (anomaly: Anomaly) => {
    const severity = severityBadgeConfig(anomaly.severity).label;
    setDrilldown({
      source: 'anomaly',
      title: `Anomaly · ${anomaly.label}`,
      description: anomaly.explanation,
      bullets: [
        `Severity: ${severity} · Score ${anomaly.score.toFixed(2)} in ${anomaly.timeRange}.`,
        'Simulate scenarios where this pattern continues, intensifies, or resolves.',
        'Recommend playbooks to mitigate risk or capture upside, depending on anomaly type.',
      ],
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 px-4 py-5 md:px-8 md:py-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
              ANALYTICS
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
              Deep Financial Analytics
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Visualise cohorts, correlations, and time-series experiments. This workspace is ready for
              real models and real ledgers.
            </p>
            <nav
              aria-label="Breadcrumb"
              className="mt-3 flex items-center gap-2 text-[11px] text-slate-500"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <ol className="flex items-center gap-1">
                <li>
                  <Link
                    to="/overview"
                    className="rounded-full px-2 py-0.5 text-slate-300 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="text-slate-600">/</li>
                <li aria-current="page" className="text-slate-300">
                  Analytics
                </li>
              </ol>
            </nav>
          </div>
          <div className="card-3d card-3d-hover flex items-center gap-3 rounded-2xl px-4 py-3 text-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                Analytics workspace
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Attach production dashboards or keep this as a sandbox for experiments.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <section
            className="card-3d card-3d-hover rounded-2xl px-4 py-4 text-xs text-slate-300 sm:px-5 sm:py-5 lg:col-span-2"
            aria-label="Cohort charts"
          >
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Cohort charts
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Compare spend and savings behaviour across user-defined groups.
                </p>
              </div>
              <div
                className="inline-flex rounded-full bg-slate-900/80 p-0.5 text-[11px]"
                role="tablist"
                aria-label="Cohort dimension selector"
              >
                {[
                  ['category', 'By category'],
                  ['merchant', 'By merchant mix'],
                  ['time', 'By time window'],
                ].map(([value, label]) => {
                  const isActive = cohortDimension === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setCohortDimension(value as CohortDimension)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                        isActive
                          ? 'bg-emerald-500/90 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.8)]'
                          : 'text-slate-300 hover:text-emerald-200'
                      }`}
                    >
                      {value === 'merchant' ? (
                        <Grid3X3 className="h-3 w-3" />
                      ) : value === 'time' ? (
                        <Activity className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3" />
                      )}
                      {label}
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cohortData}
                  margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
                  barSize={24}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis
                    dataKey="cohort"
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
                  <Bar
                    dataKey="avgSpend"
                    name="Avg spend"
                    fill="#22c55e"
                    radius={[6, 6, 0, 0]}
                    onClick={(data) => handleCohortDrilldown((data as { cohort?: string }).cohort ?? '')}
                  />
                  <Bar
                    dataKey="avgSavings"
                    name="Avg savings"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                    onClick={(data) => handleCohortDrilldown((data as { cohort?: string }).cohort ?? '')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
              <p>
                Click any bar to ask Aurora why that cohort behaves differently, or use it as an input into
                pricing and budgeting experiments.
              </p>
              <button
                type="button"
                onClick={() => handleCohortDrilldown('All cohorts')}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
              >
                <Sparkles className="h-3 w-3" />
                Ask AI about cohorts
              </button>
            </div>
          </section>

          <section
            className="card-3d card-3d-hover flex flex-col gap-3 rounded-2xl px-4 py-4 text-xs text-slate-300 sm:px-5 sm:py-5"
            aria-label="Correlation matrix and AI drill-down"
          >
            <header>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Correlation matrix
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Scan relationships between key financial variables.
              </p>
            </header>
            <div
              className="mt-2 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-3"
              role="grid"
              aria-label="Correlation matrix of financial metrics"
            >
              <div className="grid grid-cols-5 gap-1 text-[10px]">
                <div />
                {correlationVariables.map((variable) => (
                  <div
                    key={variable}
                    className="px-1.5 py-1 text-center text-slate-400"
                  >
                    {variable}
                  </div>
                ))}
                {correlationVariables.map((row) => (
                  <Fragment key={row}>
                    <div className="px-1.5 py-1 text-right text-slate-400">{row}</div>
                    {correlationVariables.map((col) => {
                      const value = correlationMatrix[row][col];
                      const isDiagonal = row === col;
                      return (
                        <button
                          key={`${row}-${col}`}
                          type="button"
                          className={`flex h-8 items-center justify-center rounded-md border text-[11px] transition-colors ${
                            isDiagonal
                              ? 'border-slate-700/80 bg-slate-900/80 text-slate-400'
                              : correlationColorClasses(value)
                          } hover:border-emerald-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70`}
                          onClick={() => !isDiagonal && handleCorrelationDrilldown(row, col, value)}
                          aria-label={
                            isDiagonal
                              ? `${row} baseline`
                              : `Correlation ${value.toFixed(2)} between ${row} and ${col}`
                          }
                        >
                          {isDiagonal ? '—' : value.toFixed(2)}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-950/90 via-slate-950 to-slate-950/90 px-3 py-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-50">AI-assisted drill-downs</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {drilldown.description}
                  </p>
                </div>
              </div>
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                {drilldown.bullets.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1 h-1 w-3 rounded-full bg-emerald-400/80" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                {drilldown.source === 'overview'
                  ? 'Select a pattern to begin an AI explanation.'
                  : `Source · ${drilldown.source}`}
              </p>
            </div>
          </section>
        </div>

        <section
          className="card-3d card-3d-hover rounded-2xl px-4 py-4 text-xs text-slate-300 sm:px-5 sm:py-5"
          aria-label="Time-series experiments and anomalies"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Time-series experiments
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Track how savings or transaction volume evolve over time.
                  </p>
                </div>
                <div
                  className="inline-flex rounded-full bg-slate-900/80 p-0.5 text-[11px]"
                  role="radiogroup"
                  aria-label="Time-series metric selector"
                >
                  {[
                    ['savings', 'Savings'],
                    ['volume', 'Volume'],
                  ].map(([value, label]) => {
                    const isActive = timeMetric === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => setTimeMetric(value as TimeSeriesMetric)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                          isActive
                            ? 'bg-sky-500/90 text-slate-950 shadow-[0_0_16px_rgba(56,189,248,0.8)]'
                            : 'text-slate-300 hover:text-sky-200'
                        }`}
                      >
                        <Activity className="h-3 w-3" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </header>
              <div className="mt-3 h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 6, right: 12, left: -18, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="analyticsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={timeMetric === 'savings' ? '#22c55e' : '#38bdf8'} stopOpacity={0.9} />
                        <stop offset="95%" stopColor={timeMetric === 'savings' ? '#22c55e' : '#38bdf8'} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#111827" vertical={false} />
                    <XAxis
                      dataKey="month"
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
                    <Area
                      type="monotone"
                      name={timeSeriesMetricLabel}
                      dataKey={timeMetric === 'savings' ? 'savings' : 'volume'}
                      stroke={timeMetric === 'savings' ? '#22c55e' : '#38bdf8'}
                      fill="url(#analyticsArea)"
                      strokeWidth={2}
                      onClick={() => handleTimeSeriesDrilldown(timeMetric)}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#a855f7"
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="spending"
                      name="Spending"
                      stroke="#f97316"
                      strokeWidth={1}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                <p>
                  Use this chart to test hypotheses, like how savings respond to a new pricing tier or cost
                  controls.
                </p>
                <button
                  type="button"
                  onClick={() => handleTimeSeriesDrilldown(timeMetric)}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-500/60 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold text-sky-100 hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70"
                >
                  <Sparkles className="h-3 w-3" />
                  Ask AI about timeline
                </button>
              </div>
            </div>

            <div className="space-y-2" aria-label="Anomaly grid">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Anomaly grid
                </p>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-200">
                  {anomalyGrid.length} flagged
                </span>
              </div>
              <div className="space-y-2">
                {anomalyGrid.map((anomaly) => {
                  const severity = severityBadgeConfig(anomaly.severity);
                  return (
                    <motion.button
                      key={anomaly.id}
                      type="button"
                      onClick={() => handleAnomalyDrilldown(anomaly)}
                      whileHover={{ y: -2, scale: 1.01 }}
                      transition={{ duration: 0.12 }}
                      className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/90 px-3 py-2 text-left text-[11px] text-slate-200 shadow-[0_0_0_rgba(0,0,0,0.0)] hover:border-emerald-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                      aria-label={`Anomaly: ${anomaly.label}, severity ${severity.label}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="flex items-center gap-1 text-[11px] font-medium text-slate-50">
                            <AlertTriangle className="h-3 w-3 text-amber-300" />
                            {anomaly.label}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{anomaly.type}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${severity.classes}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                          {severity.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Score {anomaly.score.toFixed(2)} · {anomaly.timeRange}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
