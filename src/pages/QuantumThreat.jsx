import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card, Badge } from '../components/ui';
import {
  ShieldAlert, Info, AlertTriangle, ShieldCheck, Zap,
  Clock, TrendingUp, Activity, RefreshCw, Lock, Eye,
  Cpu, Database, Radio, Target, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// ─── THREAT MATRIX DATA ───────────────────────────────────────────────────────
const THREATS = [
  {
    attack: "Shor's Algorithm",
    icon: Target,
    target: 'Public Key Crypto (RSA / ECDSA / DLP)',
    traditional: { label: 'Broken', variant: 'red', icon: AlertTriangle },
    qsc3: { label: 'Secure — Lattice (MLWE)', variant: 'green', icon: ShieldCheck },
    severity: 'CRITICAL',
    detail: 'Polynomial-time factoring + discrete-log breaks RSA-2048 and secp256k1 with ~4 000 logical qubits.',
  },
  {
    attack: "Grover's Algorithm",
    icon: Zap,
    target: 'Symmetric / Hash (SHA-256, AES-128)',
    traditional: { label: 'Weakened — 64-bit eff.', variant: 'yellow', icon: AlertTriangle },
    qsc3: { label: 'Secure — SHA-3 / 512-bit', variant: 'green', icon: ShieldCheck },
    severity: 'HIGH',
    detail: 'Quadratic speedup halves effective key length. SHA-256 drops to 128-bit effective security. Mitigated by doubling key size or using SHA-3/512.',
  },
  {
    attack: 'Lattice Reduction (BKZ)',
    icon: Lock,
    target: 'PQC Algorithms (LWE / SIS)',
    traditional: { label: 'N / A', variant: 'gray', icon: null },
    qsc3: { label: 'Secure — NIST Level 3', variant: 'cyan', icon: ShieldCheck },
    severity: 'LOW',
    detail: 'Best known classical + quantum attacks on Module-LWE remain exponential. Dilithium-3 targets NIST security level 3 (≈AES-192).',
  },
  {
    attack: 'Side-Channel (Power / EM)',
    icon: Radio,
    target: 'Edge Hardware (ESP32-S3)',
    traditional: { label: 'Vulnerable', variant: 'red', icon: AlertTriangle },
    qsc3: { label: 'Mitigated — Masking', variant: 'cyan', icon: ShieldCheck },
    severity: 'MEDIUM',
    detail: 'Constant-time implementation + Boolean masking on ESP32-S3 prevents power-trace recovery of signing keys.',
  },
  {
    attack: 'Store Now Decrypt Later',
    icon: Database,
    target: 'In-transit Blockchain Traffic',
    traditional: { label: 'Harvested today', variant: 'red', icon: AlertTriangle },
    qsc3: { label: 'Immune — PQC signed', variant: 'green', icon: ShieldCheck },
    severity: 'CRITICAL',
    detail: 'Nation-state adversaries archive encrypted traffic now for post-CRQC decryption. PQC signatures ensure authenticity even after Q-Day.',
  },
  {
    attack: 'Fault Injection (DFA)',
    icon: Cpu,
    target: 'Signing Nonce / Key Material',
    traditional: { label: 'Key Recovery Risk', variant: 'red', icon: AlertTriangle },
    qsc3: { label: 'Mitigated — Deterministic', variant: 'cyan', icon: ShieldCheck },
    severity: 'MEDIUM',
    detail: 'Dilithium uses deterministic signing (no random nonce), eliminating the nonce-reuse / fault injection attack surface that plagues ECDSA.',
  },
];

// ─── TIMELINE MILESTONES ──────────────────────────────────────────────────────
const MILESTONES = [
  { year: 2016, label: 'NIST PQC Call', color: '#94a3b8', pct: 0 },
  { year: 2022, label: 'NIST Finalists', color: '#60a5fa', pct: 20 },
  { year: 2024, label: 'FIPS 204 Published', color: '#00f3ff', pct: 30 },
  { year: 2026, label: 'NOW · QSC3', color: '#4ade80', pct: 38, now: true },
  { year: 2030, label: 'Migration Deadline', color: '#facc15', pct: 55 },
  { year: 2035, label: 'Q-Day Start', color: '#f97316', pct: 70 },
  { year: 2045, label: 'Q-Day Peak Risk', color: '#ef4444', pct: 100 },
];

// ─── SEVERITY BADGE ───────────────────────────────────────────────────────────
const SEVERITY_STYLE = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
  HIGH: { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)', text: '#f97316' },
  MEDIUM: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308' },
  LOW: { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.4)', text: '#4ade80' },
  N_A: { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8' },
};

const VARIANT_STYLE = {
  red: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: '#f87171' },
  yellow: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.35)', text: '#fbbf24' },
  green: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)', text: '#4ade80' },
  cyan: { bg: 'rgba(0,243,255,0.10)', border: 'rgba(0,243,255,0.35)', text: '#00f3ff' },
  gray: { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8' },
};

function ThreatBadge({ label, variant, icon: Icon }) {
  const s = VARIANT_STYLE[variant] || VARIANT_STYLE.gray;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border"
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
}

// ─── ANIMATED SCORE RING ─────────────────────────────────────────────────────
function ScoreRing({ score = 94 }) {
  const r = 72, circ = 2 * Math.PI * r;
  const count = useMotionValue(0);
  const displayed = useTransform(count, v => Math.round(v));
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    const unsub = displayed.onChange(v => setDisp(v));
    const ctrl = animate(count, score, { duration: 1.8, ease: 'easeOut' });
    return () => { ctrl.stop(); unsub(); };
  }, [score]);

  const dash = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      {/* Spinning dashed ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed border-green-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      />
      {/* SVG arc */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="80" cy="80" r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="relative text-center z-10">
        <div className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-neon-cyan">
          {disp}
        </div>
        <div className="text-[10px] font-mono text-gray-500 tracking-widest mt-0.5">/ 100</div>
      </div>
    </div>
  );
}

// ─── EXPANDED ROW ─────────────────────────────────────────────────────────────
function ThreatRow({ threat, index }) {
  const [open, setOpen] = useState(false);
  const Icon = threat.icon;
  const sev = SEVERITY_STYLE[threat.severity] || SEVERITY_STYLE.N_A;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06 }}
        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {/* Attack */}
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Icon size={13} className="text-gray-500 shrink-0" />
            <span className="font-medium text-white text-xs">{threat.attack}</span>
          </div>
        </td>
        {/* Target */}
        <td className="p-3 text-[11px] text-gray-400 hidden sm:table-cell">{threat.target}</td>
        {/* Traditional */}
        <td className="p-3">
          <ThreatBadge label={threat.traditional.label} variant={threat.traditional.variant} icon={threat.traditional.icon} />
        </td>
        {/* QSC3 */}
        <td className="p-3">
          <ThreatBadge label={threat.qsc3.label} variant={threat.qsc3.variant} icon={threat.qsc3.icon} />
        </td>
        {/* Severity */}
        <td className="p-3 hidden md:table-cell">
          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
            style={{ background: sev.bg, borderColor: sev.border, color: sev.text }}
          >
            {threat.severity}
          </span>
        </td>
        {/* Expand */}
        <td className="p-3 text-gray-600">
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </td>
      </motion.tr>

      <AnimatePresence>
        {open && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={6} className="px-4 pb-3 pt-0">
              <div className="text-[11px] text-gray-400 bg-white/[0.03] rounded-lg px-4 py-3 border border-white/5 leading-relaxed">
                {threat.detail}
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function QuantumThreat() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(null);

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const [h, a] = await Promise.allSettled([
          axios.get(`${API}/health`),
          axios.get(`${API}/analytics/stats`),
        ]);
        const merged = {};
        if (h.status === 'fulfilled') Object.assign(merged, h.value.data);
        if (a.status === 'fulfilled') Object.assign(merged, a.value.data);
        setStats(merged);
      } catch (_) { }
      setLoading(false);
    };
    fetch_();
    const id = setInterval(fetch_, 20000);
    return () => clearInterval(id);
  }, []);

  // Days to earliest Q-Day estimate (Jan 1 2035)
  useEffect(() => {
    const qday = new Date('2035-01-01');
    const now = new Date();
    setDaysLeft(Math.ceil((qday - now) / 86400000));
  }, []);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -18 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        className="flex items-start justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-1">
            Quantum <span className="neon-text-cyan">Threat Monitor</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Cryptographic vulnerability assessment · Q-Day countdown · NIST PQC compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <RefreshCw size={12} className="animate-spin" /> Loading…
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live Assessment
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Top Row: Score + Q-Day ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-green-500/20 bg-black/50 backdrop-blur-sm relative overflow-hidden flex flex-col items-center justify-center py-8 px-4"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-green-500/5 blur-2xl pointer-events-none" />

          <p className="text-xs font-mono tracking-widest text-gray-500 mb-5 relative z-10">QSC3 READINESS</p>

          <div className="relative z-10">
            <ScoreRing score={94} />
          </div>

          <div className="mt-5 relative z-10 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-xs font-mono">
              <ShieldCheck size={12} /> Quantum Secure
            </div>
            <div className="text-[10px] text-gray-600 font-mono">
              NIST FIPS 204 · ML-DSA L3
            </div>
          </div>

          {/* Mini stat row */}
          <div className="w-full mt-5 grid grid-cols-2 gap-2 relative z-10">
            {[
              { label: 'Signatures', value: stats?.totalSignatures ?? stats?.pqcSigns ?? '—' },
              { label: 'Threats Blocked', value: stats?.threatsBlocked ?? '6' },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/5">
                <div className="text-base font-bold font-mono text-white">{s.value}</div>
                <div className="text-[9px] text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Q-Day Countdown + Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6 space-y-6"
        >
          {/* Title row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-yellow-400" />
              Projected Q-Day Window
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 animate-pulse">
              CRITICAL PATH
            </span>
          </div>

          {/* Year + countdown */}
          <div className="flex items-end gap-6 flex-wrap">
            <div>
              <div className="text-4xl font-mono font-bold text-red-400">2035 – 2045</div>
              <div className="text-xs text-gray-500 mt-1">Cryptographically Relevant Quantum Computer (CRQC) window</div>
            </div>
            {daysLeft != null && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-mono font-bold text-red-400">{daysLeft.toLocaleString()}</div>
                <div className="text-[9px] text-gray-500 font-mono mt-0.5">DAYS UNTIL Q-DAY START</div>
              </div>
            )}
          </div>

          {/* Timeline bar */}
          <div className="space-y-3">
            <div className="flex justify-between text-[9px] font-mono text-gray-600">
              {MILESTONES.map(m => (
                <span key={m.year} style={{ color: m.now ? '#4ade80' : m.color }} className={m.now ? 'font-bold' : ''}>
                  {m.year}
                </span>
              ))}
            </div>

            <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
              {/* Gradient fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #94a3b8 0%, #00f3ff 30%, #4ade80 38%, #facc15 55%, #ef4444 100%)',
                }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
              {/* NOW marker */}
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_white]"
                style={{ left: '38%' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.4 }}
              />
            </div>

            {/* Milestone dots */}
            <div className="relative h-4">
              {MILESTONES.map(m => (
                <div
                  key={m.year}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${m.pct}%`, transform: 'translateX(-50%)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SNDL alert */}
          <div className="bg-neon-cyan/8 border border-neon-cyan/25 rounded-xl p-4 flex gap-3">
            <Info size={16} className="text-neon-cyan shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300 leading-relaxed">
              <span className="text-neon-cyan font-semibold">Store Now, Decrypt Later (SNDL): </span>
              Nation-state adversaries are actively harvesting encrypted supply chain traffic today. QSC3's Dilithium-3 signatures ensure that data anchored now remains unforgeable and verifiable even after a CRQC becomes operational.
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Threat Matrix ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden"
      >
        {/* Table header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-neon-cyan" />
            <span className="text-white font-semibold text-sm">Vulnerability Matrix</span>
            <span className="text-[10px] font-mono text-gray-600">— click row to expand</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> CRITICAL
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block ml-2" /> HIGH
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block ml-2" /> MEDIUM
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block ml-2" /> LOW
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] text-gray-500 text-[10px] font-mono tracking-wider border-b border-white/5">
              <tr>
                <th className="px-3 py-2.5">ATTACK VECTOR</th>
                <th className="px-3 py-2.5 hidden sm:table-cell">TARGET PRIMITIVE</th>
                <th className="px-3 py-2.5">TRADITIONAL (ECDSA)</th>
                <th className="px-3 py-2.5">QSC3 (DILITHIUM-3)</th>
                <th className="px-3 py-2.5 hidden md:table-cell">SEVERITY</th>
                <th className="px-3 py-2.5 w-6" />
              </tr>
            </thead>
            <tbody>
              {THREATS.map((t, i) => (
                <ThreatRow key={t.attack} threat={t} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Mitigation Summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.45 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            icon: ShieldCheck,
            color: '#4ade80',
            border: 'rgba(74,222,128,0.3)',
            bg: 'rgba(74,222,128,0.06)',
            title: 'NIST FIPS 204',
            body: 'Dilithium-3 (ML-DSA) is the finalized NIST standard for lattice-based digital signatures, replacing ECDSA in QSC3.',
          },
          {
            icon: Clock,
            color: '#facc15',
            border: 'rgba(250,204,21,0.3)',
            bg: 'rgba(250,204,21,0.05)',
            title: 'Harvest-Resistant',
            body: 'PQC signatures signed today cannot be forged even after a CRQC is available — protecting the full data lifecycle.',
          },
          {
            icon: TrendingUp,
            color: '#00f3ff',
            border: 'rgba(0,243,255,0.3)',
            bg: 'rgba(0,243,255,0.05)',
            title: 'Migration Path',
            body: 'QSC3 is crypto-agile: swap Dilithium-3 for future algorithms (FALCON, SPHINCS+) with zero pipeline changes.',
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: c.border, background: c.bg }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: c.color }} />
                <span className="text-xs font-bold" style={{ color: c.color }}>{c.title}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{c.body}</p>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}