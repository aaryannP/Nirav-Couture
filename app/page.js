'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { INITIAL_PRODUCTS } from '../lib/products-data';

// Hero carousel slides
const HERO_SLIDES = [
  {
    tag: '✨ AW\'24 EXCLUSIVE DROP',
    title: 'REDEFINING LUXURY URBAN TEES.',
    highlight: 'LUXURY',
    desc: 'Discover NIRAV\'s signature 240GSM heavyweight oversized tees, acid-wash vintage graphics, and mulberry silk-cotton blends.',
    cta: { label: 'Explore Collection →', href: '/products' },
    cta2: { label: 'Oversized Fits', href: '/products?category=oversized' },
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80',
    badge: { title: 'BESTSELLER', subtitle: 'NIRAV Acid Wash Oversized Tee', price: '₹1,499' }
  },
  {
    tag: '🆕 NEW ARRIVAL — SILK BLEND',
    title: 'CRAFTED FOR THE MODERN GENTLEMAN.',
    highlight: 'MODERN',
    desc: 'Mulberry silk meets extra-long staple cotton in our Luxury Couture line. Feel the difference in every thread.',
    cta: { label: 'Shop Luxury Line →', href: '/products?category=luxury' },
    cta2: { label: 'View All', href: '/products' },
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1000&q=80',
    badge: { title: 'COUTURE', subtitle: 'NIRAV Silk-Cotton Crew Tee', price: '₹2,499' }
  },
  {
    tag: '🎨 VINTAGE DROPS — LIMITED',
    title: 'STREETWEAR WITH A STORY.',
    highlight: 'STORY',
    desc: 'Hand-distressed vintage graphics and raw-edge detailing. Each tee tells a different story.',
    cta: { label: 'Shop Vintage Drops →', href: '/products?category=graphic' },
    cta2: { label: 'New Arrivals', href: '/products' },
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000&q=80',
    badge: { title: 'LIMITED', subtitle: 'NIRAV Vintage Crest Graphic Tee', price: '₹1,299' }
  }
];

const CATEGORY_BANNERS = [
  { label: 'Oversized', category: 'oversized', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80' },
  { label: 'Vintage Graphic', category: 'graphic', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80' },
  { label: 'Silk Blend', category: 'luxury', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80' },
  { label: 'Pique Polo', category: 'polo', image: 'https://images.unsplash.com/photo-1625910513413-562725e21972?w=600&q=80' },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide(idx);
      setIsTransitioning(false);
    }, 200);
  }, [isTransitioning]);

  // Auto-advance carousel every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((activeSlide + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlide, goToSlide]);

  const slide = HERO_SLIDES[activeSlide];

  const filteredProducts = activeCategory === 'all'
    ? INITIAL_PRODUCTS
    : INITIAL_PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div>
      {/* ── Hero Carousel ─────────────────────────────────── */}
      <section className="hero-section" style={{ background: 'var(--bg-silk)' }}>
        <div className="container">
          <div className="hero-grid" style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.2s ease' }}>
            <div className="hero-content">
              <span className="hero-tag">{slide.tag}</span>
              <h1 className="hero-title">
                {slide.title.split(slide.highlight).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span style={{ color: 'var(--accent-gold)' }}>{slide.highlight}</span>}
                  </span>
                ))}
              </h1>
              <p className="hero-desc">{slide.desc}</p>
              <div className="hero-cta-row">
                <Link href={slide.cta.href} className="btn-primary btn-gold">{slide.cta.label}</Link>
                <Link href={slide.cta2.href} className="btn-outline">{slide.cta2.label}</Link>
              </div>

              {/* Carousel dots */}
              <div className="carousel-dots" style={{ marginTop: '24px' }}>
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={`carousel-dot ${i === activeSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="hero-image-wrapper">
              <img
                src={slide.image}
                alt="NIRAV T-Shirts"
                className="hero-img"
                loading={activeSlide === 0 ? 'eager' : 'lazy'}
              />
              <div className="hero-badge-overlay">
                <span className="hero-badge-title">{slide.badge.title}</span>
                <p className="hero-badge-subtitle">{slide.badge.subtitle}</p>
                <strong style={{ fontSize: '0.88rem', color: 'var(--accent-gold)' }}>{slide.badge.price}</strong>
              </div>

              {/* Prev/Next arrows */}
              <button
                onClick={() => goToSlide((activeSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(20,22,29,0.7)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-cream)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                aria-label="Previous slide"
              >‹</button>
              <button
                onClick={() => goToSlide((activeSlide + 1) % HERO_SLIDES.length)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(20,22,29,0.7)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-cream)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                aria-label="Next slide"
              >›</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ──────────────────────────────────── */}
      <section className="trust-bar">
        <div className="container">
          <div className="trust-grid">
            {[
              { icon: '🌿', title: '240 GSM Bio-Washed Cotton', desc: 'Heavyweight organic fabric' },
              { icon: '📐', title: 'Bespoke Tailored Fit', desc: 'Perfect drop-shoulder silhouette' },
              { icon: '🚚', title: 'Free Delivery Above ₹1999', desc: 'COD available across India' },
              { icon: '🔄', title: '7-Day Easy Returns', desc: 'Hassle-free size exchange' },
            ].map((badge, i) => (
              <div key={i} className="trust-item">
                <span className="trust-icon">{badge.icon}</span>
                <strong className="trust-title">{badge.title}</strong>
                <p className="trust-desc">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Banner Cards ─────────────────────────── */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">SHOP BY STYLE</span>
            <h2 className="section-title">Explore Collections</h2>
          </div>
          <div className="category-grid">
            {CATEGORY_BANNERS.map((cat) => (
              <Link key={cat.category} href={`/products?category=${cat.category}`} className="category-card">
                <img src={cat.image} alt={cat.label} className="category-card-img" loading="lazy" />
                <div className="category-card-overlay">
                  <span className="category-card-label">NIRAV</span>
                  <span className="category-card-name">{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">THE COLLECTION</span>
            <h2 className="section-title">Men's T-Shirt Drops</h2>
          </div>

          {/* Filter pills */}
          <div className="filter-bar">
            {[
              { value: 'all', label: `All T-Shirts (${INITIAL_PRODUCTS.length})` },
              { value: 'oversized', label: 'Oversized Fits' },
              { value: 'graphic', label: 'Vintage Graphics' },
              { value: 'luxury', label: 'Silk Blend' },
              { value: 'polo', label: 'Pique Polos' },
            ].map(f => (
              <button
                key={f.value}
                className={`filter-pill ${activeCategory === f.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/products" className="btn-outline" style={{ padding: '12px 32px' }}>
              View Full Collection →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Story Section ───────────────────────────── */}
      <section className="brand-story">
        <div className="container">
          <div className="brand-story-grid">
            <div>
              <span className="section-tag" style={{ textAlign: 'left' }}>THE NIRAV CRAFT</span>
              <h2 className="section-title" style={{ textAlign: 'left', margin: '12px 0 20px', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
                Uncompromising Quality in Every Thread.
              </h2>
              <p style={{ color: '#A09A8E', fontSize: '0.97rem', marginBottom: '24px', lineHeight: 1.8 }}>
                Every NIRAV T-Shirt undergoes a rigorous 14-step manufacturing process. From sourcing 100% organic long-staple cotton to custom hand-acid washing, our garments are built to retain structure, softness, and vibrant texture wash after wash.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                {[
                  { stat: '14', label: 'Production Steps' },
                  { stat: '240', label: 'GSM Fabric Weight' },
                  { stat: '100%', label: 'Organic Cotton' },
                  { stat: '7-Day', label: 'Return Window' },
                ].map(item => (
                  <div key={item.stat} style={{ background: 'rgba(212,175,55,0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--accent-gold)', fontWeight: '700' }}>{item.stat}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/products" className="btn-primary btn-gold">
                View All Men's T-Shirts →
              </Link>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80"
                alt="NIRAV Craftsmanship"
                className="brand-story-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
