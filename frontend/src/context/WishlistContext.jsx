import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        setWishlist(Array.isArray(parsed) ? parsed : []);
      } catch {
        setWishlist([]);
      }
    }
  }, []);

  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const addToWishlist = (product) => {
    const productId = typeof product === 'string' ? product : (product._id || product.id);
    if (productId && !wishlist.includes(productId)) {
      saveWishlist([...wishlist, productId]);
    }
  };

  const removeFromWishlist = (productId) => {
    saveWishlist(wishlist.filter(id => id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
