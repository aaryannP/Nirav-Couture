'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SocialAuthButtons from '../../components/SocialAuthButtons';
import OtpModal from '../../components/OtpModal';
import LockoutScreen from '../../components/LockoutScreen';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  // 2-Step OTP and Lockout States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [lockoutState, setLockoutState] = useState(null); // { locked: true, lockHours: 48, remainingSeconds: ... }

  // Extract redirect query parameter from URL safely on client
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('redirect');
      if (r) setRedirectPath(r);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Request 6-digit OTP dispatch
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          name,
          phone,
          password,
          purpose: 'REGISTER'
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setDevOtp(data.devOtp || '');
        setShowOtpModal(true);
      } else if (data.locked) {
        setLockoutState({
          locked: true,
          lockHours: 48,
          remainingSeconds: data.remainingSeconds || 48 * 3600,
          email
        });
      } else {
        setError(data.error || 'Failed to dispatch verification code');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection error: ' + err.message);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpModal(false);
    // User is verified and session cookie is already set by /api/auth/otp
    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      window.location.href = '/products';
    }
  };

  const handleLockout = (lockData) => {
    setShowOtpModal(false);
    setLockoutState({
      locked: true,
      lockHours: lockData.lockHours || 48,
      remainingSeconds: lockData.remainingSeconds || 48 * 3600,
      email
    });
  };

  // If email is currently locked, render the 48-Hour Lockout Countdown Screen
  if (lockoutState?.locked) {
    return (
      <LockoutScreen 
        lockHours={lockoutState.lockHours} 
        remainingSeconds={lockoutState.remainingSeconds} 
        email={lockoutState.email} 
        reason="3 Failed OTP Verification Attempts"
      />
    );
  }

  return (
    <div style={{ padding: '60px 0 100px', display: 'flex', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '20px', border: '1px solid var(--border-cream)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              JOIN THE INNER CIRCLE
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', margin: '4px 0' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Enjoy express checkout, order tracking, and VIP drop access.
            </p>
          </div>

          {redirectPath === '/cart' && (
            <div style={{ background: '#000000', color: '#FFFFFF', padding: '14px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.84rem', fontWeight: '700', textAlign: 'center', letterSpacing: '0.02em' }}>
              🔒 Create an account to complete your checkout. Your bag items are saved!
            </div>
          )}

          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Registration Form with 2-Step OTP Security */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="register-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input 
                id="register-name"
                name="name"
                type="text" 
                autoComplete="name"
                required 
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-grid-2">
              <div>
                <label htmlFor="register-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input 
                  id="register-email"
                  name="email"
                  type="email" 
                  autoComplete="email"
                  required 
                  placeholder="aarav@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label htmlFor="register-phone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Mobile Number
                </label>
                <input 
                  id="register-phone"
                  name="phone"
                  type="tel" 
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label htmlFor="register-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Password *
                </label>
                <input 
                  id="register-password"
                  name="password"
                  type="password" 
                  autoComplete="new-password"
                  required 
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label htmlFor="register-confirm-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Confirm Password *
                </label>
                <input 
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password" 
                  autoComplete="new-password"
                  required 
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-gold" 
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', textTransform: 'uppercase', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? "Sending Security Code..." : "Verify Email & Create Account →"}
            </button>
          </form>

          {/* Social OAuth Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-cream)' }} />
            <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>or sign up with</span>
            <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-cream)' }} />
          </div>

          <SocialAuthButtons />

          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link 
              href={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'} 
              style={{ color: 'var(--accent-gold-hover)', fontWeight: '700', textDecoration: 'underline' }}
            >
              Sign In Here
            </Link>
          </p>
        </div>
      </div>

      {/* 2-Step OTP Modal */}
      {showOtpModal && (
        <OtpModal
          email={email}
          name={name}
          purpose="REGISTER"
          devOtp={devOtp}
          onSuccess={handleOtpSuccess}
          onClose={() => setShowOtpModal(false)}
          onLockout={handleLockout}
        />
      )}
    </div>
  );
}
