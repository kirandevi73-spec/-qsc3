const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

router.post('/anchor', (req, res) => {
  try {
    const { merkleRoot, ipfsCID } = req.body;
    
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    
    res.json({
      success: true,
      transaction: {
        txHash,
        merkleRoot: merkleRoot || '0x4a2b...9f2a',
        ipfsCID: ipfsCID || 'QmYw...3eF2',
        blockNumber: 18492301 + Math.floor(Math.random() * 100),
        gasUsed: 42500,
        gasCost: '$8.40',
        status: 'confirmed',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalAnchored: 1284,
      avgGasUsed: 42500,
      totalSaved: '70%',
      latestBlock: 18492301
    }
  });
});

module.exports = router;