'use client';
import { useState } from 'react';
import Link from 'next/link';

// Moved outside component — static data, no need to recreate on every render
const FAQS = [
  {
    id: 'delivery',
    q: 'What is the delivery timeline for my order?',
    a: 'Orders are dispatched within 24 hours from our fulfillment hub. Metro cities (Mumbai, Delhi, Bangalore, Ahmedabad) receive delivery in 2–3 business days. Rest of India takes 3–5 days. International orders ship via DHL/FedEx in 7–14 business days.'
  },
  {
    id: 'returns',
    q: 'What is the return & exchange policy?',
    a: 'We offer a 7-day hassle-free size exchange and return policy from the delivery date. If the fit is not perfect, we will arrange a free doorstep pickup. Items must be unworn, unwashed, and have original tags attached.'
  },
  {
    id: 'care',
    q: 'How do I care for 240 GSM Bio-Washed Heavy Cotton?',
    a: 'Machine wash cold (30°C) inside out with mild detergent. Line dry in shade. Do not tumble dry. Avoid ironing directly on graphic prints — iron inside out on low heat.'
  },
  {
    id: 'cod',
    q: 'Is Cash on Delivery (COD) available across India?',
    a: 'Yes! 100% Cash on Delivery is available for all pin codes across India with absolutely zero extra COD charges. Pay only when your package arrives.'
  },
  {
    id: 'international',
    q: 'Do you ship internationally?',
    a: 'Yes, we ship worldwide! International orders are shipped via DHL Express or FedEx. Shipping charges and delivery time depend on the destination country. Customs/import duties may apply as per your country\'s laws.'
  },
  {
    id: 'tracking',
    q: 'How do I track my order?',
    a: 'You will receive a tracking number via WhatsApp and email once your order is dispatched. Use the Track Order page on our website or visit the courier partner\'s website directly to track in real time.'
  },
];

export default function SupportDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open support drawer"
        style={{
          position: 'fixed',
          bottom: '88px', // above mobile bottom nav
          right: '16px',
          zIndex: 400,
          background: 'var(--accent-gold)',
          color: '#000',
          padding: '11px 18px',
          borderRadius: '999px',
          fontWeight: '700',
          fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(212,175,55,0.4)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span>💬</span>
        <span className="support-btn-label">Need Help?</span>
      </button>

      {/* Backdrop */}
      <div
        className={`drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`cart-drawer ${isOpen ? 'active' : ''}`}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '460px' }}
        aria-label="Customer support"
      >
        <div className="drawer-header">
          <div>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
              CUSTOMER CONCIERGE
            </span>
            <h3 className="drawer-title" style={{ marginTop: '2px' }}>NIRAV Support & Care</h3>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close support drawer">✕</button>
        </div>

        <div className="drawer-body">
          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <a
              href="https://wa.me/919876543210?text=Hi%20NIRAV%20Support!%20I%20need%20help%20with%20my%20order."
              target="_blank"
              rel="noreferrer"
              style={{ background: '#25D366', color: '#fff', padding: '14px 10px', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
            >
              <span style={{ fontSize: '1.3rem' }}>💬</span>
              <span>WhatsApp</span>
            </a>
            <Link
              href="/track-order"
              onClick={() => setIsOpen(false)}
              style={{ background: 'var(--bg-silk)', color: 'var(--text-primary)', padding: '14px 10px', borderRadius: '10px', fontWeight: '700', fontSize: '0.82rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', border: '1px solid var(--border-cream)' }}
            >
              <span style={{ fontSize: '1.3rem' }}>🚚</span>
              <span>Track Order</span>
            </Link>
          </div>

          {/* Shipping info strip */}
          <div style={{ background: 'var(--accent-gold-light)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--accent-gold-hover)' }}>
            🌍 <strong>We Ship Worldwide</strong> — India · UAE · USA · UK · Canada · Australia & more
          </div>

          {/* FAQs */}
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FAQS.map(faq => (
              // Use stable string ID as key — never array index, never Date.now()
              <div
                key={faq.id}
                style={{ background: 'var(--bg-silk)', borderRadius: '10px', border: '1px solid var(--border-cream)', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                  style={{ width: '100%', padding: '13px 14px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
                  aria-expanded={activeFaq === faq.id}
                >
                  <span>{faq.q}</span>
                  <span style={{ flexShrink: 0, fontSize: '1rem', color: 'var(--accent-gold)' }}>
                    {activeFaq === faq.id ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === faq.id && (
                  <div style={{ padding: '0 14px 13px', fontSize: '0.81rem', color: 'var(--text-muted)', lineHeight: 1.65, borderTop: '1px solid var(--border-light)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <style>{`
        @media (min-width: 768px) {
          button[aria-label="Open support drawer"] {
            bottom: 24px;
            right: 24px;
          }
        }
      `}</style>
    </>
  );
}
