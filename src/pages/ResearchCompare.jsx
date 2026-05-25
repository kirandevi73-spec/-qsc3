import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, Cell, AreaChart, Area
} from 'recharts';
import {
  Scale, CheckCircle2, XCircle, AlertTriangle, Download,
  Shield, Zap, Database, Lock, Activity, Filter,
  ChevronDown, ChevronUp, Cpu, Globe
} from 'lucide-react';
import { Card, Badge } from '../components/ui';
import axios from 'axios';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' }
  })
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

// ─── Static Research Data ─────────────────────────────────────────────────────
const ALGORITHMS = [
  { name: 'ECDSA-256', type: 'traditional', pubKey: 32, sigSize: 64, opsPerSec: 15000, secBits: 0, nistLevel: 0, quantumSafe: false, color: '#6b7280', note: "Broken by Shor's algorithm" },
  { name: 'RSA-2048', type: 'traditional', pubKey: 256, sigSize: 256, opsPerSec: 1000, secBits: 0, nistLevel: 0, quantumSafe: false, color: '#9ca3af', note: "Broken by Shor's algorithm" },
  { name: 'Dilithium-3', type: 'pqc', pubKey: 1952, sigSize: 3293, opsPerSec: 2900, secBits: 128, nistLevel: 3, quantumSafe: true, color: '#ef4444', note: 'NIST FIPS 204 — large sigs' },
  { name: 'Falcon-512', type: 'pqc', pubKey: 897, sigSize: 690, opsPerSec: 1500, secBits: 128, nistLevel: 1, quantumSafe: true, color: '#f97316', note: 'Compact sigs, slow keygen' },
  { name: 'SPHINCS+', type: 'pqc', pubKey: 64, sigSize: 8080, opsPerSec: 130, secBits: 128, nistLevel: 1, quantumSafe: true, color: '#a855f7', note: 'Hash-based, very large sigs' },
  { name: 'QSC3 (D3+IPFS)', type: 'qsc3', pubKey: 1952, sigSize: 32, opsPerSec: 2700, secBits: 128, nistLevel: 3, quantumSafe: true, color: '#00f3ff', note: 'Merkle root on-chain only' },
];

const METRICS = [
  { key: 'quantumSecurity', label: 'Quantum Security', trad: 1, pqc: 5, qsc3: 5, icon: Shield },
  { key: 'onChainStorage', label: 'On-Chain Storage Efficiency', trad: 5, pqc: 1, qsc3: 4, icon: Database },
  { key: 'tps', label: 'Network Scalability (TPS)', trad: 5, pqc: 2, qsc3: 4, icon: Activity },
  { key: 'latency', label: 'End-to-End Latency', trad: 5, pqc: 3, qsc3: 3, icon: Zap },
  { key: 'gasCost', label: 'Gas Cost / Operation', trad: 5, pqc: 1, qsc3: 4, icon: Lock },
  { key: 'keyManagement', label: 'Key Management Simplicity', trad: 5, pqc: 2, qsc3: 3, icon: Cpu },
  { key: 'nistStandard', label: 'NIST Standardization', trad: 3, pqc: 4, qsc3: 5, icon: CheckCircle2 },
  { key: 'interoperability', label: 'Blockchain Interoperability', trad: 4, pqc: 2, qsc3: 4, icon: Globe },
];

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'charts', label: 'Charts' },
  { id: 'matrix', label: 'Perf. Matrix' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreBars({ value, color }) {
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className={`h-2 w-4 rounded-sm origin-bottom ${i <= value ? color : 'bg-slate-800'}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 mt-1 block">{value}/5</span>
    </div>
  );
}

function MiniBar({ value, max, color, delay = 0 }) {
  return (
    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        transition={{ delay, duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="font-mono text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Derived stat helpers ─────────────────────────────────────────────────────
const avg = (arr, key) =>
  arr?.length ? Math.round(arr.reduce((s, r) => s + (r[key] ?? 0), 0) / arr.length) : null;

const maxSaving = (arr, bigKey, smallKey) => {
  if (!arr?.length) return null;
  const last = arr[arr.length - 1];
  if (!last?.[bigKey]) return null;
  return Math.round((1 - last[smallKey] / last[bigKey]) * 100);
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResearchCompare() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sigSize');
  const [sortAsc, setSortAsc] = useState(true);
  const [backendData, setBackendData] = useState(null);  // { latency, security, storage, gas }
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Backend Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    axios.get('http://localhost:5000/api/analytics/stats')
      .then(res => setBackendData(res.data))
      .catch(() => setBackendData(null))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Derived live stats from real backend shape ────────────────────────────
  const liveStats = backendData ? [
    {
      label: 'Avg Gen/Sign (ms)',
      value: avg(backendData.latency, 'gen') ?? '—',
      sub: 'Dilithium-3'
    },
    {
      label: 'Avg Verify (ms)',
      value: avg(backendData.latency, 'verify') ?? '—',
      sub: 'Dilithium-3'
    },
    {
      label: 'Storage Savings',
      value: maxSaving(backendData.storage, 'raw', 'qsc3') != null
        ? `${maxSaving(backendData.storage, 'raw', 'qsc3')}%`
        : '—',
      sub: 'vs Raw PQC'
    },
    {
      label: 'Gas Savings',
      value: maxSaving(backendData.gas, 'trad', 'qsc3') != null
        ? `${maxSaving(backendData.gas, 'trad', 'qsc3')}%`
        : '—',
      sub: 'vs Traditional'
    },
  ] : [];

  // ── Filtered + sorted algorithms ──────────────────────────────────────────
  const filtered = ALGORITHMS.filter(a => filter === 'all' || a.type === filter);
  const sorted = [...filtered].sort((a, b) =>
    sortAsc ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy]
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), algorithms: ALGORITHMS, metrics: METRICS, backendData }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'qsc3-research-comparison.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = field => {
    if (sortBy === field) setSortAsc(p => !p);
    else { setSortBy(field); setSortAsc(true); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
            Research <span className="neon-text-purple">Comparison</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Evaluating QSC3 against traditional and naive PQC implementations
          </p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                     text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm font-mono"
        >
          <Download size={14} /> Export JSON
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
        className="flex gap-1 p-1 bg-black/30 rounded-xl border border-white/5 w-fit"
      >
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ═══════════════════════════ OVERVIEW ═══════════════════════════ */}
        {activeTab === 'overview' && (
          <motion.div key="overview" variants={fadeIn} initial="hidden" animate="visible" exit="hidden"
            className="space-y-6"
          >
            {/* 3 Approach Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  Icon: XCircle, iconColor: 'text-gray-400', borderTop: 'border-t-gray-500',
                  title: 'Traditional (ECDSA)',
                  desc: "Current blockchain standard using Elliptic Curve Cryptography. Highly efficient but broken by Shor's algorithm on a mature quantum computer.",
                  stats: [{ l: 'Key Size', v: '32 B' }, { l: 'Sig Size', v: '64 B' }, { l: 'Q-Safe', v: '✗' }],
                  badge: 'VULNERABLE', badgeCls: 'bg-gray-800 text-gray-400 border border-gray-600',
                  delay: 0
                },
                {
                  Icon: AlertTriangle, iconColor: 'text-red-400', borderTop: 'border-t-red-500',
                  title: 'PQC-Only (Naive)',
                  desc: 'Direct Dilithium/Falcon substitution. Quantum-secure but causes massive state bloat, low TPS, and exorbitant gas costs from large signature sizes.',
                  stats: [{ l: 'Key Size', v: '1952 B' }, { l: 'Sig Size', v: '3293 B' }, { l: 'Q-Safe', v: '✓' }],
                  badge: 'NOT SCALABLE', badgeCls: 'bg-red-900/30 text-red-400 border border-red-700',
                  delay: 0.1
                },
                {
                  Icon: CheckCircle2, iconColor: 'text-neon-cyan', borderTop: 'border-t-neon-cyan',
                  title: 'QSC3 Framework',
                  desc: 'Dilithium-3 + IPFS + Merkle anchoring. Full quantum security while keeping on-chain footprint to just a 32-byte root hash — best of both worlds.',
                  stats: [{ l: 'On-chain', v: '32 B' }, { l: 'Storage', v: 'IPFS' }, { l: 'Q-Safe', v: '✓' }],
                  badge: 'OPTIMAL', badgeCls: 'bg-cyan-900/30 text-neon-cyan border border-cyan-700',
                  delay: 0.2, glow: true
                }
              ].map(({ Icon, iconColor, borderTop, title, desc, stats, badge, badgeCls, delay, glow }) => (
                <motion.div key={title} custom={delay} variants={fadeUp} initial="hidden" animate="visible">
                  <Card className={`border-t-4 ${borderTop} flex flex-col h-full
                    ${glow ? 'glass-strong shadow-[0_0_20px_rgba(0,243,255,0.1)]' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={iconColor} size={20} />
                      <h3 className="font-bold text-white">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 flex-1 leading-relaxed">{desc}</p>
                    <div className="grid grid-cols-3 gap-2 my-4">
                      {stats.map(({ l, v }) => (
                        <div key={l} className="bg-black/30 rounded-lg p-2 text-center border border-white/5">
                          <div className="text-xs text-gray-500 mb-1">{l}</div>
                          <div className="text-sm font-mono font-bold text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded self-start font-mono ${badgeCls}`}>
                      {badge}
                    </span>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* ── Live Stats Card (real backend fields) ── */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="text-neon-cyan" size={16} />
                    <h3 className="text-sm font-semibold text-gray-300 font-mono">
                      Live System Metrics
                    </h3>
                  </div>
                  {statsLoading && (
                    <span className="text-xs text-gray-600 animate-pulse font-mono">
                      Fetching backend…
                    </span>
                  )}
                  {!statsLoading && backendData && (
                    <span className="text-xs text-neon-cyan font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan inline-block animate-pulse" />
                      Backend Connected
                    </span>
                  )}
                </div>

                {backendData ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {liveStats.map(({ label, value, sub }) => (
                      <div key={label} className="bg-black/20 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">{label}</div>
                        <div className="text-2xl font-bold font-mono text-neon-cyan">{value}</div>
                        <div className="text-xs text-gray-600 mt-1">{sub}</div>
                      </div>
                    ))}
                  </div>
                ) : !statsLoading ? (
                  <div className="text-sm text-gray-600 font-mono py-2">
                    ⚠ Backend offline — run <span className="text-yellow-500">node server.js</span> to see live stats
                  </div>
                ) : null}

                {/* Mini latency preview from real data */}
                {backendData?.latency?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-600 mb-3 font-mono">
                      Dilithium-3 Latency Preview (ms)
                    </p>
                    <ResponsiveContainer width="100%" height={80}>
                      <BarChart data={backendData.latency} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                        <Bar dataKey="gen" name="Gen/Sign" fill="#bc13fe" radius={[3, 3, 0, 0]} barSize={8} />
                        <Bar dataKey="verify" name="Verify" fill="#00f3ff" radius={[3, 3, 0, 0]} barSize={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Q-Day Threat Alert */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <Card className="border border-red-900/30 bg-red-950/10">
                <div className="flex items-start gap-4">
                  <Shield className="text-red-500 mt-0.5 shrink-0" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-red-400 mb-1 font-mono">
                      Q-Day Risk Assessment
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      A cryptographically-relevant quantum computer with ~4,000 noise-free qubits
                      could break ECDSA-256 and RSA-2048 in hours using Shor's algorithm.
                      Expert consensus places Q-Day at{' '}
                      <span className="text-red-400 font-mono">2030–2035</span>.
                      QSC3 migrates supply chain infrastructure to NIST-standardised post-quantum
                      cryptography <span className="text-neon-cyan font-mono">today</span>.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* ═══════════════════════════ ALGORITHMS ═════════════════════════ */}
        {activeTab === 'algorithms' && (
          <motion.div key="algorithms" variants={fadeIn} initial="hidden" animate="visible" exit="hidden"
            className="space-y-4"
          >
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Filter size={14} className="text-gray-500" />
              {[
                { id: 'all', label: 'All' },
                { id: 'traditional', label: 'Traditional' },
                { id: 'pqc', label: 'PQC-Only' },
                { id: 'qsc3', label: 'QSC3' },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setFilter(id)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all font-mono ${filter === id
                      ? 'border-neon-cyan text-neon-cyan bg-cyan-900/20'
                      : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
                    }`}
                >
                  {label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort:</span>
                {[
                  { field: 'sigSize', label: 'Sig Size' },
                  { field: 'pubKey', label: 'Key Size' },
                  { field: 'opsPerSec', label: 'Speed' },
                ].map(({ field, label }) => (
                  <button key={field} onClick={() => toggleSort(field)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs border transition-all font-mono ${sortBy === field
                        ? 'border-purple-500 text-purple-400 bg-purple-900/20'
                        : 'border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                  >
                    {label}
                    {sortBy === field && (sortAsc ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                  </button>
                ))}
              </div>
            </div>

            {/* Algorithm Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((algo, i) => (
                <motion.div key={algo.name} custom={i} variants={fadeUp} initial="hidden" animate="visible">
                  <Card className={`flex flex-col gap-3 border ${algo.type === 'qsc3'
                      ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.06)]'
                      : 'border-white/5'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold font-mono text-white text-sm">{algo.name}</h3>
                        <span className={`text-xs ${algo.type === 'traditional' ? 'text-gray-500'
                            : algo.type === 'pqc' ? 'text-red-400'
                              : 'text-neon-cyan'
                          }`}>
                          {algo.type === 'traditional' ? 'Traditional'
                            : algo.type === 'pqc' ? 'Post-Quantum Only'
                              : 'QSC3 Framework'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {algo.nistLevel > 0 && (
                          <span className="text-xs font-mono text-purple-400 bg-purple-900/20
                                           border border-purple-700/30 px-2 py-0.5 rounded-full">
                            NIST L{algo.nistLevel}
                          </span>
                        )}
                        <div title={algo.quantumSafe ? 'Quantum Safe' : 'Quantum Vulnerable'}
                          className={`w-2 h-2 rounded-full ${algo.quantumSafe ? 'bg-neon-cyan' : 'bg-red-500'}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { label: 'Public Key', rawVal: algo.pubKey, max: 2100, unit: 'B', isSpeed: false },
                        { label: 'Signature', rawVal: algo.sigSize, max: 8500, unit: 'B', isSpeed: false },
                        { label: 'Speed', rawVal: algo.opsPerSec, max: 16000, unit: 'op/s', isSpeed: true },
                      ].map(({ label, rawVal, max, unit, isSpeed }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">{label}</span>
                            <span className="font-mono text-gray-300">
                              {rawVal.toLocaleString()} {unit}
                            </span>
                          </div>
                          <MiniBar
                            value={rawVal} max={max} delay={i * 0.05}
                            color={
                              isSpeed
                                ? algo.type === 'qsc3' ? 'bg-neon-cyan' : 'bg-blue-500'
                                : algo.type === 'qsc3' ? 'bg-neon-cyan'
                                  : algo.type === 'pqc' ? 'bg-red-500' : 'bg-gray-500'
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 border-t border-white/5 pt-2 font-mono">
                      {algo.note}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════ CHARTS ═════════════════════════════ */}
        {activeTab === 'charts' && (
          <motion.div key="charts" variants={fadeIn} initial="hidden" animate="visible" exit="hidden"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Latency — REAL backend data */}
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <Card>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-300 font-mono">
                      Dilithium-3 Latency (ms)
                    </h3>
                    {backendData?.latency && (
                      <span className="text-xs text-neon-cyan font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan inline-block" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Real backend data from <code className="text-gray-500">/api/analytics/stats</code>
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={backendData?.latency ?? []}
                      margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                      <Bar dataKey="gen" name="Gen/Sign (ms)" fill="#bc13fe" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="verify" name="Verify (ms)" fill="#00f3ff" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Storage — REAL backend data */}
              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                <Card>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-300 font-mono">
                      Storage Requirements (MB)
                    </h3>
                    <Badge variant="cyan">94% Savings</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Real backend data from <code className="text-gray-500">/api/analytics/stats</code>
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart
                      data={backendData?.storage ?? []}
                      margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
                    >
                      <defs>
                        <linearGradient id="gRaw" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gQsc3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                      <Area type="monotone" dataKey="raw" name="Raw PQC" stroke="#f43f5e" strokeWidth={2} fill="url(#gRaw)" />
                      <Area type="monotone" dataKey="qsc3" name="QSC3 (Merkle+IPFS)" stroke="#00f3ff" strokeWidth={2} fill="url(#gQsc3)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Gas — REAL backend data */}
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <Card>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-300 font-mono">
                      Gas Cost (USD)
                    </h3>
                    <Badge variant="purple">70% Savings</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Real backend data from <code className="text-gray-500">/api/analytics/stats</code>
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart
                      data={backendData?.gas ?? []}
                      margin={{ top: 4, right: 8, bottom: 4, left: -20 }}
                    >
                      <defs>
                        <linearGradient id="gTrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gQsc3Gas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                      <Area type="monotone" dataKey="trad" name="Traditional" stroke="#f43f5e" strokeWidth={2} fill="url(#gTrad)" />
                      <Area type="monotone" dataKey="qsc3" name="QSC3 (Hash Only)" stroke="#bc13fe" strokeWidth={2} fill="url(#gQsc3Gas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Security Radar — REAL backend data */}
              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <Card className="glass-strong">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-300 font-mono">
                      Security &amp; Efficiency Radar
                    </h3>
                    {backendData?.security && (
                      <span className="text-xs text-neon-cyan font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan inline-block" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Real backend data from <code className="text-gray-500">/api/analytics/stats</code>
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={backendData?.security ?? []}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Radar name="Traditional (ECDSA)" dataKey="trad" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} strokeWidth={1.5} />
                      <Radar name="QSC3 (Dilithium+IPFS)" dataKey="qsc3" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.25} strokeWidth={2} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════ MATRIX ═════════════════════════════ */}
        {activeTab === 'matrix' && (
          <motion.div key="matrix" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
            <Card>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Scale className="text-neon-cyan" size={20} />
                Extended Performance Matrix
              </h2>
              <p className="text-xs text-gray-500 mb-6 font-mono">
                8 metrics · 3 frameworks · Score out of 5
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-500 font-mono">
                      <th className="pb-3 font-medium w-56">Metric</th>
                      <th className="pb-3 font-medium">Traditional</th>
                      <th className="pb-3 font-medium">PQC-Only</th>
                      <th className="pb-3 font-medium text-neon-cyan">QSC3</th>
                      <th className="pb-3 font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.map((m, i) => {
                      const best = Math.max(m.trad, m.pqc, m.qsc3);
                      const qsc3IsBest = m.qsc3 === best && m.qsc3 > Math.max(m.trad, m.pqc);
                      const qsc3IsTie = m.qsc3 === best && !qsc3IsBest;
                      return (
                        <motion.tr key={m.key} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 font-medium text-gray-300 text-sm">
                            <div className="flex items-center gap-2">
                              <m.icon size={13} className="text-gray-600 shrink-0" />
                              {m.label}
                            </div>
                          </td>
                          <td className="py-4"><ScoreBars value={m.trad} color="bg-gray-500" /></td>
                          <td className="py-4"><ScoreBars value={m.pqc} color="bg-red-500" /></td>
                          <td className="py-4"><ScoreBars value={m.qsc3} color="bg-neon-cyan" /></td>
                          <td className="py-4">
                            <span className={`text-xs font-mono px-2 py-1 rounded-full border ${qsc3IsBest ? 'bg-cyan-900/30 text-neon-cyan  border-cyan-700/40'
                                : qsc3IsTie ? 'bg-gray-800    text-gray-400   border-gray-600/40'
                                  : 'bg-red-900/20  text-red-400    border-red-700/30'
                              }`}>
                              {qsc3IsBest ? '▲ BEST' : qsc3IsTie ? '— TIE' : '▼ BEHIND'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Score Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: 'Traditional', wins: METRICS.filter(m => m.trad > Math.max(m.pqc, m.qsc3)).length, color: 'text-gray-400' },
                  { label: 'PQC-Only', wins: METRICS.filter(m => m.pqc > Math.max(m.trad, m.qsc3)).length, color: 'text-red-400' },
                  { label: 'QSC3', wins: METRICS.filter(m => m.qsc3 > Math.max(m.trad, m.pqc)).length, color: 'text-neon-cyan' },
                ].map(({ label, wins, color }) => (
                  <div key={label} className="bg-black/20 rounded-xl p-3 border border-white/5 text-center">
                    <div className={`text-2xl font-bold font-mono ${color}`}>{wins}</div>
                    <div className="text-xs text-gray-500 mt-1">{label} wins</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}