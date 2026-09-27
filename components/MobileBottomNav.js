'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../lib/store-context';
import { useAuth } from '../lib/auth-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, setIsCartOpen } = useStore();
  const { user } = useAuth();
  const cartCount = cart.reduce((t, i) => t + i.qty, 0);

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`} aria-label="Home">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Home</span>
      </Link>

      <Link href="/products" className={`bottom-nav-item ${pathname === '/products' ? 'active' : ''}`} aria-label="Products">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
        <span>Shop</span>
      </Link>

      <button
        className="bottom-nav-item bottom-nav-cart"
        onClick={() => setIsCartOpen(true)}
        aria-label={`Shopping bag, ${cartCount} items`}
      >
        <div className="bottom-nav-cart-icon">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
        </div>
        <span>Bag</span>
      </button>

      <Link href="/wishlist" className={`bottom-nav-item ${pathname === '/wishlist' ? 'active' : ''}`} aria-label="Wishlist">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>Saved</span>
      </Link>

      <Link
        href={user ? '/account' : '/login'}
        className={`bottom-nav-item ${pathname === '/account' || pathname === '/login' ? 'active' : ''}`}
        aria-label="Account"
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{user ? user.name.split(' ')[0] : 'Sign In'}</span>
      </Link>
    </nav>
  );
}
