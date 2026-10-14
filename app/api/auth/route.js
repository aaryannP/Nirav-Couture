import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser } from '../../../lib/db';
import { createSessionToken, verifySessionToken } from '../../../lib/session';

// ---------------------------------------------------------------------------
// Helper — Read & verify cryptographically signed session from httpOnly cookie
// ---------------------------------------------------------------------------
export async function getVerifiedSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('nirav_session');
    if (!sessionCookie?.value) return null;
    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, name, email, password, phone } = body;

    // ---- REGISTER ----
    if (action === 'register') {
      if (!name || !email || !password) {
        return NextResponse.json({ success: false, error: 'Name, Email, and Password are required.' }, { status: 400 });
      }

      const trimmedEmail = email.toLowerCase().trim();
      const trimmedName = name.trim();

      // Strong password validation
      if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
      }

      // Check if user already exists in DB
      const existing = await findUserByEmail(trimmedEmail);
      if (existing) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 400 });
      }

      // Cryptographically salt and hash password (10 rounds)
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = {
        id: `usr-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        role: 'CUSTOMER',
        phone: phone?.trim() || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedName)}&background=111111&color=ffffff`,
        provider: 'email',
        createdAt: new Date().toISOString()
      };

      await createUser(newUser);

      // Create cryptographically signed session token
      const sessionToken = createSessionToken(newUser);

      const { passwordHash: _, ...userSafe } = newUser;
      const res = NextResponse.json({
        success: true,
        message: 'Account registered successfully!',
        user: userSafe
      });

      res.cookies.set('nirav_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return res;
    }

    // ---- LOGIN ----
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and Password are required.' }, { status: 400 });
      }

      const trimmedEmail = email.toLowerCase().trim();
      const user = await findUserByEmail(trimmedEmail);

      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      // Cryptographic comparison using bcrypt ONLY
      const isValid = await bcrypt.compare(password, user.passwordHash || user.password_hash || '');
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      // Generate cryptographically signed HMAC-SHA256 session token
      const sessionToken = createSessionToken(user);

      const { passwordHash: _, password_hash: __, ...userSafe } = user;
      const res = NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: userSafe
      });

      res.cookies.set('nirav_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      return res;
    }

    // ---- LOGOUT ----
    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      res.cookies.delete('nirav_session');
      return res;
    }

    return NextResponse.json({ success: false, error: 'Invalid auth action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---- GET current session user (Cryptographically Verified) ----
export async function GET() {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User record not found' }, { status: 404 });
  }

  const { passwordHash: _, password_hash: __, ...userSafe } = user;
  return NextResponse.json({
    success: true,
    user: {
      ...userSafe,
      role: session.role // Verified from signed session token
    }
  });
}
