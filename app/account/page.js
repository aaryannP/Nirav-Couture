'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';

export default function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              CUSTOMER PORTAL
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
              My Account & Order History
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/products" className="btn-outline">Browse T-Shirts</Link>
            
            {/* ONLY Show Admin Dashboard Button IF User is ADMIN */}
            {user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard" className="btn-primary btn-gold">
                Go to Admin Dashboard ⚙
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Customer Profile Details Card */}
        <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-cream)', marginBottom: '36px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Customer Profile Information</h3>
            <span style={{
              background: user?.role === 'ADMIN' ? 'var(--text-primary)' : 'var(--accent-gold-light)',
              color: user?.role === 'ADMIN' ? 'var(--accent-gold)' : 'var(--accent-gold-hover)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              border: '1px solid var(--accent-gold)'
            }}>
              ROLE: {user?.role || 'CUSTOMER'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '0.92rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Full Name</span>
              <strong>{user?.name || 'Guest User'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</span>
              <strong>{user?.email || 'Not logged in'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Mobile Phone</span>
              <strong>{user?.phone || '+91 98765 43210'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700' }}>Sign-in Provider</span>
              <strong style={{ textTransform: 'capitalize' }}>{user?.provider || 'Email / Password'}</strong>
            </div>
          </div>
        </div>

        {/* Order History */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '20px' }}>
          Recent Orders ({orders.length})
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading order history...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No recent orders found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-cream)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: '700', fontSize: '1.1rem' }}>{order.id}</span>
                    <span style={{ marginLeft: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Date: {order.date}</span>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    background: order.status === 'DELIVERED' ? '#D1FAE5' : order.status === 'SHIPPED' ? '#DBEAFE' : 'var(--accent-gold-light)',
                    color: order.status === 'DELIVERED' ? '#065F46' : order.status === 'SHIPPED' ? '#1E40AF' : 'var(--accent-gold-hover)'
                  }}>
                    ● {order.status}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>{item.title} (Size: {item.selectedSize || item.size}) x {item.qty || item.quantity}</span>
                      <span>₹{(item.price * (item.qty || item.quantity)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed var(--border-cream)', fontSize: '0.95rem' }}>
                  <span>Payment: <strong>{order.paymentMethod}</strong></span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total: ₹{order.finalTotal?.toLocaleString('en-IN') || order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
