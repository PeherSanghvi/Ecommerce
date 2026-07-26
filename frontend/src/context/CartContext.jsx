import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed && parsed.items ? parsed : { items: [] });
      } catch {
        setCart({ items: [] });
      }
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product, quantity = 1) => {
    // Ensure productId is always a string and never undefined/null
    const productId = String(product._id || product.id).trim();
    if (!productId || productId === 'undefined' || productId === 'null') {
      console.error('Invalid product:', product);
      throw new Error('Product ID is required');
    }

    const existingIndex = cart.items.findIndex(item => item.productId === productId);
    
    // Get price from product - try multiple fields as fallback
    const priceCents = product.price_minor ?? product.effectivePriceCents ?? product.priceCents ?? 0;
    
    let updatedItems;

    if (existingIndex >= 0) {
      updatedItems = cart.items.map((item, i) =>
        i === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updatedItems = [
        ...cart.items,
        {
          productId: productId, // Always string
          sku: product.sku || '',
          title: product.title || 'Untitled Product',
          brand: product.brand || 'AURA Exclusive',
          thumbnailUrl: product.thumbnailUrl || product.thumbnail || product.images?.[0] || '',
          unitPriceCents: Math.max(0, priceCents), // Ensure non-negative
          quantity: Math.max(1, quantity), // Ensure at least 1
        },
      ];
    }

    saveCart({ ...cart, items: updatedItems });
  };

  const updateCartItem = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedItems = cart.items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    saveCart({ ...cart, items: updatedItems });
  };

  const removeFromCart = (productId) => {
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    saveCart({ ...cart, items: updatedItems });
  };

  const clearCart = () => {
    saveCart({ items: [] });
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalCents = cart.items.reduce((sum, item) => sum + (item.unitPriceCents * item.quantity), 0);
  
  // Calculate totals with proper pricing
  const shippingCents = 0; // Free shipping
  const taxPercentage = 0.08; // 8% tax
  const taxCents = Math.round(subtotalCents * taxPercentage);
  const totalCents = subtotalCents + shippingCents + taxCents;

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    totalItems,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
