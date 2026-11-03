/**
 * Small Web Crypto helpers used by the local (demo) auth adapter.
 *
 * This is *not* a replacement for server-side authentication. It exists so the
 * demo adapter never stores a plaintext password. Production deployments must
 * use Supabase Auth (or another server) where credentials never reach the
 * browser.
 */

const DEFAULT_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function getWebCrypto() {
  const webCrypto = globalThis.crypto;
  if (!webCrypto?.subtle || typeof webCrypto.getRandomValues !== 'function') {
    throw new Error('Web Crypto is unavailable. A secure context (HTTPS or localhost) is required.');
  }
  return webCrypto;
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  const normalized = String(hex ?? '');
  if (normalized.length % 2 !== 0) return new Uint8Array();
  const bytes = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

export function createSalt() {
  const webCrypto = getWebCrypto();
  const salt = new Uint8Array(SALT_BYTES);
  webCrypto.getRandomValues(salt);
  return toHex(salt);
}

/**
 * Derive a PBKDF2-SHA256 password hash.
 * @param {string} password
 * @param {string} saltHex
 * @param {number} iterations
 */
export async function hashPassword(password, saltHex, iterations = DEFAULT_ITERATIONS) {
  const webCrypto = getWebCrypto();
  const encoder = new TextEncoder();
  const key = await webCrypto.subtle.importKey(
    'raw',
    encoder.encode(String(password)),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await webCrypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex),
      iterations: Math.max(1000, Number(iterations) || DEFAULT_ITERATIONS),
      hash: 'SHA-256',
    },
    key,
    KEY_BITS
  );

  return toHex(new Uint8Array(bits));
}

/**
 * Compare two hex digests without early exit. Length differences are not
 * secret (hashes are fixed length) but are handled safely anyway.
 */
export function constantTimeEqual(left, right) {
  const a = String(left ?? '');
  const b = String(right ?? '');
  const length = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;

  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export { DEFAULT_ITERATIONS };
