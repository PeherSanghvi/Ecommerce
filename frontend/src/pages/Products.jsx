import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import CategoryHierarchy from '../components/CategoryHierarchy';
import { SkeletonCard } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Check, X, Search as SearchIcon } from 'lucide-react';
import { formatINR } from '../utils/currency';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Local filter states
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const keyword = searchParams.get('q') || '';
  const department = searchParams.get('department') || '';
  const subcategory = searchParams.get('subcategory') || '';
  
  const [priceRange, setPriceRange] = useState(500000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOption, setSortOption] = useState('Featured');

  // Fetch products on search params change
  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (keyword) params.keyword = keyword;
      if (department) params.department = department;
      if (subcategory) params.subcategory = subcategory;

      const response = await api.get('/products', { params });
      const fetchedProducts = response.data.data || [];

      setProducts(fetchedProducts);
      setTotalPages(response.data.pagination?.totalPages || 0);
      setError(null);
    } catch (error) {
      setError('Failed to load collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams([['page', '1']]));
    setPriceRange(500000);
    setSelectedBrands([]);
  };

  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  // Client side filtering
  let filteredProducts = products.filter(p => {
    const price = (p.price_minor ?? p.effectivePriceCents ?? p.price ?? 0);
    return price <= priceRange;
  });

  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedBrands.includes(p.brand || 'Generic'));
  }

  // Client side sorting
  if (sortOption === 'Price: Low to High') {
    filteredProducts.sort((a, b) => ((a.price_minor ?? a.effectivePriceCents ?? a.priceCents ?? 0) - (b.price_minor ?? b.effectivePriceCents ?? b.priceCents ?? 0)));
  } else if (sortOption === 'Price: High to Low') {
    filteredProducts.sort((a, b) => ((b.price_minor ?? b.effectivePriceCents ?? b.priceCents ?? 0) - (a.price_minor ?? a.effectivePriceCents ?? a.priceCents ?? 0)));
  }

  const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Generic'];

  return (
    <div className="bg-white min-h-screen pb-24 pt-10 font-sans">
      <div className="flex gap-0">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block lg:w-80 border-r border-gray-200 sticky top-20 h-fit max-h-[calc(100vh-80px)] overflow-y-auto">
          <CategoryHierarchy isOpen={true} onClose={() => {}} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="container-minimal">
            {/* Header & Page Title */}
            <div className="flex flex-col mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tighter capitalize mb-4 break-words">
                {keyword ? `Search: "${keyword}"` : subcategory ? subcategory : department ? department : 'Collection'}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <p className="text-gray-400 font-medium">Showing {filteredProducts.length} premium items</p>
                
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 bg-gray-50 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm uppercase tracking-wider">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>
                  <div className="relative group hidden md:block">
                    <select 
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="bg-gray-50 border border-gray-100 rounded-full py-2.5 pl-6 pr-12 text-sm font-bold text-gray-900 appearance-none outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-sm uppercase tracking-wider"
                    >
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest Arrivals</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 flex-wrap"
                  >
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      ← Previous
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                            page === pageNum
                              ? 'bg-black text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Next →
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <p className="text-2xl font-bold text-gray-900 mb-2">No products found</p>
                <p className="text-gray-500">Try adjusting your filters or search criteria</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              />
              <CategoryHierarchy isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Products;
