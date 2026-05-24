const express = require('express');
const router = express.Router();
const multer = require('multer');
const ipfsService = require('../services/pinata');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// File upload route — accepts both file and JSON
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    try {
      let buffer, filename, mimetype;

      if (req.file) {
        // File upload
        buffer = req.file.buffer;
        filename = req.file.originalname;
        mimetype = req.file.mimetype;
      } else {
        // JSON body upload
        const content = req.body;
        buffer = Buffer.from(JSON.stringify(content));
        filename = `qsc3_upload_${Date.now()}.json`;
        mimetype = 'application/json';
      }

      const result = await ipfsService.uploadFile(buffer, filename, mimetype);

      res.status(200).json({
        success: true,
        cid: result.cid,
        data: {
          cid: result.cid,
          gatewayUrl: ipfsService.getGatewayUrl(result.cid),
          size: result.size,
          originalName: filename,
          mimeType: mimetype,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[IPFS Route] Upload error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const gatewayUrl = ipfsService.getGatewayUrl(cid);
    res.status(200).json({ success: true, data: { cid, gatewayUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;