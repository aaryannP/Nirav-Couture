'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Tracking steps — Minimal Streetwear Style
const TRACKING_STEPS = [
  {
    id: 'ordered',
    label: 'Order Placed',
    icon: '1',
    desc: 'Your order has been received and confirmed.',
  },
  {
    id: 'confirmed',
    label: 'Order Confirmed',
    icon: '2',
    desc: 'Payment verified and order is being prepared.',
  },
  {
    id: 'processing',
    label: 'Processing & Packing',
    icon: '3',
    desc: 'Your items are being quality-checked and packed.',
  },
  {
    id: 'dispatched',
    label: 'Dispatched',
    icon: '4',
    desc: 'Package handed over to the courier partner.',
  },
  {
    id: 'in_transit',
    label: 'In Transit',
    icon: '5',
    desc: 'Package is on its way to your city.',
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: '6',
    desc: 'Delivery agent is heading to your address.',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    icon: '7',
    desc: 'Package delivered successfully.',
  },
];

// Map order status string → step index
function getStepIndex(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('DELIVER')) return 6;
  if (s.includes('OUT'))     return 5;
  if (s.includes('TRANSIT')) return 4;
  if (s.includes('DISPATCH') || s.includes('SHIP')) return 3;
  if (s.includes('PROCESS') || s.includes('PACKING')) return 2;
  if (s.includes('CONFIRM')) return 1;
  return 0; // PENDING / ORDERED
}

// Courier partners shown based on order destination
const COURIER_PARTNERS = [
  { name: 'Delhivery', tracking: 'https://www.delhivery.com/track-order' },
  { name: 'Blue Dart', tracking: 'https://www.bluedart.com/tracking' },
  { name: 'DTDC', tracking: 'https://www.dtdc.in/tracking' },
  { name: 'FedEx', tracking: 'https://www.fedex.com/en-in/tracking.html' },
  { name: 'DHL Express', tracking: 'https://www.dhl.com/in-en/home/tracking.html' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [activeOrder, setActiveOrder] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setOrderId(idFromUrl);
      doSearch(idFromUrl);
    }
  }, []);

  const doSearch = async (id) => {
    if (!id?.trim()) return;
    setIsSearching(true);
    setNotFound(false);
    setActiveOrder(null);

    try {
      const res = await fetch('/api/orders?all=true');
      const data = await res.json();
      if (data.success) {
        const found = data.data.find(
          o =>
            o.id.toUpperCase() === id.trim().toUpperCase() ||
            (o.phone && o.phone.replace(/\D/g, '').includes(id.trim().replace(/\D/g, '')))
        );
        found ? setActiveOrder(found) : setNotFound(true);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
    setIsSearching(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch(orderId);
  };

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;
  const isDelivered = currentStep === 6;

  // Estimated dates relative to order date
  const getEtaDates = (orderDate) => {
    const base = orderDate ? new Date(orderDate) : new Date();
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return {
      ordered: fmt(base),
      dispatched: fmt(new Date(base.getTime() + 1 * 86400000)),
      inTransit: fmt(new Date(base.getTime() + 2 * 86400000)),
      outForDelivery: fmt(new Date(base.getTime() + 3 * 86400000)),
      delivered: fmt(new Date(base.getTime() + 4 * 86400000)),
    };
  };

  const eta = activeOrder ? getEtaDates(activeOrder.date) : null;

  const stepDates = eta
    ? ['', '', '', eta.dispatched, eta.inTransit, eta.outForDelivery, eta.delivered]
    : Array(7).fill('');

  if (!mounted) return null;

  return (
    <div className="page-padding">
      <div className="container" style={{ maxWidth: '860px' }}>

        {/* ── Header ──────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="page-tag">ORDER TRACKING</span>
          <h1 className="page-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '8px' }}>
            Enter your Order ID or phone number. We ship across India and worldwide.
          </p>
        </div>

        {/* ── Search Bar ──────────────────────────────── */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '40px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-cream)', boxShadow: 'var(--shadow-md)' }}>
          <input
            type="text"
            placeholder="Enter Order ID (e.g. NIRAV-ORD-84920) or Phone Number..."
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary btn-gold" style={{ padding: '12px 20px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {isSearching ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {/* ── Not Found ───────────────────────────────── */}
        {notFound && (
          <div className="empty-state" style={{ marginBottom: '32px' }}>
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="empty-title">Order Not Found</h3>
            <p className="empty-desc">
              No order matched <strong>"{orderId}"</strong>.<br />
              Check the order ID in your confirmation email or WhatsApp message.
            </p>
            <Link href="/account" className="btn-outline">View My Orders</Link>
          </div>
        )}

        {/* ── Active Order ─────────────────────────────── */}
        {activeOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Order Header Card */}
            <div style={{ background: isDelivered ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)', border: `1px solid ${isDelivered ? '#10B981' : 'var(--border-cream)'}`, borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '4px' }}>Order Reference</p>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--accent-gold)' }}>{activeOrder.id}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>Placed on {activeOrder.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: isDelivered ? 'rgba(16,185,129,0.2)' : 'var(--accent-gold-light)',
                    color: isDelivered ? '#10B981' : 'var(--accent-gold)',
                    border: `1px solid ${isDelivered ? '#10B981' : 'var(--accent-gold)'}`,
                  }}>
                    {isDelivered ? '✓ Delivered' : `● ${activeOrder.status}`}
                  </span>
                  {!isDelivered && eta && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Expected by <strong style={{ color: 'var(--text-primary)' }}>{eta.delivered}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Amazon-Style Progress Tracker ── */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-cream)', padding: '28px 24px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '28px' }}>
                Shipment Progress
              </h3>

              {/* Desktop: horizontal stepper */}
              <div className="tracker-steps-desktop">
                {/* Progress line behind dots */}
                <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', height: '3px', background: 'var(--border-cream)', zIndex: 0 }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981, var(--accent-gold))',
                    width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%`,
                    transition: 'width 0.6s ease',
                    borderRadius: '2px',
                  }} />
                </div>

                {TRACKING_STEPS.map((step, idx) => {
                  const done = idx < currentStep;
                  const active = idx === currentStep;
                  const future = idx > currentStep;
                  return (
                    <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
                      {/* Dot */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: active ? '1.2rem' : '1rem',
                        background: done ? '#10B981' : active ? 'var(--accent-gold)' : 'var(--bg-silk)',
                        border: `2px solid ${done ? '#10B981' : active ? 'var(--accent-gold)' : 'var(--border-cream)'}`,
                        boxShadow: active ? '0 0 0 4px rgba(212,175,55,0.25)' : 'none',
                        marginBottom: '10px',
                        transition: 'all 0.3s ease',
                        color: future ? 'var(--text-muted)' : '#000',
                      }}>
                        {done ? '✓' : step.icon}
                      </div>
                      {/* Label */}
                      <p style={{
                        fontSize: '0.68rem',
                        fontWeight: active ? '800' : '600',
                        color: active ? 'var(--accent-gold)' : done ? '#10B981' : 'var(--text-muted)',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {step.label}
                      </p>
                      {/* Date */}
                      {stepDates[idx] && (done || active) && (
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginTop: '2px', textAlign: 'center' }}>
                          {stepDates[idx]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile: vertical stepper */}
              <div className="tracker-steps-mobile">
                {TRACKING_STEPS.map((step, idx) => {
                  const done = idx < currentStep;
                  const active = idx === currentStep;
                  const future = idx > currentStep;
                  const isLast = idx === TRACKING_STEPS.length - 1;
                  return (
                    <div key={step.id} style={{ display: 'flex', gap: '16px', paddingBottom: isLast ? 0 : '0' }}>
                      {/* Left: dot + line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          background: done ? '#10B981' : active ? 'var(--accent-gold)' : 'var(--bg-silk)',
                          border: `2px solid ${done ? '#10B981' : active ? 'var(--accent-gold)' : 'var(--border-cream)'}`,
                          boxShadow: active ? '0 0 0 4px rgba(212,175,55,0.2)' : 'none',
                          flexShrink: 0,
                          color: future ? 'var(--text-muted)' : '#000',
                        }}>
                          {done ? '✓' : step.icon}
                        </div>
                        {!isLast && (
                          <div style={{ width: '2px', flexGrow: 1, minHeight: '32px', background: done ? '#10B981' : 'var(--border-cream)', margin: '4px 0' }} />
                        )}
                      </div>

                      {/* Right: text */}
                      <div style={{ paddingTop: '8px', paddingBottom: isLast ? 0 : '24px' }}>
                        <p style={{ fontWeight: active ? '800' : '600', fontSize: '0.9rem', color: active ? 'var(--accent-gold)' : done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {step.label}
                          {active && (
                            <span style={{ marginLeft: '8px', fontSize: '0.68rem', background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                              CURRENT
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{step.desc}</p>
                        {stepDates[idx] && (done || active) && (
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>{stepDates[idx]}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Delivery Details + Order Summary (2-col on desktop) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Shipping Info */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-cream)', padding: '20px' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-cream)' }}>
                    Delivery Details
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Customer</p>
                  <p style={{ fontWeight: '700', marginBottom: '10px' }}>{activeOrder.customerName || activeOrder.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Phone</p>
                  <p style={{ fontWeight: '600', marginBottom: '10px' }}>{activeOrder.phone}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Shipping Address</p>
                  <p style={{ fontWeight: '600', fontSize: '0.88rem', lineHeight: 1.5 }}>{activeOrder.shippingAddress || activeOrder.address}</p>
                </div>

                {/* Payment Info */}
                <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-cream)', padding: '20px' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-cream)' }}>
                    Payment Summary
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                    <strong>{activeOrder.paymentMethod}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Order Total</span>
                    <strong>₹{(activeOrder.finalTotal ?? activeOrder.totalAmount ?? 0).toLocaleString('en-IN')}</strong>
                  </div>
                  {activeOrder.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#10B981' }}>
                      <span>Discount Applied</span>
                      <span>-₹{activeOrder.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div style={{ marginTop: '12px', padding: '10px', background: isDelivered ? 'rgba(16,185,129,0.1)' : 'var(--accent-gold-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isDelivered ? '#10B981' : 'var(--accent-gold)', textTransform: 'uppercase' }}>
                      {isDelivered ? 'Payment Complete' : activeOrder.paymentMethod.includes('COD') ? 'Pay on Delivery' : 'Pending Delivery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Ordered */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-cream)', padding: '20px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-cream)' }}>
                  Items Ordered
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(activeOrder.items || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-silk)', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '0.88rem' }}>{item.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Size: {item.selectedSize || item.size} · Qty: {item.qty}
                        </p>
                      </div>
                      <strong style={{ color: 'var(--accent-gold)', fontSize: '0.92rem', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier Partners & Help */}
              <div style={{ background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-cream)', padding: '20px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '6px' }}>Our Courier Partners</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  We ship with trusted partners across India and internationally. Once dispatched, you'll receive a courier tracking number via WhatsApp and email.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {COURIER_PARTNERS.map(c => (
                    <a key={c.name} href={c.tracking} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--bg-silk)', borderRadius: '8px', border: '1px solid var(--border-cream)', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)', transition: 'border-color 0.2s' }}>
                      <span>{c.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* CTA row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/917990629029?text=${encodeURIComponent(`Hi NIRAV COUTURE! I want to check the status of my order: ${activeOrder.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp"
                >
                  WhatsApp Support
                </a>
                <Link href="/products" className="btn-outline">Continue Shopping</Link>
                {isDelivered && (
                  <Link href={`/products`} className="btn-primary btn-gold">
                    Leave a Review
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Empty (no search yet) ── */}
        {!activeOrder && !notFound && !isSearching && (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-cream)', padding: '40px 24px', textAlign: 'center' }}>
            <div className="empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>Track Your NIRAV Order</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
              Enter your Order ID from your confirmation message above to see real-time delivery status — for India and international orders.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/account" className="btn-outline">View My Orders</Link>
              <a href="https://wa.me/917990629029" target="_blank" rel="noreferrer" className="btn-whatsapp">
                Ask on WhatsApp
              </a>
            </div>

            {/* How it works */}
            <div style={{ marginTop: '36px', borderTop: '1px solid var(--border-cream)', paddingTop: '28px' }}>
              <p style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700', marginBottom: '20px' }}>
                HOW ORDER TRACKING WORKS
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                {TRACKING_STEPS.filter((_, i) => [0, 2, 3, 5, 6].includes(i)).map(step => (
                  <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                      {step.icon}
                    </div>
                    <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textAlign: 'center' }}>{step.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tracker-steps-desktop {
          display: flex;
          align-items: flex-start;
          position: relative;
          padding-top: 0;
        }
        .tracker-steps-mobile {
          display: none;
        }
        @media (max-width: 640px) {
          .tracker-steps-desktop { display: none; }
          .tracker-steps-mobile { display: flex; flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading order tracker...
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
