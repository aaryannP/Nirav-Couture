'use client';
import Link from 'next/link';
import { useStore } from '../lib/store-context';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useStore();
  const isSaved = wishlist.includes(product.id);

  return (
    <div className="product-card">
      <div className="product-img-container">
        {/* Discount Badge */}
        {product.badge && <span className="card-badge">{product.badge}</span>}

        {/* Wishlist Button */}
        <button 
          className={`wishlist-btn ${isSaved ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <svg width="18" height="18" fill={isSaved ? "#C93B2B" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Dual Front & Back Image Swap on Hover */}
        <Link href={`/products/${product.slug}`}>
          <img 
            src={product.frontImage} 
            alt={`${product.title} - Front View`} 
            className="product-img product-img-front" 
          />
          <img 
            src={product.backImage || product.frontImage} 
            alt={`${product.title} - Back View`} 
            className="product-img product-img-back" 
          />
        </Link>
      </div>

      <div className="product-info">
        <span className="product-fit">{product.fitType || "Oversized Fit"}</span>
        
        <Link href={`/products/${product.slug}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>

        {/* Rating Stars */}
        <div className="product-rating">
          <span>★ {product.rating || 4.9}</span>
          <span style={{ color: '#888', fontSize: '0.75rem' }}>({product.reviewsCount || 88} reviews)</span>
        </div>

        {/* Price & Add to Bag Row */}
        <div className="product-price-row">
          <div className="price-box">
            <span className="price-current">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              className="btn-add-cart"
              style={{ padding: '6px 10px', fontSize: '0.75rem', background: '#FFFFFF' }}
              onClick={() => setQuickViewProduct(product)}
              title="Quick View"
            >
              Quick View
            </button>
            <button 
              className="btn-add-cart" 
              onClick={() => addToCart(product)}
              title="Add to Shopping Bag"
            >
              Add +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
