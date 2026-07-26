import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import ProductCard from './ProductCard';
import { SkeletonCard } from './Skeleton';

const RelatedProducts = ({ category, productId, limit = 6 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef(null);

  useEffect(() => {
    fetchRelatedProducts();
  }, [category, productId]);

  const fetchRelatedProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          category: category,
          page: 1,
          limit: limit + 2, // Fetch extra to exclude current product
        },
      });

      if (response.data?.data) {
        // Filter out the current product
        const filtered = response.data.data.filter(
          (p) => (p._id || p.id) !== productId
        );
        setProducts(filtered.slice(0, limit));
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 320; // Width of card + gap
    const currentScroll = scrollContainerRef.current.scrollLeft;

    scrollContainerRef.current.scrollTo({
      left: direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  // Check if we can scroll
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight =
    scrollContainerRef.current &&
    scrollPosition < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="py-16 border-t border-gray-200 mt-16"
      >
        <h2 className="text-3xl font-black text-black mb-8 uppercase tracking-tight">
          Related Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </motion.div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="py-16 border-t border-gray-200 mt-16"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-8"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-black text-black mb-2 uppercase tracking-tight"
        >
          Related Products
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-gray-600 text-sm font-medium"
        >
          Explore more items in the {category} category
        </motion.p>
      </motion.div>

      {/* Products Carousel */}
      <div className="relative group">
        {/* Scroll Container */}
        <motion.div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 -mx-4 px-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id || product.id}
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-80"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Left Scroll Button */}
        {canScrollLeft && (
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('left')}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 hover:border-black transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </motion.button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll('right')}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white shadow-lg border border-gray-200 hover:border-black transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </motion.button>
        )}

        {/* Gradient Fade (Right) */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-5 rounded-r-lg" />
        )}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-10 text-center"
      >
        <a
          href={`/products?category=${encodeURIComponent(category)}`}
          className="inline-block px-8 py-3 border-2 border-black text-black font-bold uppercase tracking-wider rounded-lg hover:bg-black hover:text-white transition-all"
        >
          View All in {category}
        </a>
      </motion.div>
    </motion.section>
  );
};

export default RelatedProducts;
