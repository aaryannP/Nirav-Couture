'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../lib/store-context';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist } = useStore();
  const isSaved = wishlist.includes(product.id);
  const isOutOfStock = product.stock === 0;

  const slides = Array.from(
    new Set([
      product.frontImage,
      product.backImage,
      ...(product.images || [])
    ].filter(Boolean))
  );

  const [isHovered, setIsHovered] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (slides.length > 1) {
      setActiveSlide(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveSlide(0);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="card-zed">
      <div
        className="card-zed-media"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          aria-label="Wishlist"
        >
          <svg width="17" height="17" fill={isSaved ? "#E8363C" : "none"} stroke={isSaved ? "#E8363C" : "#000000"} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* 4-Image Slideshow (Slide 0: Only T-Shirt -> Hover Slide 1..3: Model Mockups) */}
        <Link href={`/products/${product.slug}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
          {slides.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt={`${product.title} - View ${idx + 1}`}
              loading="lazy"
              style={{
                position: idx === 0 ? 'relative' : 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: activeSlide === idx ? 1 : 0,
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                transition: 'opacity 0.3s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            />
          ))}
        </Link>

        {/* Left & Right Slider Arrows (Hover on Desktop, Always Accessible on Mobile Touch) */}
        {slides.length > 1 && (
          <div className={`card-slider-controls ${isHovered ? 'is-hovered' : ''}`}>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="card-slider-arrow prev"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="card-slider-arrow next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Slide Indicator Dots */}
            <div className="card-slider-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSlide(idx);
                  }}
                  aria-label={`Slide ${idx + 1}`}
                  style={{
                    width: activeSlide === idx ? '14px' : '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: activeSlide === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-zed-details">
        <Link href={`/products/${product.slug}`}>
          <h3 className="card-zed-title">{product.title}</h3>
        </Link>

        <div className="card-zed-prices">
          <span style={{ color: '#000000' }}>Rs. {product.price.toLocaleString('en-IN')}.00</span>
        </div>
      </div>
    </div>
  );
}

