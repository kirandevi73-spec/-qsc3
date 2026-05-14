import React, { useState } from 'react';
import { Card, Badge } from '../components/ui';
import { Network, Play, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MerkleTree() {
  const [step, setStep] = useState(0);

  const runAnimation = () => {
    setStep(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= 3) clearInterval(interval);
    }, 1500);
  };

  const reset = () => setStep(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">Batch Merkle <span className="neon-text-cyan">Anchoring</span></h1>
          <p className="text-gray-400">Compressing multiple PQC signatures into a single 32-byte root</p>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} className="p-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <RefreshCw size={20} />
          </button>
          <button onClick={runAnimation} className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan font-bold rounded-lg border border-neon-cyan/50 transition-all flex items-center gap-2">
            <Play size={18} /> Run Batch Anchoring
          </button>
        </div>
      </div>

      <Card className="glass-strong min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated SVG Tree */}
        <div className="relative w-full max-w-2xl aspect-video">
          <svg className="w-full h-full overflow-visible" viewBox="100 0 800 400">
            {/* Edges from L2 to L1 */}
            <line x1="200" y1="300" x2="300" y2="200" stroke={step >= 1 ? '#00f3ff' : '#334155'} strokeWidth="2" className={step >= 1 ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''} />
            <line x1="400" y1="300" x2="300" y2="200" stroke={step >= 1 ? '#00f3ff' : '#334155'} strokeWidth="2" className={step >= 1 ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''} />
            <line x1="600" y1="300" x2="700" y2="200" stroke={step >= 1 ? '#00f3ff' : '#334155'} strokeWidth="2" className={step >= 1 ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''} />
            <line x1="800" y1="300" x2="700" y2="200" stroke={step >= 1 ? '#00f3ff' : '#334155'} strokeWidth="2" className={step >= 1 ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''} />

            {/* Edges from L1 to Root */}
            <line x1="300" y1="200" x2="500" y2="100" stroke={step >= 2 ? '#bc13fe' : '#334155'} strokeWidth="2" className={step >= 2 ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''} />
            <line x1="700" y1="200" x2="500" y2="100" stroke={step >= 2 ? '#bc13fe' : '#334155'} strokeWidth="2" className={step >= 2 ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''} />

            {/* Nodes */}
            {/* L2 (Leaves) */}
            <g transform="translate(200, 300)">
              <circle r="30" fill="#0f172a" stroke="#00f3ff" strokeWidth="2" className="node-pulse" />
              <circle r="20" fill="#00f3ff" opacity="0.2" />
              <text x="0" y="5" fill="white" fontSize="14" textAnchor="middle" fontFamily="monospace">Tx1</text>
            </g>
            <g transform="translate(400, 300)">
              <circle r="30" fill="#0f172a" stroke="#00f3ff" strokeWidth="2" />
              <circle r="20" fill="#00f3ff" opacity="0.2" />
              <text x="0" y="5" fill="white" fontSize="14" textAnchor="middle" fontFamily="monospace">Tx2</text>
            </g>
            <g transform="translate(600, 300)">
              <circle r="30" fill="#0f172a" stroke="#00f3ff" strokeWidth="2" />
              <circle r="20" fill="#00f3ff" opacity="0.2" />
              <text x="0" y="5" fill="white" fontSize="14" textAnchor="middle" fontFamily="monospace">Tx3</text>
            </g>
            <g transform="translate(800, 300)">
              <circle r="30" fill="#0f172a" stroke="#00f3ff" strokeWidth="2" />
              <circle r="20" fill="#00f3ff" opacity="0.2" />
              <text x="0" y="5" fill="white" fontSize="14" textAnchor="middle" fontFamily="monospace">Tx4</text>
            </g>

            {/* L1 (Intermediates) */}
            <g transform="translate(300, 200)" opacity={step >= 1 ? 1 : 0.3} className={step >= 1 ? "transition-opacity duration-500" : ""}>
              <circle r="35" fill="#0f172a" stroke={step >= 1 ? "#00f3ff" : "#475569"} strokeWidth="2" />
              <text x="0" y="5" fill="white" fontSize="12" textAnchor="middle" fontFamily="monospace">H(12)</text>
            </g>
            <g transform="translate(700, 200)" opacity={step >= 1 ? 1 : 0.3} className={step >= 1 ? "transition-opacity duration-500" : ""}>
              <circle r="35" fill="#0f172a" stroke={step >= 1 ? "#00f3ff" : "#475569"} strokeWidth="2" />
              <text x="0" y="5" fill="white" fontSize="12" textAnchor="middle" fontFamily="monospace">H(34)</text>
            </g>

            {/* Root */}
            <g transform="translate(500, 100)" opacity={step >= 2 ? 1 : 0.3} className={step >= 2 ? "transition-opacity duration-500" : ""}>
              <circle r="45" fill="#0a0f1e" stroke={step >= 2 ? "#bc13fe" : "#475569"} strokeWidth="3" className={step >= 2 ? "shadow-[0_0_20px_rgba(188,19,254,0.5)]" : ""} />
              <text x="0" y="-5" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">ROOT</text>
              <text x="0" y="15" fill="#bc13fe" fontSize="10" textAnchor="middle" fontFamily="monospace">32 Bytes</text>
            </g>
          </svg>
        </div>

        <div className="absolute bottom-8 text-center w-full px-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400">
                Ready. 4 Dilithium signatures (13.1 KB total) waiting to be batched.
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-neon-cyan font-mono bg-black/40 p-3 rounded-lg border border-white/5 inline-block">
                Hashing leaves... SHA-256(Tx)
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-neon-purple font-mono bg-black/40 p-3 rounded-lg border border-white/5 inline-block">
                Computing Root: SHA-256(H12 || H34)
              </motion.div>
            )}
            {step >= 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg inline-block shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                <div className="text-green-400 font-bold mb-1">Batch Anchoring Complete</div>
                <div className="text-sm text-gray-300">
                  4 PQC signatures compressed into 1 Merkle root <span className="text-white font-mono bg-black/50 px-2 py-0.5 rounded">(32 bytes)</span>.
                  <br />
                  <span className="text-neon-cyan mt-1 inline-block">99.2% storage saved vs raw on-chain storage.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}
