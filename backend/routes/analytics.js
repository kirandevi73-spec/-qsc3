const express = require('express');
const router = express.Router();

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    latency: [
      { name: 'Mon', gen: 3.2, verify: 2.1 },
      { name: 'Tue', gen: 3.5, verify: 2.4 },
      { name: 'Wed', gen: 3.3, verify: 2.2 },
      { name: 'Thu', gen: 3.6, verify: 2.5 },
      { name: 'Fri', gen: 3.4, verify: 2.3 },
      { name: 'Sat', gen: 3.1, verify: 2.0 },
      { name: 'Sun', gen: 3.5, verify: 2.4 },
    ],
    storage: [
      { name: 'Batch 1', raw: 12.5, qsc3: 0.8 },
      { name: 'Batch 2', raw: 25.0, qsc3: 1.2 },
      { name: 'Batch 3', raw: 40.5, qsc3: 0.7 },
      { name: 'Batch 4', raw: 35.2, qsc3: 0.9 },
      { name: 'Batch 5', raw: 55.0, qsc3: 1.5 },
    ],
    gas: [
      { name: 'Jan', trad: 28, qsc3: 8.4 },
      { name: 'Feb', trad: 35, qsc3: 8.4 },
      { name: 'Mar', trad: 42, qsc3: 8.4 },
      { name: 'Apr', trad: 55, qsc3: 12.5 },
      { name: 'May', trad: 68, qsc3: 15.2 },
    ],
    security: [
      { subject: "Shor's Resistance", trad: 20, qsc3: 100 },
      { subject: "Grover's Resistance", trad: 50, qsc3: 95 },
      { subject: 'Side-Channel', trad: 80, qsc3: 85 },
      { subject: 'Storage Efficiency', trad: 95, qsc3: 90 },
      { subject: 'Gas Efficiency', trad: 90, qsc3: 85 },
      { subject: 'Compute Overhead', trad: 95, qsc3: 75 },
    ]
  });
});

module.exports = router;