import type React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-6">
      <div className="absolute -inset-12 -z-10 opacity-80">
        <div className="neon-orbit" aria-hidden="true" />
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500 shadow-neon">
          <Sparkles className="h-6 w-6 text-slate-950" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
          NEONLEDGER AI
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50">Secure sign-in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Connect to your encrypted financial graph and unlock AI-powered insights, predictive
          analytics, and personalized automations.
        </p>
      </div>

      <div className="card-3d card-3d-hover w-full rounded-2xl px-5 py-5 text-sm">
        <div className="mb-4 flex items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span className="font-semibold">Bank-grade security</span>
          </div>
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
            ZERO-KNOWLEDGE
          </span>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-200">Email</label>
            <input
              type="email"
              required
              placeholder="you@finance.ai"
              className="h-9 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-200">Master passphrase</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              className="h-9 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <button
            type="submit"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-[0_0_40px_rgba(59,130,246,0.9)] transition-transform hover:-translate-y-0.5"
          >
            <span>Enter command center</span>
          </button>

          <p className="mt-2 text-[11px] text-slate-400">
            By continuing you agree to secure, read-only connections to your institutions. Sensitive
            credentials are never stored in plain text.
          </p>
        </form>
      </div>
    </div>
  );
}
