import React from 'react';
import { Card, Badge } from '../components/ui';
import { Cpu, Lock, Database, Network, Link as LinkIcon, ArrowRight } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">System <span className="neon-text-cyan">Architecture</span></h1>
        <p className="text-gray-400">End-to-end data flow: Edge Device to Blockchain Anchor</p>
      </div>

      {/* Architecture Flow Diagram */}
      <Card className="glass-strong py-12 px-4 overflow-x-auto relative">
        {/* Animated packet dots */}
        <div className="absolute top-[48%] left-16 right-16 h-0.5 bg-white/5 z-0 flex items-center">
            <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_10px_#00f3ff] absolute animate-[scan_3s_linear_infinite] left-0" style={{ animationName: 'flowRight', animationDuration: '4s' }}></div>
            <div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_10px_#bc13fe] absolute animate-[scan_3s_linear_infinite] left-0" style={{ animationName: 'flowRight', animationDuration: '4s', animationDelay: '2s' }}></div>
        </div>

        <div className="min-w-[800px] flex justify-between items-center relative z-10">
          
          <div className="flex flex-col items-center gap-4 w-40">
            <div className="w-16 h-16 rounded-2xl bg-black/50 border-2 border-gray-600 flex items-center justify-center text-gray-400 shadow-lg">
              <Cpu size={32} />
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">1. Edge Device</div>
              <div className="text-xs text-gray-500 mt-1">ESP32-S3 IoT Node</div>
            </div>
            <Badge variant="cyan" className="text-[10px]">Collect Data</Badge>
          </div>

          <ArrowRight className="text-gray-600" />

          <div className="flex flex-col items-center gap-4 w-40">
            <div className="w-16 h-16 rounded-2xl bg-black/50 border-2 border-neon-cyan/50 flex items-center justify-center text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.2)]">
              <Lock size={32} />
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">2. PQC Sign</div>
              <div className="text-xs text-gray-500 mt-1">Dilithium-3</div>
            </div>
            <Badge variant="cyan" className="text-[10px]">Sign Payload</Badge>
          </div>

          <ArrowRight className="text-gray-600" />

          <div className="flex flex-col items-center gap-4 w-40">
            <div className="w-16 h-16 rounded-2xl bg-black/50 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Database size={32} />
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">3. IPFS Offload</div>
              <div className="text-xs text-gray-500 mt-1">Decentralized Storage</div>
            </div>
            <Badge variant="cyan" className="text-[10px]">Return CID</Badge>
          </div>

          <ArrowRight className="text-gray-600" />

          <div className="flex flex-col items-center gap-4 w-40">
            <div className="w-16 h-16 rounded-2xl bg-black/50 border-2 border-neon-purple/50 flex items-center justify-center text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.2)]">
              <Network size={32} />
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">4. Merkle Batch</div>
              <div className="text-xs text-gray-500 mt-1">N-Transactions</div>
            </div>
            <Badge variant="purple" className="text-[10px]">Compute Root</Badge>
          </div>

          <ArrowRight className="text-gray-600" />

          <div className="flex flex-col items-center gap-4 w-40">
            <div className="w-16 h-16 rounded-2xl bg-black/50 border-2 border-green-500/50 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <LinkIcon size={32} />
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">5. Blockchain</div>
              <div className="text-xs text-gray-500 mt-1">Smart Contract</div>
            </div>
            <Badge variant="green" className="text-[10px]">Anchor Hash</Badge>
          </div>

        </div>
      </Card>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowRight {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Data Packet Trace</h2>
          <div className="bg-black/50 rounded-lg p-4 font-mono text-sm space-y-4">
            <div>
              <div className="text-gray-500 mb-1">// 1. Raw Data (JSON)</div>
              <div className="text-white break-all">{`{"temp":24.5,"humid":60,"ts":1715629124}`}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">// 2. PQC Signature (Dilithium-3)</div>
              <div className="text-neon-cyan break-all">0x7a3f...e2d1 <span className="text-gray-600">(3.3 KB)</span></div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">// 3. IPFS Content Identifier</div>
              <div className="text-blue-400 break-all">QmYwAPJzv5CZsnAzt8auvD9y6mK1y5t2z8a9XvB4cD3eF2 <span className="text-gray-600">(46 B)</span></div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">// 4. Merkle Root (Batch of 4096)</div>
              <div className="text-neon-purple break-all">0xRoot...9f2a <span className="text-gray-600">(32 B)</span></div>
            </div>
            <div className="border-t border-white/10 pt-4 text-green-400">
               Anchored to Block #18492301
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Security Properties</h2>
          <div className="space-y-4">
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-sm font-bold text-neon-cyan mb-1">Authenticity & Non-Repudiation</h3>
              <p className="text-xs text-gray-400">Dilithium-3 signatures ensure that IoT data cannot be forged, even by adversaries equipped with Cryptographically Relevant Quantum Computers (CRQCs).</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-sm font-bold text-blue-400 mb-1">Data Availability</h3>
              <p className="text-xs text-gray-400">IPFS pinning across distributed nodes guarantees that the bulky signature data remains accessible off-chain without bloating the ledger.</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-sm font-bold text-neon-purple mb-1">Immutability</h3>
              <p className="text-xs text-gray-400">The 32-byte Merkle root stored on the Ethereum blockchain provides a cryptographically secure timestamp and tamper-proof commitment to the entire batch.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
