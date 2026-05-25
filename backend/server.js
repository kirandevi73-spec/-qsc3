const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const ipfsRoutes = require('./routes/ipfs');
const iotRoutes = require('./routes/iot');
const pqcRoutes = require('./routes/pqc');
const merkleRoutes = require('./routes/merkle');
const blockchainRoutes = require('./routes/blockchain');
const analyticsRoutes = require('./routes/analytics');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ files: [], users: [], iotData: [] }).write();
console.log('[Database] Local JSON database connected successfully.');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

app.use('/api/ipfs', ipfsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/pqc', pqcRoutes);
app.use('/api/merkle', merkleRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongoStatus: 'connected'
  });
});

app.listen(PORT, () => {
  console.log(`[Server] running on http://localhost:${PORT}`);
});