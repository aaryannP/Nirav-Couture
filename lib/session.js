import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'era43_super_secret_hmac_key_9823491_production_ready';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Creates a cryptographically signed session token.
 * Format: base64url(payload).hex(hmac_sha256)
 * @param {Object} user - User object with id, role, email
 * @returns {string} Signed session token
 */
export function createSessionToken(user) {
  const payload = {
    id: user.id,
    role: user.role || 'CUSTOMER',
    email: user.email,
    exp: Date.now() + SESSION_EXPIRY_MS
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('hex');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Uses timingSafeEqual to prevent timing attacks.
 * @param {string} token - Signed session token
 * @returns {Object|null} Decoded payload or null if invalid/expired
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
