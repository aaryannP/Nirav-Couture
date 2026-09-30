'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../lib/store-context';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useStore();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedImage, setSelectedImage] = useState('');
  const [isHoveringMain, setIsHoveringMain] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Pincode checker
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Accordion state
  const [activeAcc, setActiveAcc] = useState('desc');

  // Customer Reviews
  const [reviews, setReviews] = useState([
    { id: 1, name: 'Aman V.', rating: 5, date: '12 Aug 2026', comment: 'The 240 GSM heavy cotton feel is unreal. Absolute top tier oversized drop.' },
    { id: 2, name: 'Rohan M.', rating: 5, date: '08 Aug 2026', comment: 'Drop-shoulder silhouette is perfect. Looks exactly like high-end streetwear.' },
    { id: 3, name: 'Karan S.', rating: 4, date: '02 Aug 2026', comment: 'Heavy fabric, great drape, fast delivery to Mumbai in 2 days.' }
  ]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const found = data.data.find(p => p.slug === slug);
          if (!found) {
            setNotFound(true);
            return;
          }
          setProduct(found);
          setSelectedImage(found.frontImage);
          setSelectedSize(found.sizes?.[0] || 'L');
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '12px' }}>
          Product Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/products" className="btn-zed-solid" style={{ display: 'inline-block', width: 'auto', padding: '14px 32px' }}>
          ← Back to All Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ height: '500px', background: '#F4F4F5', borderRadius: '12px', maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF' }}>Loading Product...</span>
        </div>
      </div>
    );
  }

  const isSaved = wishlist.includes(product.id);
  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, 1);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, 1);
    router.push('/cart');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({ success: false, msg: 'Enter a valid 6-digit Pincode' });
      return;
    }
    const isExpress = ['400', '380', '110', '560'].some(prefix => pincode.startsWith(prefix));
    setPincodeStatus({
      success: true,
      msg: isExpress ? 'Express Delivery in 24–48 Hours • Cash on Delivery Available' : 'Standard Delivery in 3–5 Days • Cash on Delivery Available'
    });
  };

  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setReviews([
      { id: Date.now(), name: newReview.name, rating: newReview.rating, date: 'Just now', comment: newReview.comment },
      ...reviews
    ]);
    setShowReviewModal(false);
    setNewReview({ name: '', rating: 5, comment: '' });
  };

  const galleryImages = [
    product.frontImage,
    product.backImage || product.frontImage,
    ...(product.images || [])
  ].filter(Boolean);

  return (
    <div style={{ padding: '20px 0 80px' }}>
      <div className="container">
        {/* Breadcrumbs (Zedsonwear Style) */}
        <nav className="zed-breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Men's T-Shirts</Link>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: '800' }}>{product.title}</span>
        </nav>

        {/* Product Detail Two-Column Layout */}
        <div className="product-detail-layout">
          {/* Left Column: Sticky Media Gallery */}
          <div className="zed-gallery-wrap">
            <div
              className="zed-gallery-main"
              onMouseEnter={() => setIsHoveringMain(true)}
              onMouseLeave={() => setIsHoveringMain(false)}
            >
              <img
                src={isHoveringMain && (selectedImage === product.frontImage || !selectedImage) && product.backImage ? product.backImage : (selectedImage || product.frontImage)}
                alt={product.title}
              />
              
              {/* Wishlist Button Overlay */}
              <button
                className="card-wish-btn"
                style={{ top: '16px', right: '16px', width: '40px', height: '40px' }}
                onClick={() => toggleWishlist(product.id)}
                title="Save to Wishlist"
              >
                <svg width="20" height="20" fill={isSaved ? "#E8363C" : "none"} stroke={isSaved ? "#E8363C" : "#000000"} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Thumbnail Row */}
            <div className="zed-gallery-thumbs">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`zed-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Sticky Summary & Checkout Actions */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {product.fitType || 'HEAVYWEIGHT OVERSIZED FIT'} • 240 GSM
            </div>

            <h1 className="zed-summary-title">{product.title}</h1>

            <div className="zed-summary-price">
              <span className="zed-price-now">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="zed-price-was">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {discountPct > 0 && (
                <span className="zed-discount-pill">SAVE {discountPct}%</span>
              )}
            </div>

            <p className="zed-short-desc">
              {product.description || 'Clean, high-density drop-shoulder streetwear t-shirt crafted from 100% bio-washed organic cotton. Built for all-day comfort with heavy boxy drape.'}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div className="zed-size-header">
                <span className="zed-size-label">Select Size: <strong style={{ color: '#000' }}>{selectedSize}</strong></span>
                <button 
                  className="zed-size-guide-btn"
                  onClick={() => setShowSizeGuide(true)}
                >
                  Size Guide
                </button>
              </div>

              <div className="zed-sizes-row">
                {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                  <button
                    key={size}
                    className={`zed-size-box ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Buttons (Add to Cart & Buy Now & WhatsApp) */}
            <div className="zed-actions-group">
              <button 
                className="btn-zed-solid"
                onClick={handleAddToCart}
              >
                ADD TO BAG
              </button>
              
              <button 
                className="btn-zed-outline"
                onClick={handleBuyNow}
              >
                BUY IT NOW
              </button>

              <a 
                href={`https://wa.me/917990629029?text=${encodeURIComponent(`Hi NIRAV COUTURE! I want to order / check size for: ${product.title} (Size: ${selectedSize})`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderRadius: 'var(--radius-xs)',
                  marginTop: '4px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>ORDER VIA WHATSAPP (79906 29029)</span>
              </a>
            </div>

            {/* Live Pincode Delivery Checker */}
            <div style={{ background: '#F8F9FA', padding: '16px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Check Delivery & COD Serviceability:
              </div>
              <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Pincode (e.g. 380009)"
                  value={pincode}
                  maxLength="6"
                  onChange={e => setPincode(e.target.value)}
                  style={{ flexGrow: 1, padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                />
                <button type="submit" style={{ background: '#000', color: '#fff', padding: '0 16px', fontWeight: '800', fontSize: '0.78rem', borderRadius: 'var(--radius-xs)' }}>
                  CHECK
                </button>
              </form>
              {pincodeStatus && (
                <p style={{ fontSize: '0.8rem', fontWeight: '700', marginTop: '8px', color: pincodeStatus.success ? '#10B981' : '#E8363C' }}>
                  {pincodeStatus.msg}
                </p>
              )}
            </div>

            {/* Perks & Guarantees */}
            <div className="zed-perks-list">
              <div className="zed-perk-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span><strong>Free Express Shipping</strong> across India on orders above ₹1,499</span>
              </div>
              <div className="zed-perk-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span><strong>7 Days Easy Return & Exchange</strong> policy at your doorstep</span>
              </div>
              <div className="zed-perk-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span><strong>240+ GSM Heavyweight Cotton</strong> — Pre-shrunk & Bio-washed</span>
              </div>
            </div>

            {/* Collapsible Accordion Tabs (Zedsonwear Style) */}
            <div className="zed-accordions">
              {/* Accordion 1: Description */}
              <div className="zed-acc-item">
                <button 
                  className="zed-acc-trigger"
                  onClick={() => setActiveAcc(activeAcc === 'desc' ? '' : 'desc')}
                >
                  <span>PRODUCT SPECIFICATIONS & FIT</span>
                  <span>{activeAcc === 'desc' ? '−' : '+'}</span>
                </button>
                {activeAcc === 'desc' && (
                  <div className="zed-acc-content">
                    <p>• Silhouette: Drop-shoulder oversized streetwear fit.</p>
                    <p>• Neckline: Thick ribbed crew collar that never loosens or bacon-necks.</p>
                    <p>• Stitching: Reinforced double-needle hem and sleeve finish.</p>
                    <p>• Dye: Reactive dye technique for deep, fade-resistant color tones.</p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Fabric & Care */}
              <div className="zed-acc-item">
                <button 
                  className="zed-acc-trigger"
                  onClick={() => setActiveAcc(activeAcc === 'fabric' ? '' : 'fabric')}
                >
                  <span>FABRIC & CARE INSTRUCTIONS</span>
                  <span>{activeAcc === 'fabric' ? '−' : '+'}</span>
                </button>
                {activeAcc === 'fabric' && (
                  <div className="zed-acc-content">
                    <p>• 100% Super-Combed Bio-Washed Organic Cotton.</p>
                    <p>• Machine wash cold inside out with like colors.</p>
                    <p>• Do not iron directly on high-density prints or embroidery.</p>
                    <p>• Tumble dry low or air dry in shade to preserve fit.</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Reviews */}
              <div className="zed-acc-item">
                <button 
                  className="zed-acc-trigger"
                  onClick={() => setActiveAcc(activeAcc === 'reviews' ? '' : 'reviews')}
                >
                  <span>CUSTOMER REVIEWS ({reviews.length}) ★ 4.9</span>
                  <span>{activeAcc === 'reviews' ? '−' : '+'}</span>
                </button>
                {activeAcc === 'reviews' && (
                  <div className="zed-acc-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontWeight: '800', color: '#000' }}>Overall Rating: 4.9 / 5.0</span>
                      <button 
                        onClick={() => setShowReviewModal(true)}
                        style={{ background: '#000', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '800' }}
                      >
                        Write a Review
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {reviews.map(rev => (
                        <div key={rev.id} style={{ background: '#F8F9FA', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ color: '#000', fontSize: '0.85rem' }}>{rev.name}</strong>
                            <span style={{ color: '#E8363C', fontSize: '0.82rem' }}>{'★'.repeat(rev.rating)}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#444' }}>{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="modal-overlay active" onClick={() => setShowSizeGuide(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <button className="close-btn" onClick={() => setShowSizeGuide(false)}>✕</button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px' }}>
                Oversized Size Guide
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#000', color: '#fff' }}>
                    <th style={{ padding: '8px' }}>Size</th>
                    <th style={{ padding: '8px' }}>Chest (in)</th>
                    <th style={{ padding: '8px' }}>Length (in)</th>
                    <th style={{ padding: '8px' }}>Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>S</td><td>42</td><td>28</td><td>20.5</td></tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>M</td><td>44</td><td>29</td><td>21.5</td></tr>
                  <tr style={{ borderBottom: '1px solid #eee', background: '#F8F9FA', fontWeight: '800' }}><td style={{ padding: '8px' }}>L</td><td>46</td><td>30</td><td>22.5</td></tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '8px' }}>XL</td><td>48</td><td>31</td><td>23.5</td></tr>
                  <tr><td style={{ padding: '8px' }}>XXL</td><td>50</td><td>32</td><td>24.5</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                * All our t-shirts feature a relaxed, dropped shoulder oversized cut. For a regular fit, choose one size smaller.
              </p>
            </div>
          </div>
        )}

        {/* Write Review Modal */}
        {showReviewModal && (
          <div className="modal-overlay active" onClick={() => setShowReviewModal(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px' }}>
                Write a Verified Review
              </h2>
              <form onSubmit={handleAddReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', marginBottom: '4px' }}>Your Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Vikram S."
                    value={newReview.name} 
                    onChange={e => setNewReview({ ...newReview, name: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', marginBottom: '4px' }}>Rating *</label>
                  <select 
                    value={newReview.rating} 
                    onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                  >
                    <option value={5}>★★★★★ (5 Stars - Outstanding)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', marginBottom: '4px' }}>Your Review *</label>
                  <textarea 
                    required 
                    rows="4" 
                    placeholder="Describe the fabric quality, oversized drape, packaging..."
                    value={newReview.comment} 
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })} 
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-medium)', borderRadius: '4px' }}
                  />
                </div>
                <button type="submit" className="btn-zed-solid" style={{ marginTop: '8px' }}>
                  SUBMIT REVIEW
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
