'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../lib/store-context';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateCartQty, removeFromCart } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
  const freeShippingThreshold = 1499;
  const discountedSubtotal = Math.max(0, subtotal - appliedDiscount);
  const shippingFee = discountedSubtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 99;
  const finalTotal = discountedSubtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - discountedSubtotal);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'NIRAV10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMsg('✓ NIRAV10 Applied (10% OFF)');
    } else if (code === 'FIRST500') {
      const discount = Math.min(500, subtotal);
      setAppliedDiscount(discount);
      setCouponMsg('✓ FIRST500 Applied (₹500 OFF)');
    } else {
      setAppliedDiscount(0);
      setCouponMsg('✕ Invalid Coupon Code');
    }
  };

  const totalItemCount = cart.reduce((t, i) => t + i.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`cart-drawer-backdrop ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-in Shopping Panel (Zedsonwear Style) */}
      <aside className={`cart-drawer-panel ${isCartOpen ? 'active' : ''}`} aria-label="Shopping Bag">
        {/* Header */}
        <div className="cart-panel-header">
          <h2 className="cart-panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>SHOPPING BAG ({totalItemCount})</span>
          </h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close Shopping Bag">
            ✕
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="shipping-meter-box">
          {remainingForFreeShipping > 0 ? (
            <>
              <div>Add <strong>₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong>FREE EXPRESS SHIPPING</strong></div>
              <div className="meter-track">
                <div 
                  className="meter-fill"
                  style={{ width: `${Math.min(100, (discountedSubtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </>
          ) : (
            <div style={{ color: '#10B981', fontWeight: '800' }}>
              CONGRATULATIONS! YOU UNLOCKED FREE EXPRESS SHIPPING
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="cart-panel-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', opacity: 0.3 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000', marginBottom: '8px' }}>
                Your Bag is Empty
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
                Explore our luxury oversized Men's T-Shirts drop.
              </p>
              <Link 
                href="/products" 
                className="btn-zed-solid"
                onClick={() => setIsCartOpen(false)}
              >
                EXPLORE PRODUCTS
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.selectedSize}`} className="panel-item-card">
                <img src={item.frontImage} alt={item.title} className="panel-item-img" />
                
                <div className="panel-item-info">
                  <h4 className="panel-item-title">{item.title}</h4>
                  <div className="panel-item-meta">
                    SIZE: <strong style={{ color: '#000' }}>{item.selectedSize}</strong> • {item.selectedColor || 'Heavyweight'}
                  </div>
                  <div className="panel-item-price">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </div>

                  <div className="panel-qty-group">
                    <button 
                      className="panel-qty-btn" 
                      onClick={() => updateCartQty(item.id, item.selectedSize, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="panel-qty-count">{item.qty}</span>
                    <button 
                      className="panel-qty-btn" 
                      onClick={() => updateCartQty(item.id, item.selectedSize, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  className="panel-item-remove"
                  onClick={() => removeFromCart(item.id, item.selectedSize)}
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="cart-panel-footer">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="PROMO CODE (e.g. NIRAV10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '600' }}
              />
              <button 
                type="submit" 
                style={{ background: '#000', color: '#fff', padding: '0 16px', fontWeight: '800', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)', letterSpacing: '0.08em' }}
              >
                APPLY
              </button>
            </form>
            {couponMsg && (
              <p style={{ fontSize: '0.78rem', color: appliedDiscount > 0 ? '#10B981' : '#E8363C', fontWeight: '700', marginTop: '-8px', marginBottom: '12px' }}>
                {couponMsg}
              </p>
            )}

            <div className="panel-subtotal-row">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>SUBTOTAL</span>
              <span>₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            <Link 
              href="/cart"
              className="btn-zed-solid"
              onClick={() => setIsCartOpen(false)}
            >
              CHECKOUT NOW →
            </Link>

            <Link 
              href="/cart"
              className="btn-zed-outline"
              onClick={() => setIsCartOpen(false)}
            >
              VIEW FULL BAG
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
