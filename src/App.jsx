import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Lazy load all pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PQCSignature = lazy(() => import('./pages/PQCSignature'));
const IPFSModule = lazy(() => import('./pages/IPFSModule'));
const MerkleTree = lazy(() => import('./pages/MerkleTree'));
const Blockchain = lazy(() => import('./pages/Blockchain'));
const IoTMonitor = lazy(() => import('./pages/IoTMonitor'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ResearchCompare = lazy(() => import('./pages/ResearchCompare'));
const Architecture = lazy(() => import('./pages/Architecture'));
const QuantumThreat = lazy(() => import('./pages/QuantumThreat'));
const SecurityHardening = lazy(() => import('./pages/SecurityHardening'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontSize: '16px'
  }}>
    QSC3 Loading...
  </div>
);

function App() {
  return (
    <AuthProvider>
      <div className="w-full max-w-[100vw] min-h-[100dvh] overflow-hidden bg-dark-bg text-gray-200">
        <Router>
          <Layout>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/security" element={<SecurityHardening />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;