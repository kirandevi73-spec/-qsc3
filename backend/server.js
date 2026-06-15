const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const ipfsRoutes = require('./routes/ipfs');
const iotRoutes = require('./routes/iot');
const pqcRoutes = require('./routes/pqc');
const merkleRoutes = require('./routes/merkle');
const blockchainRoutes = require('./routes/blockchain');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const bridgeRoutes = require('./routes/bridge');
const hashRoutes = require('./routes/hash');
const walletRoutes = require('./routes/wallet');
const trustflowRoutes = require('./routes/trustflow');
const securityRoutes = require('./routes/security.js');
const { initHSM, hsmEvents } = require('./services/hsm.js');

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

// Security & Performance
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests, try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts.' }
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/pqc', pqcRoutes);
app.use('/api/merkle', merkleRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bridge', bridgeRoutes);
app.use('/api/hash', hashRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trustflow', trustflowRoutes);

// IoT Live WebSocket
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
}, 2000);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime().toFixed(2) + 's',
    websocketClients: io.engine.clientsCount,
    memoryUsage: process.memoryUsage().heapUsed
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'QSC3 Real-Time Backend',
    version: '2.1',
    features: ['IPFS', 'IoT-WebSocket', 'Auth', 'Real-time', 'PQC'],
    websocketClients: io.engine.clientsCount
  });
});

app.use('/api/security', securityRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

server.listen(PORT, () => {
  console.log(`[Server] QSC3 running on http://localhost:${PORT}`);
  hsmEvents.on('keyGenerated', e => console.log('[HSM] Key generated:', e.label, e.algo));
  hsmEvents.on('signed',       e => console.log('[HSM] Signed with:', e.label));
  hsmEvents.on('error',        e => console.error('[HSM] Error:', e));
  initHSM()
    .then(r  => console.log(`[HSM] Init OK — mode: ${r.mode}`))
    .catch(e => console.error('[HSM] Init failed:', e.message));
  console.log(`[WebSocket] Ready for connections`);
});