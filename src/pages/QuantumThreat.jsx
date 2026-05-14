import React from 'react';
import { Card, Badge } from '../components/ui';
import { ShieldAlert, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function QuantumThreat() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">Quantum <span className="neon-text-cyan">Threat Monitor</span></h1>
        <p className="text-gray-400">Cryptographic vulnerability assessment and Q-Day projection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Readiness Score */}
        <Card className="glass-strong flex flex-col items-center justify-center p-8 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent"></div>
           
           <h2 className="text-lg font-medium text-gray-300 mb-6 relative z-10">QSC3 Readiness Score</h2>
           
           <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-green-500/30 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-2 rounded-full border border-green-500/50"></div>
              <div className="text-7xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-neon-cyan drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                A+
              </div>
           </div>

           <Badge variant="green" className="text-sm px-4 py-1.5 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              Quantum Secure
           </Badge>
        </Card>

        {/* Q-Day Projection */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-semibold text-white flex items-center gap-2">
               <ShieldAlert className="text-yellow-500" /> Projected Q-Day
             </h2>
             <Badge variant="red" className="animate-pulse">CRITICAL PATH</Badge>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 border border-white/5 rounded-lg p-5">
              <div className="text-4xl font-mono font-bold text-red-400 mb-2">2035 - 2045</div>
              <p className="text-gray-400 text-sm">
                Estimated timeline for the realization of a Cryptographically Relevant Quantum Computer (CRQC) capable of breaking 2048-bit RSA and ECC secp256k1 via Shor's Algorithm.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                <span>2020</span>
                <span>2025</span>
                <span className="text-neon-cyan">NOW</span>
                <span>2035 (Q-Day Start)</span>
                <span>2050</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full relative">
                <div className="absolute left-0 top-0 h-full bg-gray-500 rounded-l-full" style={{ width: '10%' }}></div>
                <div className="absolute left-[10%] top-0 h-full bg-neon-cyan" style={{ width: '15%' }}></div>
                <div className="absolute left-[25%] top-0 h-full bg-gradient-to-r from-neon-cyan to-red-500" style={{ width: '40%' }}></div>
                <div className="absolute left-[65%] top-0 h-full bg-red-500 rounded-r-full animate-pulse" style={{ width: '35%' }}></div>
                
                {/* Current marker */}
                <div className="absolute left-[25%] -top-2 w-1 h-6 bg-white shadow-[0_0_10px_white]"></div>
              </div>
            </div>

            <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4 flex gap-3 text-sm">
              <Info className="text-neon-cyan shrink-0" size={20} />
              <div className="text-gray-300">
                <strong className="text-neon-cyan">Store Now, Decrypt Later (SNDL):</strong> Adversaries are currently harvesting encrypted blockchain traffic. QSC3 implements Dilithium-3 to ensure data signed today cannot be forged or decrypted when Q-Day arrives.
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Threat Table */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Vulnerability Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3 font-medium">Attack Vector</th>
                <th className="p-3 font-medium">Target Primitive</th>
                <th className="p-3 font-medium">Traditional (ECDSA)</th>
                <th className="p-3 font-medium">QSC3 (Dilithium)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              <tr className="hover:bg-white/5">
                <td className="p-3 font-medium text-white">Shor's Algorithm</td>
                <td className="p-3 text-gray-400">Public Key (Factor/DLP)</td>
                <td className="p-3">
                  <Badge variant="red" className="flex w-max items-center gap-1"><AlertTriangle size={12}/> Broken</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="green" className="flex w-max items-center gap-1"><ShieldCheck size={12}/> Secure (Lattice)</Badge>
                </td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-medium text-white">Grover's Algorithm</td>
                <td className="p-3 text-gray-400">Hash Functions (SHA-256)</td>
                <td className="p-3">
                  <Badge variant="purple">Weakened (128-bit)</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="green" className="flex w-max items-center gap-1"><ShieldCheck size={12}/> Secure (SHA-3/512)</Badge>
                </td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-medium text-white">Lattice Reduction</td>
                <td className="p-3 text-gray-400">PQC Algorithms</td>
                <td className="p-3 text-gray-500">N/A</td>
                <td className="p-3">
                  <Badge variant="cyan">Secure (NIST L3)</Badge>
                </td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="p-3 font-medium text-white">Side-Channel</td>
                <td className="p-3 text-gray-400">Edge Hardware (ESP32)</td>
                <td className="p-3">
                  <Badge variant="red">Vulnerable</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="cyan">Mitigated (Masking)</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
