'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import { INITIAL_PRODUCTS } from '../../lib/products-data';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [maxPrice, setMaxPrice] = useState(3500);
  const [sortBy, setSortBy] = useState('featured');

  // Automatically update category state whenever URL search param changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryFromUrl]);

  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.fitType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price <= maxPrice;

      return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [searchQuery, selectedCategory, maxPrice, sortBy]);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
            COMPLETE COLLECTION
          </span>
          <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: '8px 0' }}>
            Men's T-Shirts Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover oversized drop-shoulder fits, vintage acid washes, and bespoke luxury silk-cotton tees.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-cream)', marginBottom: '40px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
            {/* Live Search Bar */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Search Catalog
              </label>
              <input 
                type="text" 
                placeholder="Search Oversized, Acid Wash, Graphic, Silk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-cream)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--bg-silk)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Category Filter Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Fit & Style
              </label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-cream)',
                  fontSize: '0.88rem',
                  background: 'var(--bg-silk)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                <option value="all">All Styles ({INITIAL_PRODUCTS.length})</option>
                <option value="oversized">Oversized Drop-Shoulder</option>
                <option value="graphic">Vintage Graphic Tees</option>
                <option value="luxury">Luxury Silk Blend</option>
                <option value="polo">Pique Knit Polos</option>
              </select>
            </div>

            {/* Price Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: 'var(--text-muted)' }}>
                <span>Max Price</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="3500" 
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* Sort Order */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Sort By
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-cream)',
                  fontSize: '0.88rem',
                  background: 'var(--bg-silk)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              >
                <option value="featured">Featured Drops</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated ★</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredProducts.length}</strong> Men's T-Shirts
          </p>
          {(searchQuery || selectedCategory !== 'all' || maxPrice < 3500) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setMaxPrice(3500);
                setSortBy('featured');
              }}
              style={{ fontSize: '0.8rem', color: 'var(--accent-crimson)', textDecoration: 'underline', fontWeight: '600' }}
            >
              Reset All Filters ✕
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-cream)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No Men's T-Shirts found matching your search
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Try adjusting your search keywords or price slider.
            </p>
            <button 
              className="btn-primary btn-gold" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setMaxPrice(3500); }}
            >
              View All T-Shirts
            </button>
          </div>
        ) : (
          <div className="products-grid">
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
    <Suspense fallback={<div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Collection...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
