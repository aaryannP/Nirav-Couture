'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store-context';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, clearCart } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', pincode: '',
    paymentMethod: 'Cash on Delivery (COD)'
  });

  // Recalculate shipping AFTER discount (fix: discount applies before threshold check)
  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
  const freeShippingThreshold = 1999;
  const discountedSubtotal = Math.max(0, subtotal - appliedDiscount);
  const shippingFee = discountedSubtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 99;
  const finalTotal = discountedSubtotal + shippingFee;

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'NIRAV10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMsg('✓ Coupon NIRAV10 Applied — 10% OFF');
    } else if (code === 'FIRST500') {
      const discount = Math.min(500, subtotal);
      setAppliedDiscount(discount);
      setCouponMsg('✓ Coupon FIRST500 Applied — ₹500 OFF');
    } else {
      setAppliedDiscount(0);
      setCouponMsg('✕ Invalid coupon code. Try NIRAV10 or FIRST500');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError('');

    const orderPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      totalAmount: subtotal,
      discountAmount: appliedDiscount,
      finalTotal: finalTotal,
      paymentMethod: formData.paymentMethod,
      items: cart
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (!data.success) {
        setOrderError(data.error || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Use the SERVER-generated order ID, not a client-generated one
      setPlacedOrder(data.data);
      setIsCheckoutOpen(false);
      clearCart(); // only clear on confirmed success
    } catch (err) {
      setOrderError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const handleWhatsAppShare = () => {
    if (!placedOrder) return;
    const storeNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '917990629029';
    const text = encodeURIComponent(
      `Hello NIRAV COUTURE! I just placed an order.\n\n` +
      `*Order Ref:* ${placedOrder.id}\n` +
      `*Customer:* ${placedOrder.customerName} (${placedOrder.phone})\n` +
      `*Total:* ₹${placedOrder.finalTotal?.toLocaleString('en-IN')}\n` +
      `*Payment:* ${placedOrder.paymentMethod}\n` +
      `*Address:* ${placedOrder.shippingAddress}\n\nPlease confirm shipping!`
    );
    window.open(`https://wa.me/${storeNumber}?text=${text}`, '_blank');
  };

  const handleCloseConfirmation = () => {
    setPlacedOrder(null);
  };

  return (
    <div className="page-padding">
      <div className="container">
        <h1 className="page-title">Shopping Bag ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h1>

        {cart.length === 0 && !placedOrder ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h2 className="empty-title">Your Shopping Bag is Empty</h2>
            <p className="empty-desc">Add some luxury Men's T-Shirts to get started.</p>
            <Link href="/products" className="btn-primary btn-gold">Browse Men's T-Shirts →</Link>
          </div>
        ) : !placedOrder && (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-panel">
              {cart.map(item => (
                <div key={`${item.id}-${item.selectedSize}`} className="cart-item-row">
                  <img src={item.frontImage} alt={item.title} className="cart-item-img-lg" />
                  <div className="cart-item-body">
                    <h3 className="cart-item-name">{item.title}</h3>
                    <p className="cart-item-meta">
                      Size: <strong>{item.selectedSize}</strong> · Color: {item.selectedColor}
                    </p>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateCartQty(item.id, item.selectedSize, -1)}>−</button>
                      <span className="qty-value">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateCartQty(item.id, item.selectedSize, 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id, item.selectedSize)}>Remove</button>
                    </div>
                  </div>
                  <div className="cart-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="order-summary-panel">
              <h3 className="summary-heading">Order Summary</h3>

              {/* Coupon */}
              <form onSubmit={handleCouponSubmit} className="coupon-form">
                <label className="field-label">Have a Promo Code?</label>
                <div className="coupon-row">
                  <input
                    type="text"
                    placeholder="e.g. NIRAV10"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="input-field coupon-input"
                  />
                  <button type="submit" className="btn-outline" style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>APPLY</button>
                </div>
                {couponMsg && (
                  <p className={`coupon-msg ${appliedDiscount > 0 ? 'success' : 'error'}`}>{couponMsg}</p>
                )}
              </form>

              <div className="summary-row"><span>Items Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              {appliedDiscount > 0 && (
                <div className="summary-row discount-row">
                  <span>Coupon Discount</span><span>−₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Express Delivery</span>
                <span>{shippingFee === 0 ? <span className="free-badge">FREE</span> : `₹${shippingFee}`}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total Payable</span><span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                className="btn-primary btn-gold"
                style={{ width: '100%', padding: '16px', fontSize: '1rem', textTransform: 'uppercase', marginTop: '24px' }}
                onClick={() => { setIsCheckoutOpen(true); setCheckoutStep(1); }}
              >
                Proceed to Checkout →
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                🔒 Secure checkout · COD available across India
              </p>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {isCheckoutOpen && !placedOrder && (
          <div className="modal-overlay active" onClick={() => setIsCheckoutOpen(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <button className="close-btn" onClick={() => setIsCheckoutOpen(false)}>✕</button>

              <h2 className="modal-title">
                {checkoutStep === 1 ? '📍 Shipping Address' : '💳 Payment Method'}
              </h2>
              <p className="modal-step-indicator">Step {checkoutStep} of 2</p>

              {orderError && (
                <div className="error-banner">{orderError}</div>
              )}

              <form onSubmit={checkoutStep === 1 ? (e) => { e.preventDefault(); setCheckoutStep(2); } : handlePlaceOrder}>
                {checkoutStep === 1 ? (
                  <div className="form-stack">
                    <div className="form-group">
                      <label className="field-label">Full Name *</label>
                      <input type="text" required placeholder="Vikram Sharma" value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="field-label">Email *</label>
                        <input type="email" required placeholder="vikram@example.com" value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" />
                      </div>
                      <div className="form-group">
                        <label className="field-label">Phone *</label>
                        <input type="tel" required placeholder="+91 98765 43210" value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="field-label">Street Address *</label>
                      <input type="text" required placeholder="Flat/House No., Building, Street" value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })} className="input-field" />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="field-label">City *</label>
                        <input type="text" required placeholder="Mumbai" value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })} className="input-field" />
                      </div>
                      <div className="form-group">
                        <label className="field-label">Pincode *</label>
                        <input type="text" required placeholder="400050" maxLength="6" value={formData.pincode}
                          onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="input-field" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary btn-gold" style={{ padding: '14px', marginTop: '8px' }}>
                      Continue to Payment →
                    </button>
                  </div>
                ) : (
                  <div className="form-stack">
                    <p className="delivery-summary">
                      Delivering to: <strong>{formData.name}</strong>, {formData.city} – {formData.pincode}
                    </p>

                    <div className="payment-options">
                      {[
                        { id: 'Cash on Delivery (COD)', label: 'Cash on Delivery (COD)', desc: 'Pay cash when the package arrives', icon: '💵' },
                        { id: 'Pay on Delivery (UPI / QR at Doorstep)', label: 'UPI / PhonePe at Doorstep', desc: 'Scan QR and pay delivery agent via UPI', icon: '📱' },
                        { id: 'Direct Order (Contact & Pay to Store)', label: 'Direct Store Order', desc: 'Store team will contact you to confirm dispatch', icon: '📦' }
                      ].map(method => (
                        <label key={method.id} className={`payment-option ${formData.paymentMethod === method.id ? 'selected' : ''}`}>
                          <input type="radio" name="payment" checked={formData.paymentMethod === method.id}
                            onChange={() => setFormData({ ...formData, paymentMethod: method.id })} />
                          <span className="payment-icon">{method.icon}</span>
                          <div>
                            <strong className="payment-label">{method.label}</strong>
                            <p className="payment-desc">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="total-confirm-box">
                      <span>Total to Pay:</span>
                      <strong className="total-confirm-amount">₹{finalTotal.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="form-grid-2">
                      <button type="button" className="btn-outline" onClick={() => setCheckoutStep(1)} disabled={isSubmitting}>
                        ← Back
                      </button>
                      <button type="submit" className="btn-primary btn-gold" style={{ padding: '14px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Placing Order...' : `Confirm Order ✓`}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Order Confirmation Modal — now has a close button */}
        {placedOrder && (
          <div className="modal-overlay active">
            <div className="modal-container" style={{ maxWidth: '640px', textAlign: 'center' }}>
              {/* Close button — was missing before */}
              <button className="close-btn" onClick={handleCloseConfirmation} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

              <div className="order-success-icon">✓</div>
              <h2 className="modal-title">Order Placed Successfully!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Your order reference is <strong>{placedOrder.id}</strong>. Save this for tracking.
              </p>

              <div className="order-summary-card">
                <div className="order-summary-row border-bottom">
                  <span><strong>Order Ref:</strong> {placedOrder.id}</span>
                  <span><strong>Date:</strong> {placedOrder.date}</span>
                </div>
                <p><strong>Customer:</strong> {placedOrder.customerName} ({placedOrder.phone})</p>
                <p><strong>Address:</strong> {placedOrder.shippingAddress}</p>
                <p><strong>Payment:</strong> {placedOrder.paymentMethod}</p>
                <p className="status-confirmed"><strong>Status:</strong> {placedOrder.status}</p>

                <h4 className="items-heading">Items Ordered:</h4>
                {(placedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.title} ({item.selectedSize}) × {item.qty}</span>
                    <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="order-total-row">
                  <span>Total Amount</span>
                  <span>₹{placedOrder.finalTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  onClick={handleWhatsAppShare}
                  className="btn-whatsapp"
                >
                  💬 Share on WhatsApp
                </button>
                <Link href={`/track-order?id=${placedOrder.id}`} className="btn-outline">
                  🚚 Track Order
                </Link>
                <button className="btn-outline" onClick={() => window.print()}>🖨 Print Invoice</button>
                <Link href="/products" className="btn-primary btn-gold" onClick={handleCloseConfirmation}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
