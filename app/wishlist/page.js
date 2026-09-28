'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { useStore } from '../../lib/store-context';
import { INITIAL_PRODUCTS } from '../../lib/products-data';

export default function WishlistPage() {
  const { wishlist, addToCart } = useStore();
  // wishlist always contains IDs (strings) after the store-context fix
  const wishlistedProducts = INITIAL_PRODUCTS.filter(p => wishlist.includes(p.id));

  // Size picker modal for "Move All to Bag"
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [sizeSelections, setSizeSelections] = useState({});

  const handleOpenSizePicker = () => {
    // Pre-fill with each product's first available size
    const defaults = {};
    wishlistedProducts.forEach(p => {
      defaults[p.id] = p.sizes?.[0] || 'M';
    });
    setSizeSelections(defaults);
    setShowSizePicker(true);
  };

  const handleConfirmAddAll = () => {
    wishlistedProducts.forEach(product => {
      addToCart(product, sizeSelections[product.id] || product.sizes?.[0] || 'M');
    });
    setShowSizePicker(false);
  };

  return (
    <div className="page-padding">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div>
            <span className="page-tag">SAVED FAVORITES</span>
            <h1 className="page-title">My Wishlist ({wishlistedProducts.length})</h1>
          </div>
          {wishlistedProducts.length > 0 && (
            <button className="btn-primary btn-gold" onClick={handleOpenSizePicker}>
              Move All ({wishlistedProducts.length}) to Bag
            </button>
          )}
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="empty-title">Your Wishlist is Empty</h2>
            <p className="empty-desc">Save your favorite Men's T-Shirts here to buy later.</p>
            <Link href="/products" className="btn-primary btn-gold">Explore Men's T-Shirts</Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlistedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Size Picker Modal for "Add All to Bag" */}
        {showSizePicker && (
          <div className="modal-overlay active" onClick={() => setShowSizePicker(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <button className="close-btn" onClick={() => setShowSizePicker(false)} style={{ position: 'absolute', top: '16px', right: '16px' }}>✕</button>
              <h3 className="modal-title">Select Sizes Before Adding</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Choose a size for each item before moving to your bag.
              </p>

              <div className="form-stack">
                {wishlistedProducts.map(product => (
                  <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-silk)', borderRadius: '10px', border: '1px solid var(--border-cream)' }}>
                    <img src={product.frontImage} alt={product.title} style={{ width: '56px', height: '70px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: '600', marginBottom: '6px' }}>{product.title}</p>
                      <select
                        value={sizeSelections[product.id] || ''}
                        onChange={e => setSizeSelections({ ...sizeSelections, [product.id]: e.target.value })}
                        className="input-field"
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      >
                        {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <span style={{ fontWeight: '700' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <button className="btn-primary btn-gold" style={{ padding: '14px', marginTop: '8px' }} onClick={handleConfirmAddAll}>
                  Add All {wishlistedProducts.length} Items to Bag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
