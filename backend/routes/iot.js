const express = require('express');
const router = express.Router();
const { generateIoTData } = require('../services/iotMock');

// Get live IoT data
router.get('/live', (req, res) => {
    const data = Array.from({ length: 5 }, () => generateIoTData());
    res.json({ success: true, devices: data });
});

// Get single device data
router.get('/device/:id', (req, res) => {
    const data = generateIoTData();
    data.deviceId = req.params.id;
    res.json({ success: true, device: data });
});

module.exports = router;