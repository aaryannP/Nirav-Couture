'use client';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { useStore } from '../../lib/store-context';
import { INITIAL_PRODUCTS } from '../../lib/products-data';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const wishlistedProducts = INITIAL_PRODUCTS.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach(product => {
      addToCart(product);
    });
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              SAVED FAVORITES
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
              My Wishlist ({wishlistedProducts.length})
            </h1>
          </div>

          {wishlistedProducts.length > 0 && (
            <button 
              className="btn-primary btn-gold" 
              onClick={handleAddAllToCart}
              style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}
            >
              Move All ({wishlistedProducts.length}) to Bag 🛍️
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlistedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-cream)' }}>
            <div style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginBottom: '12px' }}>
              ♡
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
              Save your favorite Men's T-Shirts here to buy them later.
            </p>
            <Link href="/products" className="btn-primary btn-gold">
              Explore Men's T-Shirts →
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlistedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
