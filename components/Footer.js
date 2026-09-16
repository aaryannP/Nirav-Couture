import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2 className="footer-brand">NIRAV COUTURE</h2>
            <p className="footer-text">
              Redefining luxury urban fashion with heavyweight organic cottons, bespoke fits, and timeless craftsmanship. Designed in India.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FAF7F2', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Collections</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#A09A8E' }}>
              <li><Link href="/products?category=oversized">Oversized T-Shirts</Link></li>
              <li><Link href="/products?category=graphic">Vintage Graphic Tees</Link></li>
              <li><Link href="/products?category=luxury">Silk-Cotton Blend</Link></li>
              <li><Link href="/products?category=polo">Organic Pique Polos</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FAF7F2', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#A09A8E' }}>
              <li><Link href="/cart">Cart & Checkout</Link></li>
              <li><Link href="/account">Order Tracking</Link></li>
              <li><a href="#size-guide">Size Guide & Fit</a></li>
              <li><a href="#support">7-Day Express Returns</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FAF7F2', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Inner Circle</h4>
            <p style={{ color: '#A09A8E', fontSize: '0.85rem', marginBottom: '12px' }}>
              Subscribe to get exclusive early access to drop announcements and VIP discounts.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                placeholder="Enter your email..." 
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: '6px', 
                  border: '1px solid #333', 
                  background: '#111', 
                  color: '#FFF', 
                  fontSize: '0.85rem',
                  flexGrow: 1
                }} 
              />
              <button className="btn-primary btn-gold" style={{ padding: '10px 16px', fontSize: '0.8rem' }}>JOIN</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #282520', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#888' }}>
          <p>© {new Date().getFullYear()} NIRAV COUTURE. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>100% Cash on Delivery</span>
            <span>Express Delivery</span>
            <span>Authentic Fabric Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
