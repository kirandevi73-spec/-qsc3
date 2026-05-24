import React, { useState } from 'react';
import { Card, Badge, AnimatedCounter } from '../components/ui';
import { Database, UploadCloud, Link as LinkIcon, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function IPFSModule() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [cid, setCid] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    setIsUploading(true);
    setError('');
    try {
      const payload = {
        name: `qsc3_batch_${Date.now()}`,
        content: {
          batch: 'Block #18492',
          transactions: 4096,
          type: 'Dilithium-3 Signatures',
          timestamp: new Date().toISOString()
        }
      };
      const res = await axios.post('http://localhost:5000/api/ipfs/upload', payload);
      if (res.data.success) {
        setCid(res.data.cid);
        setUploaded(true);
      }
    } catch (err) {
      setError('Upload failed. Check backend.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setUploaded(false);
    setCid('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">IPFS <span className="neon-text-cyan">Storage Offloading</span></h1>
        <p className="text-gray-400">Decentralized storage for bulky PQC signatures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-strong relative overflow-hidden">
          <div className="absolute -right-20 -top-20 opacity-5">
            <Database size={300} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-4 relative z-10">Data & Signature Upload</h2>

          <div className="bg-black/40 border border-white/10 rounded-xl p-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple">
                  <HardDrive size={20} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-200">Pending Batch: Block #18492</div>
                  <div className="text-xs text-gray-500">4,096 Transactions + Dilithium Sigs (13.5 MB)</div>
                </div>
              </div>
              <Badge variant="cyan">READY</Badge>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isUploading && !uploaded ? (
              <button
                onClick={handleUpload}
                className="w-full py-4 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan font-bold rounded-lg border border-neon-cyan/50 transition-all flex justify-center items-center gap-2"
              >
                <UploadCloud size={20} />
                Upload Batch to IPFS Node
              </button>
            ) : isUploading ? (
              <div className="space-y-3 py-2">
                <div className="flex justify-between text-sm text-neon-cyan">
                  <span>Uploading to Pinata IPFS...</span>
                  <span className="animate-pulse">Pinning...</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-neon-cyan h-2 rounded-full w-full animate-pulse"></div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-lg p-5"
              >
                <div className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <CheckCircle size={18} /> Off-chain Storage Successful
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Content Identifier (CID)</div>
                    <div className="bg-black/50 p-3 rounded font-mono text-sm text-neon-cyan border border-white/5 flex justify-between items-center">
                      {cid}
                      <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noreferrer">
                        <LinkIcon size={14} className="text-gray-500 cursor-pointer hover:text-white" />
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    This 46-byte hash is all that needs to be anchored on-chain, completely bypassing the 13.5MB PQC storage bottleneck.
                  </div>
                  <button
                    onClick={resetUpload}
                    className="text-xs text-gray-500 hover:text-white underline mt-2"
                  >
                    Upload Another Batch
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">Storage Optimization</h2>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-gray-300">Traditional (ECDSA)</span>
                <span className="text-xs text-gray-500">12.0 MB</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-gray-500 h-3 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-gray-300">Raw PQC (On-Chain)</span>
                <span className="text-xs text-red-400">40.5 MB</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 relative">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                <div className="absolute top-4 left-0 text-[10px] text-red-400 mt-1">Exceeds block limits</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-neon-cyan font-bold">QSC3 (IPFS + Anchor)</span>
                <span className="text-xs text-neon-cyan font-bold">0.7 MB</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-neon-cyan h-3 rounded-full relative" style={{ width: '5%' }}>
                  <div className="absolute -right-1 -top-1 w-5 h-5 bg-neon-cyan rounded-full animate-ping opacity-20"></div>
                </div>
              </div>
              <div className="mt-3 text-right">
                <Badge variant="cyan"><AnimatedCounter value={94} />% Reduction</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const CheckCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);