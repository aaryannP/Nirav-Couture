'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nirav_cart');
      const savedWishlist = localStorage.getItem('nirav_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.log('LocalStorage parse error:', e);
    }
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

  const addToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const addToCart = (product, selectedSize = 'L', selectedColor = null) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += 1;
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          title: product.title,
          price: product.price,
          frontImage: product.frontImage,
          selectedSize: selectedSize || product.sizes?.[0] || 'L',
          selectedColor: selectedColor || product.colors?.[0]?.name || 'Default',
          qty: 1
        }];
      }
    });
    addToast(`Added "${product.title}" to Bag!`);
    setIsCartOpen(true);
  };

  const updateCartQty = (id, selectedSize, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === selectedSize) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id, selectedSize) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed item from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Saved to Wishlist ❤');
        return [...prev, productId];
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
