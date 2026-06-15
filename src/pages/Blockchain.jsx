import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, Badge } from '../components/ui';
import { Link as LinkIcon, CheckCircle2, AlertCircle, Copy, Zap, Box, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import HybridSign from '../components/Wallet/HybridSign';
import TrustFlowWidget from '../components/TrustFlow/TrustFlowWidget';

const API = 'http://localhost:5000/api';

const StatCard = memo(({ icon, iconBg, iconColor, label, value, valueColor }) => (
  <Card className="flex items-center gap-3 py-3">
    <div className={`p-2 ${iconBg} rounded-lg ${iconColor}`}>{icon}</div>
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold font-mono ${valueColor || 'text-white'}`}>{value}</div>
    </div>
  </Card>
));

const GasBar = memo(({ label, sub, cost, gas, width, color, barClass }) => (
  <div>
    <div className="flex justify-between items-end mb-2">
      <div>
        <div className={`text-sm font-medium ${color}`}>{label}</div>
        <div className="text-xs text-gray-500">{sub}</div>
      </div>
      <div className="text-right">
        <div className={`font-mono text-lg ${color}`}>{cost}</div>
        <div className="text-xs text-gray-500">{gas}</div>
      </div>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
      <div className={`${barClass} h-3 rounded-full`} style={{ width }} />
    </div>
  </div>
));

export default function Blockchain() {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    axios.get(`${API}/blockchain/stats`)
      .then(res => setStats(res.data.stats))
      .catch(console.error);
  }, []);

  const copyToClipboard = useCallback((text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  }, []);

  const anchorRoot = useCallback(async () => {
    setIsAnchoring(true);
    try {
      const res = await axios.post(`${API}/blockchain/anchor`, {
        merkleRoot: '0x4a2b9f2a' + Date.now(),
        ipfsCID: 'QmYwAPJzv5CZsnAzt8auvD9'
      });
      if (res.data.success) {
        setTransactions(prev => [res.data.transaction, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnchoring(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <TrustFlowWidget />
      <HybridSign />

      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
          Blockchain <span className="neon-text-purple">Anchoring</span>
        </h1>
        <p className="text-gray-400">On-chain Merkle root commitments with gas optimization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Box size={20} />} iconBg="bg-neon-purple/10" iconColor="text-neon-purple" label="Total Anchored" value={stats?.totalAnchored || 1284} />
        <StatCard icon={<Zap size={20} />} iconBg="bg-neon-cyan/10" iconColor="text-neon-cyan" label="Avg Gas Used" value={stats?.avgGasUsed || '42,500'} />
        <StatCard icon={<TrendingDown size={20} />} iconBg="bg-green-500/10" iconColor="text-green-400" label="Cost Saved" value="70%" valueColor="text-green-400" />
        <StatCard icon={<CheckCircle2 size={20} />} iconBg="bg-blue-500/10" iconColor="text-blue-400" label="Latest Block" value="#18,492,301" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Anchor Panel */}
        <Card className="glass-strong border-neon-purple/20">
          <h2 className="text-xl font-semibold text-white mb-6">Anchor Merkle Root</h2>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Merkle Root', value: '0x4a2b...9f2a', display: '0x4a2b9f2a', id: 'root', color: 'text-neon-purple' },
              { label: 'IPFS CID', value: 'QmYwAPJzv5CZsnAzt8auvD9', display: 'QmYwAPJz...3eF2', id: 'cid', color: 'text-neon-cyan' },
            ].map(({ label, value, display, id, color }) => (
              <div key={id} className="bg-black/40 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{label}</div>
                <div className="flex justify-between items-center">
                  <span className={`${color} font-mono text-sm`}>{display}</span>
                  <button onClick={() => copyToClipboard(value, id)} className="text-gray-500 hover:text-white transition-colors">
                    {copied === id ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Contract</div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-mono text-sm">QSC3Anchor.sol</span>
                <Badge variant="green">DEPLOYED</Badge>
              </div>
            </div>
          </div>

          <button
            onClick={anchorRoot}
            disabled={isAnchoring}
            className="w-full py-4 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple font-bold rounded-xl border border-neon-purple/50 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isAnchoring ? (
              <><div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" /> Awaiting Block Confirmation...</>
            ) : (
              <><LinkIcon size={18} /> Anchor to Blockchain</>
            )}
          </button>
        </Card>

        {/* Gas Analysis */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Gas Cost Analysis</h2>
          <div className="space-y-6">
            <GasBar label="Raw PQC On-Chain" sub="4 signatures stored directly" cost="$28.00" gas="~1.4M Gas" width="100%" color="text-red-400" barClass="bg-red-500/80" />
            <GasBar label="QSC3 (Batch + IPFS)" sub="1 Merkle Root + CID" cost="$8.40" gas="~42.5k Gas" width="30%" color="text-neon-cyan" barClass="bg-neon-cyan animate-pulse" />
            <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-neon-cyan shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-neon-cyan font-medium text-sm">70% Cost Reduction</h4>
                <p className="text-xs text-gray-400 mt-1">IPFS offloading + 32-byte Merkle root anchoring eliminates PQC storage bottleneck on-chain.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Feed */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Live Transaction Feed</h2>
          <Badge variant="green">{transactions.length} Confirmed</Badge>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Box size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No transactions yet — anchor a root to begin</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {transactions.map((tx) => (
                <motion.div
                  key={tx.txHash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-neon-purple/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">Confirmed</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Tx Hash</span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-neon-purple font-mono">{tx.txHash.slice(0, 18)}...</span>
                        <button onClick={() => copyToClipboard(tx.txHash, tx.txHash)}>
                          {copied === tx.txHash ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-500 hover:text-white" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Block</span>
                      <div className="text-white font-mono mt-1">#{tx.blockNumber?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Gas Used</span>
                      <div className="text-neon-cyan font-mono mt-1">{tx.gasUsed?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost</span>
                      <div className="text-green-400 font-mono mt-1">{tx.gasCost}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  );
}