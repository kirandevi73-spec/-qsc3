import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Loader2, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' or 'email'
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        email,
        password
      });
      login(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Backend may not be running.');
      } else {
        setError(err.response?.data?.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install it to connect.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 1. Get Nonce
      const nonceRes = await axios.post('http://localhost:5000/api/auth/metamask/nonce', { address });
      const nonce = nonceRes.data.nonce;

      // 2. Sign Message
      const message = `Please sign this nonce to login to QSC3: ${nonce}`;
      const signature = await signer.signMessage(message);

      // 3. Verify Signature
      const verifyRes = await axios.post('http://localhost:5000/api/auth/metamask/verify', {
        address,
        signature
      });

      login(verifyRes.data.token, verifyRes.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (!err.response && err.message && !err.message.includes('MetaMask')) {
        setError('Network Error: Backend may not be running.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to connect wallet');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-dark-bg relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-1/2 bg-neon-cyan/5 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-neon-cyan/10 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20 mb-4">
            <Shield className="text-neon-cyan w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold font-mono text-white tracking-wide">QSC<span className="text-neon-cyan">3</span></h2>
          <p className="text-gray-400 text-sm mt-2 font-mono">Quantum-Safe Cryptography Suite</p>
        </div>

        <div className="flex bg-black/40 rounded-lg p-1 mb-6 border border-white/5">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'wallet' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Web3 Wallet
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'email' 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Email
          </button>
        </div>

        {activeTab === 'wallet' ? (
          <div className="py-4">
            <p className="text-gray-400 text-sm text-center mb-6">
              Connect securely using your Web3 wallet. Recommended for full cryptographic access.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={connectWallet}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Wallet size={20} />}
                <span>{loading ? 'Connecting...' : 'Connect MetaMask'}</span>
              </button>
              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-transparent transition-all"
                  placeholder="admin@qsc3.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-neon-cyan/90 hover:bg-neon-cyan text-black font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-cyan/20"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-sm text-neon-cyan hover:underline"
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
