const { v4: uuidv4 } = require('uuid');

const generateIoTData = () => {
  return {
    deviceId: `ESP32-${uuidv4().slice(0,8).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    temperature: (20 + Math.random() * 15).toFixed(2),
    humidity: (40 + Math.random() * 40).toFixed(2),
    pressure: (1000 + Math.random() * 50).toFixed(2),
    signature: `DILITHIUM-${uuidv4().replace(/-/g,'').toUpperCase()}`,
    verified: true,
    location: 'Warehouse-A'
  };
};

module.exports = { generateIoTData };