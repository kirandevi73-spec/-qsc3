import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PenTool,
  Database,
  Network,
  Link as LinkIcon,
  Cpu,
  BarChart3,
  Scale,
  GitMerge,
  ShieldAlert,
  X,
  Zap,
  Lock,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from './ui';
import Header from './Layout/Header';

const NAV_ITEMS = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/pqc-signature', name: 'PQC Signature', icon: PenTool },
  { path: '/ipfs-module', name: 'IPFS Storage', icon: Database },
  { path: '/merkle-tree', name: 'Merkle Tree', icon: Network },
  { path: '/blockchain', name: 'Blockchain Anchoring', icon: LinkIcon },
  { path: '/iot-monitor', name: 'IoT Monitor', icon: Cpu },
  { path: '/analytics', name: 'Analytics', icon: BarChart3 },
  { path: '/research-compare', name: 'Research Compare', icon: Scale },
  { path: '/architecture', name: 'Architecture Flow', icon: GitMerge },
  { path: '/quantum-threat', name: 'Quantum Threat', icon: ShieldAlert },
  { path: '/security', name: 'Security', icon: Lock },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-[100dvh] w-full min-w-0 overflow-hidden bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-[var(--neon-cyan)] before:to-[var(--neon-purple)]",
          sidebarOpen ? "translate-x-0 shadow-2xl shadow-[var(--neon-cyan)]/20" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3 relative">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/50 text-[var(--neon-cyan)]">
              {/* Animated rings */}
              <div className="absolute inset-[-4px] rounded-full border border-[var(--neon-cyan)]/50 border-t-transparent animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-[-8px] rounded-full border border-[var(--neon-purple)]/30 border-b-transparent animate-[spin_4s_linear_infinite_reverse]" />
              <Zap size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-wider text-[var(--text-primary)] font-orbitron">
                QSC<span className="text-[var(--neon-cyan)] drop-shadow-[0_0_8px_var(--neon-cyan)]">3</span>
              </span>
              <span className="text-[10px] text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 px-1.5 py-0.5 rounded border border-[var(--neon-cyan)]/20 w-fit mt-1">v2.0 PRODUCTION</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto h-[calc(100dvh-4rem)] pb-24">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden",
                  isActive
                    ? "text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10"
                    : "text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]" />
                )}
                {/* Active bg glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-cyan)]/20 to-transparent opacity-50" />
                )}
                <Icon size={18} className={cn("relative z-10", isActive ? "text-[var(--neon-cyan)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")} />
                <span className="relative z-10">{item.name}</span>
              </NavLink>
            );
          })}

          <div className="mt-8 px-2">
            <div className="rounded-xl border border-[var(--neon-purple)]/20 bg-[var(--neon-purple)]/5 p-4 relative overflow-hidden group shadow-card-glow">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--neon-purple)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--neon-purple)] relative z-10" />
                  <div className="absolute w-4 h-4 rounded-full bg-[var(--neon-purple)]/40 animate-ping" />
                </div>
                <span className="text-xs font-bold text-[var(--neon-purple)] uppercase tracking-wider">System Status</span>
              </div>
              <div className="text-sm text-[var(--text-primary)]">All nodes operational</div>
              <div className="mt-2 text-xs text-[var(--text-secondary)] font-mono">Q-Day Est: 2035</div>
            </div>
          </div>
        </nav>

        {/* Dark/Light mode toggle */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--neon-cyan)] hover:border-[var(--neon-cyan)]/50"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 w-full overflow-hidden relative">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 h-full w-full max-w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
