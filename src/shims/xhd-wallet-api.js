// Browser compatibility shim for @algorandfoundation/algokit-utils.
// BharatSahay uses Pera Wallet for signing and does not use Algokit HD-wallet
// generation in the browser. The real XHD package depends on Node's crypto.

export const BIP32DerivationType = Object.freeze({
  Peikert: 0,
  SLIP10: 1,
});

export const KeyContext = Object.freeze({
  Address: 0,
  Key: 1,
});

export function harden(value) {
  return (Number(value) >>> 0) | 0x80000000;
}

export function fromSeed(seed) {
  if (seed instanceof Uint8Array) return seed.slice();
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(seed)) return new Uint8Array(seed);
  return new Uint8Array(seed || []);
}

export class XHDWalletAPI {
  constructor() {}

  async keyGen() {
    throw new Error('HD wallet generation is not available in the browser build. Use Pera Wallet.');
  }

  async signAlgoTransaction() {
    throw new Error('HD wallet signing is not available in the browser build. Use Pera Wallet.');
  }

  async deriveKey() {
    throw new Error('HD wallet derivation is not available in the browser build. Use Pera Wallet.');
  }
}
