import React, { useState } from 'react';
import { Card, Badge, ProgressBar } from '../components/ui';
import { Upload, FileText, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PQCSignature() {
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [signatureDone, setSignatureDone] = useState(false);

  const handleUpload = (e) => {
    e.preventDefault();
    setFile({ name: 'iot_sensor_data_batch_1.json', size: '124 KB' });
    setIsGenerating(false);
    setProgress(0);
    setSignatureDone(false);
  };

  const generateSignature = () => {
    setIsGenerating(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setSignatureDone(true);
        }, 500);
      }
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">PQC Signature <span className="neon-text-purple">Generation</span></h1>
        <p className="text-gray-400">Dilithium-3 implementation for post-quantum security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Section */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="text-neon-purple" size={20} /> Sign Data
          </h2>
          
          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all cursor-pointer"
              onClick={handleUpload}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-gray-300 font-medium mb-1">Click to upload or drag & drop</p>
              <p className="text-sm text-gray-500">JSON, CSV, or TXT up to 10MB</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="text-neon-cyan" size={24} />
                  <div>
                    <div className="text-sm font-medium text-gray-200">{file.name}</div>
                    <div className="text-xs text-gray-500">{file.size}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              {!isGenerating && !signatureDone && (
                <button
                  onClick={generateSignature}
                  className="w-full py-3 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple font-semibold rounded-lg border border-neon-purple/50 transition-all shadow-[0_0_15px_rgba(188,19,254,0.15)]"
                >
                  Generate Dilithium-3 Signature
                </button>
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <ProgressBar progress={progress} color="bg-neon-purple" label="Generating signature keys & signing..." valueText={`${progress}%`} />
                </div>
              )}

              {signatureDone && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3"
                >
                  <div className="flex items-center gap-2 text-green-400 font-medium">
                    <CheckCircle size={18} /> Signature Generated Successfully
                  </div>
                  <div className="bg-black/50 p-3 rounded font-mono text-xs text-gray-400 break-all border border-white/5 h-24 overflow-y-auto custom-scrollbar">
                    0x7a3f8c9d2e1b4a6f5e8d7c9b2a1f4e6d8c7b9a2f1e4d6c5b8a7f9e1d2c4b6a8f...
                    [Dilithium-3 Signature - 3,293 bytes]...
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </Card>

        {/* Metrics Section */}
        <Card className="glass-strong">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} /> The Storage Challenge
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-400 mb-3">Signature Size Comparison</h3>
              <div className="space-y-4">
                <ProgressBar progress={2} color="bg-gray-500" label="ECDSA (Traditional)" valueText="64 Bytes" />
                <ProgressBar progress={60} color="bg-neon-cyan" label="Dilithium-2" valueText="2,420 Bytes" />
                <ProgressBar progress={80} color="bg-neon-purple" label="Dilithium-3 (QSC3)" valueText="3,293 Bytes" />
                <ProgressBar progress={100} color="bg-red-500" label="Dilithium-5" valueText="4,595 Bytes" />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm text-gray-400 mb-3">Performance Metrics (Dilithium-3)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Key Gen Time</div>
                  <div className="font-mono text-neon-cyan">2.1 ms</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Sign Time</div>
                  <div className="font-mono text-neon-cyan">3.5 ms</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Verify Time</div>
                  <div className="font-mono text-neon-cyan">2.4 ms</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-gray-500 mb-1">Public Key Size</div>
                  <div className="font-mono text-neon-purple">1,952 B</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
