import crypto from 'crypto';

// If SESSION_SECRET environment variable is missing, generate a cryptographically
// secure ephemeral random key in memory to prevent offline token forgery.
let resolvedSecret = process.env.SESSION_SECRET;
if (!resolvedSecret) {
  resolvedSecret = crypto.randomBytes(64).toString('hex');
  if (process.env.NODE_ENV === 'production') {
    console.warn('[SECURITY] Warning: SESSION_SECRET is not set in environment variables. An ephemeral in-memory secret has been generated.');
  }
}
const SESSION_SECRET = resolvedSecret;
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
