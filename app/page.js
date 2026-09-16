'use client';
import { useState } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { INITIAL_PRODUCTS } from '../lib/products-data';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all' 
    ? INITIAL_PRODUCTS 
    : INITIAL_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <span className="hero-tag">
                ✨ AW'24 EXCLUSIVE DROP • MEN'S T-SHIRTS
              </span>

              <h1 className="hero-title">
                REDEFINING <span>LUXURY</span> URBAN TEES.
              </h1>

              <p className="hero-desc">
                Discover NIRAV's signature line of 240GSM heavyweight oversized tees, acid-wash vintage graphics, and mulberry silk-cotton blends. Handcrafted for supreme fit and comfort.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/products" className="btn-primary btn-gold">
                  Explore Men's T-Shirts →
                </Link>
                <Link href="/products?category=oversized" className="btn-outline">
                  Oversized Collection
                </Link>
              </div>
            </div>

            {/* Hero Image Banner Showcase */}
            <div className="hero-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80" 
                alt="NIRAV Men's T-Shirts Showcase" 
                className="hero-img" 
              />
              <div className="hero-badge-overlay">
                <span className="hero-badge-title">SIGNATURE ITEM</span>
                <p className="hero-badge-subtitle">NIRAV Heavyweight Acid Wash Tee</p>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>₹1,499</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Bar */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-cream)', borderBottom: '1px solid var(--border-cream)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '4px' }}>🌿</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>240 GSM Bio-Washed Cotton</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Heavyweight organic fabric</p>
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '4px' }}>📐</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Bespoke Tailored Fit</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Perfect drop-shoulder silhouette</p>
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '4px' }}>🚚</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>100% COD & Free Delivery</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Available across India</p>
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '4px' }}>🔄</span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>7-Day Easy Returns</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Instant size exchange</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 20px' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold-hover)', fontWeight: '700' }}>
              THE COLLECTION
            </span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', marginTop: '4px' }}>
              Men's T-Shirts Drops
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="filter-bar">
            <button 
              className={`filter-pill ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All T-Shirts ({INITIAL_PRODUCTS.length})
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'oversized' ? 'active' : ''}`}
              onClick={() => setActiveCategory('oversized')}
            >
              Oversized Fits
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'graphic' ? 'active' : ''}`}
              onClick={() => setActiveCategory('graphic')}
            >
              Vintage Graphics
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'luxury' ? 'active' : ''}`}
              onClick={() => setActiveCategory('luxury')}
            >
              Silk Blend
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'polo' ? 'active' : ''}`}
              onClick={() => setActiveCategory('polo')}
            >
              Pique Polos
            </button>
          </div>

          {/* Product Grid */}
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Craft Story Section */}
      <section style={{ background: '#07080B', color: 'var(--text-primary)', padding: '80px 0', borderTop: '2px solid var(--accent-gold)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '700' }}>
                THE NIRAV CRAFT
              </span>
              <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-serif)', margin: '12px 0 20px', color: 'var(--text-primary)' }}>
                Uncompromising Quality in Every Thread.
              </h2>
              <p style={{ color: '#A09A8E', fontSize: '1rem', marginBottom: '24px', lineHeight: 1.8 }}>
                Every NIRAV T-Shirt undergoes a rigorous 14-step manufacturing process. From sourcing 100% organic long-staple cotton to custom hand-acid washing, our garments are built to retain structure, softness, and vibrant texture wash after wash.
              </p>
              <Link href="/products" className="btn-primary btn-gold">
                View All Men's T-Shirts →
              </Link>
            </div>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--accent-gold)' }}>
              <img 
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80" 
                alt="NIRAV Craftsmanship" 
                style={{ width: '100%', height: '420px', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
