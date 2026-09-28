'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import { INITIAL_PRODUCTS } from '../../lib/products-data';

const CATEGORIES = [
  { value: 'all', label: 'ALL' },
  { value: 'oversized', label: 'OVERSIZED' },
  { value: 'graphic', label: 'VINTAGE DROPS' },
  { value: 'luxury', label: 'SILK BLEND' },
  { value: 'polo', label: 'PIQUE CREW' },
];

function ProductSkeleton() {
  return (
    <div style={{ borderRadius: '4px', overflow: 'hidden', background: '#F8F9FA' }}>
      <div className="skeleton-shimmer" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton-shimmer" style={{ height: '12px', width: '40%', borderRadius: '2px' }} />
        <div className="skeleton-shimmer" style={{ height: '18px', width: '90%', borderRadius: '2px' }} />
        <div className="skeleton-shimmer" style={{ height: '14px', width: '60%', borderRadius: '2px' }} />
      </div>
    </div>
  );
}

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'all');
  }, [categoryFromUrl]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS
      .filter(product => {
        return selectedCategory === 'all' || product.category === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [selectedCategory, sortBy]);

  return (
    <div style={{ padding: '40px 0 80px', background: '#FFFFFF' }}>
      <div className="container">
        {/* Minimal Editorial Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            COLLECTION
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#000000', marginBottom: '8px' }}>
            ALL PRODUCTS
          </h1>
          <p style={{ fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {filteredProducts.length} STYLES AVAILABLE
          </p>
        </div>

        {/* Minimal Category Tabs Strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: '8px 20px',
                fontSize: '0.78rem',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: '999px',
                border: selectedCategory === cat.value ? '1px solid #000' : '1px solid var(--border-medium)',
                background: selectedCategory === cat.value ? '#000000' : '#FFFFFF',
                color: selectedCategory === cat.value ? '#FFFFFF' : '#000000',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Minimal Sorting Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              SORT BY:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Full-Width 4-Column Product Grid */}
        {loading ? (
          <div className="product-grid-zed">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>No Products Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Check back soon for the next drop.</p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="btn-zed-solid"
              style={{ maxWidth: '240px', margin: '0 auto' }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="product-grid-zed">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px 0 80px', background: '#FFFFFF' }}>
        <div className="container">
          <div className="product-grid-zed">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <ProductsCatalogContent />
    </Suspense>
  );
}
