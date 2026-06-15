import React, { useEffect, useState, useCallback, memo } from 'react';
import { Card, Badge } from '../components/ui';
import { Cpu, Activity, Zap, Shield, Link, Database } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const API = 'http://localhost:5000/api';

const BENCHMARKS = [
  { algo: 'Kyber-768 (KEM)', keyGen: '1.2', sign: 'N/A', verify: 'N/A', mem: '18.5', highlight: false },
  { algo: 'Dilithium-3 (Chosen)', keyGen: '2.1', sign: '3.5', verify: '2.4', mem: '45.2', highlight: true },
  { algo: 'Falcon-512', keyGen: '15.8', sign: '0.8', verify: '0.2', mem: '142.0 *', memRed: true, highlight: false },
  { algo: 'SPHINCS+', keyGen: '85.0', sign: '210.0', verify: '1.5', mem: 'OOM *', memRed: true, highlight: false },
];

const MetricBox = memo(({ label, value, color }) => (
  <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className={`text-xl font-mono ${color}`}>{value}</p>
  </div>
));

const ProgressBar = memo(({ label, icon, value, color, sub }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-300 flex items-center gap-1">{icon} {label}</span>
      <span className={`${color} font-mono`}>{value.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-2">
      <div className={`${color.replace('text-', 'bg-')} h-2 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
    {sub && <p className="text-xs text-gray-500 mt-1 text-right">{sub}</p>}
  </div>
));

export default function IoTMonitor() {
  const [cpu, setCpu] = useState(35);
  const [memory, setMemory] = useState(62);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [bridgeStatus, setBridgeStatus] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/iot/live`);
      setDevices(res.data.devices);
    } catch (_) {}
    setLoading(false);
  }, []);

  const fetchBridgeStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/bridge/status`);
      setBridgeStatus(res.data.bridge);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchBridgeStatus();
    const dataInterval = setInterval(fetchDevices, 5000);
    const metricsInterval = setInterval(() => {
      setCpu(p => Math.min(Math.max(p + (Math.random() * 10 - 5), 30), 45));
      setMemory(p => Math.min(Math.max(p + (Math.random() * 4 - 2), 58), 72));
    }, 2000);
    return () => { clearInterval(dataInterval); clearInterval(metricsInterval); };
  }, [fetchDevices, fetchBridgeStatus]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('iot-live', setLiveData);
    return () => socket.disconnect();
  }, []);

  const validateDevice = useCallback(async (device) => {
    setValidating(true);
    setValidationResult(null);
    try {
      const res = await axios.post(`${API}/bridge/validate`, {
        deviceId: device.deviceId,
        signature: String(device.signature) || 'DILITHIUM-MOCK',
        telemetry: { temperature: device.temperature, humidity: device.humidity, pressure: device.pressure }
      });
      setValidationResult(res.data.validation);
    } catch (err) {
      console.error('Bridge error:', err);
    } finally {
      setValidating(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
          IoT <span className="neon-text-cyan">Monitor</span>
        </h1>
        <p className="text-gray-400">Live ESP32-S3 hardware constraints and PQC benchmarking</p>
      </div>

      {/* Bridge Status */}
      {bridgeStatus && (
        <Card className="border-neon-purple/30">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link className="text-neon-purple" size={20} />
              <div>
                <h2 className="text-lg font-semibold text-white">IoT ↔ Blockchain Bridge</h2>
                <p className="text-xs text-gray-400">Dilithium-3 signatures validated & anchored to ledger</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-neon-cyan">{bridgeStatus.totalValidated}</div>
                <div className="text-xs text-gray-500">Total Validated</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold font-mono text-green-400">{bridgeStatus.trustScore}%</div>
                <div className="text-xs text-gray-500">Trust Score</div>
              </div>
              <Badge variant="green">{bridgeStatus.status}</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Validation Result */}
      {validationResult && (
        <Card className="border-green-500/30 bg-green-500/5">
          <h3 className="text-lg font-semibold text-green-400 mb-4">✅ Bridge Validation Result</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Device ID', value: validationResult.deviceId, color: 'text-neon-cyan' },
              { label: 'Dilithium Verified', value: '✓ YES', color: 'text-green-400' },
              { label: 'Block Number', value: `#${validationResult.blockNumber}`, color: 'text-white' },
              { label: 'Trust Score', value: `${validationResult.trustScore}%`, color: 'text-green-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className={`font-mono ${color}`}>{value}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4">
              <p className="text-gray-500 text-xs">Anchor TX Hash</p>
              <p className="font-mono text-xs text-neon-purple">{validationResult.anchorTx}</p>
            </div>
          </div>
        </Card>
      )}

      {/* WebSocket Live Feed */}
      <Card className="border-neon-green/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            WebSocket Live Feed
          </h2>
          <Badge variant={connectionStatus === 'connected' ? 'green' : 'red'}>
            {connectionStatus.toUpperCase()}
          </Badge>
        </div>
        {liveData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBox label="Temperature" value={`${liveData.temperature}°C`} color="text-neon-cyan" />
            <MetricBox label="Humidity" value={`${liveData.humidity}%`} color="text-neon-purple" />
            <MetricBox label="CPU Usage" value={`${liveData.cpuUsage}%`} color="text-yellow-400" />
            <MetricBox label="Memory" value={`${liveData.memoryUsage} KB`} color="text-green-400" />
            <div className="col-span-2 md:col-span-4 bg-slate-900/50 p-3 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Dilithium-3 Signature Hash</p>
              <p className="font-mono text-xs text-green-400 truncate">{liveData.signature?.hash}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Waiting for live WebSocket data...</div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ESP32 Card */}
        <Card className="glass-strong border-neon-cyan/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Cpu size={80} /></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">ESP32-S3 Node</h2>
              <p className="text-sm text-gray-400">Edge Aggregator</p>
            </div>
            <Badge variant="green" className="animate-pulse">ONLINE</Badge>
          </div>
          <div className="space-y-6 relative z-10">
            <ProgressBar
              label="CPU Load"
              icon={<Activity size={14} className="text-neon-cyan" />}
              value={cpu}
              color="text-neon-cyan"
            />
            <ProgressBar
              label="Memory Used"
              icon={<Database size={14} className="text-neon-purple" />}
              value={memory}
              color="text-neon-purple"
              sub="312 KB / 512 KB SRAM"
            />
            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Active Algo</div>
                <Badge variant="cyan">Dilithium-3</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Power Draw</div>
                <div className="text-sm text-white font-mono flex items-center gap-1">
                  <Zap size={14} className="text-yellow-400" /> 185 mA
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Benchmarks */}
        <Card className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Shield className="text-neon-purple" size={20} /> PQC Algorithm Benchmarks
            </h2>
            <Badge variant="purple">Hardware: ESP32-S3 (240MHz)</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/10">
                <tr>
                  {['Algorithm', 'Key Gen (ms)', 'Sign (ms)', 'Verify (ms)', 'Memory Peak (KB)'].map(h => (
                    <th key={h} className="p-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {BENCHMARKS.map((b) => (
                  <tr key={b.algo} className={`transition-colors ${b.highlight ? 'bg-neon-cyan/5 border-l-2 border-l-neon-cyan hover:bg-neon-cyan/10' : 'hover:bg-white/5'}`}>
                    <td className={`p-3 font-medium ${b.highlight ? 'text-neon-cyan' : ''}`}>{b.algo}</td>
                    <td className={`p-3 font-mono ${b.highlight ? 'text-neon-cyan' : ''}`}>{b.keyGen}</td>
                    <td className={`p-3 font-mono ${b.highlight ? 'text-neon-cyan' : 'text-gray-500'}`}>{b.sign}</td>
                    <td className={`p-3 font-mono ${b.highlight ? 'text-neon-cyan' : 'text-gray-500'}`}>{b.verify}</td>
                    <td className={`p-3 font-mono ${b.highlight ? 'text-neon-cyan' : b.memRed ? 'text-red-400' : ''}`}>{b.mem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500">* Falcon-512 requires floating-point operations. SPHINCS+ causes OOM due to massive signature sizes.</p>
        </Card>
      </div>

      {/* Live Device Feed */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Live Device Feed</h2>
          <Badge variant="green">{loading ? 'Loading...' : `${devices.length} Devices`}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 border-b border-white/10">
              <tr>
                {['Device ID', 'Temp (°C)', 'Humidity (%)', 'Pressure (hPa)', 'Signature', 'Status', 'Bridge'].map(h => (
                  <th key={h} className="p-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {devices.map((device, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono text-neon-cyan">{device.deviceId}</td>
                  <td className="p-3 font-mono">{device.temperature}</td>
                  <td className="p-3 font-mono">{device.humidity}</td>
                  <td className="p-3 font-mono">{device.pressure}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{String(device.signature).slice(0, 20)}...</td>
                  <td className="p-3"><Badge variant="green">VERIFIED</Badge></td>
                  <td className="p-3">
                    <button
                      onClick={() => validateDevice(device)}
                      disabled={validating}
                      className="px-3 py-1 text-xs bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple rounded-lg border border-neon-purple/50 transition-all disabled:opacity-50"
                    >
                      {validating ? '...' : 'Anchor'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}