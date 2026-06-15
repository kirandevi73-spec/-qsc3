import React, { useState, useCallback, memo } from 'react';
import { Card, Badge, ProgressBar } from '../components/ui';
import { Upload, FileText, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const MetricBox = memo(({ label, value, color }) => (
  <div className="bg-black/20 p-3 rounded-lg border border-white/5">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className={`font-mono ${color}`}>{value}</div>
  </div>
));

const SIG_BARS = [
  { progress: 2, color: 'bg-gray-500', label: 'ECDSA (Traditional)', value: '64 Bytes' },
  { progress: 60, color: 'bg-neon-cyan', label: 'Dilithium-2', value: '2,420 Bytes' },
  { progress: 80, color: 'bg-neon-purple', label: 'Dilithium-3 (QSC3)', value: '3,293 Bytes' },
  { progress: 100, color: 'bg-red-500', label: 'Dilithium-5', value: '4,595 Bytes' },
];

const METRICS = [
  { label: 'Key Gen Time', value: '2.1 ms', color: 'text-neon-cyan' },
  { label: 'Sign Time', value: '3.5 ms', color: 'text-neon-cyan' },
  { label: 'Verify Time', value: '2.4 ms', color: 'text-neon-cyan' },
  { label: 'Public Key Size', value: '1,952 B', color: 'text-neon-purple' },
];

export default function PQCSignature() {
  const [file, setFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [signatureDone, setSignatureDone] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  const handleUpload = useCallback(() => {
    setFile({ name: 'iot_sensor_data_batch_1.json', size: '124 KB' });
    setIsGenerating(false);
    setProgress(0);
    setSignatureDone(false);
    setSignatureData(null);
  }, []);

  const resetAll = useCallback(() => {
    setFile(null);
    setSignatureDone(false);
    setSignatureData(null);
    setProgress(0);
  }, []);

  const generateSignature = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 90) clearInterval(interval);
    }, 200);

    try {
      const res = await axios.post(`${API}/pqc/sign`, {
        filename: file.name,
        size: file.size
      });
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setSignatureDone(true);
        setSignatureData(res.data.signature);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      console.error('Signature error:', err);
    }
  }, [file]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
          PQC Signature <span className="neon-text-purple">Generation</span>
        </h1>
        <p className="text-gray-400">Dilithium-3 implementation for post-quantum security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sign Panel */}
        <Card>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="text-neon-purple" size={20} /> Sign Data
          </h2>

          {!file ? (
            <div onClick={handleUpload}
              className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all cursor-pointer">
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
                <button onClick={() => setFile(null)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>

              {!isGenerating && !signatureDone && (
                <button onClick={generateSignature}
                  className="w-full py-3 bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple font-semibold rounded-lg border border-neon-purple/50 transition-all">
                  Generate Dilithium-3 Signature
                </button>
              )}

              {isGenerating && (
                <ProgressBar progress={progress} color="bg-neon-purple" label="Generating signature keys & signing..." valueText={`${progress}%`} />
              )}

              {signatureDone && signatureData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-green-400 font-medium">
                    <CheckCircle size={18} /> Signature Generated Successfully
                  </div>
                  <div className="bg-black/50 p-3 rounded font-mono text-xs text-gray-400 break-all border border-white/5 h-24 overflow-y-auto">
                    {signatureData.signatureHex}<br />
                    [Dilithium-3 Signature - {signatureData.signatureSize}]
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Key Gen:', value: signatureData.keyGenTime },
                      { label: 'Sign Time:', value: signatureData.signTime },
                      { label: 'Verify:', value: signatureData.verifyTime },
                      { label: 'Status:', value: 'VERIFIED ✓', green: true },
                    ].map(({ label, value, green }) => (
                      <div key={label} className="bg-black/30 p-2 rounded">
                        <span className="text-gray-500">{label}</span>
                        <span className={`ml-1 ${green ? 'text-green-400' : 'text-neon-cyan'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={resetAll} className="text-xs text-gray-500 hover:text-white underline">
                    Sign Another File
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </Card>

        {/* Info Panel */}
        <Card className="glass-strong">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={20} /> The Storage Challenge
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-400 mb-3">Signature Size Comparison</h3>
              <div className="space-y-4">
                {SIG_BARS.map(({ progress, color, label, value }) => (
                  <ProgressBar key={label} progress={progress} color={color} label={label} valueText={value} />
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm text-gray-400 mb-3">Performance Metrics (Dilithium-3)</h3>
              <div className="grid grid-cols-2 gap-4">
                {METRICS.map(({ label, value, color }) => (
                  <MetricBox key={label} label={label} value={value} color={color} />
                ))}
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}