'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '../../../lib/store-context';

export default function ProductDetailPage({ params }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedImage, setSelectedImage] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Feature 1: Pincode Serviceability State
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Feature 2: Reviews State
  const [reviews, setReviews] = useState([
    { id: 1, name: 'Aman Verma', rating: 5, date: '12 Aug 2026', fit: 'True to Size', comment: 'The 240 GSM heavy bio-washed cotton feel is unbelievable! Pure luxury streetwear.' },
    { id: 2, name: 'Rohan Mehta', rating: 5, date: '08 Aug 2026', fit: 'Perfect Oversized Fit', comment: 'Drop-shoulder drape is spot-on. Front & back print quality is top notch.' },
    { id: 3, name: 'Karan Shah', rating: 4, date: '02 Aug 2026', fit: 'Slightly Roomy', comment: 'Loved the Champagne Gold packaging and heavy fabric. Delivery took 3 days.' }
  ]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, fit: 'True to Size', comment: '' });

  // Feature 3: Find My Fit Calculator State
  const [userHeight, setUserHeight] = useState('5.9');
  const [userWeight, setUserWeight] = useState('72');
  const [recommendedSize, setRecommendedSize] = useState('L');

  // Feature 4: Recently Viewed Tracking
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const found = data.data.find(p => p.slug === params.slug) || data.data[0];
          setProduct(found);
          setSelectedImage(found.frontImage);

          // Track recently viewed in localStorage
          try {
            const history = JSON.parse(localStorage.getItem('nirav_recent_products') || '[]');
            const updated = [found, ...history.filter(item => item.id !== found.id)].slice(0, 4);
            localStorage.setItem('nirav_recent_products', JSON.stringify(updated));
            setRecentlyViewed(updated.filter(item => item.id !== found.id));
          } catch (e) {}
        }
      });
  }, [params.slug]);

  // Calculate Size Recommendation
  useEffect(() => {
    const w = parseFloat(userWeight);
    if (w < 60) setRecommendedSize('S');
    else if (w >= 60 && w < 72) setRecommendedSize('M');
    else if (w >= 72 && w < 85) setRecommendedSize('L');
    else setRecommendedSize('XL');
  }, [userHeight, userWeight]);

  if (!product) {
    return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>Loading luxury T-Shirt details...</div>;
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({ success: false, msg: '✕ Please enter a valid 6-digit Pincode' });
      return;
    }
    setPincodeStatus({
      success: true,
      msg: `✓ Express Delivery by Thursday to Pincode ${pincode} • 100% COD Available`
    });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      alert('Please fill out all fields');
      return;
    }
    const added = {
      id: Date.now(),
      name: newReview.name,
      rating: parseInt(newReview.rating),
      date: 'Just Now',
      fit: newReview.fit,
      comment: newReview.comment
    };
    setReviews([added, ...reviews]);
    setShowReviewModal(false);
    setNewReview({ name: '', rating: 5, fit: 'True to Size', comment: '' });
    setToastMsg('✓ Thank you! Your review has been published.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    setToastMsg(`✓ Added ${product.title} (${selectedSize}) to Bag!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          <Link href="/">Home</Link> / <Link href="/products">Men's T-Shirts</Link> / <span style={{ color: 'var(--text-primary)' }}>{product.title}</span>
        </div>

        {toastMsg && (
          <div className="toast-container">
            <div className="toast">
              <span>🛍️</span>
              <div>
                <strong>Success!</strong>
                <p style={{ margin: 0 }}>{toastMsg}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Left Column: Gallery */}
          <div>
            <div style={{ aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-cream)', marginBottom: '16px', background: 'var(--bg-card)' }}>
              <img src={selectedImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Thumbnail Selectors (Front & Back Views) */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setSelectedImage(product.frontImage)}
                style={{ border: selectedImage === product.frontImage ? '2px solid var(--accent-gold)' : '1px solid var(--border-cream)', borderRadius: '8px', overflow: 'hidden', width: '80px', height: '100px', cursor: 'pointer' }}
              >
                <img src={product.frontImage} alt="Front View" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
              {product.backImage && (
                <button 
                  onClick={() => setSelectedImage(product.backImage)}
                  style={{ border: selectedImage === product.backImage ? '2px solid var(--accent-gold)' : '1px solid var(--border-cream)', borderRadius: '8px', overflow: 'hidden', width: '80px', height: '100px', cursor: 'pointer' }}
                >
                  <img src={product.backImage} alt="Back View" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Product Meta & Purchase Panel */}
          <div>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
              {product.fitType}
            </span>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', margin: '4px 0 12px' }}>
              {product.title}
            </h1>

            {/* Rating Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem' }}>
                4.9 ★
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({reviews.length} Verified Buyer Reviews)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-light)' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: '700' }}>Inclusive of all taxes</span>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Size: <strong>{selectedSize}</strong>
                </span>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: '600', textDecoration: 'underline' }}
                >
                  📐 Size Guide & Fit Calculator
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      border: selectedSize === size ? '2px solid var(--accent-gold)' : '1px solid var(--border-cream)',
                      background: selectedSize === size ? 'var(--accent-gold-light)' : 'var(--bg-card)',
                      color: selectedSize === size ? 'var(--accent-gold)' : 'var(--text-primary)',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature 1: Live Pincode Serviceability & COD Checker */}
            <div style={{ background: 'var(--bg-card)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-cream)', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: 'var(--accent-gold)' }}>
                📍 Check Delivery Pincode & COD Eligibility
              </label>
              <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="Enter 6-digit Pincode (e.g. 400050)..."
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-outline" style={{ padding: '10px 16px', fontSize: '0.82rem' }}>
                  Check 🚚
                </button>
              </form>
              {pincodeStatus && (
                <p style={{ fontSize: '0.82rem', marginTop: '8px', fontWeight: '600', color: pincodeStatus.success ? '#10B981' : '#EF4444' }}>
                  {pincodeStatus.msg}
                </p>
              )}
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <button 
                className="btn-primary btn-gold" 
                onClick={handleAddToCart}
                style={{ flexGrow: 1, padding: '16px', fontSize: '1rem', textTransform: 'uppercase' }}
              >
                Add {selectedSize} to Shopping Bag 🛍️
              </button>

              <button 
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                style={{ position: 'relative', top: 'auto', right: 'auto', width: '54px', height: '54px', borderRadius: '12px' }}
                title="Save to Wishlist"
              >
                <svg width="22" height="22" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Product Specifications List */}
            <div style={{ borderTop: '1px solid var(--border-cream)', paddingTop: '20px', fontSize: '0.88rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong>Fabric Composition:</strong> {product.fabric}</div>
              <div><strong>Fit Specification:</strong> {product.fitType}</div>
              <div><strong>Wash & Care:</strong> Machine wash cold, line dry in shade, do not iron directly on print.</div>
              <div><strong>Return Policy:</strong> 7-day hassle-free returns & size exchanges.</div>
            </div>
          </div>
        </div>

        {/* Feature 4: "Pairs Well With / Complete The Look" */}
        <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid var(--border-cream)' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
            STYLE RECOMMENDATION
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Pairs Well With (Complete The Look)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { title: 'NIRAV Vintage Acid Cargo Pants', category: 'Streetwear Bottoms', price: 2499, img: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=600' },
              { title: 'NIRAV Raw Denim Oversized Jacket', category: 'Outerwear', price: 3499, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600' },
              { title: 'NIRAV Silk Blend Ribbed Tank Top', category: 'Inner Layer', price: 999, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' }
            ].map((item, idx) => (
              <div key={idx} style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-cream)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img src={item.img} alt={item.title} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '6px' }} />
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: '700' }}>{item.category}</span>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: '2px 0 4px' }}>{item.title}</h4>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>₹{item.price}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 2: Customer Reviews Section & Write a Review */}
        <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid var(--border-cream)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
                VERIFIED FEEDBACK
              </span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                Customer Reviews ({reviews.length})
              </h2>
            </div>
            <button className="btn-outline" onClick={() => setShowReviewModal(true)}>
              ✍️ Write a Review
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
            {/* Rating Summary Card */}
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-cream)', textAlign: 'center' }}>
              <div style={{ fontSize: '3.2rem', fontFamily: 'var(--font-serif)', fontWeight: '700', color: 'var(--accent-gold)', lineHeight: 1 }}>
                4.9
              </div>
              <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', margin: '4px 0 8px' }}>
                ★★★★★
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Based on {reviews.length} Verified Buyer Reviews</p>
            </div>

            {/* Review Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(rev => (
                <div key={rev.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-cream)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{rev.name}</strong>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', fontWeight: '700' }}>
                        ✓ Verified Buyer
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                  </div>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '0.88rem', marginBottom: '6px' }}>
                    {'★'.repeat(rev.rating)} • <span style={{ color: 'var(--accent-gold)', fontSize: '0.78rem', fontWeight: '600' }}>Fit: {rev.fit}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature 3: Size Guide Chart Modal & Find My Fit Calculator */}
        {showSizeGuide && (
          <div className="modal-overlay active" onClick={() => setShowSizeGuide(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <button className="close-btn" onClick={() => setShowSizeGuide(false)} style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '4px' }}>
                Size Guide & Fit Calculator
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                All measurements are in inches. Designed for an authentic drop-shoulder streetwear fit.
              </p>

              {/* Interactive Height/Weight Fit Calculator */}
              <div style={{ background: 'var(--accent-gold-light)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.4)', marginBottom: '24px' }}>
                <h4 style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', marginBottom: '10px', fontWeight: '700' }}>
                  🎯 Find My Perfect Fit Calculator
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Your Height (ft)</label>
                    <select value={userHeight} onChange={(e) => setUserHeight(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}>
                      <option value="5.6">5'6" (167 cm)</option>
                      <option value="5.8">5'8" (172 cm)</option>
                      <option value="5.9">5'9" (175 cm)</option>
                      <option value="6.0">6'0" (183 cm)</option>
                      <option value="6.2">6'2" (188 cm)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Your Weight (kg)</label>
                    <select value={userWeight} onChange={(e) => setUserWeight(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}>
                      <option value="55">55 - 60 kg</option>
                      <option value="68">61 - 70 kg</option>
                      <option value="72">71 - 80 kg</option>
                      <option value="88">81 - 95 kg</option>
                    </select>
                  </div>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Recommended Size: <span style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>Size {recommendedSize}</span> (Oversized Fit)
                </div>
              </div>

              {/* Table */}
              <table className="table-custom" style={{ marginTop: '0' }}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (inches)</th>
                    <th>Length (inches)</th>
                    <th>Shoulder (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: 'S', chest: '40"', length: '27.5"', shoulder: '20"' },
                    { size: 'M', chest: '42"', length: '28.5"', shoulder: '21"' },
                    { size: 'L', chest: '44"', length: '29.5"', shoulder: '22"' },
                    { size: 'XL', chest: '46"', length: '30.5"', shoulder: '23"' },
                    { size: 'XXL', chest: '48"', length: '31.5"', shoulder: '24"' }
                  ].map(row => (
                    <tr key={row.size} style={{ background: selectedSize === row.size ? 'var(--accent-gold-light)' : 'transparent' }}>
                      <td><strong>{row.size}</strong></td>
                      <td>{row.chest}</td>
                      <td>{row.length}</td>
                      <td>{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feature 2 Modal: Write a Review Modal */}
        {showReviewModal && (
          <div className="modal-overlay active" onClick={() => setShowReviewModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <button className="close-btn" onClick={() => setShowReviewModal(false)} style={{ position: 'absolute', top: '16px', right: '16px' }}>✕</button>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '16px' }}>
                Write a Verified Review
              </h3>

              <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Your Name *</label>
                  <input type="text" required placeholder="Aarav Sharma" value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Rating *</label>
                    <select value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}>
                      <option value="5">5 ★★★★★ (Excellent)</option>
                      <option value="4">4 ★★★★☆ (Good)</option>
                      <option value="3">3 ★★★☆☆ (Average)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Fit Feedback</label>
                    <select value={newReview.fit} onChange={(e) => setNewReview({...newReview, fit: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)' }}>
                      <option value="True to Size">True to Size</option>
                      <option value="Perfect Oversized Fit">Perfect Oversized Fit</option>
                      <option value="Slightly Tight">Slightly Tight</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Review Comment *</label>
                  <textarea rows="3" required placeholder="Tell us about the fabric GSM quality, fit, and delivery..." value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-cream)', background: 'var(--bg-silk)', color: 'var(--text-primary)', fontSize: '0.85rem' }}></textarea>
                </div>

                <button type="submit" className="btn-primary btn-gold" style={{ padding: '12px', marginTop: '8px' }}>
                  Publish Review →
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
