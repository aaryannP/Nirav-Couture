'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import SocialAuthButtons from '../../components/SocialAuthButtons';
import LockoutScreen from '../../components/LockoutScreen';
import OtpModal from '../../components/OtpModal';

export default function LoginPage() {
  const { loginWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [isAdminEmail, setIsAdminEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [attemptsWarning, setAttemptsWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  // 24-Hour Lockout State
  const [lockoutState, setLockoutState] = useState(null);

  // Forgot Password Multi-Step Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotDevOtp, setForgotDevOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Extract query parameters from URL safely on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
        const lower = emailParam.toLowerCase().trim();
        if (lower === 'admin@era43.com' || lower.startsWith('admin') || lower.includes('admin')) {
          setIsAdminEmail(true);
        }
        checkEmailStatus(emailParam);
      }
      const r = params.get('redirect');
      if (r) setRedirectPath(r);
    }
  }, []);

  // Check email status (Admin detection & Lockout check) on input change or blur
  const checkEmailStatus = async (inputEmail) => {
    if (!inputEmail || !inputEmail.includes('@')) return;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-status', email: inputEmail })
      });
      const data = await res.json();
      if (data.success) {
        if (data.isAdmin) {
          setIsAdminEmail(true);
        }
        if (data.isLocked) {
          setLockoutState({
            locked: true,
            lockHours: 24,
            remainingSeconds: data.remainingSeconds || 86400,
            email: inputEmail
          });
        }
      }
    } catch {}
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError('');
    setAttemptsWarning('');

    const lower = val.toLowerCase().trim();
    // Instant client-side check so the secret key box pops up IMMEDIATELY without server delay!
    if (lower === 'admin@era43.com' || lower.startsWith('admin') || lower.includes('admin')) {
      setIsAdminEmail(true);
    } else {
      setIsAdminEmail(false);
    }

    if (lower.includes('@')) {
      checkEmailStatus(val);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setAttemptsWarning('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (isAdminEmail && !securityKey) {
      setError('Please enter your Admin Security Key (e.g. admi@3210)');
      return;
    }

    setLoading(true);

    const res = await loginWithEmail(email, password, rememberMe, securityKey);
    setLoading(false);

    if (res.success) {
      // Clean URL if there were query params
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (res.user?.role === 'ADMIN' || res.user?.role === 'SUPER_ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (redirectPath) {
        window.location.href = redirectPath;
      } else {
        window.location.href = '/account';
      }
    } else if (res.locked) {
      setLockoutState({
        locked: true,
        lockHours: 24,
        remainingSeconds: res.remainingSeconds || 86400,
        email
      });
    } else {
      setError(res.error || 'Invalid credentials');
      if (res.attemptsRemaining !== undefined) {
        setAttemptsWarning(`⚠️ Warning: ${res.attemptsRemaining} attempt(s) remaining before a 24-hour security lockout.`);
      }
    }
  };

  // ---- FORGOT PASSWORD HANDLERS ----
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: forgotEmail,
          purpose: 'FORGOT_PASSWORD'
        })
      });

      const data = await res.json();
      setForgotLoading(false);

      if (data.success) {
        setForgotDevOtp(data.devOtp || '');
        setForgotStep(2);
      } else if (data.locked) {
        setShowForgotModal(false);
        setLockoutState({
          locked: true,
          lockHours: 24,
          remainingSeconds: data.remainingSeconds || 86400,
          email: forgotEmail
        });
      } else {
        setForgotError(data.error || 'Failed to dispatch reset code');
      }
    } catch (err) {
      setForgotLoading(false);
      setForgotError('Connection error: ' + err.message);
    }
  };

  const handleForgotOtpSuccess = () => {
    setForgotStep(3);
  };

  const handleForgotLockout = (lockData) => {
    setShowForgotModal(false);
    setLockoutState({
      locked: true,
      lockHours: 24,
      remainingSeconds: lockData.remainingSeconds || 86400,
      email: forgotEmail
    });
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters long');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          newPassword
        })
      });

      const data = await res.json();
      setForgotLoading(false);

      if (data.success) {
        setForgotSuccess('✓ Password reset successfully! You can now log in.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotSuccess('');
          setPassword(newPassword);
        }, 2000);
      } else if (data.locked) {
        setShowForgotModal(false);
        setLockoutState({
          locked: true,
          lockHours: 24,
          remainingSeconds: data.remainingSeconds || 86400,
          email: forgotEmail
        });
      } else {
        setForgotError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setForgotLoading(false);
      setForgotError('Error updating password: ' + err.message);
    }
  };

  // If email is currently locked, render the 24-Hour Lockout Countdown Screen
  if (lockoutState?.locked) {
    return (
      <LockoutScreen 
        lockHours={lockoutState.lockHours || 24} 
        remainingSeconds={lockoutState.remainingSeconds} 
        email={lockoutState.email} 
        reason="3 Failed Authentication Attempts"
      />
    );
  }

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
              Sign In to ERA43
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Access your luxury orders, saved wishlist, and exclusive drops.
            </p>
          </div>

          {redirectPath === '/cart' && (
            <div style={{ background: '#000000', color: '#FFFFFF', padding: '14px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.84rem', fontWeight: '700', textAlign: 'center', letterSpacing: '0.02em' }}>
              🔒 Sign in to complete your checkout. Your bag items are saved!
            </div>
          )}

          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {attemptsWarning && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #EF4444', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: '700', textAlign: 'center' }}>
              {attemptsWarning}
            </div>
          )}

          {/* Email / Password Form with Dynamic Admin 3rd Security Key */}
          <form 
            onSubmit={handleSubmit} 
            action="javascript:void(0);" 
            method="POST"
            style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}
          >
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
                onChange={handleEmailChange}
                onBlur={() => checkEmailStatus(email)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* DYNAMIC 3RD INPUT: Appears IMMEDIATELY when Admin Email is detected */}
            {isAdminEmail && (
              <div style={{
                background: 'rgba(212, 175, 55, 0.08)',
                border: '1.5px solid var(--accent-gold)',
                borderRadius: '10px',
                padding: '16px',
                animation: 'fadeIn 0.25s ease-in-out'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="admin-security-key" style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    👑 Admin Security Key *
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                    2-Factor Required
                  </span>
                </div>
                <input 
                  id="admin-security-key"
                  name="securityKey"
                  type="password"
                  required
                  placeholder="e.g. admi@3210"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem', background: '#FFFFFF', color: '#111111', outline: 'none' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Secret formula: Email first 4 chars + @ + admin mobile last 4 digits (e.g. admi@3210)
                </span>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="login-password" style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Password *
                </label>
                <button 
                  type="button" 
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                    setForgotStep(1);
                  }}
                  style={{ fontSize: '0.78rem', color: 'var(--accent-gold-hover)', textDecoration: 'underline', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
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
                id="remember-me"
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Remember my sign-in on this browser
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-gold" 
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', textTransform: 'uppercase' }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : (isAdminEmail ? "Sign In as Admin →" : "Sign In to Account →")}
            </button>
          </form>

          {/* Social OAuth Buttons */}
          <SocialAuthButtons />

          {/* Footer Signup Link */}
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            New to ERA43?{' '}
            <Link 
              href={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'} 
              style={{ color: 'var(--accent-gold-hover)', fontWeight: '700', textDecoration: 'underline' }}
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>

      {/* UPGRADED MULTI-STEP FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <>
          {forgotStep === 1 && (
            <div className="modal-overlay active" onClick={() => setShowForgotModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <button className="close-btn" onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--accent-gold)', fontSize: '20px' }}>
                  🔑
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '8px' }}>Reset Your Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  We will send a 6-digit authentication code to verify ownership of your registered email.
                </p>

                {forgotError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: '600' }}>
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotSendOtp} action="javascript:void(0);">
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', textAlign: 'left' }}>
                      Registered Email *
                    </label>
                    <input 
                      id="forgot-password-email"
                      name="forgot_email"
                      type="email" 
                      required 
                      placeholder="name@example.com" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary btn-gold" style={{ width: '100%', padding: '12px' }} disabled={forgotLoading}>
                    {forgotLoading ? 'Sending Security Code...' : 'Send 6-Digit OTP →'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION MODAL */}
          {forgotStep === 2 && (
            <OtpModal
              email={forgotEmail}
              purpose="FORGOT_PASSWORD"
              devOtp={forgotDevOtp}
              onSuccess={handleForgotOtpSuccess}
              onClose={() => setShowForgotModal(false)}
              onLockout={handleForgotLockout}
            />
          )}

          {/* STEP 3: SET NEW PASSWORD MODAL */}
          {forgotStep === 3 && (
            <div className="modal-overlay active" onClick={() => setShowForgotModal(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <button className="close-btn" onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: '#10B981', fontSize: '20px' }}>
                  ✓
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '8px' }}>Create New Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Identity verified! Set a new strong password for <strong style={{ color: 'var(--accent-gold)' }}>{forgotEmail}</strong>.
                </p>

                {forgotError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: '600' }}>
                    {forgotError}
                  </div>
                )}

                {forgotSuccess && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '700' }}>
                    {forgotSuccess}
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} action="javascript:void(0);" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'left' }}>
                      New Password *
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'left' }}>
                      Confirm New Password *
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary btn-gold" style={{ width: '100%', padding: '12px', marginTop: '6px' }} disabled={forgotLoading}>
                    {forgotLoading ? 'Updating Password...' : 'Save New Password & Sign In →'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
