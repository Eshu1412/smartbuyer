import crypto from 'node:crypto';

/**
 * Hash a password using PBKDF2 HMAC SHA256 with a unique 16-byte hex salt.
 * Compatible with Python's hashlib.pbkdf2_hmac format: `${salt}:${keyHex}`.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(String(password), salt, 100000, 32, 'sha256');
  return `${salt}:${key.toString('hex')}`;
}

/**
 * Verify a plain password against a stored salt:hash string.
 */
export function verifyPassword(password, hashed) {
  try {
    const idx = String(hashed).indexOf(':');
    if (idx === -1) return false;
    const salt = hashed.slice(0, idx);
    const keyHex = hashed.slice(idx + 1);
    const expectedKey = Buffer.from(keyHex, 'hex');
    const calculatedKey = crypto.pbkdf2Sync(String(password), salt, 100000, expectedKey.length, 'sha256');
    if (expectedKey.length !== calculatedKey.length) return false;
    return crypto.timingSafeEqual(expectedKey, calculatedKey);
  } catch {
    return false;
  }
}
