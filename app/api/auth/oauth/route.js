import { NextResponse } from 'next/server';
import { createSessionToken } from '../../../../lib/session';
import { findUserByEmail, createUser } from '../../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider } = body;

    let oauthUser;
    if (provider === 'google') {
      oauthUser = {
        id: `usr-google-${Date.now()}`,
        name: "Alex Mercer (Google)",
        email: "alex.mercer@gmail.com",
        role: "CUSTOMER",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
        provider: "google"
      };
    } else if (provider === 'apple') {
      oauthUser = {
        id: `usr-apple-${Date.now()}`,
        name: "Siddharth Mehta (Apple)",
        email: "siddharth.m@icloud.com",
        role: "CUSTOMER",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
        provider: "apple"
      };
    } else if (provider === 'amazon') {
      oauthUser = {
        id: `usr-amazon-${Date.now()}`,
        name: "Priya Nair (Amazon)",
        email: "priya.nair@amazon.in",
        role: "CUSTOMER",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
        provider: "amazon"
      };
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported OAuth provider' }, { status: 400 });
    }

    // Upsert user into database
    const existing = await findUserByEmail(oauthUser.email);
    if (!existing) {
      await createUser({
        ...oauthUser,
        passwordHash: 'oauth_managed',
        createdAt: new Date().toISOString()
      });
    }

    // Generate cryptographically signed session token
    const sessionToken = createSessionToken(existing || oauthUser);

    const res = NextResponse.json({
      success: true,
      message: `Signed in successfully via ${provider.toUpperCase()}!`,
      user: existing || oauthUser
    });

    res.cookies.set('nirav_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
