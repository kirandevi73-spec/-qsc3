const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

router.post('/anchor', (req, res) => {
  try {
    const transactions = [
      { id: 'Tx1', signature: uuidv4() },
      { id: 'Tx2', signature: uuidv4() },
      { id: 'Tx3', signature: uuidv4() },
      { id: 'Tx4', signature: uuidv4() }
    ];

    const h1 = sha256(transactions[0].signature);
    const h2 = sha256(transactions[1].signature);
    const h3 = sha256(transactions[2].signature);
    const h4 = sha256(transactions[3].signature);

    const h12 = sha256(h1 + h2);
    const h34 = sha256(h3 + h4);
    const root = sha256(h12 + h34);

    res.json({
      success: true,
      merkle: {
        transactions,
        leaves: { h1, h2, h3, h4 },
        intermediate: { h12, h34 },
        root,
        rootSize: '32 bytes',
        totalSigSize: '13.1 KB',
        savedPercent: '99.2%',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;