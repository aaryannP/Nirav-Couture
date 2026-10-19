// End-to-End Automated Validation of 2-Step OTP, Admin Security Key & 48h/24h Lockout
import { findUserByEmail, updateUser } from '../lib/db.js';
import { getAdminSecurityKey } from '../lib/email.js';

async function runSecurityTests() {
  console.log('================================================================');
  console.log('🛡️ TESTING ERA43 2-STEP OTP & AUTOMATED LOCKOUT DEFENSE');
  console.log('================================================================\n');

  const testEmail = `sec_test_${Date.now()}@era43.com`;

  // Test 1: Admin Security Key Formula
  console.log('▶ Test 1: Admin Dynamic Security Key Formula Verification');
  const adminKey = getAdminSecurityKey('admin@era43.com', '9876543210');
  if (adminKey === 'admi@3210') {
    console.log('  ✅ PASS: Admin security key matches formula (admi@3210)');
  } else {
    throw new Error(`Formula mismatch: got ${adminKey}`);
  }

  // Test 2: Request Registration OTP
  console.log('\n▶ Test 2: Request Registration 6-Digit OTP');
  const sendRes = await fetch('http://localhost:3000/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'send',
      email: testEmail,
      name: 'Security Test Customer',
      password: 'Password@123',
      phone: '9123456780',
      purpose: 'REGISTER'
    })
  });
  const sendData = await sendRes.json();
  if (sendData.success && sendData.devOtp) {
    console.log(`  ✅ PASS: 6-digit OTP dispatched successfully: ${sendData.devOtp}`);
  } else {
    throw new Error(`Failed to send OTP: ${JSON.stringify(sendData)}`);
  }

  // Test 3: Failed Attempt 1
  console.log('\n▶ Test 3: Incorrect OTP Entry - Attempt 1 of 3');
  const fail1Res = await fetch('http://localhost:3000/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', email: testEmail, otp: '000000', purpose: 'REGISTER' })
  });
  const fail1Data = await fail1Res.json();
  if (fail1Data.attemptsRemaining === 2) {
    console.log('  ✅ PASS: Attempt 1 rejected. Exactly 2 attempts remaining.');
  } else {
    throw new Error(`Attempt 1 failed: ${JSON.stringify(fail1Data)}`);
  }

  // Test 4: Failed Attempt 2
  console.log('\n▶ Test 4: Incorrect OTP Entry - Attempt 2 of 3');
  const fail2Res = await fetch('http://localhost:3000/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', email: testEmail, otp: '111111', purpose: 'REGISTER' })
  });
  const fail2Data = await fail2Res.json();
  if (fail2Data.attemptsRemaining === 1) {
    console.log('  ✅ PASS: Attempt 2 rejected. Exactly 1 attempt remaining.');
  } else {
    throw new Error(`Attempt 2 failed: ${JSON.stringify(fail2Data)}`);
  }

  // Test 5: Failed Attempt 3 - Hard 48-Hour Lockout Engagement
  console.log('\n▶ Test 5: Incorrect OTP Entry - Attempt 3 of 3 (Hard 48-Hour Lockout)');
  const fail3Res = await fetch('http://localhost:3000/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', email: testEmail, otp: '222222', purpose: 'REGISTER' })
  });
  const fail3Data = await fail3Res.json();
  if (fail3Data.locked && fail3Data.lockHours === 48) {
    console.log('  ✅ PASS: Attempt 3 triggered HARD 48-HOUR LOCKOUT!');
    console.log(`  ✅ PASS: Locked Until: ${fail3Data.lockedUntil}`);
  } else {
    throw new Error(`Attempt 3 lockout failed: ${JSON.stringify(fail3Data)}`);
  }

  // Test 6: Verify Locked User is Blocked from Further Actions
  console.log('\n▶ Test 6: Verify Blocked Email Rejection on Subsequent Requests');
  const blockedRes = await fetch('http://localhost:3000/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send', email: testEmail, purpose: 'REGISTER' })
  });
  const blockedData = await blockedRes.json();
  if (blockedRes.status === 423 && blockedData.locked) {
    console.log('  ✅ PASS: HTTP 423 Locked returned. Email is completely frozen.');
  } else {
    throw new Error(`Should be blocked with 423: ${JSON.stringify(blockedData)}`);
  }

  // Clean up test user
  await updateUser(testEmail, { lockedUntil: null, otpAttempts: 0 });

  console.log('\n================================================================');
  console.log('🎉 ALL 6 THREAT DEFENSE & SECURITY LOCKOUT TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runSecurityTests().catch(err => {
  console.error('Security test failed:', err);
  process.exit(1);
});
