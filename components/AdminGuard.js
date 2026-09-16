'use client';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying Super-Admin permissions...</p>
      </div>
    );
  }

  // If user is not logged in OR is NOT an ADMIN (e.g. role === 'CUSTOMER')
  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ padding: '80px 0 120px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ maxWidth: '540px', textAlign: 'center' }}>
          <div style={{ background: 'var(--bg-card)', padding: '48px 36px', borderRadius: '24px', border: '1px solid var(--border-cream)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>
              🔒
            </div>

            <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#DC2626', fontWeight: '800' }}>
              403 FORBIDDEN • ACCESS RESTRICTED
            </span>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', margin: '8px 0 12px' }}>
              Admin Portal Protection
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '28px', lineHeight: 1.6 }}>
              {user ? (
                <>You are currently signed in as <strong>{user.name} ({user.email})</strong> with <span style={{ color: 'var(--accent-gold-hover)', fontWeight: '700' }}>CUSTOMER</span> access. Admin privileges are required to view store sales analytics and inventory.</>
              ) : (
                <>You must be signed in with a Super-Admin account to access NIRAV store management.</>
              )}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-outline">
                ← Return to Shop
              </Link>
              <Link href="/login" className="btn-primary btn-gold">
                Switch Account / Admin Login 🔐
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
