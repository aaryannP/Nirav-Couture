import { NextResponse } from 'next/server';

// PRODUCTION STATUS: OAUTH IS STRICTLY DISABLED (HTTP 501) PENDING LIVE PROVIDER JWKS/PKCE CERTIFICATES

/**
 * OAuth Authentication Endpoint — Production Security Enforcement
 * 
 * SECURITY AUDIT REQUIREMENT:
 * Dummy / Mock OAuth provider logins have been strictly disabled.
 * External identity logins (Google, Apple, Amazon) must not create unverified users
 * without live cryptographic verification of provider ID tokens (JWKS / PKCE flow).
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const provider = (body.provider || 'external').toUpperCase();

    return NextResponse.json(
      {
        success: false,
        code: 'OAUTH_PROVIDER_DISABLED',
        error: `Sign-in via ${provider} is disabled in this environment. External provider token verification is not configured. Please register or sign in with your email and password.`
      },
      { status: 501 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'OAuth authentication is currently disabled. Please use standard email/password authentication.'
      },
      { status: 501 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'OAuth provider callback is disabled pending live provider credentials setup.'
    },
    { status: 501 }
  );
}
