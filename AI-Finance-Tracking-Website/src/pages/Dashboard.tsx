import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Account {
  id?: string | number;
  name?: string | null;
  balance?: number | null;
  type?: string | null;
  institution?: string | null;
}

interface Transaction {
  id?: string | number;
  timestamp?: string;
  description?: string | null;
  amount?: number | null;
  category?: string | null;
}

interface SpendingCategoryDatum {
  name: string;
  value: number;
}

const CATEGORY_COLORS = ['#22c55e', '#38bdf8', '#f97316', '#eab308', '#f97373', '#a855f7'];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !userData?.user) {
        setUser(null);
        setAccounts([]);
        setTransactions([]);
        if (userError) {
          setError(userError.message);
        }
        setLoading(false);
        return;
      }

      const currentUser = userData.user;
      setUser(currentUser);

      const [accountsRes, txRes] = await Promise.all([
        supabase
          .from('accounts')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('name', { ascending: true }),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('timestamp', { ascending: false }),
      ]);

      if (!isMounted) return;

      if (accountsRes.error || txRes.error) {
        setError(accountsRes.error?.message ?? txRes.error?.message ?? 'Failed to load data.');
        setAccounts([]);
        setTransactions([]);
      } else {
        setAccounts((accountsRes.data as Account[]) || []);
        setTransactions((txRes.data as Transaction[]) || []);
      }

      setLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const spendingByCategory: SpendingCategoryDatum[] = useMemo(() => {
    const map = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.amount == null) continue;
      if (tx.amount >= 0) continue; // treat negatives as spending
      const cat = tx.category ?? 'Other';
      const prev = map.get(cat) ?? 0;
      map.set(cat, prev + Math.abs(tx.amount));
    }

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const formatDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (value?: number | null) => {
    if (value == null) return '';
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 16px',
        backgroundColor: '#020617',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          backgroundColor: '#020617',
          borderRadius: '16px',
          border: '1px solid rgba(148,163,184,0.35)',
          padding: '24px',
          boxShadow: '0 20px 45px rgba(15,23,42,0.8)',
        }}
      >
        <h1 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '12px' }}>Dashboard</h1>

        {loading && <p style={{ marginTop: '8px' }}>Loading dashboard…</p>}

        {!loading && !user && (
          <div style={{ marginTop: '12px' }}>
            <p>Please log in to view your dashboard.</p>
            {error && (
              <p style={{ marginTop: '4px', color: '#fca5a5' }}>Error: {error}</p>
            )}
          </div>
        )}

        {!loading && user && (
          <>
            {error && (
              <p style={{ marginBottom: '8px', color: '#fca5a5' }}>Error: {error}</p>
            )}

            <p style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#9ca3af' }}>
              Welcome back, <strong>{user.email ?? user.id}</strong>
            </p>

            {/* Accounts summary */}
            <section style={{ marginBottom: '20px' }}>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Accounts
              </h2>
              {accounts.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  No accounts found. Connect or create an account to see balances.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    marginTop: '4px',
                  }}
                >
                  {accounts.map((acct) => (
                    <div
                      key={acct.id ?? `${acct.name}-${acct.institution}`}
                      style={{
                        borderRadius: '10px',
                        border: '1px solid rgba(51,65,85,0.9)',
                        padding: '10px 12px',
                        background:
                          'radial-gradient(circle at top, rgba(56,189,248,0.11), transparent 55%)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          {acct.institution ?? 'Account'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {acct.type ?? ''}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                        {formatAmount(acct.balance ?? null)}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#9ca3af',
                          marginTop: '2px',
                        }}
                      >
                        {acct.name ?? 'Unnamed account'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Chart + transactions layout */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.4fr)',
                gap: '20px',
                alignItems: 'flex-start',
              }}
            >
              {/* Spending by category chart */}
              <div
                style={{
                  borderRadius: '12px',
                  border: '1px solid rgba(51,65,85,0.9)',
                  padding: '12px',
                  backgroundColor: '#020617',
                  minHeight: '260px',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  Spending by category
                </h2>
                {spendingByCategory.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>
                    No recent spending data to visualize.
                  </p>
                ) : (
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={spendingByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={({ name }) => name}
                        >
                          {spendingByCategory.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) =>
                            typeof value === 'number' ? formatAmount(-Math.abs(value)) : value
                          }
                        />
                        <Legend verticalAlign="bottom" height={24} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Transactions table */}
              <div
                style={{
                  borderRadius: '12px',
                  border: '1px solid rgba(51,65,85,0.9)',
                  padding: '12px',
                  backgroundColor: '#020617',
                  overflowX: 'auto',
                }}
              >
                <h2
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  Recent transactions
                </h2>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.85rem',
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          borderBottom: '1px solid rgba(148,163,184,0.5)',
                          textAlign: 'left',
                          padding: '6px 8px',
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          borderBottom: '1px solid rgba(148,163,184,0.5)',
                          textAlign: 'left',
                          padding: '6px 8px',
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          borderBottom: '1px solid rgba(148,163,184,0.5)',
                          textAlign: 'right',
                          padding: '6px 8px',
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          borderBottom: '1px solid rgba(148,163,184,0.5)',
                          textAlign: 'left',
                          padding: '6px 8px',
                        }}
                      >
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            color: '#6b7280',
                          }}
                        >
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx, index) => (
                        <tr key={tx.id ?? index}>
                          <td
                            style={{
                              borderBottom: '1px solid rgba(31,41,55,0.8)',
                              padding: '6px 8px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatDate(tx.timestamp)}
                          </td>
                          <td
                            style={{
                              borderBottom: '1px solid rgba(31,41,55,0.8)',
                              padding: '6px 8px',
                            }}
                          >
                            {tx.description ?? ''}
                          </td>
                          <td
                            style={{
                              borderBottom: '1px solid rgba(31,41,55,0.8)',
                              padding: '6px 8px',
                              textAlign: 'right',
                              color:
                                typeof tx.amount === 'number' && tx.amount < 0
                                  ? '#fca5a5'
                                  : '#bbf7d0',
                            }}
                          >
                            {formatAmount(tx.amount ?? null)}
                          </td>
                          <td
                            style={{
                              borderBottom: '1px solid rgba(31,41,55,0.8)',
                              padding: '6px 8px',
                            }}
                          >
                            {tx.category ?? ''}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
