// Vercel serverless function for Aurora chat
// This is a backend entry point that your React chat UI can call at /api/chat.
// It is designed to be safe to deploy even before you plug in real APIs and DBs.

import { createClient } from '@supabase/supabase-js';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface ChatRequestBody {
  userId?: string;
  messages: ChatMessage[];
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet?: string;
}

interface AuroraAnswer {
  text: string;
  confidence?: number;
  sources?: WebSearchResult[];
  usedSearch?: boolean;
}

// --- Lightweight in-memory cache for web search ---

const SEARCH_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SEARCH_CACHE_LIMIT = 50;

const searchCache = new Map<string, { timestamp: number; results: WebSearchResult[] }>();

function getCachedSearch(query: string): WebSearchResult[] | null {
  const entry = searchCache.get(query);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > SEARCH_TTL_MS) {
    searchCache.delete(query);
    return null;
  }
  return entry.results;
}

function setCachedSearch(query: string, results: WebSearchResult[]): void {
  if (!results.length) return;
  if (searchCache.size >= SEARCH_CACHE_LIMIT) {
    // Remove oldest entry
    const firstKey = searchCache.keys().next().value as string | undefined;
    if (firstKey) searchCache.delete(firstKey);
  }
  searchCache.set(query, { timestamp: Date.now(), results });
}

function isSearchSafe(question: string): boolean {
  const q = question.toLowerCase();
  const blocked = [
    'password',
    'passcode',
    'social security',
    'ssn',
    'credit card',
    'card number',
    'cvv',
    'pin code',
  ];
  return !blocked.some((term) => q.includes(term));
}

function shouldUseWebSearch(question: string): boolean {
  const q = question.toLowerCase();
  if (!q.trim()) return false;

  const externalKeywords = [
    'news',
    'latest',
    'today',
    'current',
    'rate',
    'inflation',
    'recession',
    'market',
    'economy',
    'stock',
    'crypto',
    'yield',
    'tax law',
    'regulation',
    'what is',
    'who is',
    'define',
    'definition',
    'history of',
  ];

  return externalKeywords.some((keyword) => q.includes(keyword));
}

const BING_SEARCH_ENDPOINT = (globalThis as any)?.process?.env
  ?.BING_SEARCH_ENDPOINT as string | undefined;
const BING_SEARCH_KEY = (globalThis as any)?.process?.env
  ?.BING_SEARCH_KEY as string | undefined;

async function performWebSearch(query: string): Promise<WebSearchResult[]> {
  if (!BING_SEARCH_ENDPOINT || !BING_SEARCH_KEY) return [];

  try {
    const url = `${BING_SEARCH_ENDPOINT}?q=${encodeURIComponent(
      query,
    )}&mkt=en-US&count=5&textDecorations=false&textFormat=Raw`;

    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_SEARCH_KEY,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: any = await response.json();
    const webPages: any[] = data.webPages?.value ?? [];

    const results: WebSearchResult[] = webPages.slice(0, 5).map((page: any) => ({
      title: typeof page.name === 'string' ? page.name : page.url,
      url: page.url,
      snippet:
        typeof page.snippet === 'string'
          ? page.snippet
          : typeof page.description === 'string'
          ? page.description
          : undefined,
    }));

    return results.filter((r) => typeof r.url === 'string');
  } catch {
    return [];
  }
}

async function getWebResultsForQuestion(question: string): Promise<WebSearchResult[]> {
  if (!BING_SEARCH_ENDPOINT || !BING_SEARCH_KEY) return [];
  if (!question || !isSearchSafe(question)) return [];
  if (!shouldUseWebSearch(question)) return [];

  const cached = getCachedSearch(question);
  if (cached) return cached;

  const results = await performWebSearch(question);
  if (results.length) {
    setCachedSearch(question, results);
  }
  return results;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body: ChatRequestBody =
      typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as ChatRequestBody);

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({ error: 'Invalid request body: missing messages' });
    }

    const userId = body.userId ?? 'anonymous';
    const lastUser = [...body.messages].reverse().find((m) => m.role === 'user');
    const question = lastUser?.text ?? body.messages[body.messages.length - 1]?.text ?? '';

    const qLower = question.toLowerCase();
    const stockSymbols: string[] = [];
    if (/\bAAPL\b/i.test(question)) stockSymbols.push('AAPL');
    if (/\bTSLA\b/i.test(question)) stockSymbols.push('TSLA');
    if (/\bMSFT\b/i.test(question)) stockSymbols.push('MSFT');

    const cryptoSymbols: string[] = [];
    if (qLower.includes('btc') || qLower.includes('bitcoin')) cryptoSymbols.push('BTC');
    if (qLower.includes('eth') || qLower.includes('ethereum')) cryptoSymbols.push('ETH');

    const [userProfile, fxRates, stockQuotes, cryptoPrices, transactions, webResults] =
      await Promise.all([
        getUserFinancialProfile(userId),
        getFxRates('USD', ['EUR', 'GBP']),
        getStockQuotes(stockSymbols),
        getCryptoPrices(cryptoSymbols, 'usd'),
        getRecentTransactions(userId, 25),
        getWebResultsForQuestion(question),
      ]);

    const kbSnippets = getKnowledgeSnippets(question);

    const answer = await generateAuroraAnswer({
      question,
      messages: body.messages,
      userProfile,
      fxRates,
      stockQuotes,
      cryptoPrices,
      transactions,
      kbSnippets,
      webResults,
    });

    return res.status(200).json({
      text: answer.text,
      confidence: answer.confidence ?? 0.9,
      sources: answer.sources ?? [],
      usedSearch: answer.usedSearch ?? false,
      usedLiveData: {
        fxSymbols: Object.keys(fxRates || {}),
        stocks: Object.keys(stockQuotes || {}),
        crypto: Object.keys(cryptoPrices || {}),
        transactionCount: Array.isArray(transactions) ? transactions.length : 0,
      },
    });
  } catch (err) {
    // In case of any failure (LLM / external API / parsing), fall back to a simple heuristic answer
    console.error('Aurora /api/chat error', err);
    const fallback = basicHeuristicAnswer('');
    return res.status(200).json({
      text: fallback.text,
      confidence: fallback.confidence ?? 0.7,
      fallback: true,
      sources: fallback.sources ?? [],
      usedSearch: fallback.usedSearch ?? false,
    });
  }
}

// --- Supabase-backed user data with safe fallback ---

function getSupabaseClient() {
  const url = (globalThis as any)?.process?.env?.SUPABASE_URL as string | undefined;
  const serviceRoleKey =
    (globalThis as any)?.process?.env?.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const anonKey = (globalThis as any)?.process?.env?.SUPABASE_ANON_KEY as string | undefined;
  const key = serviceRoleKey || anonKey;

  if (!url || !key) return null;

  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

function getMockUserProfile(userId: string) {
  return {
    userId,
    currency: 'USD',
    recentSummary: {
      monthlyIncome: 5200,
      monthlyFixedCosts: 2800,
      avgDiscretionary: 900,
      savingsRate: 0.18,
    },
    goals: [
      { name: 'Emergency fund', target: 10000, progress: 0.6 },
      { name: 'Long-term investing', target: 50000, progress: 0.22 },
    ],
  };
}

async function getUserFinancialProfile(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return getMockUserProfile(userId);
  }

  try {
    // Example: fetch a summarized financial overview from Supabase.
    // Adjust table/column names to match your schema.
    const { data, error } = await (supabase as any)
      .from('financial_overview')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return getMockUserProfile(userId);
    }

    return {
      userId,
      currency: data.currency ?? 'USD',
      recentSummary: {
        monthlyIncome: data.monthly_income ?? 0,
        monthlyFixedCosts: data.monthly_fixed_costs ?? 0,
        avgDiscretionary: data.avg_discretionary ?? 0,
        savingsRate: data.savings_rate ?? 0,
      },
      goals: Array.isArray(data.goals)
        ? data.goals
        : [
            {
              name: 'Emergency fund',
              target: data.emergency_goal_target ?? 0,
              progress: data.emergency_goal_progress ?? 0,
            },
          ],
    };
  } catch {
    return getMockUserProfile(userId);
  }
}

async function getRecentTransactions(userId: string, limit = 25): Promise<any[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await (supabase as any)
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

// --- Live market data via Alpha Vantage & CoinGecko ---

async function getFxRates(base: string, symbols: string[]): Promise<Record<string, number>> {
  const apiKey =
    (globalThis as any)?.process?.env?.ALPHAVANTAGE_API_KEY as string | undefined;
  if (!apiKey) {
    return {};
  }

  const result: Record<string, number> = {};

  for (const symbol of symbols) {
    try {
      const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${encodeURIComponent(
        base,
      )}&to_currency=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json: any = await res.json();
      const rateStr: string | undefined =
        json['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
      const rate = rateStr ? Number(rateStr) : NaN;
      if (!Number.isNaN(rate)) {
        result[symbol] = rate;
      }
    } catch {
      // ignore individual pair failures
    }
  }

  return result;
}

async function getStockQuotes(
  symbols: string[],
): Promise<Record<string, { price: number | null; currency?: string }>> {
  const apiKey =
    (globalThis as any)?.process?.env?.ALPHAVANTAGE_API_KEY as string | undefined;
  if (!apiKey || symbols.length === 0) return {};

  const results: Record<string, { price: number | null; currency?: string }> = {};

  for (const symbol of symbols) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
        symbol,
      )}&apikey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json: any = await res.json();
      const quote = json['Global Quote'] || {};
      const priceStr: string | undefined = quote['05. price'];
      const price = priceStr ? Number(priceStr) : NaN;
      if (!Number.isNaN(price)) {
        results[symbol.toUpperCase()] = {
          price,
          currency: quote['08. currency'] ?? 'USD',
        };
      }
    } catch {
      // ignore individual symbol failures
    }
  }

  return results;
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

async function getCryptoPrices(
  symbols: string[],
  vsCurrency: string,
): Promise<Record<string, number>> {
  const upper = symbols.map((s) => s.toUpperCase());
  const ids = upper
    .map((sym) => COINGECKO_IDS[sym])
    .filter((id, idx, arr) => id && arr.indexOf(id) === idx) as string[];

  if (ids.length === 0) return {};

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      ids.join(','),
    )}&vs_currencies=${encodeURIComponent(vsCurrency)}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const json: any = await res.json();

    const out: Record<string, number> = {};
    for (const sym of upper) {
      const id = COINGECKO_IDS[sym];
      if (!id) continue;
      const entry = json[id];
      const price = entry?.[vsCurrency.toLowerCase()];
      if (typeof price === 'number') {
        out[sym] = price;
      }
    }

    return out;
  } catch {
    return {};
  }
}

// --- Simple knowledge base stub ---

function getKnowledgeSnippets(query: string): string[] {
  const q = query.toLowerCase();
  const snippets: string[] = [];

  if (q.includes('budget') || q.includes('spend') || q.includes('saving')) {
    snippets.push(
      'Good budgeting often routes 20–30% of net income into savings and investing, with fixed costs kept below ~50%.',
      'Tracking spend by category (housing, food, transport, subscriptions) makes it easier to decide where to trim.',
    );
  }

  if (q.includes('invest') || q.includes('stock') || q.includes('etf')) {
    snippets.push(
      'Diversification across low-cost ETFs is a common way to spread risk rather than betting on single names.',
      'Time in the market usually matters more than timing the market; short-term moves are hard to predict.',
    );
  }

  if (q.includes('crypto')) {
    snippets.push(
      'Crypto assets can be extremely volatile. Many guides suggest treating them as a small, higher-risk sleeve.',
    );
  }

  snippets.push(
    'Aurora is not a tax, legal, or investment advisor. Treat these outputs as educational guidance, not directives.',
  );

  return snippets;
}

// --- Core answer generation ---

async function generateAuroraAnswer(context: {
  question: string;
  messages: ChatMessage[];
  userProfile: any;
  fxRates: Record<string, number>;
  stockQuotes: Record<string, { price: number | null; currency?: string }>;
  cryptoPrices: Record<string, number>;
  transactions: any[];
  kbSnippets: string[];
  webResults?: WebSearchResult[];
}): Promise<AuroraAnswer> {
  const apiKey = (globalThis as any)?.process?.env?.OPENAI_API_KEY as string | undefined;
  const question =
    context.question ||
    context.messages.filter((m) => m.role === 'user').slice(-1)[0]?.text ||
    'Explain my finances in simple terms.';

  if (!apiKey) {
    // No LLM key configured yet – use a deterministic heuristic message.
    return basicHeuristicAnswer(question);
  }

  const fxSummary = Object.entries(context.fxRates || {})
    .map(([sym, rate]) => `${sym}: ${rate.toFixed(3)}`)
    .join(', ');

  const stockSummary = Object.entries(context.stockQuotes || {})
    .map(([sym, quote]) => {
      const price = quote.price != null ? quote.price.toFixed(2) : 'n/a';
      const ccy = quote.currency ? ` ${quote.currency}` : '';
      return `${sym}: ${price}${ccy}`;
    })
    .join(', ');

  const cryptoSummary = Object.entries(context.cryptoPrices || {})
    .map(([sym, price]) => `${sym}: ${price.toFixed(2)} USD`)
    .join(', ');

  const transactions = Array.isArray(context.transactions) ? context.transactions : [];
  const txCount = transactions.length;
  const txCategories = Array.from(
    new Set(
      transactions
        .map((t: any) => t?.category)
        .filter((c: unknown): c is string => typeof c === 'string'),
    ),
  ).slice(0, 4);

  const systemPrompt =
    'You are Aurora, an AI finance copilot inside a futuristic finance dashboard. ' +
    'You answer questions about personal finance, investing, banking, and markets using clear, calm language. ' +
    'You can reference recent spending patterns, live market data, and educational finance concepts. ' +
    'You are not a tax, legal, or investment advisor; avoid giving directives, and instead present options and trade-offs.';

  const kbText = context.kbSnippets.join('\n- ');

  const userSnapshot =
    `User monthly income ~${context.userProfile?.recentSummary?.monthlyIncome ?? 'N/A'} ` +
    `with fixed costs ~${context.userProfile?.recentSummary?.monthlyFixedCosts ?? 'N/A'} ` +
    `and savings rate ~${(context.userProfile?.recentSummary?.savingsRate ?? 0) * 100}%.`;

  const assistantIntroLines: string[] = [
    'Here is a brief summary you can use:',
    `- FX snapshot (base USD): ${fxSummary || 'not available at the moment.'}`,
    `- User profile: ${userSnapshot}`,
  ];

  if (txCount > 0) {
    const cats = txCategories.length ? ` (categories seen: ${txCategories.join(', ')})` : '';
    assistantIntroLines.push(`- Recent transactions: ${txCount} loaded${cats}`);
  }

  if (stockSummary) {
    assistantIntroLines.push(`- Stock quotes: ${stockSummary}`);
  }

  if (cryptoSummary) {
    assistantIntroLines.push(`- Crypto prices (USD): ${cryptoSummary}`);
  }

  if (kbText) {
    assistantIntroLines.push(`- Knowledge hints:`, `- ${kbText}`);
  }

  const hasWebResults = Array.isArray(context.webResults) && context.webResults.length > 0;
  if (hasWebResults) {
    const webSummary = (context.webResults || [])
      .slice(0, 4)
      .map((result, index) => {
        const snippet = result.snippet ? ` — ${result.snippet}` : '';
        return `${index + 1}. ${result.title}${snippet} (Source: ${result.url})`;
      })
      .join('\n');

    assistantIntroLines.push('- Web search results:', webSummary);
  }

  const assistantIntro = assistantIntroLines.join('\n');

  const openAiMessages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: assistantIntro },
    { role: 'user', content: `Question: ${question}` },
  ];

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: openAiMessages,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI error: ${res.status}`);
    }

    const data: any = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return basicHeuristicAnswer(question);
    }

    return {
      text: content,
      confidence: 0.92,
      sources: hasWebResults ? (context.webResults || []).slice(0, 4) : undefined,
      usedSearch: hasWebResults,
    };
  } catch (err) {
    console.error('Aurora LLM error', err);
    return basicHeuristicAnswer(question);
  }
}

// --- Fallback heuristic answer ---

function basicHeuristicAnswer(question: string): AuroraAnswer {
  const lower = (question || '').toLowerCase();
  let text =
    "Here's a high-level perspective on your finances. I can help you break this down by accounts, categories, or time horizon if you like.";

  if (lower.includes('budget') || lower.includes('spend')) {
    text =
      'Most people get the largest leverage by looking at their top 2–3 variable categories: often food, transport, and subscriptions. If you trim those by 10–15% while keeping rent and essentials stable, your budget usually feels better without feeling restrictive.';
  } else if (lower.includes('save') || lower.includes('savings')) {
    text =
      'A common pattern is to target a savings rate in the 15–25% range of net income, then adjust up or down based on stability and goals. We can look at your fixed costs and recent spending to see what level is realistic for you.';
  } else if (lower.includes('invest') || lower.includes('stock') || lower.includes('etf')) {
    text =
      'Investing typically starts with building an emergency buffer, then allocating surplus into diversified, low-cost investments like broad-market ETFs. From there, you can decide how much risk to take based on your time horizon and volatility comfort.';
  } else if (lower.includes('runway') || lower.includes('forecast')) {
    text =
      'Runway is essentially your liquid assets divided by your average monthly burn. If we keep your burn stable and increase savings, that runway extends. Small, persistent changes in discretionary categories compound into meaningful extra months.';
  } else if (lower.includes('crypto')) {
    text =
      'Crypto should usually be treated as a high-volatility sleeve in a broader plan. Many approaches keep it to a small percentage of total net worth, rebalanced occasionally, rather than relying on it for near-term goals.';
  }

  return { text, confidence: 0.78 };
}
