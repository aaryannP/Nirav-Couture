'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { INITIAL_PRODUCTS } from '../../lib/products-data';

const CATEGORIES = [
  { value: 'all', label: 'All Styles' },
  { value: 'oversized', label: 'Oversized Drop-Shoulder' },
  { value: 'graphic', label: 'Vintage Graphic Tees' },
  { value: 'luxury', label: 'Luxury Silk Blend' },
  { value: 'polo', label: 'Pique Knit Polos' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function ProductSkeleton() {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-cream)' }}>
      <div className="skeleton-shimmer" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton-shimmer" style={{ height: '12px', width: '40%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '18px', width: '90%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '14px', width: '60%', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(3500);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'all');
  }, [categoryFromUrl]);

  // Simulate loading (replace with real fetch if products come from API)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS
      .filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.fitType || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = product.price <= maxPrice;
        const matchesSize = selectedSizes.length === 0 ||
          selectedSizes.some(s => (product.sizes || []).includes(s));
        return matchesCategory && matchesSearch && matchesPrice && matchesSize;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'discount') return ((b.originalPrice - b.price) / b.originalPrice) - ((a.originalPrice - a.price) / a.originalPrice);
        return 0;
      });
  }, [searchQuery, selectedCategory, maxPrice, sortBy, selectedSizes]);

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + selectedSizes.length + (maxPrice < 3500 ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSizes([]);
    setMaxPrice(3500);
    setSortBy('featured');
  };

  const countForCategory = (cat) =>
    cat === 'all' ? INITIAL_PRODUCTS.length : INITIAL_PRODUCTS.filter(p => p.category === cat).length;

  return (
    <div className="page-padding">
      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px' }}>
          <span className="page-tag">COMPLETE COLLECTION</span>
          <h1 className="page-title">Men's T-Shirts Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.93rem', marginTop: '8px' }}>
            Oversized drop-shoulder fits, vintage acid washes, and bespoke luxury silk-cotton tees.
          </p>
        </div>

        {/* Mobile: Filter toggle + search bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
          <button
            className="filter-sidebar-toggle"
            style={{ width: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <input
            type="text"
            placeholder="Search T-Shirts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="products-page-layout">
          {/* Filter Sidebar — hidden on mobile unless toggled */}
          <aside className="filter-sidebar" style={{ display: sidebarOpen ? 'block' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="filter-sidebar-title" style={{ margin: 0 }}>Filters</h3>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '700', textDecoration: 'underline' }}>
                  Clear All ✕
                </button>
              )}
            </div>

            {/* Search (desktop) */}
            <div className="filter-group" style={{ display: 'none' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            {/* Category */}
            <div className="filter-group">
              <span className="filter-group-label">Fit & Style</span>
              {CATEGORIES.map(cat => (
                <label key={cat.value} className={`filter-check-item ${selectedCategory === cat.value ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.value}
                    onChange={() => setSelectedCategory(cat.value)}
                    style={{ accentColor: 'var(--accent-gold)' }}
                  />
                  {cat.label}
                  <span className="filter-count">({countForCategory(cat.value)})</span>
                </label>
              ))}
            </div>

            {/* Size */}
            <div className="filter-group">
              <span className="filter-group-label">Size</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                    style={{ minWidth: '38px', height: '38px', fontSize: '0.78rem' }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-group">
              <span className="filter-group-label">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</span>
              <input
                type="range" min="999" max="3500" step="100"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)', marginTop: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>₹999</span><span>₹3,500</span>
              </div>
            </div>

            {/* Quick links */}
            <div className="filter-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <span className="filter-group-label">Quick Picks</span>
              {[
                { label: 'Bestsellers', href: '/products?category=oversized' },
                { label: 'New Arrivals', href: '/products?category=graphic' },
                { label: 'Under ₹1500', action: () => setMaxPrice(1500) },
              ].map((item, i) => (
                item.href ? (
                  <Link key={i} href={item.href} className="filter-check-item" style={{ display: 'block', padding: '5px 0' }}>
                    {item.label}
                  </Link>
                ) : (
                  <button key={i} onClick={item.action} className="filter-check-item" style={{ width: '100%', textAlign: 'left', padding: '5px 0' }}>
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </aside>

          {/* Product Area */}
          <div>
            {/* Toolbar */}
            <div className="products-toolbar">
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> Men's T-Shirts
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#EF4444', fontWeight: '700', textDecoration: 'underline' }}>
                    Reset ✕
                  </button>
                )}
              </p>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-field"
                  style={{ width: 'auto', fontSize: '0.82rem', padding: '8px 12px' }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Best Discount</option>
                </select>

                {/* View toggle */}
                <div className="view-toggle">
                  <button
                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                    aria-label="Grid view"
                  >⊞</button>
                  <button
                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                    aria-label="List view"
                  >☰</button>
                </div>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFiltersCount > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {selectedCategory !== 'all' && (
                  <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                    <button onClick={() => setSelectedCategory('all')} style={{ color: 'inherit', fontWeight: '900' }}>✕</button>
                  </span>
                )}
                {selectedSizes.map(s => (
                  <span key={s} style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Size {s}
                    <button onClick={() => toggleSize(s)} style={{ color: 'inherit', fontWeight: '900' }}>✕</button>
                  </span>
                ))}
                {maxPrice < 3500 && (
                  <span style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold-hover)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Under ₹{maxPrice.toLocaleString('en-IN')}
                    <button onClick={() => setMaxPrice(3500)} style={{ color: 'inherit', fontWeight: '900' }}>✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="products-grid">
                {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3 className="empty-title">No T-Shirts Found</h3>
                <p className="empty-desc">Try adjusting your filters or search term.</p>
                <button className="btn-primary btn-gold" onClick={resetFilters}>Clear All Filters</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="products-grid-list">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/products/${product.slug}`} className="product-card-list">
                    <img src={product.frontImage} alt={product.title} className="product-card-list-img" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="product-fit">{product.fitType}</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', margin: '2px 0 4px' }}>{product.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{product.fabric}</p>
                      <div className="product-rating" style={{ marginBottom: '6px' }}>★ {product.rating}</div>
                      <div className="price-box">
                        <span className="price-current">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'center' }}>
                      {product.stock === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Out of Stock</span>
                      ) : (
                        <span className="btn-primary btn-gold" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>Add to Bag</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="page-padding">
        <div className="container">
          <div className="products-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="skeleton-shimmer" style={{ aspectRatio: '3/4' }} />
                <div style={{ padding: '14px' }}>
                  <div className="skeleton-shimmer" style={{ height: '12px', marginBottom: '8px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ height: '18px', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsCatalogContent />
    </Suspense>
  );
}
