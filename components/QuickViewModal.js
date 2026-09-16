'use client';
import { useState } from 'react';
import { useStore } from '../lib/store-context';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  if (!quickViewProduct) return null;

  const images = [quickViewProduct.frontImage, quickViewProduct.backImage].filter(Boolean);
  const currentImage = images[selectedImageIndex] || quickViewProduct.frontImage;

  return (
    <div className="modal-overlay active" onClick={() => setQuickViewProduct(null)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button 
          className="close-btn" 
          onClick={() => setQuickViewProduct(null)} 
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}
        >
          ✕
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Gallery View */}
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#F4EFEA', marginBottom: '12px', aspectRatio: '3/4' }}>
              <img src={currentImage} alt={quickViewProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            {/* Image Thumbnails */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '60px',
                    height: '75px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: selectedImageIndex === idx ? '2px solid var(--accent-gold)' : '1px solid var(--border-cream)'
                  }}
                >
                  <img src={img} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Selectors */}
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              {quickViewProduct.fitType || "Oversized Fit"}
            </span>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-primary)', margin: '4px 0 12px' }}>
              {quickViewProduct.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700' }}>₹{quickViewProduct.price.toLocaleString('en-IN')}</span>
              {quickViewProduct.originalPrice && (
                <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-light)' }}>
                  ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                SAVE 20%
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {quickViewProduct.description}
            </p>

            {/* Size Selector + Size Guide */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Select Size:</span>
                <button 
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  style={{ fontSize: '0.8rem', color: 'var(--accent-gold-hover)', textDecoration: 'underline', fontWeight: '600' }}
                >
                  📐 Size Guide Chart
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(quickViewProduct.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '6px',
                      border: selectedSize === size ? '2px solid var(--text-primary)' : '1px solid var(--border-cream)',
                      background: selectedSize === size ? 'var(--text-primary)' : 'var(--bg-card)',
                      color: selectedSize === size ? 'var(--accent-gold)' : 'var(--text-primary)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Guide Chart Display */}
            {showSizeGuide && (
              <div style={{ background: 'var(--bg-silk)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-cream)', marginBottom: '20px', fontSize: '0.8rem' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>NIRAV Oversized T-Shirt Size Chart (Inches)</h4>
                <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--border-cream)' }}>
                      <th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>S</td><td>42"</td><td>28"</td><td>21"</td></tr>
                    <tr><td>M</td><td>44"</td><td>29"</td><td>22"</td></tr>
                    <tr><td>L</td><td>46"</td><td>30"</td><td>23"</td></tr>
                    <tr><td>XL</td><td>48"</td><td>31"</td><td>24"</td></tr>
                    <tr><td>XXL</td><td>50"</td><td>32"</td><td>25"</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Fabric Specs */}
            <div style={{ padding: '12px', background: 'var(--accent-gold-light)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '24px', fontSize: '0.82rem', color: 'var(--accent-gold-hover)' }}>
              🧵 <strong>Fabric:</strong> {quickViewProduct.fabric || "240 GSM 100% Bio-Washed Combed Cotton"}
            </div>

            {/* Add to Bag CTA */}
            <button 
              className="btn-primary btn-gold" 
              style={{ width: '100%', padding: '16px', fontSize: '0.95rem', textTransform: 'uppercase' }}
              onClick={() => {
                addToCart(quickViewProduct, selectedSize, selectedColor);
                setQuickViewProduct(null);
              }}
            >
              Add {selectedSize} to Shopping Bag • ₹{quickViewProduct.price.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
