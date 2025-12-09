import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
  isAuthenticated: boolean;
  onLogout: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
};

const navItems: Array<{ label: string; to: string }> = [
  { label: 'Dashboard', to: '/overview' },
  { label: 'Insights', to: '/analytics' },
  { label: 'Settings', to: '/security' },
];

export function Navbar({ isAuthenticated, onLogout, onSignIn, onSignUp }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const renderLinks = (onItemClick?: () => void) => (
    <ul className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onItemClick}
              className={`relative text-sm font-medium tracking-tight transition-colors duration-200 ${
                isActive
                  ? 'text-emerald-300'
                  : 'text-slate-300 hover:text-emerald-200 focus-visible:text-emerald-200'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const renderAuthButtons = (variant: 'desktop' | 'mobile') => {
    const baseButton =
      'inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors';

    if (isAuthenticated) {
      return (
        <button
          type="button"
          onClick={() => {
            closeMenu();
            onLogout();
          }}
          className={`${baseButton} border-rose-400/80 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20 hover:text-rose-50`}
        >
          Logout
        </button>
      );
    }

    return (
      <div
        className={
          variant === 'desktop'
            ? 'flex items-center gap-2'
            : 'mt-4 flex flex-col items-stretch gap-2'
        }
      >
        <button
          type="button"
          onClick={() => {
            closeMenu();
            onSignIn?.();
          }}
          className={`${baseButton} border-slate-600/80 bg-slate-900/80 text-slate-200 hover:border-emerald-400/80 hover:text-emerald-200`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            closeMenu();
            onSignUp?.();
          }}
          className={`${baseButton} border-emerald-400/80 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20 hover:text-emerald-50`}
        >
          Sign Up
        </button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.9)]">
            <span className="text-sm font-semibold">A</span>
          </div>
          <div className="leading-tight">
            <span className="text-sm font-semibold text-slate-50">Aurora</span>
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300/80 hidden sm:block">
              Finance Tracker
            </p>
          </div>
        </div>

        <nav
          className="hidden flex-1 items-center justify-center md:flex"
          aria-label="Primary navigation"
        >
          {renderLinks()}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {renderAuthButtons('desktop')}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 p-1.5 text-slate-200 shadow-[0_0_18px_rgba(15,23,42,0.9)] transition-colors hover:border-emerald-400/80 hover:text-emerald-300 md:hidden"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="aurora-mobile-nav"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent opacity-70" />
      </div>

      <div
        id="aurora-mobile-nav"
        className={`md:hidden ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="border-t border-slate-800/80 bg-slate-950/95 shadow-[0_22px_40px_rgba(15,23,42,0.96)] transition-opacity duration-200">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <nav aria-label="Mobile primary navigation">{renderLinks(closeMenu)}</nav>
            {renderAuthButtons('mobile')}
          </div>
        </div>
      </div>
    </header>
  );
}
