'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('NIRAV-ORD-84920');
  const [activeOrder, setActiveOrder] = useState(null);
  const [courierPos, setCourierPos] = useState(45); // percentage along route
  const [isSearching, setIsSearching] = useState(false);

  // Default Mock Active Order
  const defaultOrder = {
    id: 'NIRAV-ORD-84920',
    customerName: 'Vikram Sharma',
    phone: '+91 98765 43210',
    address: 'Bandra West, Mumbai - 400050',
    courierName: 'Delhivery Express',
    trackingNumber: 'DLHVY-948201',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98123 45678',
    driverVehicle: 'MH-02-EQ-8492',
    eta: 'Today by 4:30 PM',
    distanceRemaining: '2.4 km away',
    status: 'IN_TRANSIT',
    stepIndex: 3,
    items: [
      { title: "NIRAV Heavyweight Acid Wash Oversized Tee", size: "L", price: 1499, qty: 1 },
      { title: "NIRAV Signature Crest Graphic Tee", size: "L", price: 1299, qty: 1 }
    ],
    finalTotal: 2518
  };

  useEffect(() => {
    setActiveOrder(defaultOrder);

    // Simulate subtle live courier movement along route
    const interval = setInterval(() => {
      setCourierPos(prev => (prev >= 80 ? 45 : prev + 0.5));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setActiveOrder({
        ...defaultOrder,
        id: orderId.trim().toUpperCase() || 'NIRAV-ORD-84920'
      });
    }, 600);
  };

  return (
    <div style={{ padding: '40px 0 100px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
            REAL-TIME TRACKING
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--text-primary)', margin: '4px 0 8px' }}>
            Track Your Package Live
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Track live courier vehicle movement, driver contact, and estimated arrival in real-time.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '580px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-cream)', boxShadow: 'var(--shadow-md)' }}>
            <input 
              type="text" 
              placeholder="Enter Order Ref (e.g. NIRAV-ORD-84920) or Phone..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ flexGrow: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none', fontWeight: '600' }}
            />
            <button type="submit" className="btn-primary btn-gold" style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
              {isSearching ? "Searching..." : "Track Order 🔍"}
            </button>
          </form>
        </div>

        {activeOrder && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '36px', alignItems: 'start' }}>
            {/* Left Column: Interactive Live Map & Stepper */}
            <div>
              {/* Interactive Zomato/Swiggy Style Live Map Container */}
              <div style={{ background: '#12141A', borderRadius: '20px', border: '1px solid var(--border-cream)', overflow: 'hidden', marginBottom: '28px', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
                
                {/* Live Map Top Status Banner */}
                <div style={{ background: 'rgba(20, 22, 29, 0.92)', backdropFilter: 'blur(12px)', padding: '16px 24px', borderBottom: '1px solid var(--border-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
                      🚚 COURIER IN TRANSIT
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#FFFFFF', margin: '2px 0 0' }}>
                      {activeOrder.courierName} ({activeOrder.trackingNumber})
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid #10B981', padding: '4px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700' }}>
                      ● ETA: {activeOrder.eta}
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {activeOrder.distanceRemaining}
                    </p>
                  </div>
                </div>

                {/* Simulated SVG Interactive Live Map Canvas */}
                <div style={{ height: '380px', position: 'relative', background: 'radial-gradient(circle at 50% 50%, #1A1D26 0%, #0F1015 100%)', overflow: 'hidden' }}>
                  {/* Grid Lines */}
                  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#D4AF37" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Route Polyline Path */}
                  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                    <path 
                      d="M 80 300 Q 250 100, 500 240 T 900 120" 
                      fill="none" 
                      stroke="#2E3242" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                    <path 
                      d="M 80 300 Q 250 100, 500 240 T 900 120" 
                      fill="none" 
                      stroke="url(#routeGradient)" 
                      strokeWidth="6" 
                      strokeDasharray="12 8" 
                      strokeLinecap="round" 
                    >
                      <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
                    </path>
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Pin 1: Warehouse Origin */}
                  <div style={{ position: 'absolute', left: '70px', top: '270px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <div style={{ background: '#1E2029', color: 'var(--accent-gold)', border: '2px solid var(--accent-gold)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap' }}>
                      🏭 NIRAV Fulfillment Hub (Mumbai)
                    </div>
                    <div style={{ width: '12px', height: '12px', background: 'var(--accent-gold)', borderRadius: '50%', marginTop: '4px' }} />
                  </div>

                  {/* Pin 2: Live Moving Courier Vehicle (Zomato Style) */}
                  <div style={{ 
                    position: 'absolute', 
                    left: `${courierPos}%`, 
                    top: '48%', 
                    transform: 'translate(-50%, -50%)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    zIndex: 20,
                    transition: 'left 1s linear'
                  }}>
                    <div style={{ background: '#10B981', color: '#000000', padding: '6px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', boxShadow: '0 4px 16px rgba(16,185,129,0.5)', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <span>🚚 Courier Vehicle</span>
                      <span style={{ fontSize: '0.65rem', background: '#000', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
                    </div>
                    <div style={{ width: '20px', height: '20px', background: '#10B981', borderRadius: '50%', marginTop: '6px', border: '3px solid #fff', boxShadow: '0 0 12px #10B981', animation: 'pulse 1.5s infinite' }} />
                  </div>

                  {/* Pin 3: Customer Destination */}
                  <div style={{ position: 'absolute', right: '60px', top: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <div style={{ background: '#1E2029', color: '#FFFFFF', border: '2px solid #10B981', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', boxShadow: 'var(--shadow-md)', whiteSpace: 'nowrap' }}>
                      📍 Delivery Address ({activeOrder.address.split(',')[0]})
                    </div>
                    <div style={{ width: '12px', height: '12px', background: '#10B981', borderRadius: '50%', marginTop: '4px' }} />
                  </div>
                </div>

                {/* Driver Contact Bar */}
                <div style={{ background: 'var(--bg-card)', padding: '20px 24px', borderTop: '1px solid var(--border-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gold-light)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      👨‍✈️
                    </div>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>
                        {activeOrder.driverName} ({activeOrder.driverVehicle})
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Delivery Executive • Delhivery Express
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a href={`tel:${activeOrder.driverPhone}`} className="btn-outline" style={{ padding: '10px 16px', fontSize: '0.82rem' }}>
                      📞 Call Driver
                    </a>
                    <a href={`https://wa.me/${activeOrder.driverPhone.replace(/\D/g, '')}`} target="_blank" className="btn-primary btn-gold" style={{ padding: '10px 16px', fontSize: '0.82rem' }}>
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Fulfillment Stepper */}
              <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-cream)' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '24px' }}>
                  Fulfillment Status Pipeline
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', position: 'relative' }}>
                  {[
                    { label: 'Order Placed', time: '10:15 AM', done: true },
                    { label: 'Quality Checked', time: '11:30 AM', done: true },
                    { label: 'In Transit (Live)', time: '01:45 PM', done: true, active: true },
                    { label: 'Out for Delivery', time: 'Pending', done: false }
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: step.active ? 'var(--accent-gold)' : step.done ? '#10B981' : 'var(--bg-silk)',
                        color: step.active || step.done ? '#000000' : 'var(--text-muted)',
                        border: '2px solid ' + (step.active ? 'var(--accent-gold)' : step.done ? '#10B981' : 'var(--border-cream)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        marginBottom: '8px'
                      }}>
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: step.active ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {step.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {step.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Customer Details */}
            <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '20px', border: '1px solid var(--border-cream)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '20px', borderBottom: '1px solid var(--border-cream)', paddingBottom: '12px' }}>
                Order Summary
              </h3>

              <div style={{ marginBottom: '20px', fontSize: '0.88rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Order Reference ID:</p>
                <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{activeOrder.id}</strong>
              </div>

              <div style={{ marginBottom: '20px', fontSize: '0.88rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Customer & Contact:</p>
                <strong style={{ color: 'var(--text-primary)' }}>{activeOrder.customerName}</strong>
                <p style={{ color: 'var(--text-muted)' }}>{activeOrder.phone}</p>
              </div>

              <div style={{ marginBottom: '24px', fontSize: '0.88rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Shipping Address:</p>
                <strong style={{ color: 'var(--text-primary)' }}>{activeOrder.address}</strong>
              </div>

              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid var(--border-cream)', paddingBottom: '6px' }}>
                Items Included:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.title} ({item.size}) x {item.qty}</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-cream)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem' }}>
                <span>Total Amount</span>
                <span>₹{activeOrder.finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
