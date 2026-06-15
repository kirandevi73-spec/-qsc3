const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// SHA-256 (classical)
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

// BLAKE2b simulation (using sha512 as approximation)
const blake2b = (data) => crypto.createHash('sha512').update(data).digest('hex');

// Keccak-256 simulation
const keccak256 = (data) => {
  const hash = crypto.createHash('sha3-256').update(data).digest('hex');
  return '0x' + hash;
};

router.post('/compare', (req, res) => {
  try {
    const { data } = req.body;
    const input = data || 'QSC3-Dilithium-Test-Data';

    const results = {
      input,
      sha256: {
        hash: sha256(input),
        bits: 256,
        quantumSecurity: 128,
        groverReduction: '50%',
        recommended: false
      },
      blake2b: {
        hash: blake2b(input),
        bits: 512,
        quantumSecurity: 256,
        groverReduction: '0%',
        recommended: true
      },
      keccak256: {
        hash: keccak256(input),
        bits: 256,
        quantumSecurity: 128,
        groverReduction: '50%',
        recommended: false
      },
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;