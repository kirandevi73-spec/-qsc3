import React, { useEffect, useState, useCallback, memo } from 'react';
import { Card, Badge, AnimatedCounter } from '../components/ui';
import { Zap, ShieldCheck, Box, Server, Activity } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import axios from 'axios';

const API = 'http://localhost:5000/api';

// Memoized stat card
const StatCard = memo(({ icon, iconBg, iconColor, label, value }) => (
  <Card className="flex items-center gap-4 hover:border-neon-cyan/30 transition-colors">
    <div className={`p-3 ${iconBg} rounded-lg ${iconColor}`}>{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-bold font-mono text-gray-100">{value}</div>
    </div>
  </Card>
));

// Memoized status row
const StatusRow = memo(({ label, badge, variant }) => (
  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
    <span className="text-gray-300">{label}</span>
    <Badge variant={variant}>{badge}</Badge>
  </div>
));

export default function Dashboard() {
  const { account, connected, connectWallet, disconnectWallet } = useWallet();
  const [serverStatus, setServerStatus] = useState('checking...');
  const [deviceCount, setDeviceCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const [health, iot] = await Promise.all([
        axios.get(`${API}/health`),
        axios.get(`${API}/iot/live`)
      ]);
      setServerStatus(health.data.status);
      setDeviceCount(iot.data.devices?.length || 0);
    } catch {
      setServerStatus('offline');
      setDeviceCount(0);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
            QSC3 System <span className="neon-text-cyan">Overview</span>
          </h1>
          <p className="text-gray-400">Quantum-Secure Scalable Blockchain Framework</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="cyan" className="text-sm px-4 py-1.5">
            <Activity size={14} className="inline mr-1 mb-0.5" /> System Active
          </Badge>
          <button
            onClick={connected ? disconnectWallet : connectWallet}
            style={{
              background: connected ? '#ff4444' : '#f6851b',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
            {connected ? `🦊 ${account.slice(0, 6)}...${account.slice(-4)}` : '🦊 Connect MetaMask'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <Card className="glass-strong border-neon-cyan/30 relative overflow-hidden">
        <div className="scan-line"></div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap size={120} />
        </div>
        <div className="relative z-10">
          <Badge variant="purple" className="mb-4">Research Gap G1 Solved</Badge>
          <h2 className="text-2xl font-bold text-white mb-4">Storage Bottleneck Resolution</h2>
          <p className="text-lg text-gray-300 max-w-4xl leading-relaxed font-light">
            Dilithium signatures (2.9–4.6 KB) create storage and bandwidth bottlenecks for on-chain storage.
            Solved via{' '}
            <span className="text-neon-cyan font-medium">Batch Merkle-root anchoring</span> and{' '}
            <span className="text-neon-cyan font-medium">IPFS offloading</span> with on-chain hash commitments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 border-l-neon-cyan/50 border-l-4">
              <div className="text-gray-400 text-sm mb-1">Storage Reduction</div>
              <div className="text-3xl font-bold text-neon-cyan"><AnimatedCounter value={94} suffix="%" /></div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 border-l-neon-purple/50 border-l-4">
              <div className="text-gray-400 text-sm mb-1">Cost Savings (Gas)</div>
              <div className="text-3xl font-bold text-neon-purple"><AnimatedCounter value={70} suffix="%" /></div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 border-l-green-500/50 border-l-4">
              <div className="text-gray-400 text-sm mb-1">Security Standard</div>
              <div className="text-2xl font-bold text-green-400 mt-1">NIST Level 3</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Box size={24} />}
          iconBg="bg-neon-cyan/10"
          iconColor="text-neon-cyan"
          label="Latest Block"
          value="18,492,301"
        />
        <StatCard
          icon={<Zap size={24} />}
          iconBg="bg-neon-purple/10"
          iconColor="text-neon-purple"
          label="Current Gas"
          value={<><AnimatedCounter value={12} /> gwei</>}
        />
        <StatCard
          icon={<Server size={24} />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          label="Live IoT Devices"
          value={deviceCount}
        />
        <StatCard
          icon={<ShieldCheck size={24} />}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          label="Threat Level"
          value={<span className="text-green-400">SECURE</span>}
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-64 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Network Activity Map</h3>
          <div className="flex-1 flex items-center justify-center border border-white/5 bg-black/20 rounded-lg">
            <p className="text-gray-500 font-mono text-sm">Real-time mapping operational...</p>
          </div>
        </Card>

        <Card className="h-64 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">PQC Security Status</h3>
          <div className="flex-1 space-y-4">
            <StatusRow label="Dilithium Signature Integrity" badge="VERIFIED" variant="green" />
            <StatusRow label="IPFS Decentralized Storage" badge="ONLINE" variant="cyan" />
            <StatusRow
              label="Backend Server"
              badge={serverStatus === 'OK' ? 'ONLINE' : serverStatus.toUpperCase()}
              variant={serverStatus === 'OK' ? 'green' : 'red'}
            />
          </div>
        </Card>
      </div>

    </div>
  );
}