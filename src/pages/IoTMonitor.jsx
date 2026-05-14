import React, { useEffect, useState } from 'react';
import { Card, Badge, ProgressBar } from '../components/ui';
import { Cpu, Activity, Zap, Shield } from 'lucide-react';

export default function IoTMonitor() {
  const [cpu, setCpu] = useState(35);
  const [memory, setMemory] = useState(62);

  // Simulate live IoT metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => {
        const next = prev + (Math.random() * 10 - 5);
        return Math.min(Math.max(next, 30), 45); // Keep between 30-45%
      });
      setMemory(prev => {
        const next = prev + (Math.random() * 4 - 2);
        return Math.min(Math.max(next, 58), 72); // Keep between 58-72%
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">IoT <span className="neon-text-cyan">Monitor</span></h1>
        <p className="text-gray-400">Live ESP32-S3 hardware constraints and PQC benchmarking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Card */}
        <Card className="glass-strong border-neon-cyan/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Cpu size={80} />
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">ESP32-S3 Node</h2>
              <p className="text-sm text-gray-400">Edge Aggregator</p>
            </div>
            <Badge variant="green" className="animate-pulse">ONLINE</Badge>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 flex items-center gap-1"><Activity size={14} className="text-neon-cyan" /> CPU Load</span>
                <span className="text-neon-cyan font-mono">{cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-neon-cyan h-2 rounded-full transition-all duration-500" style={{ width: `${cpu}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 flex items-center gap-1"><Database size={14} className="text-neon-purple" /> Memory Used</span>
                <span className="text-neon-purple font-mono">{memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-neon-purple h-2 rounded-full transition-all duration-500" style={{ width: `${memory}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">312 KB / 512 KB SRAM</p>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Active Algo</div>
                <Badge variant="cyan">Dilithium-3</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Power Draw</div>
                <div className="text-sm text-white font-mono flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" /> 185 mA
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Benchmarks Table */}
        <Card className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Shield className="text-neon-purple" size={20} /> PQC Algorithm Benchmarks
            </h2>
            <Badge variant="purple">Hardware: ESP32-S3 (240MHz)</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/10">
                <tr>
                  <th className="p-3">Algorithm</th>
                  <th className="p-3">Key Gen (ms)</th>
                  <th className="p-3">Sign (ms)</th>
                  <th className="p-3">Verify (ms)</th>
                  <th className="p-3">Memory Peak (KB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium">Kyber-768 (KEM)</td>
                  <td className="p-3 font-mono">1.2</td>
                  <td className="p-3 font-mono text-gray-500">N/A</td>
                  <td className="p-3 font-mono text-gray-500">N/A</td>
                  <td className="p-3 font-mono">18.5</td>
                </tr>
                <tr className="bg-neon-cyan/5 border-l-2 border-l-neon-cyan hover:bg-neon-cyan/10 transition-colors">
                  <td className="p-3 font-medium text-neon-cyan">Dilithium-3 (Chosen)</td>
                  <td className="p-3 font-mono text-neon-cyan">2.1</td>
                  <td className="p-3 font-mono text-neon-cyan">3.5</td>
                  <td className="p-3 font-mono text-neon-cyan">2.4</td>
                  <td className="p-3 font-mono text-neon-cyan">45.2</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium">Falcon-512</td>
                  <td className="p-3 font-mono">15.8</td>
                  <td className="p-3 font-mono">0.8</td>
                  <td className="p-3 font-mono">0.2</td>
                  <td className="p-3 font-mono text-red-400">142.0 *</td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium">SPHINCS+</td>
                  <td className="p-3 font-mono">85.0</td>
                  <td className="p-3 font-mono">210.0</td>
                  <td className="p-3 font-mono">1.5</td>
                  <td className="p-3 font-mono text-red-400">OOM *</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            * Falcon-512 requires floating-point operations which stress the ESP32. SPHINCS+ causes Out-of-Memory (OOM) due to massive signature sizes (up to 49KB).
          </div>
        </Card>
      </div>
    </div>
  );
}

// Inline missing icon
const Database = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);
