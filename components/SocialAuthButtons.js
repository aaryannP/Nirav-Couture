'use client';
import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function SocialAuthButtons() {
  const { loginWithSocial } = useAuth();
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleSocialClick = async (provider) => {
    setLoadingProvider(provider);
    const res = await loginWithSocial(provider);
    setLoadingProvider(null);
    if (res.success) {
      router.push('/products');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Sign in with Google */}
      <button 
        type="button" 
        onClick={() => handleSocialClick('google')}
        disabled={loadingProvider === 'google'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 20px',
          background: '#FFFFFF',
          color: '#333333',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.9rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.28v3.15C3.26 21.3 7.31 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.28C.46 8.2.0 10.05.0 12s.46 3.8 1.28 5.42l4-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
        </svg>
        <span>{loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>

      {/* Sign in with Apple */}
      <button 
        type="button" 
        onClick={() => handleSocialClick('apple')}
        disabled={loadingProvider === 'apple'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 20px',
          background: '#000000',
          color: '#FFFFFF',
          border: '1px solid #000000',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.96.99-3.1-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.87-1.01 2.99 1.08.08 2.17-.51 2.84-1.33z"/>
        </svg>
        <span>{loadingProvider === 'apple' ? 'Connecting to Apple...' : 'Continue with Apple'}</span>
      </button>

      {/* Sign in with Amazon */}
      <button 
        type="button" 
        onClick={() => handleSocialClick('amazon')}
        disabled={loadingProvider === 'amazon'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 20px',
          background: '#FF9900',
          color: '#111111',
          border: '1px solid #E68A00',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.9 12.3c-.6 0-1.1.2-1.5.5-.4.3-.6.7-.6 1.2 0 .5.2.9.5 1.2.4.3.9.5 1.5.5.6 0 1.2-.2 1.6-.6.4-.4.6-.9.6-1.5v-.2c-.5-.7-1.2-1.1-2.1-1.1zm7.4 8.7c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-1.8-1.5-3.6-2.5-6.5-2.5-2.8 0-5.1.9-6.9 2.5-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.3-.3-.3-.8 0-1.1 2.1-1.8 4.7-2.9 8.3-2.9 3.5 0 6.2 1.1 8.2 2.9.3.3.3.8 0 1.1zM16.5 17c-1-.7-1.5-1.7-1.5-2.8v-.2c-.6.6-1.4 1-2.3 1-1.1 0-2-.3-2.7-1-.7-.7-1.1-1.6-1.1-2.6 0-1.1.4-2 1.1-2.7.7-.7 1.7-1 2.8-1 .9 0 1.7.3 2.3.9V8.2c0-.7-.2-1.2-.6-1.5-.4-.3-1-.5-1.7-.5-1.1 0-2.2.4-3.1 1.1-.3.2-.7.2-1 0-.3-.2-.4-.6-.2-.9 1.2-.9 2.6-1.4 4.2-1.4 1.3 0 2.3.3 3 1 .7.7 1.1 1.6 1.1 2.8V15c0 .7.2 1.3.6 1.7.2.2.3.5.3.7s-.2.5-.4.6z"/>
        </svg>
        <span>{loadingProvider === 'amazon' ? 'Connecting to Amazon...' : 'Continue with Amazon'}</span>
      </button>
    </div>
  );
}
