import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-24 pb-12 border-t border-gray-900 font-sans">
      <div className="container-minimal">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <svg className="w-8 h-8 text-white transition-transform group-hover:rotate-90 duration-500" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 0L48 24L24 48L0 24L24 0Z" fill="currentColor"/>
                <path d="M24 12L36 24L24 36L12 24L24 12Z" fill="black"/>
              </svg>
              <span className="text-2xl font-black tracking-[0.2em] uppercase">AURA</span>
            </Link>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm font-light">
              Elevating your lifestyle with curated premium products. Experience the extraordinary with AURA.
            </p>
            <form className="flex max-w-sm relative group">
              <input 
                type="email" 
                placeholder="Join our newsletter" 
                className="w-full bg-gray-900 border border-gray-800 rounded-full py-3.5 pl-6 pr-32 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button type="button" className="absolute right-1.5 top-1.5 bottom-1.5 bg-white text-black hover:bg-gray-200 px-6 rounded-full text-xs font-bold uppercase tracking-wider transition-colors">
                Subscribe
              </button>
            </form>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-[0.1em] text-xs uppercase">Collections</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=home" className="hover:text-white transition-colors">Home & Garden</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-[0.1em] text-xs uppercase">Assistance</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Track Your Order</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-[0.1em] text-xs uppercase">AURA</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-gray-500 font-light">
            &copy; {new Date().getFullYear()} AURA GLOBAL. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-transform hover:-translate-y-1">
              <span className="sr-only">Facebook</span>
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-transform hover:-translate-y-1">
              <span className="sr-only">Instagram</span>
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-transform hover:-translate-y-1">
              <span className="sr-only">Twitter</span>
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-transform hover:-translate-y-1">
              <span className="sr-only">Youtube</span>
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
