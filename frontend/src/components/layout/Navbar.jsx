import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, Heart, Menu, X, LogOut, Package, Settings, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../../api';

const seededUsers = [
  { id: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'USER' },
  { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'USER' },
  { id: 'user_admin', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN' },
];

const Navbar = () => {
  const { user, login, logout, isAuthenticated } = useUser();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = React.useRef(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsMegaMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/products', { params: { page: 1, limit: 5, keyword: searchQuery } });
        if (response.data?.products) {
          setSearchSuggestions(response.data.products);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLoginAs = async (seededUser) => {
    await login(seededUser.email, 'password123');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Helper for image fallback
  const getSuggestionImage = (product) => {
    return (product.images && product.images.length > 0 && product.images[0]) || 
           product.image || 
           product.thumbnail || 
           product.thumbnailUrl || 
           'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80';
  };

  // Format currency helper
  const formatCurrency = (minor) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((minor || 0) / 100);
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-1 rounded-md text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center space-x-2 group shrink-0">
              <span className="text-2xl font-bold text-white tracking-tight flex items-center gap-1">
                <span className="text-orange-400">a</span>
                mazon<span className="text-orange-400 text-sm">POC</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="flex-1 max-w-2xl px-6 hidden lg:block relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchSuggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search products..."
                className="w-full px-4 py-2 text-gray-900 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-orange-400 hover:bg-orange-500 rounded-r-md text-gray-900 font-medium transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
            
            {/* Live Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-6 right-6 mt-1 bg-white rounded-md shadow-2xl overflow-hidden border border-gray-200 z-50"
                >
                  {searchSuggestions.map(s => (
                    <Link 
                      to={`/products/${s._id || s.id}`} 
                      key={s._id || s.id} 
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-gray-900 transition-colors"
                    >
                      <img src={getSuggestionImage(s)} alt={s.title} className="w-10 h-10 object-contain bg-white rounded" />
                      <div className="flex-1 truncate text-sm font-bold">{s.title}</div>
                      <div className="font-black text-orange-600">{formatCurrency(s.price_minor || s.priceCents || 0)}</div>
                    </Link>
                  ))}
                  <Link 
                    to={`/search?q=${encodeURIComponent(searchQuery)}`} 
                    onClick={() => setShowSuggestions(false)}
                    className="block w-full text-center p-2 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors bg-gray-50 border-t border-gray-100"
                  >
                    See all results for "{searchQuery}"
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            
            {/* Account & Lists */}
            <div className="relative" onMouseLeave={() => setIsProfileOpen(false)}>
              <button 
                onMouseEnter={() => setIsProfileOpen(true)}
                className="flex flex-col items-start hover:border-white border border-transparent p-1 rounded"
              >
                <span className="text-xs text-gray-300">Hello, {user ? user.firstName : 'Sign in'}</span>
                <span className="text-sm font-bold flex items-center gap-1">Account & Lists <ChevronDown size={14}/></span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-2xl py-2 text-gray-800 z-50 border border-gray-200"
                  >
                    {!isAuthenticated ? (
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-md">
                        <div className="text-center mb-3">
                          <Link to="/login" className="bg-orange-400 hover:bg-orange-500 text-gray-900 font-bold py-1.5 px-8 rounded-md inline-block w-full text-sm">Sign in</Link>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Or Login As (Seed Users):</p>
                        {seededUsers.map((su) => (
                          <button
                            key={su.id}
                            onClick={() => handleLoginAs(su)}
                            className="w-full text-left px-2 py-1.5 text-xs hover:bg-orange-100 rounded text-gray-700 hover:text-orange-600 font-medium flex items-center gap-2 transition-colors"
                          >
                            <User size={12}/> {su.name} ({su.role})
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                          <p className="text-sm font-bold truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"><Package size={16}/> Your Orders</Link>
                          {user.role === 'ADMIN' && (
                            <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-orange-600 font-medium transition-colors"><Settings size={16}/> Admin Dashboard</Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button onClick={logout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 transition-colors">
                            <LogOut size={16}/> Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Returns & Orders */}
            {isAuthenticated && (
              <Link to="/orders" className="flex flex-col items-start hover:border-white border border-transparent p-1 rounded">
                <span className="text-xs text-gray-300">Returns</span>
                <span className="text-sm font-bold">& Orders</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="flex items-center hover:border-white border border-transparent p-1 rounded relative group">
              <Heart size={24} className="text-white group-hover:text-orange-400 transition-colors"/>
              {wishlist?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="flex items-center hover:border-white border border-transparent p-1 rounded group">
              <div className="relative">
                <ShoppingCart size={28} className="text-white group-hover:text-orange-400 transition-colors"/>
                <span className="absolute -top-2 left-3 text-orange-400 font-bold text-lg">{totalItems || 0}</span>
              </div>
              <span className="text-sm font-bold mt-3 ml-1">Cart</span>
            </Link>

          </div>

          {/* Mobile Right Actions */}
          <div className="flex lg:hidden items-center gap-4">
             <Link to="/cart" className="flex items-center relative">
                <ShoppingCart size={24} className="text-white"/>
                <span className="absolute -top-2 -right-2 bg-orange-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {totalItems || 0}
                </span>
             </Link>
          </div>
        </div>
      </div>
      
      {/* Subnav / Mega Menu Trigger */}
      <div className="bg-gray-800 text-white border-t border-gray-700 hidden lg:block relative" onMouseLeave={() => setIsMegaMenuOpen(false)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10">
          <button 
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            className="flex items-center gap-1 hover:border-white border border-transparent px-2 py-1 rounded text-sm font-bold mr-2"
          >
            <Menu size={18}/> All Categories
          </button>
          <div className="flex gap-4 overflow-x-auto no-scrollbar text-sm font-medium">
            <Link to="/products" className="hover:border-white border border-transparent px-2 py-1 rounded whitespace-nowrap">All Products</Link>
            {['Fashion', 'Electronics', 'Home & Garden', 'Beauty'].map(cat => (
              <Link key={cat} to={`/products?department=${encodeURIComponent(cat)}`} className="hover:border-white border border-transparent px-2 py-1 rounded whitespace-nowrap capitalize">
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {isMegaMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }}
              className="absolute top-10 left-0 w-full bg-white text-gray-900 shadow-2xl border-t border-gray-200 z-50"
            >
              <div className="max-w-7xl mx-auto px-6 py-8">
                <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-6">Shop by Category</h3>
                <div className="grid grid-cols-4 gap-6">
                  {['Fashion', 'Electronics', 'Home & Garden', 'Beauty'].map((cat) => (
                    <Link 
                      key={cat} 
                      to={`/products?department=${encodeURIComponent(cat)}`}
                      className="text-sm hover:text-orange-600 hover:underline capitalize flex items-center gap-2"
                    >
                      <ChevronRight size={14} className="text-gray-400"/>
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }} transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div className="relative w-4/5 max-w-sm bg-white h-full flex flex-col overflow-y-auto shadow-2xl text-gray-900">
              {/* Header */}
              <div className="bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <User size={24} className={isAuthenticated ? "text-orange-400" : "text-white"}/>
                  <span className="font-bold text-lg">
                    {isAuthenticated ? `Hello, ${user.firstName}` : "Hello, sign in"}
                  </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-800 rounded">
                  <X size={24} />
                </button>
              </div>
              
              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search AmazonPOC..."
                    className="w-full px-4 py-2 text-gray-900 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button type="submit" className="px-4 py-2 bg-orange-400 hover:bg-orange-500 rounded-r-md text-gray-900 font-medium">
                    <Search size={20} />
                  </button>
                </form>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 py-2">
                {!isAuthenticated && (
                  <div className="px-4 py-3 border-b border-gray-200">
                     <Link to="/login" className="block text-center bg-orange-400 hover:bg-orange-500 font-bold py-2 rounded-md mb-3">Sign In</Link>
                     <p className="text-xs font-semibold text-gray-500 mb-2">Seed Users:</p>
                     <div className="flex gap-2 flex-wrap">
                       {seededUsers.map((su) => (
                         <button key={su.id} onClick={() => handleLoginAs(su)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border border-gray-300 shadow-sm">
                           {su.name} ({su.role})
                         </button>
                       ))}
                     </div>
                  </div>
                )}

                <div className="py-2 border-b border-gray-200">
                  <h3 className="px-4 py-2 text-lg font-bold text-gray-800">Shop By Department</h3>
                  <Link to="/products" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm">All Products</Link>
                  
                  {/* Category Accordion */}
                  <div>
                    <button 
                      onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm font-medium"
                    >
                      Categories
                      <ChevronDown size={16} className={`transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isMobileCategoriesOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-gray-50"
                        >
                          {['Fashion', 'Electronics', 'Home & Garden', 'Beauty'].map((cat) => (
                            <Link 
                              key={cat} 
                              to={`/products?department=${encodeURIComponent(cat)}`}
                              className="block px-8 py-2.5 text-gray-600 hover:bg-gray-200 text-sm capitalize border-l-2 border-transparent hover:border-orange-400"
                            >
                              {cat}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="py-2">
                  <h3 className="px-4 py-2 text-lg font-bold text-gray-800">Help & Settings</h3>
                  {isAuthenticated && (
                    <>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"><Package size={18}/> Your Orders</Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 text-sm"><Heart size={18}/> Your Wishlist</Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-orange-600 hover:bg-gray-100 font-medium text-sm"><Settings size={18}/> Admin Dashboard</Link>
                      )}
                      <button onClick={logout} className="w-full flex items-center gap-3 text-left px-4 py-3 text-red-600 hover:bg-gray-100 text-sm">
                        <LogOut size={18}/> Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
