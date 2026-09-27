'use client';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying admin permissions...</p>
      </div>
    );
  }

  // Allow both ADMIN and SUPER_ADMIN roles
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!user || !isAdmin) {
    return (
      <div className="admin-guard-blocked">
        <div className="container" style={{ maxWidth: '540px' }}>
          <div className="admin-guard-card">
            <div className="admin-guard-icon">🔒</div>
            <span className="admin-guard-tag">403 FORBIDDEN • ACCESS RESTRICTED</span>
            <h1 className="admin-guard-title">Admin Portal Protection</h1>
            <p className="admin-guard-desc">
              {user ? (
                <>
                  You are signed in as <strong>{user.name}</strong> with{' '}
                  <span style={{ color: 'var(--accent-gold-hover)', fontWeight: 700 }}>
                    {user.role || 'CUSTOMER'}
                  </span>{' '}
                  access. Admin privileges are required to view this page.
                </>
              ) : (
                <>You must be signed in with an Admin account to access NIRAV store management.</>
              )}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn-outline">← Return to Shop</Link>
              <Link href="/login" className="btn-primary btn-gold">Admin Login 🔐</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
