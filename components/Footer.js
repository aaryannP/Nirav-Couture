'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubMsg('✕ Please enter a valid email.');
      return;
    }
    setSubMsg('✓ Subscribed! You will receive VIP drop access.');
    setEmail('');
    setTimeout(() => setSubMsg(''), 5000);
  };

  return (
    <footer className="site-footer-zed">
      <div className="container">
        <div className="footer-zed-grid">
          {/* Column 1: Brand & Tagline */}
          <div className="footer-zed-brand">
            <h3>NIRAV COUTURE</h3>
            <p className="footer-zed-text">
              Engineering ultra-heavyweight luxury streetwear and oversized Men's T-Shirts with bespoke Indian craftsmanship.
            </p>
            <div className="footer-social-row">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="Instagram">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="footer-social-icon" aria-label="WhatsApp">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
              <a href="mailto:support@niravcouture.com" className="footer-social-icon" aria-label="Email">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h4 className="footer-col-title">COLLECTIONS</h4>
            <ul className="footer-col-links">
              <li><Link href="/products?category=oversized">Oversized T-Shirts</Link></li>
              <li><Link href="/products?category=graphic">Vintage Graphic Tees</Link></li>
              <li><Link href="/products?category=luxury">Silk-Cotton Blend</Link></li>
              <li><Link href="/products?category=polo">Luxury Pique Crew</Link></li>
              <li><Link href="/products">All Men's Drops</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Services */}
          <div>
            <h4 className="footer-col-title">CUSTOMER CARE</h4>
            <ul className="footer-col-links">
              <li><Link href="/track-order">Track Your Order 🚚</Link></li>
              <li><Link href="/cart">Cart & Checkout</Link></li>
              <li><Link href="/account">My Account</Link></li>
              <li><Link href="/wishlist">My Wishlist</Link></li>
              <li><a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">Direct WhatsApp Desk</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="footer-col-title">JOIN THE INNER CIRCLE</h4>
            <p className="footer-zed-text" style={{ marginBottom: '14px' }}>
              Subscribe to get exclusive early access to upcoming luxury drops and private VIP discounts.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form-zed">
              <input 
                type="email" 
                placeholder="YOUR EMAIL..." 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="newsletter-input-zed"
                required
              />
              <button type="submit" className="newsletter-btn-zed" aria-label="Subscribe">
                →
              </button>
            </form>
            {subMsg && <p style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '700', marginTop: '8px' }}>{subMsg}</p>}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div>
            © {new Date().getFullYear()} NIRAV COUTURE. All Rights Reserved. Crafted for Nirav Prajapati.
          </div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.75rem', fontWeight: '700' }}>
            <span>🔒 100% SECURE CHECKOUT</span>
            <span>•</span>
            <span>UPI / GPAY</span>
            <span>•</span>
            <span>CARDS</span>
            <span>•</span>
            <span>CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
