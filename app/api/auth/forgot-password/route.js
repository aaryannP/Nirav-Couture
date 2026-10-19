import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findUserByEmail, updateUser } from '../../../../lib/db';

export async function POST(request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found.' }, { status: 404 });
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingSec = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
      return NextResponse.json({
        success: false,
        locked: true,
        lockedUntil: user.lockedUntil,
        remainingSeconds: remainingSec,
        error: 'Account is currently locked due to security protocol. Cannot reset password.'
      }, { status: 423 });
    }

    // Hash new password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and reset failed counters
    await updateUser(cleanEmail, {
      passwordHash,
      otpCode: null,
      otpExpiresAt: null,
      otpAttempts: 0,
      loginAttempts: 0
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('[Forgot Password Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
