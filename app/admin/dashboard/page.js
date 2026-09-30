'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 128450,
    ordersCount: 42,
    tshirtsSold: 86,
    customersCount: 38
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders?all=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecentOrders(data.data);
      });
  }, []);

  return (
    <AdminGuard>
      <div>
        {/* Admin Top Navigation Subheader */}
        <div className="admin-header">
          <div className="container admin-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
                NIRAV ADMIN PORTAL
              </h2>
              <span style={{ fontSize: '0.7rem', background: 'var(--accent-gold)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                SUPER ADMIN
              </span>
            </div>

            <div className="admin-menu">
              <Link href="/admin/dashboard" className="admin-menu-link active">Dashboard</Link>
              <Link href="/admin/products" className="admin-menu-link">T-Shirts Catalog</Link>
              <Link href="/admin/orders" className="admin-menu-link">Orders Fulfillment</Link>
              <Link href="/admin/team" className="admin-menu-link">Team & Handover</Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 16px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
                REAL-TIME OVERVIEW
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--text-primary)', marginTop: '4px' }}>
                Sales Progress & Analytics
              </h1>
            </div>

            <Link href="/admin/products" className="btn-primary btn-gold">
              + Add New Men's T-Shirt
            </Link>
          </div>

          {/* Visual Analytics Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <div className="stat-card">
              <span className="stat-label">Total Revenue</span>
              <div className="stat-value" style={{ color: 'var(--accent-gold-hover)' }}>
                ₹{stats.totalSales.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '600' }}>↑ +18.4% this month</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <div className="stat-value">{stats.ordersCount}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>4 pending fulfillment</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">T-Shirts Sold</span>
              <div className="stat-value">{stats.tshirtsSold}</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Oversized tees top seller</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Registered Customers</span>
              <div className="stat-value">{stats.customersCount}</div>
              <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '600' }}>↑ 12 new signups</span>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-cream)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Recent Customer Orders</h3>
              <Link href="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--accent-gold-hover)', fontWeight: '600', textDecoration: 'underline' }}>
                View All Orders →
              </Link>
            </div>

            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong></td>
                      <td>{order.customerName}<br/><span style={{ fontSize: '0.75rem', color: '#888' }}>{order.phone}</span></td>
                      <td>{order.paymentMethod}</td>
                      <td>{order.date}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          whiteSpace: 'nowrap',
                          background: order.status === 'DELIVERED' ? '#D1FAE5' : order.status === 'SHIPPED' ? '#DBEAFE' : 'var(--accent-gold-light)',
                          color: order.status === 'DELIVERED' ? '#065F46' : order.status === 'SHIPPED' ? '#1E40AF' : 'var(--accent-gold-hover)'
                        }}>
                          ● {order.status}
                        </span>
                      </td>
                      <td><strong>₹{order.finalTotal?.toLocaleString('en-IN') || order.totalAmount?.toLocaleString('en-IN')}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
