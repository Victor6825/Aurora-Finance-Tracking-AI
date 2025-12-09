import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Bell,
  BellOff,
  CreditCard,
  Eye,
  EyeOff,
  Globe2,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Wallet,
  WifiOff,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type SyncStatus = 'healthy' | 'degraded' | 'error';
type AccountType = 'Bank' | 'Card' | 'Vault';
type NotificationPreference = 'all' | 'important' | 'none';

interface Account {
  id: string;
  institution: string;
  type: AccountType;
  name: string;
  mask: string;
  balance: number;
  currency: string;
  status: SyncStatus;
  lastSync: string;
  nickname: string;
  visible: boolean;
  notifications: NotificationPreference;
  primary?: boolean;
  country?: string;
}

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-01',
    institution: 'Aurora Bank US',
    type: 'Bank',
    name: 'Operating Checking',
    mask: '1024',
    balance: 128500,
    currency: 'USD',
    status: 'healthy',
    lastSync: '2 min ago',
    nickname: 'Primary operating',
    visible: true,
    notifications: 'all',
    primary: true,
    country: 'US',
  },
  {
    id: 'acc-02',
    institution: 'Atlas Corporate Card',
    type: 'Card',
    name: 'Team Spend Card',
    mask: '7780',
    balance: -13240,
    currency: 'USD',
    status: 'degraded',
    lastSync: '24 min ago',
    nickname: 'Corporate card',
    visible: true,
    notifications: 'important',
    country: 'US',
  },
  {
    id: 'acc-03',
    institution: 'Northern Vault',
    type: 'Vault',
    name: 'Runway Reserve',
    mask: '9931',
    balance: 420000,
    currency: 'USD',
    status: 'healthy',
    lastSync: 'Today, 08:12',
    nickname: 'Runway vault',
    visible: true,
    notifications: 'none',
    country: 'EU',
  },
];

const statusConfig: Record<
  SyncStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  healthy: {
    label: 'Healthy',
    description: 'Connected and syncing normally.',
    badgeClass:
      'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.65)]',
    dotClass: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.95)]',
  },
  degraded: {
    label: 'Degraded',
    description: 'Sync is slow or partially failing.',
    badgeClass:
      'border-amber-400/70 bg-amber-500/10 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.5)]',
    dotClass: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]',
  },
  error: {
    label: 'Error',
    description: 'Connection broken. Needs user attention.',
    badgeClass:
      'border-rose-500/70 bg-rose-500/10 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.6)]',
    dotClass: 'bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.9)]',
  },
};

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    INITIAL_ACCOUNTS[0]?.id ?? null,
  );
  const [showOnboarding, setShowOnboarding] = useState(false);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const healthCounts = useMemo(
    () => ({
      healthy: accounts.filter((account) => account.status === 'healthy').length,
      degraded: accounts.filter((account) => account.status === 'degraded').length,
      error: accounts.filter((account) => account.status === 'error').length,
    }),
    [accounts],
  );

  const overallStatus: SyncStatus = useMemo(() => {
    if (healthCounts.error > 0) return 'error';
    if (healthCounts.degraded > 0) return 'degraded';
    return 'healthy';
  }, [healthCounts]);

  const lastGlobalSync = useMemo(() => {
    if (!accounts.length) return 'Not synced yet';
    return accounts[0]?.lastSync ?? 'Just now';
  }, [accounts]);

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ?? accounts[0] ?? null;

  const updateAccount = (id: string, updater: (account: Account) => Account) => {
    setAccounts((prev) => prev.map((account) => (account.id === id ? updater(account) : account)));
  };

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleCancelOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleCompleteOnboarding = () => {
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      institution: 'Aurora Test Bank',
      type: 'Bank',
      name: 'Aurora Checking',
      mask: '4820',
      balance: 12400,
      currency: 'USD',
      status: 'degraded',
      lastSync: 'Just now',
      nickname: 'New onboarding account',
      visible: true,
      notifications: 'important',
      country: 'US',
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setSelectedAccountId(newAccount.id);
    setShowOnboarding(false);
  };

  const handleDisconnect = (id: string) => {
    setAccounts((prev) => {
      const next = prev.filter((account) => account.id !== id);
      if (selectedAccountId === id) {
        setSelectedAccountId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 px-4 py-5 md:px-8 md:py-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
              ACCOUNTS
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
              Linked Accounts
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Manage connected banks, cards, and vaults. Aurora keeps your financial surface in sync so
              AI models always see a clean, up-to-date ledger.
            </p>
          </div>
          <div className="card-3d card-3d-hover flex items-center gap-3 rounded-2xl px-4 py-3 text-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="flex-1 leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                Account hub
              </p>
              <p className="mt-1 text-xs text-slate-200">
                {accounts.length || 'No'} connected
                <span className="mx-1 text-slate-500">·</span>
                {accounts.length ? formatCurrency(totalBalance, 'USD') : 'Connect to see balances'}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                <RefreshCcw className="h-3 w-3 text-emerald-400" />
                Last sync {lastGlobalSync}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartOnboarding}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            >
              <Plus className="h-3 w-3" />
              Connect
            </button>
          </div>
        </header>

        <AnimatePresence initial={false}>
          {showOnboarding && (
            <motion.section
              layout
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="card-3d card-3d-hover rounded-2xl border border-emerald-500/40 bg-slate-950/80 px-4 py-4 text-xs text-slate-200 sm:px-5 sm:py-5"
              role="dialog"
              aria-modal="false"
              aria-label="Connect a new institution"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-50">Connect a new bank or card</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      This is a placeholder for your onboarding and KYC flow. Plug in Plaid, Tink, or
                      your internal aggregator here.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelOnboarding}
                  className="rounded-full border border-slate-700/80 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-3 text-[11px] sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
                  <p className="font-medium text-slate-100">Step 1 · Institution</p>
                  <p className="mt-1 text-slate-400">User selects a bank, card, or vault provider.</p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
                  <p className="font-medium text-slate-100">Step 2 · Credentials &amp; KYC</p>
                  <p className="mt-1 text-slate-400">
                    Redirect to secure hosted flow for credential input and identity verification.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3">
                  <p className="font-medium text-slate-100">Step 3 · Live sync</p>
                  <p className="mt-1 text-slate-400">
                    Aurora ingests accounts and transactions for monitoring &amp; AI insights.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-400">
                  Use this flow to ensure least-privilege access and transparent consent copy.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelOnboarding}
                    className="rounded-full border border-slate-700/80 px-3 py-1.5 text-[11px] text-slate-300 hover:border-slate-500 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_35px_rgba(16,185,129,0.75)] hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                  >
                    <Plus className="h-3 w-3" />
                    Simulate connect
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid gap-5 lg:grid-cols-3">
          <section
            className="card-3d card-3d-hover rounded-2xl px-4 py-4 text-sm text-slate-300 sm:px-5 sm:py-5 lg:col-span-2"
            aria-label="Linked financial accounts"
          >
            <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">Linked accounts</h2>
                <p className="text-xs text-slate-400">
                  Banks, cards, and vaults connected to your Aurora workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartOnboarding}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
              >
                <Plus className="h-3 w-3" />
                Add account
              </button>
            </header>

            <div className="mt-4 space-y-1" role="list" aria-label="Linked accounts list">
              <AnimatePresence initial={false}>
                {accounts.map((account) => {
                  const status = statusConfig[account.status];
                  const Icon =
                    account.type === 'Card' ? CreditCard : account.type === 'Vault' ? Banknote : Wallet;

                  return (
                    <motion.article
                      key={account.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-950/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                      role="listitem"
                      aria-label={`${account.institution} ${account.type} ending in ${account.mask}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 text-emerald-300 ring-1 ring-slate-700/80">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="flex items-center gap-2 text-sm font-medium text-slate-50">
                            {account.nickname || account.name}
                            {account.primary && (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                                Primary
                              </span>
                            )}
                            {!account.visible && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
                                <EyeOff className="h-3 w-3" /> Hidden
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {account.institution}
                            <span className="mx-1 text-slate-600">·</span>
                            ••••{account.mask}
                            {account.country && (
                              <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                                <Globe2 className="h-3 w-3" />
                                {account.country}
                              </span>
                            )}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                            <RefreshCcw className="h-3 w-3" />
                            Last sync {account.lastSync}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-300">
                            {formatCurrency(account.balance, account.currency)}
                          </p>
                          <p className="text-[11px] text-slate-400">{account.type}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${status.badgeClass}`}
                          aria-label={`Connection status: ${status.label}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`}
                            aria-hidden="true"
                          />
                          {status.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAccountId(account.id)}
                          className="rounded-full border border-slate-700/80 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400/80 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                        >
                          Settings
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDisconnect(account.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/5 px-3 py-1 text-[11px] text-rose-200 hover:border-rose-400 hover:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70"
                          aria-label={`Disconnect ${account.institution} ${account.type} account ending in ${account.mask}`}
                        >
                          <WifiOff className="h-3 w-3" />
                          Disconnect
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
              {accounts.length === 0 && (
                <div className="mt-2 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/80 px-4 py-3 text-xs text-slate-400">
                  No accounts connected yet. Connect a bank or card to start real-time monitoring and
                  AI insights.
                </div>
              )}
            </div>
          </section>

          <section
            className="space-y-4 text-xs text-slate-300"
            aria-label="Account hub summary and institution settings"
          >
            <div
              className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Connection health
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-100">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${statusConfig[overallStatus].badgeClass}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusConfig[overallStatus].dotClass}`}
                        aria-hidden="true"
                      />
                      {statusConfig[overallStatus].label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {statusConfig[overallStatus].description}
                    </span>
                  </p>
                </div>
                <ShieldCheck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <div className="rounded-xl bg-slate-950/80 p-2">
                  <dt className="text-slate-500">Healthy</dt>
                  <dd className="mt-1 text-sm font-semibold text-emerald-300">
                    {healthCounts.healthy}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-2">
                  <dt className="text-slate-500">Degraded</dt>
                  <dd className="mt-1 text-sm font-semibold text-amber-300">
                    {healthCounts.degraded}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-950/80 p-2">
                  <dt className="text-slate-500">Errors</dt>
                  <dd className="mt-1 text-sm font-semibold text-rose-300">{healthCounts.error}</dd>
                </div>
              </dl>
            </div>

            <div className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
              {selectedAccount ? (
                <>
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/90 text-emerald-300 ring-1 ring-slate-700/80">
                        {selectedAccount.type === 'Card' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : selectedAccount.type === 'Vault' ? (
                          <Banknote className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-50">Institution settings</p>
                        <p className="text-[11px] text-slate-400">
                          {selectedAccount.institution}
                          <span className="mx-1 text-slate-600">·</span>
                          ••••{selectedAccount.mask}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAccountId(null)}
                      className="rounded-full border border-slate-700/80 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-500 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70"
                    >
                      Clear
                    </button>
                  </header>

                  <div className="mt-4 space-y-4 text-xs">
                    <div>
                      <label
                        htmlFor="account-nickname"
                        className="mb-1 block text-[11px] font-medium text-slate-300"
                      >
                        Nickname
                      </label>
                      <input
                        id="account-nickname"
                        type="text"
                        value={selectedAccount.nickname}
                        onChange={(event) =>
                          updateAccount(selectedAccount.id, (account) => ({
                            ...account,
                            nickname: event.target.value,
                          }))
                        }
                        className="h-8 w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="How this account should appear in dashboards"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-slate-200">Visibility</p>
                        <p className="text-[11px] text-slate-400">
                          Hide this account from overview dashboards and exports.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selectedAccount.visible}
                        onClick={() =>
                          updateAccount(selectedAccount.id, (account) => ({
                            ...account,
                            visible: !account.visible,
                          }))
                        }
                        className={`inline-flex items-center rounded-full border px-1 py-0.5 text-[11px] transition-colors ${
                          selectedAccount.visible
                            ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-700/80 bg-slate-900/80 text-slate-300'
                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/90 text-[10px] shadow-[0_0_12px_rgba(15,23,42,0.9)] ${
                            selectedAccount.visible ? 'translate-x-4 bg-emerald-500 text-slate-950' : ''
                          }`}
                        >
                          {selectedAccount.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </span>
                        <span className="ml-2 mr-1">
                          {selectedAccount.visible ? 'Visible in dashboards' : 'Hidden from dashboards'}
                        </span>
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-200">Notifications</p>
                      <p className="text-[11px] text-slate-400">
                        Control alerts for new transactions, large movements, and failed syncs.
                      </p>
                      <div
                        className="mt-2 inline-flex rounded-full bg-slate-900/80 p-1 text-[11px]"
                        role="group"
                        aria-label="Notification preference"
                      >
                        {([
                          ['all', 'All activity'],
                          ['important', 'Important only'],
                          ['none', 'Muted'],
                        ] as [NotificationPreference, string][]).map(([value, label]) => {
                          const isActive = selectedAccount.notifications === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                updateAccount(selectedAccount.id, (account) => ({
                                  ...account,
                                  notifications: value,
                                }))
                              }
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                                isActive
                                  ? 'bg-emerald-500/90 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.7)]'
                                  : 'text-slate-300 hover:text-emerald-200'
                              }`}
                              aria-pressed={isActive}
                            >
                              {value === 'none' ? (
                                <BellOff className="h-3 w-3" />
                              ) : (
                                <Bell className="h-3 w-3" />
                              )}
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  <p>Select an account from the list to adjust institution-level settings.</p>
                </div>
              )}
            </div>

            <div className="card-3d card-3d-hover rounded-2xl px-4 py-4 sm:px-5 sm:py-5 text-[11px] text-slate-400">
              <p className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Aurora never stores banking credentials.
              </p>
              <p className="mt-2">
                Use a trusted aggregator for credential handling and tokenised access. This panel is
                a good place to describe your security posture, data retention policy, and how account
                links power AI monitoring and automated workflows.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
