import React, { useState } from 'react';
import { Card, Badge, AnimatedCounter } from '../components/ui';
import { Link as LinkIcon, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Blockchain() {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchored, setAnchored] = useState(false);
  const [txHash, setTxHash] = useState('');

  const anchorRoot = () => {
    setIsAnchoring(true);
    setTimeout(() => {
      setIsAnchoring(false);
      setAnchored(true);
      setTxHash('0x8f2a9b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">Blockchain <span className="neon-text-purple">Anchoring</span></h1>
        <p className="text-gray-400">Smart contract interaction and gas cost analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-strong border-neon-purple/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="text-neon-purple" size={20} /> Smart Contract Interaction
          </h2>
          
          <div className="bg-black/50 rounded-xl p-5 border border-white/5 font-mono text-sm mb-6 shadow-inner">
            <div className="text-gray-500 mb-2">// Contract: QSC3Anchor.sol</div>
            <div className="text-blue-400">function <span className="text-yellow-200">anchorMerkleRoot</span>(</div>
            <div className="pl-4 text-white">bytes32 _merkleRoot,</div>
            <div className="pl-4 text-white">string memory _ipfsCID</div>
            <div className="text-blue-400">) public returns (<span className="text-green-300">bool</span>) {'{'}</div>
            <div className="pl-4 text-gray-400">...</div>
            <div className="text-blue-400">{'}'}</div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded border border-white/10 flex justify-between items-center">
              <span className="text-sm text-gray-400">Root to Anchor:</span>
              <span className="text-sm text-neon-purple font-mono">0x4a2b...9f2a</span>
            </div>
            <div className="bg-white/5 p-3 rounded border border-white/10 flex justify-between items-center">
              <span className="text-sm text-gray-400">IPFS CID:</span>
              <span className="text-sm text-neon-cyan font-mono">QmYw...3eF2</span>
            </div>

            {!isAnchoring && !anchored ? (
              <button 
                onClick={anchorRoot}
                className="w-full py-3 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple font-semibold rounded-lg border border-neon-purple/50 transition-all shadow-[0_0_15px_rgba(188,19,254,0.15)] flex justify-center items-center gap-2"
              >
                <LinkIcon size={18} /> Call anchorMerkleRoot()
              </button>
            ) : isAnchoring ? (
              <div className="w-full py-3 bg-black/40 text-gray-400 font-semibold rounded-lg border border-white/10 flex justify-center items-center gap-2">
                <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                Awaiting Block Confirmation...
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle2 size={18} /> Transaction Confirmed
                </div>
                <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-400">Tx Hash:</span>
                     <span className="text-white font-mono">{txHash.substring(0, 14)}...</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Block:</span>
                     <span className="text-white font-mono">#18,492,301</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Gas Used:</span>
                     <span className="text-neon-cyan font-mono">42,500</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white mb-6">Gas Cost Analysis</h2>
          
          <div className="space-y-8">
            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-sm text-gray-300 font-medium">Traditional Smart Contract (Raw PQC)</div>
                  <div className="text-xs text-gray-500">Storing 4 signatures on-chain</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-mono text-lg">$28.00</div>
                  <div className="text-xs text-gray-500">~1.4M Gas</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                <div className="bg-red-500/80 h-4 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="text-sm text-neon-cyan font-medium">QSC3 Framework (Batch + IPFS)</div>
                  <div className="text-xs text-gray-500">Storing 1 Merkle Root + CID</div>
                </div>
                <div className="text-right">
                  <div className="text-neon-cyan font-mono text-lg font-bold">$8.40</div>
                  <div className="text-xs text-gray-500">~42.5k Gas</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                <div className="bg-neon-cyan h-4 rounded-full relative" style={{ width: '30%' }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-neon-cyan shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-neon-cyan font-medium">70% Cost Reduction Achieved</h4>
                <p className="text-sm text-gray-400 mt-1">
                  By offloading the bulk of the PQC signature data to IPFS and only anchoring a 32-byte Merkle root, QSC3 resolves the exorbitant gas fees associated with large post-quantum cryptographic primitives.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
