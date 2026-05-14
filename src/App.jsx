import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PQCSignature from './pages/PQCSignature';
import IPFSModule from './pages/IPFSModule';
import MerkleTree from './pages/MerkleTree';
import Blockchain from './pages/Blockchain';
import IoTMonitor from './pages/IoTMonitor';
import Analytics from './pages/Analytics';
import ResearchCompare from './pages/ResearchCompare';
import Architecture from './pages/Architecture';
import QuantumThreat from './pages/QuantumThreat';

function App() {
  return (
    <div className="w-full max-w-[100vw] min-h-[100dvh] overflow-hidden bg-dark-bg text-gray-200">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pqc-signature" element={<PQCSignature />} />
            <Route path="/ipfs-module" element={<IPFSModule />} />
            <Route path="/merkle-tree" element={<MerkleTree />} />
            <Route path="/blockchain" element={<Blockchain />} />
            <Route path="/iot-monitor" element={<IoTMonitor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/research-compare" element={<ResearchCompare />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/quantum-threat" element={<QuantumThreat />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
