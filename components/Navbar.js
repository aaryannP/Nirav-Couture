'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../lib/store-context';
import { useAuth } from '../lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { cart, wishlist, setIsCartOpen } = useStore();
  const { user, logout, isAdmin } = useAuth();
  
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <header className="navbar-sticky">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link href="/" className="brand-logo">
          <h1>NIRAV</h1>
          <span>COUTURE</span>
        </Link>

        {/* Navigation Menu */}
        <nav>
          <ul className="nav-menu">
            <li>
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className={`nav-link ${pathname === '/products' ? 'active' : ''}`}>
                Men's T-Shirts
              </Link>
            </li>
            <li>
              <Link href="/products?category=oversized" className="nav-link">
                Oversized
              </Link>
            </li>
            <li>
              <Link href="/products?category=graphic" className="nav-link">
                Vintage Drops
              </Link>
            </li>
            <li>
              <Link href="/track-order" className={`nav-link ${pathname === '/track-order' ? 'active' : ''}`} style={{ color: 'var(--accent-gold)' }}>
                🚚 Live Track
              </Link>
            </li>
          </ul>
        </nav>

        {/* Action Controls & User Account Menu */}
        <div className="nav-actions">
          {/* Admin Dashboard Link (Shown if user is Admin) */}
          {isAdmin && (
            <Link href="/admin/dashboard" className="admin-badge-nav" title="Admin Portal">
              Admin Panel ⚙
            </Link>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/account" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '999px', border: '1px solid var(--border-cream)' }}>
                <img 
                  src={user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name)} 
                  alt={user.name} 
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>

              <button 
                onClick={logout}
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline', fontWeight: '600' }}
                title="Sign Out"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              Sign In
            </Link>
          )}

          {/* Wishlist Link */}
          <Link href="/wishlist" className="icon-btn" title="Wishlist">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>

          {/* Cart Drawer Trigger */}
          <button className="icon-btn" onClick={() => setIsCartOpen(true)} title="Shopping Bag">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
