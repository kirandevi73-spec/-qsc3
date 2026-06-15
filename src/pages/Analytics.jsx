import React, { useState, useEffect, memo, useCallback } from 'react';
import { Card, Badge } from '../components/ui';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const CustomTooltip = memo(({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0f1e] border border-white/10 p-3 rounded-lg shadow-xl shadow-black">
      <p className="text-gray-300 font-medium mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="text-white font-mono">{entry.value}</span>
        </div>
      ))}
    </div>
  );
});

const chartMargin = { top: 10, right: 10, left: -20, bottom: 0 };
const gridProps = { strokeDasharray: '3 3', stroke: '#ffffff10', vertical: false };
const axisProps = { stroke: '#64748b', fontSize: 12, tickLine: false, axisLine: false };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/analytics/stats`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono tracking-tight text-white mb-2">
          System <span className="neon-text-cyan">Analytics</span>
        </h1>
        <p className="text-gray-400">Performance, scaling, and security metrics visualization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Latency */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Dilithium-3 Latency (ms)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.latency} margin={chartMargin}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="gen" name="Gen/Sign Time" fill="#bc13fe" radius={[4,4,0,0]} barSize={12} />
                <Bar dataKey="verify" name="Verify Time" fill="#00f3ff" radius={[4,4,0,0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Radar */}
        <Card className="glass-strong">
          <h2 className="text-lg font-semibold text-white mb-4">Security & Efficiency Matrix</h2>
          <div className="h-72 w-full relative -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data?.security}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Radar name="Traditional (ECDSA)" dataKey="trad" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
                <Radar name="QSC3 (Dilithium + IPFS)" dataKey="qsc3" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.4} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Storage */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Storage Requirements (MB)</h2>
            <Badge variant="cyan">94% Savings</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.storage} margin={chartMargin}>
                <defs>
                  <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQsc3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="raw" name="Raw PQC Storage" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRaw)" />
                <Area type="monotone" dataKey="qsc3" name="QSC3 (Merkle+IPFS)" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorQsc3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gas */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Gas Consumption Cost (USD)</h2>
            <Badge variant="purple">70% Savings</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.gas} margin={chartMargin}>
                <defs>
                  <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQsc3Gas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="trad" name="Traditional (Raw PQC)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTrad)" />
                <Area type="monotone" dataKey="qsc3" name="QSC3 (Hash Only)" stroke="#bc13fe" strokeWidth={2} fillOpacity={1} fill="url(#colorQsc3Gas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}