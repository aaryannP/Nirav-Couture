'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LockoutScreen({ 
  lockHours = 24, 
  remainingSeconds = 86400, 
  email = '',
  reason = '3 Failed Verification Attempts'
}) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, remainingSeconds));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#0D0E12',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '24px',
        padding: '48px 32px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(239, 68, 68, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient background accent */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Shield & Lock Animated Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid rgba(239, 68, 68, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#EF4444',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <span style={{
          fontSize: '0.75rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#EF4444',
          fontWeight: '800',
          display: 'inline-block',
          marginBottom: '8px'
        }}>
          ⚠️ SECURITY PROTOCOL ENGAGED
        </span>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '2.1rem',
          color: '#FAF7F2',
          margin: '0 0 12px',
          lineHeight: 1.2
        }}>
          Account Access Temporarily Frozen
        </h1>

        <p style={{ color: '#9CA3AF', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>
          Our threat detection system registered <strong>3 consecutive failed authentication attempts</strong>. To protect this email from credential stuffing and bot brute-force attacks, access is locked for <strong>{lockHours} Hours</strong>.
        </p>

        {/* REVERSE COUNTDOWN TIMER */}
        <div style={{
          background: '#16181F',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '16px',
          padding: '24px 20px',
          marginBottom: '28px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            ⏳ TIME REMAINING UNTIL UNLOCK
          </span>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            {/* Hours */}
            <div style={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', minWidth: '72px' }}>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: '800', color: '#FAF7F2' }}>
                {pad(hours)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8A8D98', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                Hours
              </div>
            </div>

            <span style={{ fontSize: '2rem', color: 'var(--accent-gold)', fontWeight: '700' }}>:</span>

            {/* Minutes */}
            <div style={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', minWidth: '72px' }}>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: '800', color: '#FAF7F2' }}>
                {pad(minutes)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8A8D98', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                Mins
              </div>
            </div>

            <span style={{ fontSize: '2rem', color: 'var(--accent-gold)', fontWeight: '700' }}>:</span>

            {/* Seconds */}
            <div style={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', minWidth: '72px' }}>
              <div style={{ fontSize: '2.2rem', fontFamily: 'monospace', fontWeight: '800', color: '#EF4444' }}>
                {pad(seconds)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8A8D98', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                Secs
              </div>
            </div>
          </div>
        </div>

        {/* Security Notification Details */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          textAlign: 'left',
          fontSize: '0.8rem',
          color: '#E5E7EB',
          lineHeight: 1.5,
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', fontWeight: '700', color: '#EF4444' }}>
            <span>📧</span> Suspicious Activity Alert Dispatched
          </div>
          An alert email has been sent to <strong>{email || 'your registered email'}</strong>. If you did not initiate these requests, your account is safe and the attacker is fully locked out.
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/" className="btn-primary btn-gold" style={{ padding: '12px 24px', fontSize: '0.88rem' }}>
            Return to Storefront
          </Link>
          <Link href="/contact" className="btn-outline" style={{ padding: '12px 24px', fontSize: '0.88rem' }}>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
