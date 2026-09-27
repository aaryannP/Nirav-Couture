'use client';
import Link from 'next/link';
import { useStore } from '../lib/store-context';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, setQuickViewProduct } = useStore();
  const isSaved = wishlist.includes(product.id);
  const isOutOfStock = product.stock === 0;

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="card-zed">
      <div className="card-zed-media">
        {/* Sale / Stock Badge */}
        {discountPct > 0 && !isOutOfStock && (
          <span className="card-sale-pill">
            SAVE {discountPct}%
          </span>
        )}
        {isOutOfStock && (
          <span className="card-sale-pill" style={{ background: '#000000' }}>
            SOLD OUT
          </span>
        )}

        {/* Wishlist Heart Icon Button */}
        <button
          className="card-wish-btn"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist"
        >
          <svg width="17" height="17" fill={isSaved ? "#E8363C" : "none"} stroke={isSaved ? "#E8363C" : "#000000"} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Dual Hover Image Transition (Front to Back Model View) */}
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.frontImage}
            alt={`${product.title} - Front View`}
            className="img-front"
            loading="lazy"
          />
          <img
            src={product.backImage || product.frontImage}
            alt={`${product.title} - Back View`}
            className="img-back"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="card-zed-details">
        <div style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '3px' }}>
          {product.fitType || 'HEAVYWEIGHT OVERSIZED'}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="card-zed-title">{product.title}</h3>
        </Link>

        <div className="card-zed-prices">
          <span style={{ color: '#000000' }}>₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="card-price-original">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
