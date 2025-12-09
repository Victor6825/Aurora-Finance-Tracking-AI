import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Search, Lock, User } from 'lucide-react';

interface TopBarProps {
  onLogout: () => void;
}

const NAV_LINKS = [
  { label: 'Dashboard', to: '/overview' },
  { label: 'Insights', to: '/analytics' },
  { label: 'Settings', to: '/security' },
];

const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Spending spike detected',
    time: '2h ago',
    description: 'Food & mobility are trending 18% above your recent baseline.',
  },
  {
    id: 'n2',
    title: 'New savings opportunity',
    time: 'Today',
    description: 'Rerouting idle cash into your high-yield vault adds ~$36 / month.',
  },
  {
    id: 'n3',
    title: 'Subscription cluster spotted',
    time: 'Yesterday',
    description: 'Four media charges landed within 24 hours. Time for a quick audit.',
  },
];

export function TopBar({ onLogout }: TopBarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!notificationsRef.current || notificationsRef.current.contains(target)) return;
      setIsNotificationsOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isNotificationsOpen]);

  return (
    <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-2xl">
      <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-70" />
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.9)]">
            <span className="text-sm font-semibold">A</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-50">Aurora</p>
            <p className="hidden text-[10px] uppercase tracking-[0.26em] text-emerald-300/80 sm:block">
              Finance Tracker
            </p>
          </div>
        </div>

        <nav
          className="hidden flex-[1.2] items-center justify-center md:flex"
          aria-label="Primary navigation"
        >
          <ul className="flex items-center gap-6 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/overview'}
                  className={({ isActive }: { isActive: boolean }) =>
                    `relative inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isActive
                        ? 'text-emerald-300'
                        : 'text-slate-300 hover:text-emerald-200'
                    }`
                  }
                >
                  {({ isActive }: { isActive: boolean }) => (
                    <>
                      <span>{link.label}</span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-1 -bottom-1 h-px bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden sm:flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
            <input
              placeholder="Search insights, merchants, events..."
              className="h-9 w-52 rounded-full border border-slate-700/80 bg-slate-900/80 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="relative z-30" ref={notificationsRef}>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-200 transition-colors hover:border-emerald-400/80 hover:text-emerald-300"
              aria-label="Notifications"
              aria-haspopup="true"
              aria-expanded={isNotificationsOpen}
              aria-controls="topbar-notifications-panel"
              onClick={() => setIsNotificationsOpen((open) => !open)}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-semibold text-slate-950 shadow-[0_0_14px_rgba(52,211,153,0.95)]">
                {NOTIFICATIONS.length}
              </span>
            </button>

            <div
              id="topbar-notifications-panel"
              role="menu"
              aria-label="Recent notifications"
              aria-hidden={!isNotificationsOpen}
              className={`absolute right-0 z-30 mt-2 w-72 origin-top-right rounded-2xl border border-emerald-400/40 bg-slate-950/95 shadow-[0_22px_40px_rgba(15,23,42,0.96)] ring-1 ring-emerald-500/15 transition-all duration-200 ${
                isNotificationsOpen
                  ? 'pointer-events-auto translate-y-0 opacity-100'
                  : 'pointer-events-none -translate-y-1 opacity-0'
              }`}
            >
              <div className="border-b border-slate-800/80 px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/90">
                  Aurora alerts
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Model-surfaced events from the last 48 hours.
                </p>
              </div>
              <ul className="max-h-72 space-y-1 overflow-y-auto px-2.5 py-2 text-xs text-slate-100 scroll-soft">
                {NOTIFICATIONS.map((item) => (
                  <li
                    key={item.id}
                    role="menuitem"
                    tabIndex={-1}
                    className="group rounded-xl border border-slate-800/80 bg-slate-950/80 px-2.5 py-2 transition-colors hover:border-emerald-400/70 hover:bg-slate-900/90"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold text-slate-50">
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-500">{item.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-slate-300">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-full border border-emerald-400/70 bg-slate-900/90 px-2.5 py-1.5 text-xs text-slate-100 shadow-[0_0_28px_rgba(16,185,129,0.7)]">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500">
                <User className="h-4 w-4 text-slate-950" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 text-[8px] font-bold text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.95)]">
                  A7
                </span>
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[11px] font-semibold text-slate-100">
                  AI-Guarded Profile
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-200/90">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span className="truncate">Zero-knowledge mode</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="ml-1 shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300 transition-colors hover:bg-emerald-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
