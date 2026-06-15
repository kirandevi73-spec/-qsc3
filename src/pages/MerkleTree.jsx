import React, { useState, useCallback } from 'react';
import { Card } from '../components/ui';
import { Play, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEP_MESSAGES = [
  { color: 'text-gray-400', text: 'Ready. 4 Dilithium signatures (13.1 KB total) waiting to be batched.' },
  { color: 'text-neon-cyan', text: 'Hashing leaves... SHA-256(Tx)', mono: true },
  { color: 'text-neon-purple', text: 'Computing Root: SHA-256(H12 || H34)', mono: true },
  { color: 'text-green-400', text: null },
];

const edgeColor = (active, step, threshold) =>
  step >= threshold ? '#00f3ff' : '#334155';

const purpleEdgeColor = (step, threshold) =>
  step >= threshold ? '#bc13fe' : '#334155';

export default function MerkleTree() {
  const [step, setStep] = useState(0);

  const runAnimation = useCallback(() => {
    setStep(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= 3) clearInterval(interval);
    }, 1500);
  }, []);

  const reset = useCallback(() => setStep(0), []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
            Batch Merkle <span className="neon-text-cyan">Anchoring</span>
          </h1>
          <p className="text-gray-400">Compressing multiple PQC signatures into a single 32-byte root</p>
        </div>
        <div className="flex gap-3">
          <button onClick={reset}
            className="p-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <RefreshCw size={20} />
          </button>
          <button onClick={runAnimation}
            className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan font-bold rounded-lg border border-neon-cyan/50 transition-all flex items-center gap-2">
            <Play size={18} /> Run Batch Anchoring
          </button>
        </div>
      </div>

      <Card className="glass-strong min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">

        {/* SVG Tree */}
        <div className="relative w-full max-w-2xl aspect-video">
          <svg className="w-full h-full overflow-visible" viewBox="100 0 800 400">

            {/* L2 → L1 edges */}
            {[[200, 300, 300, 200], [400, 300, 300, 200], [600, 300, 700, 200], [800, 300, 700, 200]].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={step >= 1 ? '#00f3ff' : '#334155'} strokeWidth="2" />
            ))}

            {/* L1 → Root edges */}
            {[[300, 200, 500, 100], [700, 200, 500, 100]].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={step >= 2 ? '#bc13fe' : '#334155'} strokeWidth="2" />
            ))}

            {/* Leaf nodes */}
            {[200, 400, 600, 800].map((x, i) => (
              <g key={i} transform={`translate(${x}, 300)`}>
                <circle r="30" fill="#0f172a" stroke="#00f3ff" strokeWidth="2" />
                <circle r="20" fill="#00f3ff" opacity="0.2" />
                <text x="0" y="5" fill="white" fontSize="14" textAnchor="middle" fontFamily="monospace">Tx{i + 1}</text>
              </g>
            ))}

            {/* Intermediate nodes */}
            {[{ x: 300, label: 'H(12)' }, { x: 700, label: 'H(34)' }].map(({ x, label }) => (
              <g key={label} transform={`translate(${x}, 200)`}
                opacity={step >= 1 ? 1 : 0.3}
                style={{ transition: 'opacity 0.5s' }}>
                <circle r="35" fill="#0f172a" stroke={step >= 1 ? '#00f3ff' : '#475569'} strokeWidth="2" />
                <text x="0" y="5" fill="white" fontSize="12" textAnchor="middle" fontFamily="monospace">{label}</text>
              </g>
            ))}

            {/* Root node */}
            <g transform="translate(500, 100)"
              opacity={step >= 2 ? 1 : 0.3}
              style={{ transition: 'opacity 0.5s' }}>
              <circle r="45" fill="#0a0f1e" stroke={step >= 2 ? '#bc13fe' : '#475569'} strokeWidth="3" />
              <text x="0" y="-5" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">ROOT</text>
              <text x="0" y="15" fill="#bc13fe" fontSize="10" textAnchor="middle" fontFamily="monospace">32 Bytes</text>
            </g>

          </svg>
        </div>

        {/* Step Messages */}
        <div className="absolute bottom-8 text-center w-full px-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400">
                Ready. 4 Dilithium signatures (13.1 KB total) waiting to be batched.
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-neon-cyan font-mono bg-black/40 p-3 rounded-lg border border-white/5 inline-block">
                Hashing leaves... SHA-256(Tx)
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-neon-purple font-mono bg-black/40 p-3 rounded-lg border border-white/5 inline-block">
                Computing Root: SHA-256(H12 || H34)
              </motion.div>
            )}
            {step >= 3 && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg inline-block">
                <div className="text-green-400 font-bold mb-1">Batch Anchoring Complete</div>
                <div className="text-sm text-gray-300">
                  4 PQC signatures compressed into 1 Merkle root{' '}
                  <span className="text-white font-mono bg-black/50 px-2 py-0.5 rounded">(32 bytes)</span>.
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