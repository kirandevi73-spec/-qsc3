const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const keyStore = {};

function toHex(bytes) {
  return '0x' + Buffer.from(bytes).toString('hex');
}

let dilithium = null;
async function getDilithium() {
  if (!dilithium) {
    dilithium = await import('../services/dilithium.mjs');
  }
  return dilithium;
}

router.post('/sign', async (req, res) => {
  try {
    const { filename, size } = req.body;
    const d = await getDilithium();

    // 1. Keygen
    const t0 = performance.now();
    const { publicKey, secretKey } = d.keygen();
    const keyGenTime = (performance.now() - t0).toFixed(2);

    // 2. Message
    const message = new TextEncoder().encode(
      JSON.stringify({ filename, size, timestamp: new Date().toISOString() })
    );

    // 3. Sign
    const t1 = performance.now();
    const signature = d.sign(secretKey, message);
    const signTime = (performance.now() - t1).toFixed(2);

    // 4. Verify
    const t2 = performance.now();
    const verified = d.verify(publicKey, message, signature);
    const verifyTime = (performance.now() - t2).toFixed(2);

    // 5. Store
    const sigId = uuidv4();
    keyStore[sigId] = { publicKey, message, signature };

    res.json({
      success: true,
      signature: {
        id: sigId,
        filename: filename || 'iot_sensor_data.json',
        size: size || '124 KB',
        algorithm: 'Dilithium-3 (ML-DSA-65)',
        standard: 'NIST FIPS 204',
        signatureHex: toHex(signature).substring(0, 130) + '...[' + signature.length + ' bytes total]',
        signatureHexFull: toHex(signature),
        signatureSize: `${signature.length.toLocaleString()} bytes`,
        publicKeyHex: toHex(publicKey),
        publicKeySize: `${publicKey.length.toLocaleString()} bytes`,
        keyGenTime: `${keyGenTime} ms`,
        signTime: `${signTime} ms`,
        verifyTime: `${verifyTime} ms`,
        securityLevel: 'NIST Level 3 (equivalent to AES-192)',
        quantumSafe: true,
        verified,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[PQC] Sign error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { signatureId } = req.body;
    const d = await getDilithium();

    if (signatureId && keyStore[signatureId]) {
      const { publicKey, message, signature } = keyStore[signatureId];
      const t = performance.now();
      const verified = d.verify(publicKey, message, signature);
      const verifyTime = (performance.now() - t).toFixed(2);

      return res.json({
        success: true,
        verified,
        algorithm: 'Dilithium-3 (ML-DSA-65)',
        verifyTime: `${verifyTime} ms`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(400).json({ success: false, error: 'Invalid signature ID' });

  } catch (error) {
    console.error('[PQC] Verify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/info', (req, res) => {
  res.json({
    algorithm: 'ML-DSA-65 (Dilithium-3)',
    standard: 'NIST FIPS 204',
    library: '@noble/post-quantum',
    securityLevel: 'NIST Level 3',
    publicKeySize: '1,952 bytes',
    secretKeySize: '4,032 bytes',
    signatureSize: '3,309 bytes',
    quantumSafe: true
  });
});

module.exports = router;