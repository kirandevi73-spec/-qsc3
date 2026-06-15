import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

export function keygen() {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const keypair = ml_dsa65.keygen(seed);
  // Explicitly naye Uint8Array banao — koi reference issue na ho
  return {
    publicKey: Uint8Array.from(keypair.publicKey),
    secretKey: Uint8Array.from(keypair.secretKey)
  };
}

export function sign(secretKey, message) {
  return ml_dsa65.sign(Uint8Array.from(secretKey), message);
}

export function verify(publicKey, message, signature) {
  return ml_dsa65.verify(Uint8Array.from(publicKey), message, Uint8Array.from(signature));
}