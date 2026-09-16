'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store-context';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart, clearCart } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'Cash on Delivery (COD)'
  });

  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const freeShippingThreshold = 1999;
  const shippingFee = subtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'NIRAV10') {
      const discount = Math.round(subtotal * 0.10);
      setAppliedDiscount(discount);
      setCouponMsg('✓ Coupon NIRAV10 Applied (10% OFF)');
    } else if (code === 'FIRST500') {
      const discount = Math.min(500, subtotal);
      setAppliedDiscount(discount);
      setCouponMsg('✓ Coupon FIRST500 Applied (₹500 OFF)');
    } else {
      setAppliedDiscount(0);
      setCouponMsg('✕ Invalid Coupon Code');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const orderRef = `NIRAV-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const finalOrderObj = {
      id: orderRef,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
      totalAmount: subtotal,
      discountAmount: appliedDiscount,
      finalTotal: finalTotal,
      paymentMethod: formData.paymentMethod,
      transactionId: null,
      status: 'CONFIRMED (COD / Direct Order)',
      date: new Date().toLocaleDateString('en-IN'),
      items: cart
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrderObj)
      });
    } catch (err) {
      console.error('Order placement error:', err);
    }

    setPlacedOrder(finalOrderObj);
    setIsCheckoutOpen(false);
    clearCart();
    setIsSubmitting(false);
  };

  const handleWhatsAppShare = () => {
    if (!placedOrder) return;
    const targetWhatsAppNumber = process.env.NEXT_PUBLIC_STORE_WHATSAPP || placedOrder.phone.replace(/\D/g, '') || '910000000000';

    const text = encodeURIComponent(
      `Hello NIRAV COUTURE! I just placed an order on your website.\n\n` +
      `*Order Ref:* ${placedOrder.id}\n` +
      `*Customer:* ${placedOrder.name} (${placedOrder.phone})\n` +
      `*Total Amount:* ₹${placedOrder.finalTotal.toLocaleString('en-IN')}\n` +
      `*Payment Mode:* ${placedOrder.paymentMethod}\n` +
      `*Address:* ${placedOrder.address}\n\n` +
      `Please confirm shipping update!`
    );
    window.open(`https://wa.me/${targetWhatsAppNumber}?text=${text}`, '_blank');
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', marginBottom: '32px' }}>
          Shopping Bag ({cart.length} items)
        </h1>

        {cart.length === 0 && !placedOrder ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-cream)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '12px' }}>Your Shopping Bag is Empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add some luxury Men's T-Shirts to get started.</p>
            <Link href="/products" className="btn-primary btn-gold">
              Browse Men's T-Shirts
            </Link>
          </div>
        ) : (
          !placedOrder && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '36px' }}>
              {/* Itemized List */}
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-cream)' }}>
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '20px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                    <img src={item.frontImage} alt={item.title} style={{ width: '90px', height: '115px', objectFit: 'cover', borderRadius: '8px', background: '#F4EFEA' }} />
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Size: <strong>{item.selectedSize}</strong> | Fit: Oversized
                      </p>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateCartQty(item.id, item.selectedSize, -1)}>-</button>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', padding: '0 8px' }}>{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateCartQty(item.id, item.selectedSize, 1)}>+</button>
                        <button onClick={() => removeFromCart(item.id, item.selectedSize)} style={{ marginLeft: 'auto', color: '#C93B2B', fontSize: '0.8rem', fontWeight: '600' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary & Checkout Trigger */}
              <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-cream)', height: 'fit-content' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '20px', borderBottom: '1px solid var(--border-cream)', paddingBottom: '12px' }}>
                  Order Summary
                </h3>

                {/* Coupon Form */}
                <form onSubmit={handleCouponSubmit} style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    Have a Promo Code?
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. NIRAV10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-cream)', textTransform: 'uppercase', fontSize: '0.85rem' }}
                    />
                    <button type="submit" className="btn-outline" style={{ padding: '10px 16px' }}>APPLY</button>
                  </div>
                  {couponMsg && <p style={{ fontSize: '0.8rem', marginTop: '6px', color: appliedDiscount > 0 ? '#10B981' : '#C93B2B', fontWeight: '600' }}>{couponMsg}</p>}
                </form>

                <div className="summary-row"><span>Items Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {appliedDiscount > 0 && <div className="summary-row" style={{ color: '#10B981' }}><span>Coupon Discount</span><span>-₹{appliedDiscount.toLocaleString('en-IN')}</span></div>}
                <div className="summary-row"><span>Express Delivery</span><span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span></div>
                <div className="summary-row summary-total"><span>Total Payable</span><span>₹{finalTotal.toLocaleString('en-IN')}</span></div>

                <button 
                  className="btn-primary btn-gold" 
                  style={{ width: '100%', padding: '16px', fontSize: '1rem', textTransform: 'uppercase', marginTop: '24px' }}
                  onClick={() => { setIsCheckoutOpen(true); setCheckoutStep(1); }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>
          )
        )}

        {/* Simple Direct Checkout Modal */}
        {isCheckoutOpen && !placedOrder && (
          <div className="modal-overlay active" onClick={() => setIsCheckoutOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
              <button className="close-btn" onClick={() => setIsCheckoutOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '8px' }}>
                {checkoutStep === 1 ? "Shipping Address" : "Confirm Order & Payment"}
              </h2>

              <form onSubmit={checkoutStep === 1 ? (e) => { e.preventDefault(); setCheckoutStep(2); } : handlePlaceOrder}>
                {checkoutStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Full Name *</label>
                      <input type="text" required placeholder="Vikram Sharma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Email *</label>
                        <input type="email" required placeholder="vikram@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Phone Number *</label>
                        <input type="tel" required placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Street Address *</label>
                      <input type="text" required placeholder="Flat/House No., Building Name, Street" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>City *</label>
                        <input type="text" required placeholder="Mumbai / Ahmedabad" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Pincode *</label>
                        <input type="text" required placeholder="400050" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary btn-gold" style={{ marginTop: '12px', padding: '14px' }}>
                      Continue to Payment Mode →
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Delivering to: <strong>{formData.name}</strong>, {formData.city} ({formData.pincode})
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {[
                        { id: 'Cash on Delivery (COD)', label: 'Cash on Delivery (COD)', desc: 'Pay with Cash or UPI when the package arrives at your doorstep', icon: '💵' },
                        { id: 'Pay on Delivery (UPI / QR at Doorstep)', label: 'Pay on Delivery (UPI / PhonePe at Doorstep)', desc: 'Pay delivery agent directly via UPI QR scan on delivery', icon: '📱' },
                        { id: 'Direct Order (Contact & Pay to Store)', label: 'Direct Store Order (Pay Later / Store Confirmation)', desc: 'Store team will contact you to confirm and arrange dispatch', icon: '📦' }
                      ].map(method => (
                        <label key={method.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px', borderRadius: '10px', border: formData.paymentMethod === method.id ? '2px solid var(--accent-gold)' : '1px solid var(--border-cream)', background: formData.paymentMethod === method.id ? 'var(--accent-gold-light)' : 'transparent', cursor: 'pointer' }}>
                          <input type="radio" name="payment" checked={formData.paymentMethod === method.id} onChange={() => setFormData({...formData, paymentMethod: method.id})} style={{ marginTop: '4px' }} />
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                              <strong style={{ fontSize: '0.95rem' }}>{method.label}</strong>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div style={{ background: 'var(--bg-silk)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-cream)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Amount to Pay:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-gold)' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="button" className="btn-outline" onClick={() => setCheckoutStep(1)} disabled={isSubmitting}>
                        ← Back
                      </button>
                      <button type="submit" className="btn-primary btn-gold" style={{ flexGrow: 1, padding: '14px' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Placing Order...' : `Place Order • ₹${finalTotal.toLocaleString('en-IN')} ✓`}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Printable Order Confirmation & Invoice Modal with WhatsApp Sharing */}
        {placedOrder && (
          <div className="modal-overlay active">
            <div className="modal-container" style={{ maxWidth: '640px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>✓</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '4px' }}>Order Placed Successfully!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Thank you for shopping with NIRAV COUTURE. Your order reference is <strong>{placedOrder.id}</strong>.
              </p>

              <div style={{ background: 'var(--bg-silk)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-cream)', textAlign: 'left', marginBottom: '24px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-cream)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span><strong>Order Ref:</strong> {placedOrder.id}</span>
                  <span><strong>Date:</strong> {placedOrder.date}</span>
                </div>
                <p style={{ marginBottom: '8px' }}><strong>Customer:</strong> {placedOrder.name} ({placedOrder.phone})</p>
                <p style={{ marginBottom: '8px' }}><strong>Shipping Address:</strong> {placedOrder.address}</p>
                <p style={{ marginBottom: '8px' }}><strong>Payment Mode:</strong> {placedOrder.paymentMethod}</p>
                <p style={{ marginBottom: '12px', color: '#10B981', fontWeight: '700' }}>
                  <strong>Status:</strong> {placedOrder.status}
                </p>
                
                <h4 style={{ fontFamily: 'var(--font-serif)', marginTop: '16px', marginBottom: '8px' }}>Items Ordered:</h4>
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.title} ({item.selectedSize}) x {item.qty}</span>
                    <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                
                <div style={{ borderTop: '1px solid var(--border-cream)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem' }}>
                  <span>Total Amount</span>
                  <span>₹{placedOrder.finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleWhatsAppShare}
                  style={{ background: '#25D366', color: '#FFFFFF', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  💬 Share Order on WhatsApp
                </button>
                <Link href="/track-order" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🗺️ Track Order
                </Link>
                <button className="btn-outline" onClick={() => window.print()}>🖨 Print Invoice</button>
                <Link href="/products" className="btn-primary btn-gold">Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
