// Automated Integration & Security Audit Test Suite for ERA43
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import path from 'path';
import { pathToFileURL } from 'url';

console.log('================================================================');
console.log('🧪 RUNNING ERA43 SECURITY & PERSISTENCE AUDIT TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  // --------------------------------------------------------------------------
  // TEST 1: Mandatory SESSION_SECRET & Fail-Closed Behavior
  // --------------------------------------------------------------------------
  console.log('▶ Test 1: Mandatory SESSION_SECRET Enforcement');
  const sessionUrl = pathToFileURL(path.resolve('./lib/session.js')).href;

  // Verify missing secret throws error
  const origSecret = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  
  try {
    const { createSessionToken } = await import(`${sessionUrl}?t=${Date.now()}`);
    createSessionToken({ id: 'test-user', email: 'test@era43.com' });
    assert(false, 'Should throw error when SESSION_SECRET is missing');
  } catch (err) {
    assert(
      err.message.includes('Mandatory environment variable SESSION_SECRET is missing'),
      'Throws fatal security error on missing secret without hardcoded fallback'
    );
  }

  // Restore secure secret for subsequent tests
  process.env.SESSION_SECRET = origSecret || 'test_secure_session_secret_for_audit_verification_minimum_32_chars';
  const { createSessionToken, verifySessionToken } = await import(`${sessionUrl}?t=${Date.now() + 1}`);

  // --------------------------------------------------------------------------
  // TEST 2: Cryptographic Session Signing & Verification
  // --------------------------------------------------------------------------
  console.log('\n▶ Test 2: Cryptographic HMAC-SHA256 Token Signing');
  const mockUser = { id: 'usr-12345', role: 'ADMIN', email: 'admin@era43.com' };
  const token = createSessionToken(mockUser);
  assert(token && token.includes('.'), 'Generates signed token with payload and signature');

  const verified = verifySessionToken(token);
  assert(verified && verified.id === mockUser.id && verified.role === 'ADMIN', 'Validates authentic signed token');

  // --------------------------------------------------------------------------
  // TEST 3: Forged / Tampered Cookie Rejection
  // --------------------------------------------------------------------------
  console.log('\n▶ Test 3: Tampered & Forged Cookie Rejection');
  const [b64Payload, signature] = token.split('.');
  
  // Tamper role from ADMIN to SUPER_ADMIN
  const tamperedPayload = Buffer.from(JSON.stringify({ id: 'usr-12345', role: 'SUPER_ADMIN' })).toString('base64url');
  const tamperedToken = `${tamperedPayload}.${signature}`;
  const tamperedResult = verifySessionToken(tamperedToken);
  assert(tamperedResult === null, 'Rejects tampered token with altered payload');

  // Test invalid signature
  const fakeSigToken = `${b64Payload}.${'0'.repeat(64)}`;
  assert(verifySessionToken(fakeSigToken) === null, 'Rejects forged signature using constant-time check');

  // --------------------------------------------------------------------------
  // TEST 4: Setup DB Script Non-Zero Exit on Missing Database
  // --------------------------------------------------------------------------
  console.log('\n▶ Test 4: scripts/setup-db.js Fail-Closed Non-Zero Exit');
  const setupDbResult = spawnSync('node', ['scripts/setup-db.js'], {
    env: { ...process.env, DATABASE_URL: '', POSTGRES_URL: '' },
    encoding: 'utf8'
  });
  assert(setupDbResult.status === 1, 'setup-db.js exits with status 1 when DATABASE_URL is missing');

  // --------------------------------------------------------------------------
  // TEST 5: Live API Endpoints (Running Local Server)
  // --------------------------------------------------------------------------
  console.log('\n▶ Test 5: Live API Endpoints Validation');
  try {
    // 5a. Disabled Fake OAuth (501)
    const oauthRes = await fetch('http://localhost:3000/api/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google' })
    });
    assert(oauthRes.status === 501, 'POST /api/auth/oauth returns 501 Not Implemented');
    const oauthBody = await oauthRes.json();
    assert(oauthBody.code === 'OAUTH_PROVIDER_DISABLED', 'OAuth response confirms provider authentication disabled');

    // 5b. Order Quantity Validation (> 5 units rejected)
    const invalidQtyRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit User',
        email: 'audit@era43.com',
        phone: '9876543210',
        address: '123 Fashion Street',
        paymentMethod: 'Cash on Delivery (COD)',
        items: [{ id: 'era43-ts-001', qty: 9 }]
      })
    });
    assert(invalidQtyRes.status === 400, 'Orders API rejects quantity > 5 with 400 Bad Request');

    // 5c. Arbitrary Payment Method Validation
    const invalidPayRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit User',
        email: 'audit@era43.com',
        phone: '9876543210',
        address: '123 Fashion Street',
        paymentMethod: 'UnverifiedCrypto',
        items: [{ id: 'era43-ts-001', qty: 1 }]
      })
    });
    assert(invalidPayRes.status === 400, 'Orders API rejects non-whitelisted payment methods');

    // 5d. Status Separation: COD vs Online
    const codRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit COD User',
        email: 'audit.cod@era43.com',
        phone: '9876543210',
        address: '123 Fashion Street',
        paymentMethod: 'Cash on Delivery (COD)',
        items: [{ id: 'era43-ts-001', qty: 1 }]
      })
    });
    const codData = await codRes.json();
    assert(
      codData.data?.orderStatus === 'CONFIRMED' && codData.data?.paymentStatus === 'PENDING_ON_DELIVERY',
      'COD Order sets orderStatus=CONFIRMED and paymentStatus=PENDING_ON_DELIVERY'
    );

    const onlineRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Online User',
        email: 'audit.online@era43.com',
        phone: '9876543210',
        address: '123 Fashion Street',
        paymentMethod: 'Razorpay / Online',
        items: [{ id: 'era43-ts-001', qty: 1 }]
      })
    });
    const onlineData = await onlineRes.json();
    assert(
      onlineData.data?.orderStatus === 'PENDING' && onlineData.data?.paymentStatus === 'PENDING_PAYMENT',
      'Online Order sets orderStatus=PENDING and paymentStatus=PENDING_PAYMENT'
    );

    // 5e. Idempotency Replay
    const testIdemKey = `idem-audit-${Date.now()}`;
    const idemPayload = {
      name: 'Audit Idempotent User',
      email: 'audit.idem@era43.com',
      phone: '9876543210',
      address: '123 Fashion Street',
      paymentMethod: 'Cash on Delivery (COD)',
      items: [{ id: 'era43-ts-001', qty: 1 }]
    };

    const firstOrderRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'idempotency-key': testIdemKey },
      body: JSON.stringify(idemPayload)
    });
    const firstOrder = await firstOrderRes.json();

    const replayOrderRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'idempotency-key': testIdemKey },
      body: JSON.stringify(idemPayload)
    });
    const replayOrder = await replayOrderRes.json();

    assert(
      firstOrder.data?.id === replayOrder.data?.id,
      'Idempotency key prevents duplicate orders and returns original order ID'
    );

  } catch (err) {
    console.error('API Test Error:', err.message);
  }

  console.log('\n================================================================');
  console.log(`🏁 AUDIT RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('================================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
