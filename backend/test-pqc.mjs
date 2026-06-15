import { ml_dsa65 } from './node_modules/@noble/post-quantum/ml-dsa.js';
const seed = crypto.getRandomValues(new Uint8Array(32));
const result = ml_dsa65.keygen(seed);
console.log('Keys:', Object.keys(result));
console.log('publicKey length:', result.publicKey?.length);
console.log('secretKey length:', result.secretKey?.length);
console.log('secretKey type:', result.secretKey?.constructor?.name);