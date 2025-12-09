import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

interface ChatSource {
  title: string;
  url: string;
  snippet?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: ChatSource[];
  usedSearch?: boolean;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'ai',
    text: "Hey, I'm Aurora — your NeonLedger AI co-pilot. I can help you understand your spending, plan savings, and model your runway.",
    timestamp: 'Just now',
    confidence: 0.97,
  },
  {
    id: 'm2',
    role: 'ai',
    text: 'Try asking: "How much can I safely save this month without risking my bills?"',
    timestamp: 'Just now',
    confidence: 0.94,
  },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

async function mockFinanceAiResponse(question: string): Promise<{
  text: string;
  confidence?: number;
}> {
  const lower = question.toLowerCase();
  let text = "Here is a high-level take on your finances. I can break this down by accounts, categories, or time horizon if you like.";
  if (lower.includes('budget') || lower.includes('spend')) {
    text =
      'Based on your recent transactions, most variance is coming from food delivery and mobility. Capping those lines by ~15% would keep you on budget without touching rent or subscriptions.';
  } else if (lower.includes('save') || lower.includes('savings')) {
    text =
      'Given your current inflows and fixed costs, you could route an extra 8–12% of monthly cash into savings while keeping a 2.5× cushion on upcoming bills.';
  } else if (lower.includes('invest')) {
    text =
      'Your cash buffer looks healthy. Consider splitting surplus between a high-yield vault and a diversified ETF sleeve. I can simulate scenarios once you define your risk band.';
  } else if (lower.includes('runway') || lower.includes('forecast')) {
    text =
      'Projected runway is just over 7 months at the current burn. Trimming 5–7% from discretionary categories would extend that by ~0.8 months without touching essentials.';
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve({ text, confidence: 0.93 }), 700);
  });
}

async function callAuroraChatApi(
  conversation: ChatMessage[],
  question: string,
): Promise<{
  text: string;
  confidence?: number;
  sources?: ChatSource[];
  usedSearch?: boolean;
}> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // In a real app, derive userId from auth; here we send a placeholder.
        userId: 'demo-user',
        messages: conversation.map((m) => ({ role: m.role, text: m.text })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Aurora API error: ${res.status}`);
    }

    const data: any = await res.json();
    const text: string =
      data.text ??
      'I had trouble generating a detailed answer, but I can still help you reason about your finances.';
    const confidence: number = typeof data.confidence === 'number' ? data.confidence : 0.9;
    const rawSources: unknown = data.sources;
    const parsedSources: ChatSource[] = Array.isArray(rawSources)
      ? rawSources
          .map((item: any) => ({
            title: typeof item?.title === 'string' ? item.title : item?.url ?? 'Source',
            url: typeof item?.url === 'string' ? item.url : '#',
            snippet: typeof item?.snippet === 'string' ? item.snippet : undefined,
          }))
          .filter((s) => typeof s.url === 'string' && s.url !== '#')
      : [];
    const usedSearch: boolean = Boolean(data.usedSearch && parsedSources.length);
    return { text, confidence, sources: parsedSources, usedSearch };
  } catch (error) {
    console.error('Falling back to mock Aurora response', error);
    const fallback = await mockFinanceAiResponse(question);
    return { ...fallback, sources: undefined, usedSearch: false };
  }
}

export function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'ai');
  const searchUsed = Boolean(lastAiMessage?.usedSearch);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const now = new Date();
    const userMessage: ChatMessage = {
      id: `u-${now.getTime()}`,
      role: 'user',
      text: trimmed,
      timestamp: formatTime(now),
    };

    const conversation = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const ai = await callAuroraChatApi(conversation, trimmed);
      const aiMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: ai.text,
        confidence: ai.confidence,
        timestamp: formatTime(new Date()),
        sources: ai.sources,
        usedSearch: ai.usedSearch,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 px-4 py-5 md:px-8 md:py-7">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-6 min-h-[calc(100vh-5rem)]">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-500 text-slate-950 shadow-neon">
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
              NeonLedger AI Co-Pilot
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-50 sm:text-3xl">Ask anything about your finances.</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Budgeting, expense tracking, savings plans, investment strategies, anomaly detection, and runway
              forecasts — Aurora can reason over your financial graph in real time.
            </p>
          </div>
          <div className="card-3d card-3d-hover flex items-center gap-3 rounded-2xl px-4 py-3 text-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/90 text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.75)]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-slate-50">AI context loaded</p>
              <p className="text-[11px] text-slate-400">Recent transactions, insights, and projections are in view.</p>
              {searchUsed && (
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
                  Search used
                </p>
              )}
            </div>
          </div>
        </header>

        <section className="card-3d card-3d-hover flex min-h-[60vh] flex-col rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-sm scroll-soft">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl border px-3 py-2.5 text-xs sm:text-[13px] shadow-[0_0_22px_rgba(15,23,42,0.9)] ${
                    msg.role === 'user'
                      ? 'border-indigo-400/70 bg-indigo-500/20 text-slate-50'
                      : 'border-emerald-400/60 bg-slate-950/90 text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {msg.role === 'user' ? 'YOU' : 'AURORA · AI CO-PILOT'}
                    </p>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.role === 'ai' && msg.confidence != null && (
                    <p className="mt-2 text-[10px] text-emerald-300/90">
                      Confidence: {(msg.confidence * 100).toFixed(0)}%
                      {msg.usedSearch && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-sky-500/80 bg-sky-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                          Live web search
                        </span>
                      )}
                    </p>
                  )}
                  {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 rounded-xl border border-slate-800/80 bg-slate-950/90 px-2.5 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Sources
                      </p>
                      <ul className="mt-1 space-y-1.5 text-[10px] text-slate-300">
                        {msg.sources.slice(0, 4).map((source, index) => {
                          const url = source.url;
                          let host: string | undefined;
                          try {
                            host = new URL(url).hostname.replace(/^www\./, '');
                          } catch {
                            host = undefined;
                          }
                          return (
                            <li key={`${source.url}-${index}`} className="leading-snug">
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-sky-300 hover:text-sky-200 hover:underline"
                              >
                                <span className="rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[9px] text-sky-200">
                                  {index + 1}
                                </span>
                                <span className="truncate">{source.title}</span>
                                {host && (
                                  <span className="text-[9px] text-slate-500">· {host}</span>
                                )}
                              </a>
                              {source.snippet && (
                                <p className="ml-6 mt-0.5 text-[10px] text-slate-400">
                                  {source.snippet}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/70 px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none sm:text-sm"
            />
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200 hover:bg-emerald-400/20 hover:text-emerald-50 disabled:opacity-60"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
