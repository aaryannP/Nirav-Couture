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
  const [allProducts, setAllProducts] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedImage, setSelectedImage] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Pincode checker
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Accordion state
  const [activeAcc, setActiveAcc] = useState('specs');

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
          setAllProducts(data.data || []);
          const found = (data.data || []).find(p => p.slug === slug);
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
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '12px' }}>
          Product Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/products" className="btn-era-cart" style={{ display: 'inline-block', width: 'auto', padding: '14px 32px' }}>
          Back to All Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ height: '520px', background: '#F4F4F5', borderRadius: '12px', maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF' }}>Loading Product...</span>
        </div>
      </div>
    );
  }

  const isSaved = wishlist.includes(product.id);

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
      setPincodeStatus({ success: false, msg: 'Please enter a valid 6-digit Pincode' });
      return;
    }
    const isExpress = ['400', '380', '110', '560', '500'].some(prefix => pincode.startsWith(prefix));
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

  const galleryImages = Array.from(
    new Set([
      product.frontImage,
      product.backImage || product.frontImage,
      ...(product.images || [])
    ].filter(Boolean))
  );

  const currentImgIndex = Math.max(0, galleryImages.indexOf(selectedImage || product.frontImage));

  const handlePrevMain = () => {
    const nextIdx = (currentImgIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[nextIdx]);
  };

  const handleNextMain = () => {
    const nextIdx = (currentImgIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIdx]);
  };

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="era-pdp-wrapper">
      {/* Minimal Breadcrumb */}
      <nav className="era-pdp-breadcrumb">
        <Link href="/">HOME</Link>
        <span className="era-pdp-breadcrumb-sep">/</span>
        <Link href="/products">COLLECTION</Link>
        <span className="era-pdp-breadcrumb-sep">/</span>
        <span style={{ color: '#000000', fontWeight: '700' }}>{product.title}</span>
      </nav>

      {/* 3-Column Studio Purchase Section */}
      <div className="era-pdp-grid">
        
        {/* COLUMN 1: LEFT INFO (Title, Price, Story, Specs & Accordions) */}
        <div className="era-pdp-col-left">
          <span className="era-pdp-eyebrow">
            ERA43 // {product.fitType || 'HEAVYWEIGHT OVERSIZED'}
          </span>
          <h1 className="era-pdp-title">{product.title}</h1>
          
          <div className="era-pdp-price-wrap">
            <span className="era-pdp-price">Rs. {product.price.toLocaleString('en-IN')}.00</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="era-pdp-price-was">Rs. {product.originalPrice.toLocaleString('en-IN')}.00</span>
            )}
          </div>
          
          <div className="era-pdp-tax-note">
            Inclusive of all taxes. Free express shipping across India.
          </div>

          <div className="era-pdp-divider"></div>

          <p className="era-pdp-desc">
            {product.description || 'Crafted from 240 GSM heavyweight bio-washed organic cotton. Features an engineered drop-shoulder boxy silhouette with clean structured drape for everyday street luxury.'}
          </p>

          <div className="era-pdp-specs-title">Garment Specifications</div>
          <ul className="era-pdp-specs-list">
            <li>240 GSM 100% Super-Combed Cotton</li>
            <li>Drop-shoulder relaxed oversized silhouette</li>
            <li>Reinforced high-density ribbed crew collar</li>
            <li>Pre-shrunk to prevent wash deformation</li>
            <li>Signature ERA43 high-density finish</li>
          </ul>

          {/* Minimal Accordions */}
          <div className="era-accordions-group">
            <div className="era-acc-item">
              <button 
                type="button"
                className="era-acc-btn"
                onClick={() => setActiveAcc(activeAcc === 'specs' ? '' : 'specs')}
              >
                <span>PRODUCT DETAILS & FIT</span>
                <span>{activeAcc === 'specs' ? '−' : '+'}</span>
              </button>
              {activeAcc === 'specs' && (
                <div className="era-acc-content">
                  <p>• Cut: Generous drop-shoulder boxy fit engineered to drape without clinging.</p>
                  <p>• Stitching: Twin-needle reinforced seams on sleeve & hem for lifetime wear.</p>
                  <p>• Finish: Bio-softened handfeel with zero scratchiness.</p>
                </div>
              )}
            </div>

            <div className="era-acc-item">
              <button 
                type="button"
                className="era-acc-btn"
                onClick={() => setActiveAcc(activeAcc === 'care' ? '' : 'care')}
              >
                <span>FABRIC & CARE INSTRUCTIONS</span>
                <span>{activeAcc === 'care' ? '−' : '+'}</span>
              </button>
              {activeAcc === 'care' && (
                <div className="era-acc-content">
                  <p>• Machine wash cold inside out with similar darks.</p>
                  <p>• Do not iron directly over typography prints or embroidery.</p>
                  <p>• Tumble dry gentle or hang dry in shade to maintain fit and wash tone.</p>
                </div>
              )}
            </div>

            <div className="era-acc-item">
              <button 
                type="button"
                className="era-acc-btn"
                onClick={() => setActiveAcc(activeAcc === 'shipping' ? '' : 'shipping')}
              >
                <span>SHIPPING & 7-DAY EXCHANGE</span>
                <span>{activeAcc === 'shipping' ? '−' : '+'}</span>
              </button>
              {activeAcc === 'shipping' && (
                <div className="era-acc-content">
                  <p>• Free Express Shipping across all Indian pin codes.</p>
                  <p>• Orders dispatched within 24 hours from Ahmedabad studio.</p>
                  <p>• Hassle-free 7-day doorstep return and size exchange support.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2: CENTER HERO (Studio Showcase + Bottom Thumbnails) */}
        <div className="era-pdp-col-center">
          <div className="era-studio-stage">
            <img 
              src={selectedImage || product.frontImage} 
              alt={product.title}
              className="era-studio-img"
            />

            {/* Hover navigation arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMain}
                  aria-label="Previous view"
                  className="era-stage-arrow era-stage-arrow-prev"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNextMain}
                  aria-label="Next view"
                  className="era-stage-arrow era-stage-arrow-next"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}

            {/* Wishlist toggle */}
            <button
              type="button"
              className="era-stage-wish-btn"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Save to Wishlist"
              title="Save to Wishlist"
            >
              <svg width="20" height="20" fill={isSaved ? "#E8363C" : "none"} stroke={isSaved ? "#E8363C" : "#000000"} strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Image counter indicator */}
            <div className="era-stage-counter">
              {currentImgIndex + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Clean Horizontal Thumbnail Gallery */}
          <div className="era-studio-thumbs">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`era-studio-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                onClick={() => setSelectedImage(img)}
                aria-label={`View angle ${idx + 1}`}
              >
                <img src={img} alt={`Angle ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 3: RIGHT ACTIONS (Sizes, Buy Buttons, WhatsApp, Assurances) */}
        <div className="era-pdp-col-right">
          {/* Size Picker Header */}
          <div className="era-size-header">
            <span className="era-size-title">
              SELECT SIZE: <span style={{ fontWeight: '900' }}>{selectedSize}</span>
            </span>
            <button 
              type="button"
              className="era-size-guide-link"
              onClick={() => setShowSizeGuide(true)}
            >
              Size Guide
            </button>
          </div>

          {/* Size Pills */}
          <div className="era-sizes-grid">
            {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
              <button
                key={size}
                type="button"
                className={`era-size-pill ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Live stock indicator */}
          <div className="era-stock-row">
            <span className="era-stock-dot"></span>
            <span>In Stock • Dispatches within 24 Hours</span>
          </div>

          {/* Main Action Buttons */}
          <div className="era-actions-stack">
            <button 
              type="button"
              className="btn-era-cart"
              onClick={handleAddToCart}
            >
              ADD TO BAG
            </button>

            <button 
              type="button"
              className="btn-era-buy"
              onClick={handleBuyNow}
            >
              BUY IT NOW
            </button>

            <a 
              href={`https://wa.me/917990629029?text=${encodeURIComponent(`Hi ERA43! I would like to order: ${product.title} (Size: ${selectedSize})`)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-era-wa"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>ORDER VIA WHATSAPP (79906 29029)</span>
            </a>
          </div>

          {/* Minimal Pincode Checker */}
          <div className="era-pincode-box">
            <label htmlFor="pdp-pincode-input" className="era-pincode-label">
              Check Estimated Delivery
            </label>
            <form onSubmit={handlePincodeCheck} className="era-pincode-form">
              <input 
                id="pdp-pincode-input"
                name="pdp_pincode"
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                className="era-pincode-input"
              />
              <button type="submit" className="era-pincode-btn">CHECK</button>
            </form>
            {pincodeStatus && (
              <div className={`era-pincode-status ${pincodeStatus.success ? 'success' : 'error'}`}>
                {pincodeStatus.msg}
              </div>
            )}
          </div>

          {/* Clean Assurances List */}
          <div className="era-assurances">
            <div className="era-assurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span>Free Express Delivery across India</span>
            </div>
            <div className="era-assurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>7-Day Hassle-Free Doorstep Exchange</span>
            </div>
            <div className="era-assurance-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span>240+ GSM 100% Bio-Washed Combed Cotton</span>
            </div>
          </div>

          {/* Quick Review Header & Modal Trigger */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#000000' }}>★ 4.9</span>
              <span style={{ fontSize: '0.76rem', color: '#71717A', marginLeft: '6px' }}>({reviews.length} reviews)</span>
            </div>
            <button 
              type="button"
              onClick={() => setShowReviewModal(true)}
              style={{ background: 'none', border: 'none', fontSize: '0.74rem', fontWeight: '700', textDecoration: 'underline', color: '#000000', cursor: 'pointer' }}
            >
              Write Review
            </button>
          </div>
        </div>

      </div>

      {/* Customer Reviews Section */}
      <div style={{ marginTop: '70px', paddingTop: '40px', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
              VERIFIED BUYER REVIEWS
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#71717A' }}>Real feedback from streetwear enthusiasts</span>
          </div>
          <button 
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="btn-era-buy"
            style={{ width: 'auto', padding: '10px 22px', fontSize: '0.78rem' }}
          >
            WRITE A REVIEW
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#000000' }}>{rev.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#71717A' }}>{rev.date}</span>
              </div>
              <div style={{ color: '#000000', fontSize: '0.8rem', marginBottom: '8px' }}>
                {'★'.repeat(rev.rating)}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended / Complete The Look */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
            COMPLETE THE LOOK // OTHER DROPS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {relatedProducts.map(item => (
              <Link key={item.id} href={`/products/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#F4F4F5', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/5', marginBottom: '12px' }}>
                  <img src={item.frontImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#52525B', fontWeight: '600' }}>
                  Rs. {item.price.toLocaleString('en-IN')}.00
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="modal-overlay active" onClick={() => setShowSizeGuide(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button type="button" className="close-btn" onClick={() => setShowSizeGuide(false)}>✕</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '14px' }}>
              Oversized Size Guide
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'center', marginBottom: '18px' }}>
              <thead>
                <tr style={{ background: '#000000', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px' }}>Size</th>
                  <th style={{ padding: '8px' }}>Chest (in)</th>
                  <th style={{ padding: '8px' }}>Length (in)</th>
                  <th style={{ padding: '8px' }}>Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #EEEEEE' }}><td style={{ padding: '8px' }}>S</td><td>42</td><td>28</td><td>20.5</td></tr>
                <tr style={{ borderBottom: '1px solid #EEEEEE' }}><td style={{ padding: '8px' }}>M</td><td>44</td><td>29</td><td>21.5</td></tr>
                <tr style={{ borderBottom: '1px solid #EEEEEE', background: '#F8F9FA', fontWeight: '800' }}><td style={{ padding: '8px' }}>L</td><td>46</td><td>30</td><td>22.5</td></tr>
                <tr style={{ borderBottom: '1px solid #EEEEEE' }}><td style={{ padding: '8px' }}>XL</td><td>48</td><td>31</td><td>23.5</td></tr>
                <tr><td style={{ padding: '8px' }}>XXL</td><td>50</td><td>32</td><td>24.5</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.76rem', color: '#71717A', margin: 0 }}>
              * Engineered with relaxed dropped shoulders and structured drape. For a fitted look, select one size down.
            </p>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay active" onClick={() => setShowReviewModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <button type="button" className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px' }}>
              Write a Verified Review
            </h2>
            <form onSubmit={handleAddReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label htmlFor="review-author" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Your Name *
                </label>
                <input 
                  id="review-author"
                  name="review_author"
                  type="text" 
                  required 
                  placeholder="e.g. Rahul S."
                  value={newReview.name} 
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4E4E7', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label htmlFor="review-stars" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Rating *
                </label>
                <select 
                  id="review-stars"
                  name="review_stars"
                  value={newReview.rating} 
                  onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4E4E7', borderRadius: '6px' }}
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Great Quality)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                </select>
              </div>
              <div>
                <label htmlFor="review-text" style={{ display: 'block', fontSize: '0.76rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Your Review *
                </label>
                <textarea 
                  id="review-text"
                  name="review_text"
                  required 
                  rows="4" 
                  placeholder="Tell us about the fabric weight, oversized silhouette, wash quality..."
                  value={newReview.comment} 
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E4E4E7', borderRadius: '6px' }}
                />
              </div>
              <button type="submit" className="btn-era-cart" style={{ marginTop: '8px' }}>
                SUBMIT REVIEW
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
