import crypto from 'crypto';

/**
 * MANDATORY SESSION_SECRET ENFORCEMENT
 * Application strictly fails closed if SESSION_SECRET environment variable is missing.
 * No hardcoded keys, no ephemeral keys, and no per-process fallbacks.
 */
function getRequiredSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      '[FATAL SECURITY ERROR] Mandatory environment variable SESSION_SECRET is missing. ' +
      'Application is configured to fail closed. Refusing to start, sign, or verify sessions.'
    );
  }
  return secret.trim();
}

// Enforce immediate startup failure if SESSION_SECRET is missing
if (process.env.NODE_ENV === 'production') {
  getRequiredSecret();
}

const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Format: base64url(payload).hex(hmac_sha256)
 * @param {Object} user - User object with id, role, email
 * @returns {string} Signed session token
 */
export function createSessionToken(user) {
  const secret = getRequiredSecret();
  const payload = {
    id: user.id,
    role: user.role || 'CUSTOMER',
    email: user.email,
    exp: Date.now() + SESSION_EXPIRY_MS
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('hex');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed HMAC-SHA256 session token.
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
    const secret = getRequiredSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
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
  } catch (err) {
    if (err.message && err.message.includes('Mandatory environment variable SESSION_SECRET')) {
      throw err;
    }
    return null;
  }
}
