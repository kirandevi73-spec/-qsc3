const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { Server } = require('socket.io');
const http = require('http');

const ipfsRoutes = require('./routes/ipfs');
const iotRoutes = require('./routes/iot');
const pqcRoutes = require('./routes/pqc');
const merkleRoutes = require('./routes/merkle');
const blockchainRoutes = require('./routes/blockchain');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const bridgeRoutes = require('./routes/bridge');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ files: [], users: [], iotData: [] }).write();
console.log('[Database] Local JSON database connected successfully.');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/pqc', pqcRoutes);
app.use('/api/merkle', merkleRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bridge', bridgeRoutes);

let iotCounter = 0;
setInterval(() => {
  iotCounter++;
  const mockData = {
    deviceId: 'ESP32-S3-001',
    deviceType: 'ESP32-S3',
    temperature: (20 + Math.random() * 15).toFixed(2),
    humidity: (40 + Math.random() * 30).toFixed(2),
    pressure: (1013 + Math.random() * 50).toFixed(2),
    cpuUsage: (Math.random() * 100).toFixed(2),
    memoryUsage: (Math.random() * 520).toFixed(2),
    signature: {
      type: 'Dilithium-3',
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      publicKey: 'pk_' + Math.random().toString(36).substr(2, 32)
    },
    timestamp: new Date().toISOString(),
    status: 'active'
  };

  io.emit('iot-live', mockData);
  if (io.engine.clientsCount > 0) {
    console.log(`[WebSocket] Data #${iotCounter} sent to ${io.engine.clientsCount} clients`);
  }
}, 2000);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongoStatus: 'connected',
    websocketClients: io.engine.clientsCount
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'QSC3 Real-Time Backend',
    version: '2.1',
    features: ['IPFS', 'IoT-WebSocket', 'Auth', 'Real-time'],
    websocketClients: io.engine.clientsCount
  });
});

server.listen(PORT, () => {
  console.log(`[Server] QSC3 Real-Time running on http://localhost:${PORT}`);
  console.log(`[WebSocket] Ready for connections`);
});