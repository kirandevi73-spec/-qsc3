const express = require('express');
const router = express.Router();
const multer = require('multer');
const ipfsService = require('../services/pinata');
const File = require('../models/File');

// Configure multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size (Pinata direct API limit for files)
  }
});

// File upload route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      console.warn('[IPFS Route] Upload attempt failed: No file provided.');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log(`[IPFS Route] Uploading file to IPFS: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

    // Call service to upload to Pinata v3
    const result = await ipfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Try to save record in MongoDB (optional - won't block upload if DB is down)
    let savedAt = new Date().toISOString();
    try {
      const fileRecord = new File({
        filename: result.name || req.file.originalname,
        cid: result.cid,
        size: result.size || req.file.size,
        mimeType: result.mimeType || req.file.mimetype
      });
      await fileRecord.save();
      savedAt = fileRecord.uploadedAt;
      console.log(`[IPFS Route] Successfully uploaded and saved to DB. CID: ${result.cid}`);
    } catch (dbError) {
      console.warn(`[IPFS Route] Uploaded to IPFS but MongoDB save failed: ${dbError.message}`);
    }

    // Return detailed and clean metadata response
    res.status(200).json({
      success: true,
      data: {
        id: result.id,
        cid: result.cid,
        gatewayUrl: ipfsService.getGatewayUrl(result.cid),
        size: result.size || req.file.size,
        originalName: result.name || req.file.originalname,
        mimeType: result.mimeType || req.file.mimetype,
        uploadedAt: savedAt
      }
    });
  } catch (error) {
    console.error('[IPFS Route] Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error during IPFS upload'
    });
  }
});

// GET file details by CID
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    // Check if file exists in our MongoDB database
    const fileRecord = await File.findOne({ cid });
    const gatewayUrl = ipfsService.getGatewayUrl(cid);

    res.status(200).json({
      success: true,
      data: {
        cid,
        gatewayUrl,
        filename: fileRecord ? fileRecord.filename : null,
        size: fileRecord ? fileRecord.size : null,
        mimeType: fileRecord ? fileRecord.mimeType : null,
        uploadedAt: fileRecord ? fileRecord.uploadedAt : null,
        recorded: !!fileRecord
      }
    });
  } catch (error) {
    console.error('[IPFS Route] Get CID error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error retrieving file metadata'
    });
  }
});

module.exports = router;
 
