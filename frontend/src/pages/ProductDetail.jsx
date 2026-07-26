import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Zap, Star, Truck, Shield, RotateCcw, ChevronRight } from 'lucide-react';
import api from '../api';
import ImageGallery from '../components/ImageGallery';
import SpecificationsList from '../components/SpecificationsList';
import RelatedProducts from '../components/RelatedProducts';
import NotFound from '../components/NotFound';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { formatINR, calculateDiscount } from '../utils/currency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useUser();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product on mount and when ID changes
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Update wishlist state
  useEffect(() => {
    if (product) {
      setIsWishlisted(isInWishlist(product._id || product.id));
    }
  }, [product, isInWishlist]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data?.success && response.data?.data) {
        setProduct(response.data.data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate prices and discount
  const priceCents = useMemo(() => {
    return product?.price_minor ?? product?.effectivePriceCents ?? product?.priceCents ?? 0;
  }, [product]);

  const originalPriceCents = useMemo(() => {
    return product?.priceCents ? product.priceCents : Math.round(priceCents * 1.2);
  }, [product, priceCents]);

  const discount = useMemo(() => {
    return calculateDiscount(originalPriceCents, priceCents);
  }, [originalPriceCents, priceCents]);

  // Generate stable rating and reviews
  const rating = useMemo(() => {
    return product?.rating || parseFloat((4 + Math.random()).toFixed(1));
  }, [product?.id]);

  const reviewsCount = useMemo(() => {
    return product?.reviewsCount || Math.floor(Math.random() * 500) + 20;
  }, [product?.id]);

  // Parse description
  const getDescription = () => {
    const raw = product?.description;
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

  // Get gallery images
  const getGalleryImages = () => {
    const images = [];
    
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      images.push(...product.images);
    } else if (typeof product?.images === 'string') {
      try {
        const parsed = JSON.parse(product.images.replace(/'/g, '"'));
        if (Array.isArray(parsed) && parsed.length > 0) images.push(...parsed);
        else images.push(product.images);
      } catch {
        images.push(product.images);
      }
    }

    if (product?.thumbnail && !images.includes(product.thumbnail)) images.push(product.thumbnail);
    if (product?.thumbnailUrl && !images.includes(product.thumbnailUrl)) images.push(product.thumbnailUrl);
    
    if (product?.image) {
      if (typeof product.image === 'string' && !images.includes(product.image)) images.push(product.image);
      else if (Array.isArray(product.image)) {
        product.image.forEach(img => { if (!images.includes(img)) images.push(img) });
      }
    }

    if (images.length === 0) {
      const dept = (product?.department || product?.category || '').toLowerCase();
      if (dept.includes('electronics')) images.push('https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600');
      else if (dept.includes('home')) images.push('https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600');
      else if (dept.includes('beauty')) images.push('https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600');
      else images.push('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600');
    }
    
    return [...new Set(images.filter(Boolean))];
  };

  // Handlers
  const handleAddToCart = () => {
    if (product.stockQuantity === 0) {
      toast?.error('Product is out of stock');
      return;
    }
    addToCart(product, quantity);
    toast?.success(`${quantity} × ${product.title} added to cart`);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (product.stockQuantity === 0) {
      toast?.error('Product is out of stock');
      return;
    }
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id || product.id);
      setIsWishlisted(false);
      toast?.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
      toast?.success('Added to wishlist');
    }
  };

  // 404 State
  if (notFound && !loading) {
    return (
      <NotFound
        title="Product Not Found"
        message="The product you're looking for doesn't exist or has been removed."
      />
    );
  }

  // Loading State
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-gray-200 border-t-black rounded-full"
          />
          <p className="text-gray-600 font-medium">Loading product details...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-200 sticky top-0 z-30 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-black transition-colors font-medium"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigate('/products')}
              className="text-gray-500 hover:text-black transition-colors font-medium"
            >
              Products
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {product?.category && (
              <>
                <button
                  onClick={() => navigate(`/products?category=${product.category}`)}
                  className="text-gray-500 hover:text-black transition-colors font-medium"
                >
                  {product.category}
                </button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            <span className="text-black font-bold line-clamp-1">{product?.title}</span>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <ImageGallery images={getGalleryImages()} title={product?.title} />
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 flex flex-col"
          >
            {/* Header Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                    {product?.brand || 'Aura Exclusive'}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-black mb-4 leading-tight tracking-tight">
                    {product?.title}
                  </h1>
                  <div className="flex items-center gap-6 flex-wrap mb-6">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            style={{
                              fill: i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb',
                              color: i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb',
                            }}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-black">{rating}</span>
                      <span className="text-sm text-gray-500">({reviewsCount} reviews)</span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      {product?.stockQuantity === 0 ? (
                        <>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D14343' }} />
                          <span className="text-sm font-semibold text-gray-700">Out of Stock</span>
                        </>
                      ) : product?.stockQuantity < 10 ? (
                        <>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                          <span className="text-sm font-semibold text-gray-700">
                            Only {product?.stockQuantity} left
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1E8E5A' }} />
                          <span className="text-sm font-semibold text-gray-700">In Stock</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlistToggle}
                  className="p-3 rounded-full border border-gray-300 hover:border-black transition-colors ml-4"
                >
                  <Heart
                    className="w-6 h-6 transition-colors"
                    style={{
                      fill: isWishlisted ? '#D14343' : 'none',
                      color: isWishlisted ? '#D14343' : '#666',
                    }}
                  />
                </motion.button>
              </div>

              {/* Category */}
              {product?.category && (
                <div className="text-sm text-gray-600 mb-6">
                  Category:{' '}
                  <button
                    onClick={() => navigate(`/products?category=${product.category}`)}
                    className="font-bold text-black hover:underline"
                  >
                    {product.category}
                  </button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 pb-8 border-b border-gray-200"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-black text-black">{formatINR(priceCents)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-xl line-through text-gray-400">
                      {formatINR(originalPriceCents)}
                    </span>
                    <span
                      className="text-lg font-black uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#D14343', color: 'white' }}
                    >
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                You save {formatINR(originalPriceCents - priceCents)}
              </p>
            </motion.div>

            {/* Quantity Selector */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 pb-8 border-b border-gray-200"
            >
              <label className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 block">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product?.stockQuantity === 0}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product?.stockQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    disabled={product?.stockQuantity === 0}
                    className="w-16 text-center font-bold text-black outline-none disabled:bg-gray-50 disabled:opacity-50"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product?.stockQuantity, quantity + 1))}
                    disabled={product?.stockQuantity === 0 || quantity >= product?.stockQuantity}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product?.stockQuantity && product.stockQuantity > 0
                    ? `${product.stockQuantity} available`
                    : 'Out of stock'}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product?.stockQuantity === 0}
                className="py-4 px-6 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-2 border-black text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product?.stockQuantity === 0}
                className="py-4 px-6 rounded-lg font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-sm text-black">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over ₹500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-sm text-black">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-black flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-sm text-black">Easy Returns</p>
                  <p className="text-xs text-gray-600">30 days guarantee</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-gray-200 pt-16"
        >
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
            {['description', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-bold uppercase tracking-wider text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab === 'description' ? 'Description' : 'Specifications'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatedTabContent activeTab={activeTab} product={product} description={getDescription()} />
        </motion.div>
      </motion.div>

      {/* Related Products */}
      {product?.category && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <RelatedProducts
            category={product.category}
            productId={product._id || product.id}
            limit={6}
          />
        </motion.div>
      )}
    </div>
  );
};

// Animated Tab Content Component
const AnimatedTabContent = ({ activeTab, product, description }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={activeTab}
    >
      {activeTab === 'description' && (
        <div className="prose prose-sm max-w-none">
          <p className="text-base text-gray-700 leading-relaxed mb-6">{description}</p>
          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <h3 className="font-bold text-lg text-black mb-4">Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2" />
                <span className="text-gray-700">Premium quality materials and craftsmanship</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2" />
                <span className="text-gray-700">Designed for modern lifestyle and durability</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2" />
                <span className="text-gray-700">Expert customer service and support</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-black rounded-full flex-shrink-0 mt-2" />
                <span className="text-gray-700">Warranty and guarantee included</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'specifications' && (
        <SpecificationsList
          specifications={product?.specifications}
          description={product?.description}
        />
      )}
    </motion.div>
  );
};

export default ProductDetail;
