import React, { useState } from 'react';
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
  Zap
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
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-[100dvh] w-full min-w-0 overflow-hidden bg-dark-bg font-sans text-gray-200">
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
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/5 bg-[#0a0f1e]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0 shadow-2xl shadow-neon-cyan/20" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan">
              <Zap size={18} />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">
              QSC<span className="neon-text-cyan">3</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto h-[calc(100dvh-4rem)]">
          <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
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
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-neon-cyan/10 text-neon-cyan neon-border-cyan border-l-2 border-y-0 border-r-0"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-100 border-l-2 border-transparent"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-neon-cyan" : "text-gray-500 group-hover:text-gray-300")} />
                {item.name}
              </NavLink>
            );
          })}

          <div className="mt-8 px-2">
            <div className="rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
                <span className="text-xs font-bold text-neon-purple uppercase tracking-wider">System Status</span>
              </div>
              <div className="text-sm text-gray-300">All nodes operational</div>
              <div className="mt-2 text-xs text-gray-500 font-mono">Q-Day Est: 2035</div>
            </div>
          </div>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 w-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 min-w-0 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative">
          {/* Subtle grid overlay for main area */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

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
