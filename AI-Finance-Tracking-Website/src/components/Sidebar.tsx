import { NavLink } from 'react-router-dom';
import { Brain, BarChart3, Activity, ShieldCheck, Wallet, Sparkles, X } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Brain, label: 'AI Overview', path: '/overview' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Activity, label: 'Live Flow', path: '/live-flow' },
  { icon: Wallet, label: 'Accounts', path: '/accounts' },
  { icon: ShieldCheck, label: 'Security', path: '/security' },
];

interface SidebarProps {
  variant?: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function Sidebar({ variant = 'desktop', onClose }: SidebarProps) {
  const visibilityClass =
    variant === 'desktop'
      ? 'hidden md:flex'
      : 'flex md:hidden';

  return (
    <aside
      className={`${visibilityClass} w-72 flex-col border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-2xl shadow-[0_0_60px_rgba(15,23,42,0.95)] relative overflow-hidden`}
    >
      <div className="neon-orbit" aria-hidden="true" />
      <div className="relative flex items-center gap-3 px-6 pt-6 pb-4">
        {variant === 'mobile' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-300 hover:border-emerald-400/80 hover:text-emerald-300"
            aria-label="Close navigation"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500 shadow-neon flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-slate-950" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-emerald-300/90">
            Neural Finance
          </p>
          <p className="text-lg font-semibold text-slate-50">NeonLedger AI</p>
        </div>
      </div>

      <nav className="relative mt-2 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/overview'}
            className={({ isActive }: { isActive: boolean }) =>
              `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all card-3d-hover ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-400/10 via-sky-500/10 to-indigo-500/10 border border-emerald-400/70 shadow-neon text-slate-50'
                  : 'border border-transparent text-slate-400/90 hover:text-slate-50 hover:bg-slate-900/60 hover:border-slate-700/80'
              }`
            }
            onClick={variant === 'mobile' ? onClose : undefined}
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border text-emerald-300/90 bg-slate-900/80 shadow-[0_0_20px_rgba(34,197,94,0.3)] ${
                    isActive ? 'border-emerald-400/80' : 'border-slate-700/80 group-hover:border-emerald-400/70'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-medium tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative mt-auto px-5 pb-6 pt-4">
        <div className="card-3d card-3d-hover px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                AI MODEL
              </p>
              <p className="mt-1 text-sm font-medium text-slate-50">Aurora Insight Engine</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Re-training nightly on your encrypted financial graph.
              </p>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                LIVE
              </span>
              <span className="mt-2 text-xs text-slate-300">Latency: 42 ms</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
