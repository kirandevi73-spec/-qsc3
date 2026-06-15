import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Card, Badge } from '../components/ui';
import {
  Cpu, Lock, Database, Link as LinkIcon,
  Shield, Activity, CheckCircle,
  RefreshCw, ChevronDown, ChevronUp, GitBranch,
  Layers, Box
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const STAGES = [
  {
    id: 'edge', step: '01', label: 'Edge Device', sub: 'ESP32-S3 IoT Node',
    badge: 'Collect Data', color: '#94a3b8', glow: 'rgba(148,163,184,0.25)',
    border: 'rgba(148,163,184,0.4)', icon: Cpu,
    detail: 'Collects environmental telemetry (temperature, humidity, location) at the supply chain node and prepares a structured JSON payload for signing.',
    specs: ['ARM Cortex-M33 @ 240 MHz', 'MQTT over TLS 1.3', '~2 KB raw payload', 'AES-256 local cache'],
  },
  {
    id: 'pqc', step: '02', label: 'PQC Sign', sub: 'Dilithium-3 (ML-DSA)',
    badge: 'Sign Payload', color: '#00f3ff', glow: 'rgba(0,243,255,0.25)',
    border: 'rgba(0,243,255,0.45)', icon: Lock,
    detail: "CRYSTALS-Dilithium-3 (NIST FIPS 204) signs the payload. Produces a 3.3 KB quantum-resistant signature, replacing ECDSA which is vulnerable to Shor's algorithm.",
    specs: ['NIST FIPS 204 standard', '3.3 KB signature size', '1952-byte public key', 'CRQC-resistant'],
  },
  {
    id: 'ipfs', step: '03', label: 'IPFS Offload', sub: 'Pinata Decentralised',
    badge: 'Return CID', color: '#60a5fa', glow: 'rgba(96,165,250,0.25)',
    border: 'rgba(96,165,250,0.45)', icon: Database,
    detail: 'The signed payload is pinned to IPFS via Pinata. The content-addressed CID (46 bytes) replaces the 3.3 KB blob on-chain, keeping the ledger lean.',
    specs: ['Content-addressed (SHA-256)', '46-byte CID on-chain', 'Pinata pinning SLA', 'Off-chain blob storage'],
  },
  {
    id: 'merkle', step: '04', label: 'Merkle Batch', sub: 'N = 4096 leaves',
    badge: 'Compute Root', color: '#bc13fe', glow: 'rgba(188,19,254,0.25)',
    border: 'rgba(188,19,254,0.45)', icon: GitBranch,
    detail: 'Batches 4096 CIDs into a Merkle tree. The 32-byte root summarises the entire batch, reducing 4096 on-chain writes to a single transaction.',
    specs: ['SHA-256 hash function', '4096 leaves / batch', '32-byte Merkle root', '99.99% gas reduction'],
  },
  {
    id: 'blockchain', step: '05', label: 'Blockchain', sub: 'Smart Contract Anchor',
    badge: 'Anchor Hash', color: '#4ade80', glow: 'rgba(74,222,128,0.25)',
    border: 'rgba(74,222,128,0.45)', icon: LinkIcon,
    detail: 'The Merkle root is anchored in a Solidity smart contract on Ethereum / Substrate. Immutable timestamp + on-chain event log for full auditability.',
    specs: ['Solidity / ink! contract', '~21 000 gas / anchor', 'Immutable timestamp', 'EVM + Substrate ready'],
  },
];

const TRACE_STEPS = [
  { label: '// 1. Raw Telemetry (JSON)', color: '#94a3b8', value: '{"temp":24.5,"humid":60,"loc":"KHI-WH-3","ts":1748131200}', size: '~128 B' },
  { label: '// 2. Dilithium-3 Signature (hex-truncated)', color: '#00f3ff', value: '0x7a3f9c2d8e1b4f6a0d5c3e9f2a7b1d4e8c0f3a6...e2d1', size: '3.3 KB' },
  { label: '// 3. IPFS CID (v1 base32)', color: '#60a5fa', value: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf4midvogmr2gbddi', size: '46 B' },
  { label: '// 4. Merkle Root (SHA-256 batch)', color: '#bc13fe', value: '0x9f2a3e7c1b4d8f0a2c5e9b3d7f1a4c8e2b5d9f3a6c0e4b7d1f5a8c2e6b0d4f8', size: '32 B' },
  { label: '// 5. On-Chain Anchor', color: '#4ade80', value: 'Block #21,884,502 · TxHash: 0xfe3a...1c9b · Gas: 21,000', size: 'FINAL' },
];

const SECURITY = [
  { title: 'Authenticity & Non-Repudiation', color: '#00f3ff', icon: Shield, body: "Dilithium-3 (ML-DSA) signatures are CRQC-resistant. Even adversaries with fault-tolerant quantum computers running Shor's algorithm cannot forge or repudiate a signed payload." },
  { title: 'Data Availability', color: '#60a5fa', icon: Database, body: 'Pinata-pinned IPFS keeps bulky signature blobs off-chain across a distributed content network, guaranteeing retrieval without bloating the ledger.' },
  { title: 'Batch Efficiency', color: '#bc13fe', icon: Layers, body: 'Merkle batching condenses 4 096 individual transactions into one 32-byte root, achieving >99.99 % gas reduction while preserving full individual auditability via Merkle proof.' },
  { title: 'Immutability & Auditability', color: '#4ade80', icon: CheckCircle, body: 'The Merkle root anchored on-chain acts as a cryptographic timestamp. Any post-anchor mutation of leaf data is instantly detectable via root mismatch.' },
];

const TECH_STACK = [
  { label: 'React 18 + Vite', sub: 'Frontend', color: '#61dafb' },
  { label: 'Tailwind CSS', sub: 'Styling', color: '#38bdf8' },
  { label: 'Framer Motion', sub: 'Animations', color: '#ff4466' },
  { label: 'Node + Express', sub: 'Backend', color: '#68a063' },
  { label: 'Pinata IPFS', sub: 'Storage', color: '#60a5fa' },
  { label: 'Dilithium-3', sub: 'PQC', color: '#00f3ff' },
];

// ── Memoized subcomponents ──
const PacketDot = memo(({ color, delay }) => (
  <motion.div
    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-20"
    style={{ background: color, boxShadow: `0 0 10px ${color}` }}
    initial={{ left: '0%', opacity: 0 }}
    animate={{ left: ['0%', '10%', '90%', '100%'], opacity: [0, 1, 1, 0] }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: 'linear' }}
  />
));

const StageCard = memo(({ stage, index, isActive, onClick }) => {
  const Icon = stage.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center gap-3 w-36 cursor-pointer select-none"
      onClick={() => onClick(stage.id)}
    >
      <div className="text-[10px] font-mono tracking-widest" style={{ color: stage.color }}>
        STEP {stage.step}
      </div>
      <motion.div
        whileHover={{ scale: 1.08 }}
        className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: `2px solid ${isActive ? stage.color : stage.border}`,
          boxShadow: isActive ? `0 0 24px ${stage.glow}, 0 0 48px ${stage.glow}` : 'none',
        }}
      >
        <Icon size={28} style={{ color: stage.color }} />
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `1px solid ${stage.color}`, opacity: 0.4 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
      </motion.div>
      <div className="text-center">
        <div className="font-bold text-white text-xs leading-tight">{stage.label}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{stage.sub}</div>
      </div>
      <div
        className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
        style={{ color: stage.color, borderColor: stage.border, background: stage.glow }}
      >
        {stage.badge}
      </div>
    </motion.div>
  );
});

const Connector = memo(({ color }) => (
  <div className="flex items-center justify-center w-8 shrink-0 mt-[-28px]">
    <svg width="32" height="12" viewBox="0 0 32 12">
      <line x1="0" y1="6" x2="24" y2="6" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <polygon points="24,2 32,6 24,10" fill={color} opacity="0.6" />
    </svg>
  </div>
));

export default function Architecture() {
  const [activeStage, setActiveStage] = useState('pqc');
  const [backendStats, setBackendStats] = useState(null);
  const [blockStats, setBlockStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [traceOpen, setTraceOpen] = useState(true);
  const [packetStep, setPacketStep] = useState(0);

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const fetchAll = useCallback(async () => {
    try {
      const [health, stats] = await Promise.allSettled([
        axios.get(`${API}/health`),
        axios.get(`${API}/blockchain/stats`),
      ]);
      if (health.status === 'fulfilled') setBackendStats(health.value.data);
      if (stats.status === 'fulfilled') setBlockStats(stats.value.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, [fetchAll]);

  useEffect(() => {
    const id = setInterval(() => setPacketStep(p => (p + 1) % TRACE_STEPS.length), 2200);
    return () => clearInterval(id);
  }, []);

  const activeData = STAGES.find(s => s.id === activeStage);

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div ref={headerRef} initial={{ opacity: 0, y: -20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-1">
              System <span className="neon-text-cyan">Architecture</span>
            </h1>
            <p className="text-gray-400 text-sm">End-to-end quantum-safe data pipeline · Edge → PQC → IPFS → Merkle → Blockchain</p>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                <RefreshCw size={12} className="animate-spin" /> Connecting…
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Backend Live
                {blockStats?.totalAnchors != null && <span className="text-gray-500 ml-1">· {blockStats.totalAnchors} anchors</span>}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden py-10 px-6"
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(0,243,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute top-[48%] left-16 right-16 h-px bg-white/5 z-0 overflow-hidden">
          <PacketDot color="#00f3ff" delay={0} />
          <PacketDot color="#bc13fe" delay={2.5} />
          <PacketDot color="#4ade80" delay={4.2} />
        </div>
        <div className="min-w-[840px] flex justify-between items-start relative z-10 overflow-x-auto pb-2">
          {STAGES.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <StageCard stage={stage} index={i} isActive={activeStage === stage.id} onClick={setActiveStage} />
              {i < STAGES.length - 1 && <Connector color={STAGES[i + 1].color} />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-4 font-mono tracking-widest relative z-10">
          CLICK A NODE TO INSPECT · PACKETS ANIMATE LEFT → RIGHT
        </p>
      </motion.div>

      {/* Stage Detail */}
      <AnimatePresence mode="wait">
        {activeData && (
          <motion.div key={activeData.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
            className="rounded-2xl border p-5"
            style={{ borderColor: activeData.border, background: `linear-gradient(135deg, ${activeData.glow}, rgba(0,0,0,0.5))` }}
          >
            <div className="flex items-start gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,0,0,0.5)', border: `1.5px solid ${activeData.border}` }}>
                <activeData.icon size={22} style={{ color: activeData.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-widest" style={{ color: activeData.color }}>STEP {activeData.step}</span>
                  <span className="text-white font-semibold">{activeData.label}</span>
                  <span className="text-gray-500 text-xs">— {activeData.sub}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{activeData.detail}</p>
                <div className="flex flex-wrap gap-2">
                  {activeData.specs.map(sp => (
                    <span key={sp} className="text-[10px] font-mono px-2.5 py-1 rounded-full border"
                      style={{ borderColor: activeData.border, color: activeData.color, background: 'rgba(0,0,0,0.4)' }}>
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Packet Trace */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden"
        >
          <button className="w-full flex items-center justify-between px-5 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
            onClick={() => setTraceOpen(o => !o)}>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Activity size={15} className="text-neon-cyan" /> Live Packet Trace
            </div>
            {traceOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
          </button>
          <AnimatePresence>
            {traceOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="p-5 font-mono text-xs space-y-3">
                  {TRACE_STEPS.map((t, i) => (
                    <motion.div key={i} animate={{ opacity: packetStep === i ? 1 : 0.45, x: packetStep === i ? 4 : 0 }} transition={{ duration: 0.3 }} className="space-y-0.5">
                      <div className="text-gray-600">{t.label}</div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="break-all leading-relaxed" style={{ color: t.color }}>{t.value}</div>
                        <span className="text-gray-700 shrink-0 text-[9px] mt-0.5">{t.size}</span>
                      </div>
                      {i < TRACE_STEPS.length - 1 && <div className="text-gray-800 pl-2">↓</div>}
                    </motion.div>
                  ))}
                </div>
                {blockStats && (
                  <div className="px-5 pb-4 pt-0 border-t border-white/5 mt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                      <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10} /> {blockStats.totalAnchors ?? '—'} total anchors</span>
                      <span>Latest block: #{blockStats.latestBlock ?? '—'}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security Properties */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
            <Shield size={15} className="text-neon-cyan" />
            <span className="text-white font-semibold text-sm">Security Properties</span>
          </div>
          <div className="p-5 space-y-3">
            {SECURITY.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                  className="p-3.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={13} style={{ color: s.color }} />
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{s.body}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Box size={14} className="text-neon-purple" />
          <span className="text-white font-semibold text-sm">Tech Stack</span>
          {backendStats && (
            <span className="ml-auto text-[10px] font-mono text-gray-600">
              uptime: {backendStats.uptime ? Math.round(backendStats.uptime) + 's' : '—'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TECH_STACK.map(t => (
            <div key={t.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3 text-center hover:bg-white/[0.07] transition-colors">
              <div className="text-[11px] font-bold" style={{ color: t.color }}>{t.label}</div>
              <div className="text-[9px] text-gray-600 mt-0.5 font-mono">{t.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}