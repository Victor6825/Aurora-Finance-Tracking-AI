import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Brain } from 'lucide-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBarMain';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LiveFlowPage } from './pages/LiveFlowPage';
import { AccountsPage } from './pages/AccountsPage';
import { SecurityPage } from './pages/SecurityPage';
import { AiChatPage } from './pages/AiChatPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('neon-sidebar-open');
    if (stored !== null) return stored === 'true';
    // Default: open on desktop, collapsed on mobile
    return window.innerWidth >= 768;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('neon-sidebar-open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen app-bg text-slate-50 flex items-center justify-center p-4">
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute -inset-[15%] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.16),_transparent_55%)]" />
        <div className="absolute inset-0 bg-ai-grid bg-ai-grid/20 mix-blend-soft-light" />
      </div>

      {/* Global sidebar toggle (visible on all screen sizes) */}
      <button
        type="button"
        className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-200 shadow-[0_0_24px_rgba(15,23,42,0.9)] transition-transform hover:-translate-y-0.5 hover:border-emerald-400/80 hover:text-emerald-300"
        aria-label={isSidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
        onClick={() => setIsSidebarOpen((open) => !open)}
      >
        <Menu className="h-4 w-4" />
      </button>

      <motion.button
        type="button"
        onClick={() => navigate('/ai-chat')}
        className="fixed bottom-4 right-4 z-30 group sm:bottom-6 sm:right-6"
        title="Chat with Aurora – Tap to ask anything about your finances"
        aria-label="Open AI chat – Chat with Aurora"
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-emerald-400 to-indigo-500 shadow-[0_0_40px_rgba(56,189,248,0.9)] border border-emerald-300/80 sm:h-16 sm:w-16">
          <motion.div
            className="flex items-center justify-center"
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Brain className="h-6 w-6 text-slate-950" />
          </motion.div>
          <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300 shadow-[0_0_18px_rgba(15,23,42,0.95)]">
            AI
          </span>
        </div>
        <div className="pointer-events-none absolute right-full mr-3 hidden translate-y-1 rounded-full bg-slate-950/95 px-3 py-1 text-[10px] font-medium text-emerald-100 opacity-0 shadow-[0_0_24px_rgba(15,23,42,0.95)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
          Chat with Aurora
        </div>
      </motion.button>

      <div className="relative z-10 flex min-h-screen overflow-x-hidden overflow-y-visible">
        {/* Desktop sliding sidebar (md+) that pushes content */}
        <AnimatePresence initial={false}>
          <motion.div
            className="hidden md:flex overflow-hidden"
            initial={false}
            animate={{ width: isSidebarOpen ? 288 : 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <Sidebar variant="desktop" />
          </motion.div>
        </AnimatePresence>

        {/* Mobile sliding sidebar that pushes content */}
        <AnimatePresence initial={false}>
          <motion.div
            className="flex md:hidden overflow-hidden"
            initial={false}
            animate={{ width: isSidebarOpen ? 288 : 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <Sidebar variant="mobile" onClose={() => setIsSidebarOpen(false)} />
          </motion.div>
        </AnimatePresence>

        {/* Main content flexes to fill remaining space and is resized when sidebar width changes on any breakpoint */}
        <div className="flex flex-1 flex-col">
          <TopBar onLogout={() => setIsAuthenticated(false)} />
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<Dashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/live-flow" element={<LiveFlowPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/ai-chat" element={<AiChatPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
