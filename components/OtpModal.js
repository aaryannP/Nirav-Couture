'use client';
import { useState, useEffect, useRef } from 'react';

export default function OtpModal({
  email = '',
  name = '',
  purpose = 'REGISTER', // 'REGISTER' | 'FORGOT_PASSWORD'
  onSuccess,
  onClose,
  onLockout,
  devOtp = '' // passed in development mode for easy testing
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [simulatedDevOtp, setSimulatedDevOtp] = useState(devOtp);

  const inputsRef = useRef([]);

  // Auto-focus first input box when modal opens
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index, value) => {
    const val = value.replace(/\D/g, '');
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit input
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      const fullCode = digits.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = pasteData.split('');
    while (newDigits.length < 6) newDigits.push('');
    setDigits(newDigits);

    const nextIdx = Math.min(pasteData.length, 5);
    inputsRef.current[nextIdx]?.focus();

    if (pasteData.length === 6) {
      handleVerify(pasteData);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          otp: code,
          purpose
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onSuccess(data);
      } else if (data.locked) {
        // Trigger 48h / 24h lockout
        if (onLockout) {
          onLockout(data);
        }
      } else {
        setError(data.error || 'Verification failed');
        if (data.currentAttempt) {
          setAttempts(data.currentAttempt);
        } else {
          setAttempts(prev => prev + 1);
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Network error: ' + err.message);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          name,
          purpose
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setResendCooldown(60);
        setDigits(['', '', '', '', '', '']);
        inputsRef.current[0]?.focus();
        if (data.devOtp) {
          setSimulatedDevOtp(data.devOtp);
        }
      } else if (data.locked) {
        if (onLockout) onLockout(data);
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch (err) {
      setLoading(false);
      setError('Error resending OTP');
    }
  };

  const lockHours = purpose === 'REGISTER' ? 48 : 24;

  return (
    <div className="modal-overlay active" style={{ zIndex: 9999 }}>
      <div className="modal-container" style={{ maxWidth: '480px', textAlign: 'center', background: '#0D0E12', border: '1px solid rgba(212,175,55,0.4)', padding: '36px 28px', borderRadius: '20px' }}>
        {onClose && (
          <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', color: '#8A8D98' }}>✕</button>
        )}

        {/* Shield Icon */}
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-gold)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>

        <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '800' }}>
          TWO-STEP VERIFICATION
        </span>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#FAF7F2', margin: '6px 0 8px' }}>
          {purpose === 'REGISTER' ? 'Confirm Registration' : 'Verify Password Reset'}
        </h2>

        <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
          Enter the 6-digit authentication code sent to:<br/>
          <strong style={{ color: 'var(--accent-gold)' }}>{email}</strong>
        </p>

        {/* Development Helper Badge */}
        {simulatedDevOtp && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', color: '#10B981', padding: '6px 12px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: '700', marginBottom: '16px', display: 'inline-block' }}>
            ⚡ Dev Mode OTP: <strong>{simulatedDevOtp}</strong> (Also sent via SMTP)
          </div>
        )}

        {/* Remaining Attempts Warning Banner */}
        <div style={{
          background: attempts > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${attempts > 0 ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
          padding: '8px 14px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: attempts > 0 ? '#EF4444' : '#9CA3AF', fontWeight: '700' }}>
            {attempts > 0 ? `⚠️ Attempt ${attempts} of 3 Used` : '🛡️ Brute-Force Defense Active'}
          </span>
          <span style={{ color: attempts >= 2 ? '#EF4444' : '#8A8D98', fontSize: '0.72rem' }}>
            Lockout: {lockHours} Hours on 3rd fail
          </span>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.82rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputsRef.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={loading}
              style={{
                width: '48px',
                height: '58px',
                borderRadius: '10px',
                border: digit ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.15)',
                background: digit ? 'rgba(212,175,55,0.08)' : '#16181F',
                color: '#FAF7F2',
                fontSize: '1.6rem',
                fontFamily: 'monospace',
                fontWeight: '800',
                textAlign: 'center',
                outline: 'none',
                boxShadow: digit ? '0 0 12px rgba(212,175,55,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleVerify()}
          disabled={loading || digits.join('').length < 6}
          className="btn-primary btn-gold"
          style={{ width: '100%', padding: '14px', fontSize: '0.92rem', letterSpacing: '0.05em', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Verifying Code...' : 'Verify Code & Proceed →'}
        </button>

        {/* Resend Link */}
        <div style={{ marginTop: '20px', fontSize: '0.82rem', color: '#8A8D98' }}>
          Didn't receive the email?{' '}
          {resendCooldown > 0 ? (
            <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
              Resend in {resendCooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
            >
              Resend Code Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
