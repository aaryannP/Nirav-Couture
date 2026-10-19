import { NextResponse } from 'next/server';
import { findUserByEmail, updateUser, createUser } from '../../../../lib/db';
import { generateOtp, sendOtpEmail, sendSuspiciousActivityAlert } from '../../../../lib/email';
import { createSessionToken } from '../../../../lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, email, name, phone, password, otp, purpose = 'REGISTER' } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await findUserByEmail(cleanEmail);

    // -------------------------------------------------------------------------
    // Check if account is currently locked
    // -------------------------------------------------------------------------
    if (user?.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingSec = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
      return NextResponse.json({
        success: false,
        locked: true,
        lockedUntil: user.lockedUntil,
        remainingSeconds: remainingSec,
        error: `Security Lockout Active: Account locked due to multiple failed attempts. Please wait until countdown completes.`
      }, { status: 423 });
    }

    // -------------------------------------------------------------------------
    // ACTION 1: SEND OTP
    // -------------------------------------------------------------------------
    if (action === 'send') {
      const isRegister = purpose === 'REGISTER';

      // For registration: if verified user already exists, prevent duplicate
      if (isRegister && user && user.isVerified) {
        return NextResponse.json({
          success: false,
          error: 'An active verified account with this email already exists. Please login.'
        }, { status: 400 });
      }

      // For forgot password: user must exist
      if (!isRegister && !user) {
        return NextResponse.json({
          success: false,
          error: 'No account found with this email address.'
        }, { status: 404 });
      }

      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      if (user) {
        // Reset attempts on new OTP request
        await updateUser(cleanEmail, {
          otpCode,
          otpExpiresAt: expiresAt,
          otpAttempts: 0
        });
      } else if (isRegister) {
        // Pre-create pending user record with isVerified: false
        const passwordHash = password ? await bcrypt.hash(password, 10) : '';
        user = await createUser({
          id: `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          name: name ? name.trim() : 'Customer',
          email: cleanEmail,
          passwordHash,
          role: 'CUSTOMER',
          phone: phone ? phone.trim() : '',
          isVerified: false,
          otpCode,
          otpExpiresAt: expiresAt,
          otpAttempts: 0,
          loginAttempts: 0
        });
      }

      // Dispatch Email via SMTP (or dev console fallback)
      const emailResult = await sendOtpEmail({
        to: cleanEmail,
        name: user?.name || name || 'Customer',
        otp: otpCode,
        purpose
      });

      return NextResponse.json({
        success: true,
        message: `6-digit verification code sent to ${cleanEmail}`,
        devMode: emailResult.devMode,
        devOtp: emailResult.otp // visible in dev mode for seamless testing
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: VERIFY OTP
    // -------------------------------------------------------------------------
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ success: false, error: 'OTP code is required.' }, { status: 400 });
      }

      if (!user) {
        return NextResponse.json({ success: false, error: 'No verification record found for this email.' }, { status: 404 });
      }

      const isRegister = purpose === 'REGISTER';
      const lockHours = isRegister ? 48 : 24;

      // 1. Check if OTP is expired
      if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
        return NextResponse.json({
          success: false,
          error: 'This verification code has expired. Please request a new one.'
        }, { status: 400 });
      }

      const cleanInputOtp = String(otp).trim();
      const storedOtp = String(user.otpCode || '').trim();

      // 2. CHECK OTP MATCH
      if (storedOtp && cleanInputOtp === storedOtp) {
        // Success: Reset counters
        const updated = await updateUser(cleanEmail, {
          isVerified: true,
          otpCode: null,
          otpExpiresAt: null,
          otpAttempts: 0,
          loginAttempts: 0
        });

        // For registration, automatically create signed session cookie
        let sessionToken = null;
        if (isRegister) {
          sessionToken = createSessionToken(updated || user);
        }

        const res = NextResponse.json({
          success: true,
          message: isRegister ? 'Account verified and activated successfully!' : 'OTP verified successfully.',
          verified: true
        });

        if (sessionToken) {
          res.cookies.set('nirav_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
          });
        }

        return res;
      }

      // 3. MISMATCH: Increment failed OTP attempts
      const currentAttempts = (user.otpAttempts || 0) + 1;
      const remaining = Math.max(0, 3 - currentAttempts);

      if (currentAttempts >= 3) {
        // HARD LOCKOUT TRIGGERED: 48 hours for register, 24 hours for forgot-password
        const lockedUntil = new Date(Date.now() + lockHours * 60 * 60 * 1000);
        await updateUser(cleanEmail, {
          otpAttempts: currentAttempts,
          lockedUntil
        });

        // Send Suspicious Activity Alert Email immediately
        await sendSuspiciousActivityAlert({
          to: cleanEmail,
          name: user.name,
          reason: `3 Failed OTP Verification Attempts (${purpose})`,
          lockHours
        });

        return NextResponse.json({
          success: false,
          locked: true,
          lockHours,
          lockedUntil: lockedUntil.toISOString(),
          remainingSeconds: lockHours * 3600,
          error: `CRITICAL SECURITY LOCKOUT: 3 incorrect OTP entries detected. Your email has been frozen for ${lockHours} Hours.`
        }, { status: 423 });
      }

      // Record incremented attempt
      await updateUser(cleanEmail, { otpAttempts: currentAttempts });

      return NextResponse.json({
        success: false,
        attemptsRemaining: remaining,
        currentAttempt: currentAttempts,
        error: `Incorrect OTP code. You have ${remaining} attempt(s) remaining before a ${lockHours}-hour security lockout.`
      }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('[OTP Route Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
