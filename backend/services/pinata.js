const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor() {
    this.jwt = process.env.PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  async uploadFile(buffer, filename, mimeType) {
    try {
      const formData = new FormData();
      formData.append('file', buffer, { filename: filename, contentType: mimeType });

      const metadata = JSON.stringify({ name: filename });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({ cidVersion: 1 });
      formData.append('pinataOptions', options);

      const response = await axios.post(
        `${this.baseURL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.jwt}`
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      return {
        success: true,
        cid: response.data.IpfsHash,
        id: response.data.IpfsHash,
        name: filename,
        size: response.data.PinSize,
        mimeType: mimeType,
        timestamp: response.data.Timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('=== PINATA ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data');
      console.error('Message:', error.message);
      console.error('===================');

      const errorDetails = error.response?.data
        ? (typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data)
        : error.message;
      throw new Error(`Pinata upload failed: ${errorDetails}`);
    }
  }

  getGatewayUrl(cid) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
}

module.exports = new IPFSService();
