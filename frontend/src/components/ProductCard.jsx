import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Zap, Star } from 'lucide-react';
import { formatINR, centsToRupees, calculateDiscount } from '../utils/currency';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useUser();
  const { addToWishlist, isInWishlist, removeFromWishlist, wishlist } = useWishlist();
  const toast = useToast();

  // Use wishlist state directly - ensure this re-renders when context changes
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Sync local state with context whenever wishlist changes
  useEffect(() => {
    setIsWishlisted(isInWishlist(product._id || product.id));
  }, [wishlist, product._id, product.id, isInWishlist]);

  // Handle price from backend: price_minor is in cents
  const priceCents = product.price_minor ?? product.effectivePriceCents ?? product.priceCents ?? 0;
  const originalPriceCents = product.priceCents ? product.priceCents : Math.round(priceCents * 1.2);
  const discount = calculateDiscount(originalPriceCents, priceCents);

  // Parse description: backend returns array of objects or raw strings like "[{'Product Details': '...'}]"
  const getDescription = () => {
    const raw = product.description;
    if (!raw) return 'Premium quality product from our curated collection.';
    
    if (typeof raw !== 'string') {
      if (Array.isArray(raw)) {
        const details = raw.find(x => x && x["Product Details"]);
        if (details) return details["Product Details"];
        return Object.values(raw[0] || {})[0] || 'Premium quality product from our curated collection.';
      }
      return 'Premium quality product from our curated collection.';
    }

    try {
      const parsed = JSON.parse(raw.replace(/'/g, '"'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        const details = parsed.find(x => x && x["Product Details"]);
        if (details) return details["Product Details"];
        return Object.values(parsed[0] || {})[0] || 'Premium quality product from our curated collection.';
      }
    } catch {
      // Regex to extract value for "Product Details" from Python dict-like strings
      const match = raw.match(/['"]Product Details['"]\s*:\s*['"](.*?)['"]\s*}/i);
      if (match && match[1]) return match[1];

      if (raw.includes('[') || raw.includes('{')) {
        let stripped = raw.replace(/[\[\]{}"]/g, '');
        stripped = stripped.replace(/'Product Details':/gi, '').trim();
        if (stripped.startsWith("'") && stripped.endsWith("'")) {
          stripped = stripped.slice(1, -1);
        }
        return stripped || 'Premium quality product from our curated collection.';
      }
    }
    return raw;
  };

  // Stable fallback so Math.random() is not re-evaluated on every render.
  const rating = useMemo(
    () => product.rating || parseFloat((4 + Math.random()).toFixed(1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id]
  );
  const reviewsCount = useMemo(
    () => product.reviewsCount || Math.floor(Math.random() * 500) + 20,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id]
  );

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id || product.id);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast?.success(`${product.title} added to cart`);
  };
  
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      // Don't add to cart yet — let the user log in first, then return to checkout.
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative overflow-hidden flex flex-col h-full transition-all duration-500 font-sans"
      style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: 'var(--accent-cta)' }}>
            -{discount}% OFF
          </span>
        )}
        {product.stockQuantity === 0 ? (
          <span className="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: 'var(--danger)' }}>
            Out of Stock
          </span>
        ) : product.stockQuantity < 10 ? (
          <span className="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: 'var(--status-pending)' }}>
            Low Stock ({product.stockQuantity})
          </span>
        ) : (
          <span className="text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md" style={{ backgroundColor: 'var(--success)' }}>
            In Stock ({product.stockQuantity})
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistToggle}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 translate-x-2 group-hover:translate-x-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: isWishlisted ? 'var(--accent-cta)' : 'var(--text-secondary)' }}
      >
        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container */}
      <Link to={`/products/${product._id || product.id}`} className="relative h-64 overflow-hidden flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-base)' }}>
        <img
          src={
            (product.images && product.images.length > 0 && product.images[0]) || 
            product.image || 
            product.thumbnail || 
            product.thumbnailUrl || 
            ((product.department || product.category || '').toLowerCase().includes('electronics') ? 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600' :
             (product.department || product.category || '').toLowerCase().includes('home') ? 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600' :
             (product.department || product.category || '').toLowerCase().includes('beauty') ? 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600' :
             'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600')
          }
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Quick actions overlay */}
        <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-out opacity-0 group-hover:opacity-100">
           <button onClick={handleAddToCart} disabled={product.stockQuantity === 0} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>
             <ShoppingBag className="w-4 h-4" /> Add
           </button>
           <button onClick={handleBuyNow} disabled={product.stockQuantity === 0} className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--accent-cta)', color: 'white' }}>
             <Zap className="w-4 h-4" /> Buy
           </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
            {product.brand || 'AURA Exclusive'}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" style={{ fill: '#fbbf24', color: '#fbbf24' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{rating}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>({reviewsCount})</span>
          </div>
        </div>
        
        <Link to={`/products/${product._id || product.id}`}>
          <h3 className="font-bold text-base mb-3 line-clamp-1 leading-tight transition-colors" style={{ color: 'var(--text-primary)' }}>
            {product.title}
          </h3>
        </Link>
        
        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
          {getDescription()}
        </p>
        
        <div className="mt-auto pt-4 border-t flex items-end justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black tracking-tight text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(priceCents)}</span>
              {discount > 0 && <span className="text-sm font-bold line-through" style={{ color: 'var(--text-secondary)' }}>{formatINR(originalPriceCents)}</span>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
