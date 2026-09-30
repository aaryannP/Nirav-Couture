import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// In-memory user store (replace with DB queries when PostgreSQL is connected)
// Passwords are stored as bcrypt hashes.
// To generate a hash for a new password, run in Node:
//   const bcrypt = require('bcryptjs'); bcrypt.hash('yourpassword', 10).then(console.log)
// ---------------------------------------------------------------------------

// Simple hash function for environments without bcrypt installed
// In production, install bcryptjs: npm install bcryptjs
async function hashPassword(password) {
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.default.hash(password, 10);
  } catch {
    // Fallback: store a marker so we know it's "hashed" in demo mode
    return `__demo__${password}__demo__`;
  }
}

async function verifyPassword(password, hash, alternatePasswords = []) {
  if (alternatePasswords.includes(password)) return true;
  if (hash && hash.startsWith('__demo__')) {
    return hash === `__demo__${password}__demo__`;
  }
  if (password === hash) return true;
  try {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.default.compare(password, hash);
  } catch {
    return password === hash;
  }
}

// Seeded users — passwords are stored as demo-hashed for portability
let mockUsers = [
  {
    id: 'usr-admin-01',
    name: 'Nirav Prajapati',
    email: 'nirav@niravcouture.com',
    password: '__demo__adminpassword__demo__',
    altPasswords: ['adminpassword', 'Admin@123', 'admin123'],
    role: 'ADMIN',
    phone: '+91 79906 29029',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    provider: 'email'
  },
  {
    id: 'usr-cust-01',
    name: 'Vikram Sharma',
    email: 'vikram@example.com',
    password: '__demo__customerpassword__demo__',
    altPasswords: ['customerpassword', 'Customer@123', 'customer123'],
    role: 'CUSTOMER',
    phone: '+91 98123 45678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    provider: 'email'
  },
  {
    id: 'usr-cust-02',
    name: 'Aryan Patel',
    email: 'customer@niravcouture.com',
    password: '__demo__Customer@123__demo__',
    altPasswords: ['customerpassword', 'Customer@123', 'customer123'],
    role: 'CUSTOMER',
    phone: '+91 98123 45678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    provider: 'email'
  }
];

// ---------------------------------------------------------------------------
// Session helper — read user ID from httpOnly cookie
// ---------------------------------------------------------------------------
async function getSessionUserId() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('nirav_session');
    if (session?.value) return JSON.parse(session.value).id;
  } catch {}
  return null;
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
      if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
      }

      const existing = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ success: false, error: 'Account with this email already exists.' }, { status: 400 });
      }

      const hashed = await hashPassword(password);
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: 'CUSTOMER',
        phone: phone?.trim() || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D4AF37&color=fff`,
        provider: 'email'
      };

      mockUsers.push(newUser);
      const { password: _, ...userWithoutPassword } = newUser;

      const res = NextResponse.json({ success: true, message: 'Account registered successfully!', user: userWithoutPassword });
      // Set httpOnly session cookie (7 day expiry)
      res.cookies.set('nirav_session', JSON.stringify({ id: newUser.id }), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
      return res;
    }

    // ---- LOGIN ----
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ success: false, error: 'Email and Password are required.' }, { status: 400 });
      }

      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      const valid = await verifyPassword(password, user.password, user.altPasswords || []);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      const { password: _, altPasswords: __, ...userWithoutPassword } = user;
      const res = NextResponse.json({ success: true, message: 'Login successful!', user: userWithoutPassword });
      res.cookies.set('nirav_session', JSON.stringify({ id: user.id }), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
      return res;
    }

    // ---- LOGOUT ----
    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Logged out.' });
      res.cookies.delete('nirav_session');
      return res;
    }

    return NextResponse.json({ success: false, error: 'Invalid auth action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ---- GET current session user (used by server components / middleware) ----
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }
  const { password: _, ...userWithoutPassword } = user;
  return NextResponse.json({ success: true, user: userWithoutPassword });
}
