import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
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
    <AuthProvider>
      <div className="w-full max-w-[100vw] min-h-[100dvh] overflow-hidden bg-dark-bg text-gray-200">
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pqc-signature" element={<ProtectedRoute><PQCSignature /></ProtectedRoute>} />
              <Route path="/ipfs-module" element={<ProtectedRoute><IPFSModule /></ProtectedRoute>} />
              <Route path="/merkle-tree" element={<ProtectedRoute><MerkleTree /></ProtectedRoute>} />
              <Route path="/blockchain" element={<ProtectedRoute><Blockchain /></ProtectedRoute>} />
              <Route path="/iot-monitor" element={<ProtectedRoute><IoTMonitor /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/research-compare" element={<ProtectedRoute><ResearchCompare /></ProtectedRoute>} />
              <Route path="/architecture" element={<ProtectedRoute><Architecture /></ProtectedRoute>} />
              <Route path="/quantum-threat" element={<ProtectedRoute><QuantumThreat /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
