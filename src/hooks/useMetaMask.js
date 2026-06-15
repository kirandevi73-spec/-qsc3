import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

export const useMetaMask = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask not installed!');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);

      window.ethereum.on('accountsChanged', (newAccounts) => {
        setAccount(newAccounts[0] || null);
        setIsConnected(!!newAccounts[0]);
      });

      return accounts[0];
    } catch (error) {
      console.error('MetaMask connect error:', error);
      throw error;
    }
  };

  const signMessage = async (message) => {
    try {
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Sign error:', error);
      throw error;
    }
  };

  // NEW: Sign nonce for auth
  const signNonce = async () => {
    try {
      if (!account) throw new Error('Wallet not connected');
      
      // Get nonce from backend
      const nonceRes = await axios.post('http://localhost:5000/api/auth/metamask/nonce', {
        address: account
      });
      
      const message = `Please sign this nonce to login to QSC3: ${nonceRes.data.nonce}`;
      const signature = await signMessage(message);
      
      return { signature, nonce: nonceRes.data.nonce };
    } catch (error) {
      console.error('Sign nonce error:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
  };

  return { account, isConnected, connect, disconnect, signMessage, signNonce, provider };
};