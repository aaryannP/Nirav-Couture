'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState([]);
  const [targetEmail, setTargetEmail] = useState('');
  const [msg, setMsg] = useState('');

  const fetchAdmins = () => {
    fetch('/api/admin/handover')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdmins(data.data);
      });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleGrantAdmin = async (e) => {
    e.preventDefault();
    if (!targetEmail) return;

    try {
      const res = await fetch('/api/admin/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✓ ${data.message}`);
        setTargetEmail('');
        fetchAdmins();
      } else {
        alert(data.error || 'Failed to grant Admin access');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <AdminGuard>
      <div>
        <div className="admin-header">
          <div className="container admin-nav">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
              NIRAV ADMIN PORTAL
            </h2>
            <div className="admin-menu">
              <Link href="/admin/dashboard" className="admin-menu-link">Dashboard</Link>
              <Link href="/admin/products" className="admin-menu-link">T-Shirts Catalog</Link>
              <Link href="/admin/orders" className="admin-menu-link">Orders Fulfillment</Link>
              <Link href="/admin/team" className="admin-menu-link active">Team & Handover</Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px' }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              ACCESS DELEGATION
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
              Admin Role Handover & Delegation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Nirav can grant admin access or delegate management privileges to any store manager by entering their registered email below.
            </p>
          </div>

          {msg && (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600', fontSize: '0.9rem' }}>
              {msg}
            </div>
          )}

          {/* Grant Admin Access Form */}
          <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-cream)', marginBottom: '40px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '12px' }}>
              Grant Admin Role / Handover Access
            </h3>

            <form onSubmit={handleGrantAdmin} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', maxWidth: '600px' }}>
              <div style={{ flexGrow: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                  User Email Address *
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. manager@niravcouture.com" 
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.9rem' }} 
                />
              </div>
              <button type="submit" className="btn-primary btn-gold" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
                Grant Admin Access
              </button>
            </form>
          </div>

          {/* Active Admins Table */}
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '16px' }}>
            Active Admins & Managers ({admins.length})
          </h3>

          <table className="table-custom">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Granted Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(adm => (
                <tr key={adm.id}>
                  <td><strong>{adm.name}</strong></td>
                  <td>{adm.email}</td>
                  <td>
                    <span style={{ background: 'var(--text-primary)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {adm.role}
                    </span>
                  </td>
                  <td>{adm.grantedDate}</td>
                  <td><span style={{ color: '#10B981', fontWeight: '700' }}>● Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
