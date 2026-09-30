'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [msg, setMsg] = useState('');

  const fetchOrders = () => {
    // ?all=true fetches all orders (admin mode)
    fetch('/api/orders?all=true')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      // Use normalized field names: customerName, phone, shippingAddress
      const name = (o.customerName || o.name || '').toLowerCase();
      const phone = o.phone || '';
      const id = (o.id || '').toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        id.includes(searchQuery.toLowerCase()) ||
        name.includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✓ Order ${orderId} updated to ${newStatus}`);
        fetchOrders();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch {
      alert('Failed to update order status');
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export.');
      return;
    }

    const headers = ['Order Ref', 'Customer Name', 'Phone', 'Address', 'Payment Method', 'Total (INR)', 'Status', 'Date'];
    const rows = filteredOrders.map(o => {
      // Normalise field names — support both naming conventions
      const customerName = o.customerName || o.name || '';
      const phone = o.phone || '';
      const address = (o.shippingAddress || o.address || '').replace(/"/g, '""');
      const total = o.finalTotal ?? o.totalAmount ?? 0;
      return [
        `"${o.id}"`,
        `"${customerName}"`,
        `"${phone}"`,
        `"${address}"`,
        `"${o.paymentMethod || ''}"`,
        `"${total}"`,
        `"${o.status || ''}"`,
        `"${o.date || ''}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `NIRAV_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMsg('✓ Orders CSV downloaded!');
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <AdminGuard>
      <div>
        {/* Admin Subheader */}
        <div className="admin-header">
          <div className="container admin-nav">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontSize: '1.4rem' }}>
              NIRAV ADMIN PORTAL
            </h2>
            <div className="admin-menu">
              <Link href="/admin/dashboard" className="admin-menu-link">Dashboard</Link>
              <Link href="/admin/products" className="admin-menu-link">T-Shirts</Link>
              <Link href="/admin/orders" className="admin-menu-link active">Orders</Link>
              <Link href="/admin/team" className="admin-menu-link">Team</Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
                FULFILLMENT LOGISTICS
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                Customer Orders ({filteredOrders.length})
              </h1>
            </div>
            <button className="btn-primary btn-gold" onClick={handleExportCSV}>
              Export CSV
            </button>
          </div>

          {msg && (
            <div style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600', fontSize: '0.9rem', border: '1px solid rgba(16,185,129,0.3)' }}>
              {msg}
            </div>
          )}

          {/* Search & Filter */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-cream)', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <input
              id="admin-orders-search"
              name="orders_search"
              aria-label="Search Orders"
              type="text"
              placeholder="Search by Order ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flexGrow: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
            />
            <select
              id="admin-orders-status-filter"
              name="status_filter"
              aria-label="Filter Orders by Status"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '600' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Orders Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No orders found matching your filters.
                    </td>
                  </tr>
                ) : filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                        {o.id}
                      </strong>
                    </td>
                    <td>
                      <strong>{o.customerName || o.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.phone}</span>
                      <br />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.customerEmail || o.email}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', maxWidth: '220px' }}>
                      {o.shippingAddress || o.address}
                    </td>
                    <td>
                      <strong>₹{(o.finalTotal ?? o.totalAmount ?? 0).toLocaleString('en-IN')}</strong>
                      <br />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.paymentMethod}</span>
                    </td>
                    <td>
                      <select
                        id={`order-status-${o.id}`}
                        name={`order_status_${o.id}`}
                        aria-label={`Order status for ${o.id}`}
                        value={o.status}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          border: 'none',
                          cursor: 'pointer',
                          background:
                            o.status === 'DELIVERED' ? 'rgba(16,185,129,0.2)' :
                            o.status === 'SHIPPED' ? 'rgba(59,130,246,0.2)' :
                            o.status === 'CONFIRMED' ? 'rgba(212,175,55,0.2)' :
                            'rgba(245,158,11,0.2)',
                          color:
                            o.status === 'DELIVERED' ? '#10B981' :
                            o.status === 'SHIPPED' ? '#3B82F6' :
                            o.status === 'CONFIRMED' ? 'var(--accent-gold)' :
                            '#F59E0B'
                        }}
                      >
                        <option value="CONFIRMED" style={{ background: '#1E2029', color: '#FAF7F2' }}>CONFIRMED</option>
                        <option value="PENDING" style={{ background: '#1E2029', color: '#FAF7F2' }}>PENDING</option>
                        <option value="PROCESSING" style={{ background: '#1E2029', color: '#FAF7F2' }}>PROCESSING</option>
                        <option value="SHIPPED" style={{ background: '#1E2029', color: '#FAF7F2' }}>SHIPPED</option>
                        <option value="DELIVERED" style={{ background: '#1E2029', color: '#FAF7F2' }}>DELIVERED</option>
                        <option value="CANCELLED" style={{ background: '#1E2029', color: '#FAF7F2' }}>CANCELLED</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
