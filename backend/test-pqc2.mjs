import { keygen, sign, verify } from './services/dilithium.mjs';

console.log('Testing keygen...');
const { publicKey, secretKey } = keygen();
console.log('publicKey length:', publicKey.length);
console.log('secretKey length:', secretKey.length);

const message = new TextEncoder().encode('hello world');
console.log('Testing sign...');
const sig = sign(secretKey, message);
console.log('signature length:', sig.length);

console.log('Testing verify...');
const ok = verify(publicKey, message, sig);
console.log('verified:', ok);