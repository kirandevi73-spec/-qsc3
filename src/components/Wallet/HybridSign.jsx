import React, { useState } from 'react';
import { useMetaMask } from '../../hooks/useMetaMask';
import axios from 'axios';

export default function HybridSign() {
  const { account, isConnected, connect, signMessage } = useMetaMask();
  const [message, setMessage] = useState('QSC3-Anchor-Data');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleHybridSign = async () => {
    try {
      setLoading(true);

      // Step 1: MetaMask ECDSA Sign
      const ecdsaSignature = await signMessage(message);
      console.log('ECDSA Signature:', ecdsaSignature);

      // Step 2: Generate Dilithium-3 Mock Signature (proper format)
      const dilithiumSignature = `pk_dilithium_${Math.random().toString(36).substring(2, 34)}`;
      // Step 3: Send to backend for verification
      const response = await axios.post('http://localhost:5000/api/wallet/verify-hybrid', {
        message,
        ecdsaSignature,
        dilithiumSignature,
        publicKeyECDSA: account,
        publicKeyDilithium: 'pk_dilithium_mock_123'
      });

      setResult(response.data);

      // Step 4: If valid, submit extrinsic
      if (response.data.verification.hybrid === 'VALID') {
        const extrinsic = await axios.post('http://localhost:5000/api/wallet/submit-extrinsic', {
          extrinsicPayload: response.data.extrinsicPayload
        });
        setResult(prev => ({ ...prev, substrate: extrinsic.data.substrate }));
      }

    } catch (error) {
      console.error('Hybrid sign error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-neon-cyan/30">
      <h2 className="text-xl font-bold text-white mb-4">Hybrid Signature (ECDSA + Dilithium-3)</h2>

      {!isConnected ? (
        <button
          onClick={connect}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          🔗 Connect MetaMask
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-green-400 font-mono text-sm">Connected: {account}</p>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
            placeholder="Message to sign..."
          />

          <button
            onClick={handleHybridSign}
            disabled={loading}
            className="bg-neon-cyan hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? '⏳ Signing...' : '✍️ Hybrid Sign + Submit'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          <div className="bg-slate-900 p-3 rounded">
            <p className="text-xs text-gray-400">ECDSA: <span className={result.verification.ecdsa === 'VALID' ? 'text-green-400' : 'text-red-400'}>{result.verification.ecdsa}</span></p>
            <p className="text-xs text-gray-400">Dilithium-3: <span className={result.verification.dilithium3 === 'VALID' ? 'text-green-400' : 'text-red-400'}>{result.verification.dilithium3}</span></p>
            <p className="text-xs text-gray-400">Hybrid: <span className={result.verification.hybrid === 'VALID' ? 'text-green-400' : 'text-red-400'}>{result.verification.hybrid}</span></p>
          </div>

          {result.substrate && (
            <div className="bg-green-900/30 p-3 rounded border border-green-500/30">
              <p className="text-xs text-green-400">✅ Substrate Anchored!</p>
              <p className="text-xs text-gray-400">Block: {result.substrate.blockNumber}</p>
              <p className="text-xs text-gray-400 font-mono truncate">TX: {result.substrate.txHash}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}