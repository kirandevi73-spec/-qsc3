import React, { useState, useEffect } from 'react';
import { Card, Badge, AnimatedCounter } from '../components/ui';
import { Link as LinkIcon, CheckCircle2, AlertCircle, Copy, ExternalLink, Zap, Box, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Blockchain() {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/blockchain/stats')
      .then(res => setStats(res.data.stats))
      .catch(err => console.error(err));
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const anchorRoot = async () => {
    setIsAnchoring(true);
    try {
      const res = await axios.post('http://localhost:5000/api/blockchain/anchor', {
        merkleRoot: '0x4a2b9f2a' + Date.now(),
        ipfsCID: 'QmYwAPJzv5CZsnAzt8auvD9'
      });

      if (res.data.success) {
        const tx = res.data.transaction;
        setTransactions(prev => [tx, ...prev].slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnchoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
          Blockchain <span className="neon-text-purple">Anchoring</span>
        </h1>
        <p className="text-gray-400">On-chain Merkle root commitments with gas optimization</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple"><Box size={20} /></div>
          <div>
            <div className="text-xs text-gray-500">Total Anchored</div>
            <div className="text-lg font-bold font-mono text-white">{stats?.totalAnchored || 1284}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2 bg-neon-cyan/10 rounded-lg text-neon-cyan"><Zap size={20} /></div>
          <div>
            <div className="text-xs text-gray-500">Avg Gas Used</div>
            <div className="text-lg font-bold font-mono text-white">{stats?.avgGasUsed || '42,500'}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><TrendingDown size={20} /></div>
          <div>
            <div className="text-xs text-gray-500">Cost Saved</div>
            <div className="text-lg font-bold font-mono text-green-400">70%</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><CheckCircle2 size={20} /></div>
          <div>
            <div className="text-xs text-gray-500">Latest Block</div>
            <div className="text-lg font-bold font-mono text-white">#18,492,301</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anchor Panel */}
        <Card className="glass-strong border-neon-purple/20">
          <h2 className="text-xl font-semibold text-white mb-6">Anchor Merkle Root</h2>

          {/* Input Fields */}
          <div className="space-y-3 mb-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Merkle Root</div>
              <div className="flex justify-between items-center">
                <span className="text-neon-purple font-mono text-sm">0x4a2b...9f2a</span>
                <button onClick={() => copyToClipboard('0x4a2b9f2a', 'root')}
                  className="text-gray-500 hover:text-white transition-colors">
                  {copied === 'root' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">IPFS CID</div>
              <div className="flex justify-between items-center">
                <span className="text-neon-cyan font-mono text-sm">QmYwAPJz...3eF2</span>
                <button onClick={() => copyToClipboard('QmYwAPJzv5CZsnAzt8auvD9', 'cid')}
                  className="text-gray-500 hover:text-white transition-colors">
                  {copied === 'cid' ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

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
              <>
                <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                Awaiting Block Confirmation...
              </>
            ) : (
              <>
                <LinkIcon size={18} /> Anchor to Blockchain
              </>
            )}
          </button>
        </Card>

        {/* Gas Analysis */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Gas Cost Analysis</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-sm text-gray-300 font-medium">Raw PQC On-Chain</div>
                  <div className="text-xs text-gray-500">4 signatures stored directly</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-mono text-lg">$28.00</div>
                  <div className="text-xs text-gray-500">~1.4M Gas</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-red-500/80 h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-sm text-neon-cyan font-medium">QSC3 (Batch + IPFS)</div>
                  <div className="text-xs text-gray-500">1 Merkle Root + CID</div>
                </div>
                <div className="text-right">
                  <div className="text-neon-cyan font-mono text-lg font-bold">$8.40</div>
                  <div className="text-xs text-gray-500">~42.5k Gas</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-neon-cyan h-3 rounded-full animate-pulse" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-neon-cyan shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-neon-cyan font-medium text-sm">70% Cost Reduction</h4>
                <p className="text-xs text-gray-400 mt-1">
                  IPFS offloading + 32-byte Merkle root anchoring eliminates PQC storage bottleneck on-chain.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Transaction Feed */}
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
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.txHash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-neon-purple/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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