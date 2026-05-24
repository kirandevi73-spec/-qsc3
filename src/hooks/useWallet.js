import { useState } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      setConnected(true);
    } else {
      alert('MetaMask not found!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setConnected(false);
  };

  return { account, connected, connectWallet, disconnectWallet };
};