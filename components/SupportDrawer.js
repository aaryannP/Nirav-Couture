'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SupportDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'What is the delivery timeline for my order?',
      a: 'Orders are dispatched within 24 hours from our Mumbai hub. Metro cities receive delivery in 2-3 business days, while rest of India takes 3-5 days.'
    },
    {
      q: 'What is the return & exchange policy?',
      a: 'We offer a 7-day hassle-free size exchange and return policy. If the fit is not perfect, we will collect it from your doorstep at zero cost!'
    },
    {
      q: 'How do I care for 240 GSM Bio-Washed Heavy Cotton?',
      a: 'Machine wash cold inside out with mild detergent. Line dry in shade. Avoid ironing directly on graphic prints.'
    },
    {
      q: 'Is Cash on Delivery (COD) available across India?',
      a: 'Yes, 100% Cash on Delivery (COD) is available for all pin codes across India with zero extra COD fees!'
    }
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 400,
          background: 'var(--accent-gold)',
          color: '#000000',
          padding: '12px 20px',
          borderRadius: '999px',
          fontWeight: '700',
          fontSize: '0.88rem',
          boxShadow: '0 8px 24px rgba(212,175,55,0.4)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
      >
        <span>💬</span>
        <span>Need Help? NIRAV Support</span>
      </button>

      {/* Slide-Out Support Drawer */}
      <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
        <div className={`cart-drawer ${isOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
          <div className="drawer-header">
            <div>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
                CUSTOMER CONCIERGE
              </span>
              <h3 className="drawer-title" style={{ marginTop: '2px' }}>NIRAV Support & Care</h3>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="drawer-body">
            {/* Quick Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <a 
                href="https://wa.me/919876543210?text=Hi%20NIRAV%20Support!%20I%20need%20help%20with%20my%20order." 
                target="_blank" 
                style={{ background: '#25D366', color: '#FFFFFF', padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ fontSize: '1.4rem' }}>💬</span>
                <span>WhatsApp Support</span>
              </a>

              <Link 
                href="/track-order"
                onClick={() => setIsOpen(false)}
                style={{ background: 'var(--bg-silk)', color: 'var(--text-primary)', padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', border: '1px solid var(--border-cream)' }}
              >
                <span style={{ fontSize: '1.4rem' }}>🚚</span>
                <span>Track Package</span>
              </Link>
            </div>

            {/* FAQs Accordion */}
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
              Frequently Asked Questions (FAQs)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ background: 'var(--bg-silk)', borderRadius: '10px', border: '1px solid var(--border-cream)', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '14px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>{faq.q}</span>
                    <span>{activeFaq === idx ? '−' : '+'}</span>
                  </button>
                  {activeFaq === idx && (
                    <div style={{ padding: '0 16px 14px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px border var(--border-light)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
