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
      {/* 1. Minimal Streetwear Hero Banner (North Story Style) */}
      <section style={{ position: 'relative', width: '100%', minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', color: '#FFFFFF', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&q=85"
          alt="NIRAV COUTURE Drop"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
        />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: '700px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FFFFFF', display: 'block', marginBottom: '12px' }}>
            NEW SEASON DROP
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: '900', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.05, marginBottom: '20px' }}>
            OVERSIZED HEAVYWEIGHT
          </h1>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/products" 
              style={{ background: '#FFFFFF', color: '#000000', padding: '14px 32px', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '4px' }}
            >
              SHOP COLLECTION
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Minimal Category Navigation Strip */}
      <section style={{ borderBottom: '1px solid var(--border-light)', padding: '24px 0', background: '#FFFFFF' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `ALL (${INITIAL_PRODUCTS.length})` },
              { id: 'oversized', label: 'OVERSIZED' },
              { id: 'graphic', label: 'VINTAGE DROPS' },
              { id: 'luxury', label: 'SILK BLEND' },
              { id: 'polo', label: 'PIQUE CREW' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 20px',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: '999px',
                  border: activeCategory === cat.id ? '1px solid #000' : '1px solid var(--border-medium)',
                  background: activeCategory === cat.id ? '#000000' : '#FFFFFF',
                  color: activeCategory === cat.id ? '#FFFFFF' : '#000000',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Clean Visual Product Grid (Zero Text Clutter) */}
      <section style={{ padding: '40px 0 70px' }}>
        <div className="container">
          <div className="product-grid-zed">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Minimal Lookbook Feature Banner */}
      <section style={{ position: 'relative', width: '100%', height: '55vh', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111', color: '#FFFFFF', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1600&q=85"
          alt="NIRAV Lookbook"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
        />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
            240 GSM BIO-WASHED HEAVY COTTON
          </h2>
          <Link
            href="/products?category=oversized"
            style={{ display: 'inline-block', background: '#000000', color: '#FFFFFF', border: '1px solid #FFFFFF', padding: '12px 28px', fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: '4px' }}
          >
            EXPLORE HEAVYWEIGHT
          </Link>
        </div>
      </section>
    </div>
  );
}
