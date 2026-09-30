'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import SocialAuthButtons from '../../components/SocialAuthButtons';

export default function LoginPage() {
  const { loginWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Pass rememberMe so auth-context uses localStorage vs sessionStorage
    const res = await loginWithEmail(email, password, rememberMe);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'ADMIN' || res.user?.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/account');
      }
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    // Placeholder — replace with real email API (e.g. Resend) when ready
    await new Promise(r => setTimeout(r, 800));
    setForgotLoading(false);
    setForgotMsg(`✓ If an account exists for ${forgotEmail}, a reset link has been sent. Check your inbox.`);
  };

  return (
    <div style={{ padding: '60px 0 100px', display: 'flex', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '20px', border: '1px solid var(--border-cream)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              WELCOME BACK
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', margin: '4px 0' }}>
              Sign In to NIRAV
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Access your luxury orders, saved wishlist, and exclusive drops.
            </p>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Quick Demo Credentials for Client Testing */}
          <div style={{ background: '#F8F9FA', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              DEMO CREDENTIALS (CLICK TO AUTO-FILL)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                id="btn-fill-customer"
                onClick={() => { setEmail('vikram@example.com'); setPassword('customerpassword'); }}
                style={{ background: '#FFFFFF', border: '1px solid #111', borderRadius: '4px', padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'center', cursor: 'pointer' }}
              >
                CUSTOMER
              </button>
              <button
                type="button"
                id="btn-fill-admin"
                onClick={() => { setEmail('nirav@niravcouture.com'); setPassword('adminpassword'); }}
                style={{ background: '#111111', color: '#FFFFFF', border: '1px solid #111', borderRadius: '4px', padding: '8px', fontSize: '0.75rem', fontWeight: '700', textAlign: 'center', cursor: 'pointer' }}
              >
                ADMIN
              </button>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Email Address *
              </label>
              <input 
                id="login-email"
                name="email"
                type="email" 
                autoComplete="email"
                required 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password *
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  style={{ fontSize: '0.78rem', color: 'var(--accent-gold-hover)', textDecoration: 'underline', fontWeight: '600' }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 42px 12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem', outline: 'none' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Keep me signed in on this device
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-gold" 
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', textTransform: 'uppercase' }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          {/* Social OAuth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-cream)' }} />
            <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or sign in with</span>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-cream)' }} />
          </div>

          {/* Social OAuth Buttons (Google, Apple, Amazon) */}
          <SocialAuthButtons />

          {/* Footer Signup Link */}
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            New to NIRAV COUTURE?{' '}
            <Link href="/register" style={{ color: 'var(--accent-gold-hover)', fontWeight: '700', textDecoration: 'underline' }}>
              Create an Account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay active" onClick={() => setShowForgotModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="close-btn" onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px' }}>Reset Your Password</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Enter your account email to receive a password reset link.
            </p>

            <form onSubmit={handleForgotSubmit}>
              <input 
                id="forgot-password-email"
                name="forgot_email"
                aria-label="Reset Email Address"
                type="email" 
                autoComplete="email"
                required 
                placeholder="name@example.com" 
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', marginBottom: '16px' }}
              />
              {forgotMsg && <p style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: '600', marginBottom: '16px' }}>{forgotMsg}</p>}
              <button type="submit" className="btn-primary btn-gold" style={{ width: '100%', padding: '12px' }} disabled={forgotLoading}>
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
