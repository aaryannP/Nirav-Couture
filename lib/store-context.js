'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]); // always stores product IDs (strings)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nirav_cart');
      const savedWishlist = localStorage.getItem('nirav_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        // Migrate: if saved wishlist contains objects instead of IDs, extract IDs
        const normalized = parsed.map(item => (typeof item === 'object' && item !== null ? item.id : item));
        setWishlist(normalized.filter(Boolean));
      }
    } catch (e) {}
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nirav_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('nirav_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const addToCart = (product, selectedSize = null, selectedColor = null) => {
    // Use first available size as default if none provided
    const size = selectedSize || product.sizes?.[0] || 'M';
    const color = selectedColor || product.colors?.[0]?.name || 'Default';

    setCart(prev => {
      const existingIndex = prev.findIndex(item =>
        item.id === product.id && item.selectedSize === size
      );
      if (existingIndex > -1) {
        // Immutable update — spread to new array, spread the item
        const updated = prev.map((item, i) =>
          i === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          title: product.title,
          price: product.price,
          frontImage: product.frontImage,
          selectedSize: size,
          selectedColor: color,
          qty: 1
        }];
      }
    });
    addToast(`Added "${product.title}" to Bag!`);
    setIsCartOpen(true);
  };

  const updateCartQty = (id, selectedSize, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id && item.selectedSize === selectedSize) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id, selectedSize) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  const clearCart = () => {
    setCart([]);
  };

  // toggleWishlist ALWAYS works with product IDs (strings) — never full objects
  const toggleWishlist = (productId) => {
    // Accept either a product ID string or a product object (extract id)
    const id = typeof productId === 'object' && productId !== null ? productId.id : productId;
    setWishlist(prev => {
      const exists = prev.includes(id);
      if (exists) {
        addToast('Removed from Wishlist');
        return prev.filter(existingId => existingId !== id);
      } else {
        addToast('Saved to Wishlist ❤');
        return [...prev, id];
      }
    });
  };

  return (
    <StoreContext.Provider value={{
      cart,
      wishlist,
      isCartOpen,
      setIsCartOpen,
      quickViewProduct,
      setQuickViewProduct,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      toasts,
      addToast
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
