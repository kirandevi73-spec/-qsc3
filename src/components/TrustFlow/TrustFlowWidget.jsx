import React, { useState } from 'react';
import { useMetaMask } from '../../hooks/useMetaMask';
import axios from 'axios';

export default function TrustFlowWidget() {
  const { account, isConnected, connect, signMessage } = useMetaMask();
  const [iotData, setIotData] = useState('Temperature:25.5,Humidity:60%');
  const [deviceId, setDeviceId] = useState('IoT-Sensor-001');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const handleTrustFlow = async () => {
    try {
      setLoading(true);
      setStep(1);
      
      // Step 1: Get ECDSA signature from MetaMask
      const hashPayload = `QSC3:${deviceId}:${btoa(iotData)}`;
      const ecdsaSignature = await signMessage(hashPayload);
      setStep(2);
      
      // Step 2: Generate Dilithium-3 mock signature
      const dilithiumSignature = `pk_dilithium_${Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setStep(3);
      
      // Step 3: Send to backend for complete trust flow
      const response = await axios.post('http://localhost:5000/api/trustflow/anchor', {
        iotData,
        deviceId,
        ecdsaSignature,
        dilithiumSignature,
        publicKeyECDSA: account
      });
      setStep(4);
      
      setResult(response.data);
      setStep(5);
      
    } catch (error) {
      console.error('Trust flow error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    'Connect MetaMask',
    'Sign with ECDSA',
    'Generate Dilithium-3',
    'Anchor to Blockchain',
    'Complete!'
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-neon-cyan/30">
      <h2 className="text-xl font-bold text-white mb-4">🔐 End-to-End Trust Flow</h2>
      
      {/* Progress Steps */}
      <div className="flex justify-between mb-6">
        {steps.map((s, i) => (
          <div key={i} className={`flex flex-col items-center ${i <= step ? 'text-neon-cyan' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 
              ${i <= step ? 'bg-neon-cyan text-slate-900' : 'bg-slate-700 text-gray-400'}`}>
              {i + 1}
            </div>
            <span className="text-xs">{s}</span>
          </div>
        ))}
      </div>

      {!isConnected ? (
        <button 
          onClick={connect}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-bold"
        >
          🔗 Connect MetaMask to Start
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-900/30 p-3 rounded border border-green-500/30">
            <p className="text-green-400 font-mono text-sm">✅ Connected: {account?.slice(0, 20)}...</p>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm">Device ID</label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white mt-1"
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-sm">IoT Data</label>
            <textarea
              value={iotData}
              onChange={(e) => setIotData(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white mt-1 h-20"
            />
          </div>
          
          <button
            onClick={handleTrustFlow}
            disabled={loading}
            className="w-full bg-neon-cyan hover:bg-cyan-400 text-slate-900 px-4 py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? `⏳ Processing Step ${step + 1}...` : '🚀 Anchor to Blockchain'}
          </button>
        </div>
      )}
      
      {result && (
        <div className="mt-6 space-y-3">
          <div className="bg-slate-900 p-4 rounded border border-green-500/30">
            <h3 className="text-green-400 font-bold mb-2">✅ Trust Flow Complete!</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">BLAKE2b Hash:</span>
                <span className="text-neon-cyan font-mono text-xs truncate max-w-[200px]">
                  {result.trustFlow.step2_blake2bHash}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Verification:</span>
                <span className="text-green-400">
                  {result.trustFlow.step4_verification?.hybrid || 'PENDING'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Block Number:</span>
                <span className="text-white font-mono">
                  {result.trustFlow.step6_blockchainAnchor.blockNumber}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">TX Hash:</span>
                <span className="text-white font-mono text-xs truncate max-w-[200px]">
                  {result.trustFlow.step6_blockchainAnchor.txHash}
                </span>
              </div>
              
              <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                <span className="text-gray-400">Quantum Security:</span>
                <span className="text-purple-400 font-bold">
                  {result.quantumSecurity}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
            <p className="text-xs text-purple-400">🔐 Merkle Root: {result.merkleRoot?.slice(0, 20)}...</p>
          </div>
        </div>
      )}
    </div>
  );
}