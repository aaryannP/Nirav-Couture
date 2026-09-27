'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../lib/store-context';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, wishlist, toggleWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  if (!quickViewProduct) return null;

  const images = [quickViewProduct.frontImage, quickViewProduct.backImage].filter(Boolean);
  const currentImage = images[selectedImageIndex] || quickViewProduct.frontImage;

  // Fix: initialize selectedSize to first available size on open
  const defaultSize = selectedSize || quickViewProduct.sizes?.[0] || 'M';

  // Fix: calculate real discount % from actual price data
  const discountPct = quickViewProduct.originalPrice
    ? Math.round(((quickViewProduct.originalPrice - quickViewProduct.price) / quickViewProduct.originalPrice) * 100)
    : 0;

  const isWishlisted = wishlist.includes(quickViewProduct.id);

  return (
    <div className="modal-overlay active" onClick={() => setQuickViewProduct(null)}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '760px' }}>
        <button className="close-btn" onClick={() => setQuickViewProduct(null)} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>✕</button>

        <div className="qv-grid">
          {/* Gallery */}
          <div>
            <div className="qv-main-image">
              <img src={currentImage} alt={quickViewProduct.title} />
            </div>
            <div className="qv-thumbs">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImageIndex(idx)}
                  className={`qv-thumb ${selectedImageIndex === idx ? 'active' : ''}`}>
                  <img src={img} alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <span className="product-fit">{quickViewProduct.fitType || 'Oversized Fit'}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--text-primary)', margin: '4px 0 12px' }}>
              {quickViewProduct.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                ₹{quickViewProduct.price.toLocaleString('en-IN')}
              </span>
              {quickViewProduct.originalPrice && (
                <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-light)' }}>
                  ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {/* Fix: real discount % not hardcoded 20% */}
              {discountPct > 0 && (
                <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                  SAVE {discountPct}%
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
              {quickViewProduct.description}
            </p>

            {/* Size Selector */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  Select Size: <strong>{defaultSize}</strong>
                </span>
                <button onClick={() => setShowSizeGuide(!showSizeGuide)}
                  style={{ fontSize: '0.78rem', color: 'var(--accent-gold-hover)', textDecoration: 'underline', fontWeight: '600' }}>
                  📐 Size Guide
                </button>
              </div>
              <div className="size-grid">
                {(quickViewProduct.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`size-btn ${defaultSize === size ? 'active' : ''}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Guide Table — measurements consistent with product detail page */}
            {showSizeGuide && (
              <div style={{ background: 'var(--bg-silk)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-cream)', marginBottom: '16px', fontSize: '0.8rem' }}>
                <h5 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Size Chart (inches)</h5>
                <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: 'var(--border-cream)' }}>
                    <th style={{ padding: '4px' }}>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th>
                  </tr></thead>
                  <tbody>
                    {[['S','40"','27.5"','20"'],['M','42"','28.5"','21"'],['L','44"','29.5"','22"'],['XL','46"','30.5"','23"'],['XXL','48"','31.5"','24"']].map(([s,c,l,sh]) => (
                      <tr key={s} style={{ background: defaultSize === s ? 'var(--accent-gold-light)' : 'transparent' }}>
                        <td style={{ padding: '4px', fontWeight: '700' }}>{s}</td>
                        <td>{c}</td><td>{l}</td><td>{sh}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Fabric */}
            <div style={{ padding: '10px 14px', background: 'var(--accent-gold-light)', borderRadius: '8px', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--accent-gold-hover)', border: '1px solid rgba(212,175,55,0.3)' }}>
              🧵 <strong>Fabric:</strong> {quickViewProduct.fabric || '240 GSM 100% Bio-Washed Cotton'}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary btn-gold"
                style={{ flexGrow: 1, padding: '14px', fontSize: '0.9rem', textTransform: 'uppercase' }}
                onClick={() => {
                  addToCart(quickViewProduct, defaultSize);
                  setQuickViewProduct(null);
                }}
              >
                Add {defaultSize} to Bag · ₹{quickViewProduct.price.toLocaleString('en-IN')}
              </button>
              <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(quickViewProduct.id)}
                style={{ position: 'relative', top: 'auto', right: 'auto', width: '50px', height: '50px', borderRadius: '10px', border: '1px solid var(--border-cream)' }}
                title="Save to Wishlist"
              >
                <svg width="18" height="18" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            <Link href={`/products/${quickViewProduct.slug}`}
              onClick={() => setQuickViewProduct(null)}
              style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '0.82rem', color: 'var(--accent-gold-hover)', textDecoration: 'underline' }}>
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
