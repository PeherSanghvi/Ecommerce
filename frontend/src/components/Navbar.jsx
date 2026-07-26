import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { Search, ShoppingBag, User, Heart, Menu, X, LogOut, Package, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const Navbar = () => {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await api.get(`/products`, { params: { page: 0, size: 5, keyword: searchQuery } });
          setSearchSuggestions(res.data.content || []);
        } catch (e) {
          setSearchSuggestions([]);
        }
      } else {
        setSearchSuggestions([]);
      }
    };
    
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Collections', href: '/products' },
    { name: 'New Arrivals', href: '/products?category=new' },
    { name: 'Trending', href: '/products?category=trending' },
  ];

  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const currentCategory = new URLSearchParams(location.search).get('category') || '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/products/categories');
        setCategories(res.data.data || []);
      } catch (e) {
        // silent
      }
    };
    fetchCats();
  }, []);

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 transition-all duration-300">
      {/* Existing navbar content */}
      <div className="container-minimal flex items-center justify-between h-24">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-3 group z-50">
          <svg className="w-10 h-10 text-black transition-transform group-hover:rotate-90 duration-500" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 0L48 24L24 48L0 24L24 0Z" fill="currentColor"/>
            <path d="M24 12L36 24L24 36L12 24L24 12Z" fill="white"/>
          </svg>
          <span className="text-2xl font-black tracking-[0.2em] uppercase text-black">AURA</span>
        </Link>

        {/* Center: Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              className="text-xs font-bold transition-colors uppercase tracking-[0.15em] relative group" style={{ color: 'var(--text-primary)' }}
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full" style={{ backgroundColor: 'var(--accent-primary)' }}></span>
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-8">
          
          {/* User Profile */}
          {isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-4 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden glass-card z-50"
                  >
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                      <p className="font-bold text-gray-900 truncate text-lg">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{user?.email}</p>
                    </div>
                    <div className="p-3 space-y-1">
                      <Link to="/orders" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors group">
                        <span className="flex items-center gap-3"><Package className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" /> My Orders</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                      </Link>
                      <Link to="/products" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors group">
                        <span className="flex items-center gap-3"><Heart className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" /> Wishlist</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                      </Link>
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button onClick={() => { logout(); setIsProfileMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-colors text-left group">
                        <span className="flex items-center gap-3"><LogOut className="w-4 h-4" /> Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold uppercase tracking-wider hover:text-indigo-600 transition-colors">Log In As</Link>
          )}

          {/* Wishlist */}
          <Link to="/products" className="relative hover:scale-110 transition-transform text-gray-900 hover:text-rose-500">
            <Heart className="w-6 h-6" strokeWidth={1.5} />
            {wishlist?.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart - Mini-cart icon with item count badge per spec */}
          <Link to="/cart" className="relative hover:scale-110 transition-transform" style={{ color: 'var(--text-primary)' }}>
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {cart?.items?.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white" style={{ backgroundColor: 'var(--accent-cta)' }}>
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-6 lg:hidden z-50">
          <Link to="/cart" className="relative">
            <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            {cart?.items?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-white text-[10px] font-bold flex items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-cta)' }}>
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 rounded-full" style={{ backgroundColor: 'var(--bg-base)' }}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 top-24 backdrop-blur-2xl z-40 flex flex-col px-6 py-8 overflow-y-auto"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            {/* Search removed per spec */}

            <div className="flex flex-col gap-8 mb-10">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-black uppercase tracking-[0.1em] transition-colors" style={{ color: 'var(--text-primary)' }}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-10 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-xl">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold p-4 bg-gray-50 rounded-2xl"><Package /> My Orders</Link>
                  <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 text-xl font-bold p-4 bg-gray-50 rounded-2xl"><Heart /> Wishlist</Link>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 text-xl font-bold p-4 bg-red-50 text-red-600 rounded-2xl">
                    <LogOut /> Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-minimal w-full py-5 text-lg">Log In As</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Capsule Navigation */}
    <div className={`sticky top-[96px] z-40 flex justify-center py-4 transition-all duration-300 pointer-events-none ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`pointer-events-auto flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border border-white/20 backdrop-blur-xl transition-all duration-300 overflow-x-auto no-scrollbar max-w-[95vw] ${scrolled ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/70' : 'shadow-sm bg-white/50'}`}
      >
        <Link 
          to="/products"
          className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap flex-shrink-0 ${!currentCategory ? 'text-white' : 'text-gray-600 hover:text-black'}`}
        >
          {!currentCategory && <motion.div layoutId="capsule-active" className="absolute inset-0 bg-black rounded-full -z-10 shadow-md" />}
          All Products
        </Link>
        {categories.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <Link 
              key={cat}
              to={`/products?category=${cat}`}
              className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-colors whitespace-nowrap flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600 hover:text-black'}`}
            >
              {isActive && <motion.div layoutId="capsule-active" className="absolute inset-0 bg-black rounded-full -z-10 shadow-md" />}
              {cat}
            </Link>
          );
        })}
      </motion.div>
    </div>
    </>
  );
};

export default Navbar;

