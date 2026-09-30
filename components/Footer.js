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

          {/* Policies & Compliance (Mandatory for Bank & Payment Gateway) */}
          <div>
            <h4 className="footer-col-title">POLICIES & LEGAL</h4>
            <ul className="footer-col-links">
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/returns-policy">Return & Refund Policy</Link></li>
              <li><Link href="/shipping-policy">Shipping & Delivery Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* VIP Drop Newsletter & Support */}
          <div>
            <h4 className="footer-col-title">NEWSLETTER & SUPPORT</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Subscribe for private drop notifications.
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form-zed">
              <input 
                type="email" 
                id="footer-newsletter-email"
                name="newsletter_email"
                aria-label="Newsletter Email Address"
                autoComplete="email"
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
            <div style={{ marginTop: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <div><strong>Support:</strong> <a href="tel:+917990629029">+91 79906 29029</a></div>
              <div><strong>Email:</strong> <a href="mailto:nirav@niravcouture.com">nirav@niravcouture.com</a></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar" style={{ paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            © {new Date().getFullYear()} NIRAV COUTURE. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.76rem', fontWeight: '600' }}>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/returns-policy">Refund & Cancellation</Link>
            <Link href="/shipping-policy">Shipping Policy</Link>
            <Link href="/contact">Contact Us</Link>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#777' }}>
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
