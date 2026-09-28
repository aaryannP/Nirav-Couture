'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubMsg('Subscribed for exclusive drops');
    setEmail('');
    setTimeout(() => setSubMsg(''), 4000);
  };

  return (
    <footer className="site-footer-zed" style={{ marginTop: '60px', padding: '50px 0 30px' }}>
      <div className="container">
        <div className="footer-zed-grid" style={{ marginBottom: '36px' }}>
          {/* Brand Info */}
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
              NIRAV COUTURE
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Minimalist Heavyweight Streetwear. Designed in India.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a 
                href="https://wa.me/917990629029" 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-icon" 
                aria-label="WhatsApp"
                title="WhatsApp Support"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-icon" 
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="footer-col-title">SHOP</h4>
            <ul className="footer-col-links">
              <li><Link href="/products?category=oversized">Oversized T-Shirts</Link></li>
              <li><Link href="/products?category=graphic">Vintage Graphics</Link></li>
              <li><Link href="/products?category=luxury">Silk Blend Tees</Link></li>
              <li><Link href="/products">All Products</Link></li>
            </ul>
          </div>

          {/* Quick Support & WhatsApp */}
          <div>
            <h4 className="footer-col-title">SUPPORT</h4>
            <ul className="footer-col-links">
              <li><Link href="/track-order">Track Order</Link></li>
              <li>
                <a href="https://wa.me/917990629029" target="_blank" rel="noreferrer" style={{ fontWeight: '700', color: '#000' }}>
                  WhatsApp: +91 79906 29029
                </a>
              </li>
              <li><Link href="/cart">Shopping Bag</Link></li>
              <li><Link href="/account">My Account</Link></li>
            </ul>
          </div>

          {/* VIP Drop Newsletter */}
          <div>
            <h4 className="footer-col-title">NEWSLETTER</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Subscribe for private drop notifications.
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
            {subMsg && <p style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '700', marginTop: '6px' }}>{subMsg}</p>}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar" style={{ paddingTop: '20px' }}>
          <div>
            © {new Date().getFullYear()} NIRAV COUTURE. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: '700', color: '#777' }}>
            <span>UPI</span>
            <span>•</span>
            <span>GPAY / PHONEPE</span>
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
