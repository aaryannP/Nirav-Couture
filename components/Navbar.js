'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '../lib/store-context';
import { useAuth } from '../lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, wishlist, setIsCartOpen } = useStore();
  const { user, logout, isAdmin } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* 1. Top Announcement Bar */}
      <div className="announcement-bar">
        FREE SHIPPING ACROSS INDIA ON ORDERS OVER ₹1,499 • 100% LUXURY HEAVYWEIGHT COTTON
      </div>

      {/* 2. Main Site Header */}
      <header className="site-header">
        <div className="container nav-container">
          {/* Left: MENU Button & Search Icon */}
          <div className="nav-left">
            <button 
              className="zed-menu-trigger-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <span>MENU</span>
            </button>

            <button 
              className="nav-icon-btn"
              onClick={() => setIsSearchOpen(prev => !prev)}
              aria-label="Search Catalog"
              title="Search"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          {/* Center: Minimalist High-Fashion Logo */}
          <Link href="/" className="brand-logo-zed">
            <h1>NIRAV</h1>
            <span>COUTURE</span>
          </Link>

          {/* Right: Account, Wishlist, Animated Shopping Cart */}
          <div className="nav-right">
            {isAdmin && (
              <Link href="/admin/dashboard" style={{ fontSize: '0.75rem', fontWeight: '800', background: '#000', color: '#fff', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ADMIN
              </Link>
            )}

            <Link href={user ? "/account" : "/login"} className="nav-icon-btn" aria-label="Account" title={user ? user.name : "Sign In"}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>

            <Link href="/wishlist" className="nav-icon-btn" aria-label="Wishlist" title="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlist.length > 0 && <span className="cart-badge-bubble">{wishlist.length}</span>}
            </Link>

            {/* Animated Shopping Bag (Zedsonwear Lottie-Style) */}
            <button 
              className="cart-animated-icon"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Shopping Bag"
              title="Shopping Bag"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && <span className="cart-badge-bubble">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Drop-Down Search Overlay */}
      <div className={`search-overlay-zed ${isSearchOpen ? 'active' : ''}`}>
        <div className="container">
          <form onSubmit={handleSearchSubmit} className="search-form-inner">
            <input 
              type="text" 
              placeholder="Search heavyweight t-shirts, oversized, vintage drops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
              autoFocus={isSearchOpen}
            />
            <button type="submit" className="search-submit-btn">
              SEARCH
            </button>
          </form>
        </div>
      </div>

      {/* 4. Slide-Out Menu Drawer (Zedsonwear Style) */}
      <div 
        className={`menu-drawer-backdrop ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <aside className={`menu-drawer-zed ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-drawer-header">
          <span style={{ fontWeight: '900', letterSpacing: '0.14em', fontSize: '1rem', textTransform: 'uppercase' }}>
            NIRAV COUTURE
          </span>
          <button onClick={() => setIsMenuOpen(false)} className="close-btn" aria-label="Close Menu">
            ✕
          </button>
        </div>

        <nav className="menu-drawer-nav">
          <Link href="/" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            HOME
          </Link>
          <Link href="/products" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            ALL PRODUCTS
          </Link>
          <Link href="/products?category=oversized" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            OVERSIZED T-SHIRTS
          </Link>
          <Link href="/products?category=graphic" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            VINTAGE DROPS
          </Link>
          <Link href="/products?category=luxury" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            SILK-COTTON BLEND
          </Link>
          <Link href="/wishlist" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            MY WISHLIST ({wishlist.length})
          </Link>
          <Link href="/account" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            MY ACCOUNT
          </Link>
          <Link href="/contact" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            CONTACT US
          </Link>
          <Link href="/returns-policy" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            RETURN & REFUND POLICY
          </Link>
          <Link href="/shipping-policy" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            SHIPPING POLICY
          </Link>
          <Link href="/terms-and-conditions" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            TERMS & CONDITIONS
          </Link>
          <Link href="/privacy-policy" className="menu-nav-item" onClick={() => setIsMenuOpen(false)}>
            PRIVACY POLICY
          </Link>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <p style={{ fontWeight: '700', color: '#000', marginBottom: '4px' }}>NEED HELP?</p>
          <a href="https://wa.me/917990629029" target="_blank" rel="noreferrer" style={{ color: '#000', fontWeight: '600' }}>WhatsApp: +91 79906 29029</a>
          <p style={{ marginTop: '4px' }}>Email: nirav@niravcouture.com</p>
        </div>
      </aside>
    </>
  );
}
