const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file in the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const ipfsService = require('./services/pinata');

async function runTest() {
  console.log('==================================================');
  console.log('  QSC3 Backend IPFS Pinata API Integration Test   ');
  console.log('==================================================');

  if (!process.env.PINATA_JWT) {
    console.error('ERROR: PINATA_JWT is not defined in the environment or .env file!');
    process.exit(1);
  }
  console.log('PINATA_JWT loaded: YES (starts with', process.env.PINATA_JWT.substring(0, 20) + '...)');

  // Use a unique file content to verify a new upload
  const timestamp = new Date().toISOString();
  const testContent = `QSC3 Quantum-Safe Cryptography System - IPFS Storage Test\nTimestamp: ${timestamp}\nVerify: SUCCESS`;
  const fileBuffer = Buffer.from(testContent);
  const fileName = `qsc3_test_upload_${Date.now()}.txt`;
  const mimeType = 'text/plain';

  console.log(`\nPrepared test file: "${fileName}"`);
  console.log(`File size: ${fileBuffer.length} bytes`);
  console.log('Initiating upload to Pinata IPFS...\n');

  try {
    const result = await ipfsService.uploadFile(fileBuffer, fileName, mimeType);

    console.log('[SUCCESS] Upload Completed!');
    console.log('--------------------------------------------------');
    console.log('Upload Result Metadata:');
    console.log(JSON.stringify(result, null, 2));

    const gatewayUrl = ipfsService.getGatewayUrl(result.cid);
    console.log('--------------------------------------------------');
    console.log(`Public Gateway URL:\n${gatewayUrl}`);
    console.log('==================================================');
  } catch (error) {
    console.error('[FAILURE] Upload Failed!');
    console.error('--------------------------------------------------');
    console.error(error.message);
    console.error('==================================================');
    process.exit(1);
  }
}

runTest();
