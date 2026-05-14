import React from 'react';
import { Card, Badge } from '../components/ui';
import { Scale, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const MetricRow = ({ name, trad, pqc, qsc3 }) => {
  const renderBars = (value, colorClass) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`h-2 w-4 rounded-sm ${i <= value ? colorClass : 'bg-slate-800'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td className="py-4 font-medium text-gray-300">{name}</td>
      <td className="py-4">
        {renderBars(trad, 'bg-gray-400')}
        <span className="text-xs text-gray-500 mt-1 block">{trad}/5</span>
      </td>
      <td className="py-4">
        {renderBars(pqc, 'bg-red-500')}
        <span className="text-xs text-red-500 mt-1 block">{pqc}/5</span>
      </td>
      <td className="py-4">
        {renderBars(qsc3, 'bg-neon-cyan')}
        <span className="text-xs text-neon-cyan mt-1 block">{qsc3}/5</span>
      </td>
    </tr>
  );
};

export default function ResearchCompare() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">Research <span className="neon-text-purple">Comparison</span></h1>
        <p className="text-gray-400">Evaluating QSC3 against traditional and naive PQC implementations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-t-4 border-t-gray-500 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
             <XCircle className="text-gray-400" size={20} />
             <h3 className="font-bold text-white">Traditional (ECDSA)</h3>
          </div>
          <p className="text-sm text-gray-400 flex-1">
            Current blockchain standard using Elliptic Curve Cryptography. Highly efficient but completely vulnerable to Shor's algorithm on a mature quantum computer.
          </p>
          <Badge variant="red" className="mt-4 self-start bg-transparent">VULNERABLE (Q-DAY)</Badge>
        </Card>

        <Card className="border-t-4 border-t-red-500 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
             <AlertTriangle className="text-red-400" size={20} />
             <h3 className="font-bold text-white">PQC-Only (Naive)</h3>
          </div>
          <p className="text-sm text-gray-400 flex-1">
            Directly substituting ECDSA with Dilithium/Falcon. Quantum-secure but results in massive state bloat, low TPS, and exorbitant gas costs due to large signature sizes.
          </p>
          <Badge variant="red" className="mt-4 self-start bg-transparent text-red-400 border-red-500">NOT SCALABLE</Badge>
        </Card>

        <Card className="border-t-4 border-t-neon-cyan glass-strong shadow-[0_0_20px_rgba(0,243,255,0.1)] flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
             <CheckCircle2 className="text-neon-cyan" size={20} />
             <h3 className="font-bold text-white">QSC3 Framework</h3>
          </div>
          <p className="text-sm text-gray-300 flex-1">
            Hybrid approach utilizing Dilithium for security, IPFS for off-chain storage, and Merkle roots for on-chain anchoring. Achieves quantum security with high scalability.
          </p>
          <Badge variant="cyan" className="mt-4 self-start bg-transparent shadow-[0_0_10px_rgba(0,243,255,0.2)]">OPTIMAL SOLUTION</Badge>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Scale className="text-neon-cyan" size={20} /> Performance Matrix
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-sm text-gray-400">
                <th className="pb-3 font-medium">Evaluation Metric</th>
                <th className="pb-3 font-medium">Traditional</th>
                <th className="pb-3 font-medium">PQC-Only</th>
                <th className="pb-3 font-medium text-neon-cyan">QSC3 Framework</th>
              </tr>
            </thead>
            <tbody>
              <MetricRow name="Quantum Security" trad={1} pqc={5} qsc3={5} />
              <MetricRow name="On-Chain Storage Efficiency" trad={5} pqc={1} qsc3={4} />
              <MetricRow name="Network Scalability (TPS)" trad={5} pqc={2} qsc3={4} />
              <MetricRow name="End-to-End Latency" trad={5} pqc={3} qsc3={3} />
              <MetricRow name="Gas Cost / Operation" trad={5} pqc={1} qsc3={4} />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
