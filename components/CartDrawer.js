'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../lib/store-context';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateCartQty, removeFromCart } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const freeShippingThreshold = 1999;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'NIRAV10') {
      const discount = Math.round(subtotal * 0.10);
      setAppliedDiscount(discount);
      setCouponMessage('✓ Coupon NIRAV10 Applied (10% OFF)');
    } else if (code === 'FIRST500') {
      const discount = Math.min(500, subtotal);
      setAppliedDiscount(discount);
      setCouponMessage('✓ Coupon FIRST500 Applied (₹500 OFF)');
    } else {
      setAppliedDiscount(0);
      setCouponMessage('✕ Invalid coupon code. Try NIRAV10');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`drawer-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Drawer */}
      <aside className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Shopping Bag ({cart.length})</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        {/* Free Express Shipping Meter Bar */}
        <div className="free-shipping-bar">
          {remainingForFreeShipping > 0 ? (
            <span>Add <strong>₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE Express Shipping!</span>
          ) : (
            <span style={{ color: '#10B981' }}>🎉 Congratulations! You unlocked FREE Express Shipping!</span>
          )}
        </div>

        {/* Cart Item List */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block', color: '#D4AF37' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
              </svg>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#1A1A1A', marginBottom: '8px' }}>Your Shopping Bag is empty</p>
              <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>Discover our luxury Men's T-Shirts collection.</p>
              <Link href="/products" className="btn-primary" onClick={() => setIsCartOpen(false)}>
                Explore Collection
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
                <img src={item.frontImage} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.title}</h4>
                  <div className="cart-item-meta">
                    <span>Size: <strong>{item.selectedSize}</strong></span> | <span>Color: {item.selectedColor}</span>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '8px' }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateCartQty(item.id, item.selectedSize, -1)}>-</button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateCartQty(item.id, item.selectedSize, 1)}>+</button>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      style={{ marginLeft: 'auto', color: '#C93B2B', fontSize: '0.75rem', fontWeight: '600' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Applicator */}
            <form onSubmit={handleApplyCoupon} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Coupon code (e.g. NIRAV10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-cream)',
                    fontSize: '0.82rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button type="submit" className="btn-outline" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>APPLY</button>
              </div>
              {couponMessage && (
                <p style={{ fontSize: '0.75rem', marginTop: '4px', color: appliedDiscount > 0 ? '#10B981' : '#C93B2B', fontWeight: '600' }}>
                  {couponMessage}
                </p>
              )}
            </form>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="summary-row" style={{ color: '#10B981' }}>
                <span>Discount</span>
                <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{(finalTotal + (subtotal >= freeShippingThreshold ? 0 : 99)).toLocaleString('en-IN')}</span>
            </div>

            <Link 
              href="/cart" 
              className="btn-primary btn-gold" 
              style={{ width: '100%', marginTop: '16px', textTransform: 'uppercase' }}
              onClick={() => setIsCartOpen(false)}
            >
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
