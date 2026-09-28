'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    // GET /api/orders without ?all=true returns only the current user's orders
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="page-padding">
        <div className="container" style={{ maxWidth: '480px', textAlign: 'center' }}>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="empty-title">Sign In to View Your Account</h2>
            <p className="empty-desc">Access your order history, wishlist, and profile details.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" className="btn-primary btn-gold">Sign In</Link>
              <Link href="/register" className="btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-padding">
      <div className="container">
        {/* Page header */}
        <div className="page-header">
          <div>
            <span className="page-tag">CUSTOMER PORTAL</span>
            <h1 className="page-title">My Account</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-outline">Browse T-Shirts</Link>
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <Link href="/admin/dashboard" className="btn-primary btn-gold">Admin Panel</Link>
            )}
            <button className="btn-outline" onClick={logout} style={{ color: '#EF4444', borderColor: '#EF4444' }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="info-card" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Profile Information</h3>
            <span style={{
              background: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'var(--text-primary)' : 'var(--accent-gold-light)',
              color: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'var(--accent-gold)' : 'var(--accent-gold-hover)',
              padding: '4px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800',
              textTransform: 'uppercase', border: '1px solid var(--accent-gold)'
            }}>
              {user.role || 'CUSTOMER'}
            </span>
          </div>
          <div className="profile-grid">
            <div><span className="field-label">Full Name</span><strong>{user.name}</strong></div>
            <div><span className="field-label">Email Address</span><strong>{user.email}</strong></div>
            <div><span className="field-label">Mobile Phone</span><strong>{user.phone || 'Not set'}</strong></div>
            <div><span className="field-label">Sign-in Method</span><strong style={{ textTransform: 'capitalize' }}>{user.provider || 'Email'}</strong></div>
          </div>
        </div>

        {/* Order History — filtered to current user */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '20px' }}>
          Order History ({orders.length})
        </h2>

        {loading ? (
          <div className="orders-skeleton">
            {[1, 2].map(i => <div key={i} className="skeleton-shimmer" style={{ height: '140px', borderRadius: '12px' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 20px' }}>
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>No Orders Yet</h3>
            <p className="empty-desc">Your order history will appear here after your first purchase.</p>
            <Link href="/products" className="btn-primary btn-gold">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => (
              <div key={order.id} className="info-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: '700', fontSize: '1rem' }}>{order.id}</span>
                    <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}</span>
                  </div>
                  <span className={`status-badge status-${(order.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                    ● {order.status}
                  </span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                      <span>{item.title} (Size: {item.selectedSize || item.size}) × {item.qty}</span>
                      <span>₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed var(--border-cream)', fontSize: '0.9rem', flexWrap: 'wrap', gap: '8px' }}>
                  <span>Payment: <strong>{order.paymentMethod}</strong></span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                    Total: ₹{(order.finalTotal ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <Link href={`/track-order?id=${order.id}`} className="btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                    Track This Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
