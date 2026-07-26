import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Lock, ShieldCheck, Tag } from 'lucide-react';
import { formatINR } from '../utils/currency';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, subtotalCents, shippingCents, taxCents, totalCents } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-12 px-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="w-40 h-40 mx-auto mb-10 bg-gray-50 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
          <h1 className="text-4xl font-black text-black mb-6 tracking-tighter">Your bag is empty.</h1>
          <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg font-light">Explore our curated collection and discover your next favorite item.</p>
          <Link to="/products" className="btn-minimal inline-block">
            Explore Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16 font-sans">
      <div className="container-minimal">
        
        <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-5xl font-black text-black tracking-tighter">Review Bag</h1>
          <button onClick={clearCart} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Clear All
          </button>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-16">
          
          {/* Left Column: Cart Items */}
          <div className="flex-1">
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              <AnimatePresence>
                {cart.items.map((item) => {
                  const itemSubtotal = item.unitPriceCents * item.quantity;
                  return (
                    <motion.div 
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="py-8 flex flex-col sm:flex-row gap-8 group"
                    >
                      <Link to={`/products/${item.productId}`} className="shrink-0 w-full sm:w-40 h-48 bg-gray-50 rounded-[2rem] p-4 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                        <img
                          src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                          alt={item.title}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                      </Link>
                      
                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{item.brand || 'AURA Exclusive'}</div>
                            <Link to={`/products/${item.productId}`}>
                              <h3 className="text-2xl font-black text-black hover:text-gray-600 transition-colors leading-tight line-clamp-2 mb-3 tracking-tighter">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              In Stock
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-semibold text-gray-500 mb-2">Unit Price</div>
                            <span className="text-2xl font-black text-black tracking-tight">{formatINR(item.unitPriceCents)}</span>
                            <div className="text-xs font-semibold text-gray-500 mt-2">Subtotal: {formatINR(itemSubtotal)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-8">
                          <div className="flex items-center bg-gray-50 rounded-xl h-12 px-1 border border-gray-100">
                            <button 
                              onClick={() => updateCartItem(item.productId, Math.max(1, item.quantity - 1))}
                              className="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center text-black font-black transition-colors"
                            ><Minus className="w-3 h-3" /></button>
                            <span className="w-12 text-center font-black text-sm text-black">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                              className="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center text-black font-black transition-colors"
                            ><Plus className="w-3 h-3" /></button>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => removeFromCart(item.productId)}
                              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-2"
                            >
                              <X className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            <div className="mt-8 bg-gray-50 rounded-[2rem] p-8 flex items-start gap-6 border border-gray-100">
               <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-black shrink-0 border border-gray-100">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <div>
                 <h4 className="font-black text-black text-lg mb-2">Complimentary Priority Shipping</h4>
                 <p className="text-sm font-light text-gray-500">Order today to receive your items by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
               </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="xl:w-[450px] shrink-0">
            <div className="bg-gray-50 rounded-[2rem] p-10 sticky top-32 border border-gray-100">
              <h2 className="text-2xl font-black text-black mb-10 tracking-tighter">Order Summary</h2>
              
              <div className="space-y-6 mb-10 border-b border-gray-200 pb-10">
                <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="text-black">{formatINR(subtotalCents)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-black font-bold text-green-600">{shippingCents === 0 ? 'Complimentary' : formatINR(shippingCents)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 text-sm font-bold uppercase tracking-widest">
                  <span>Tax (8%)</span>
                  <span className="text-black">{formatINR(taxCents)}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-10">
                 <div className="flex gap-3">
                   <div className="relative flex-1">
                     <Tag className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                     <input type="text" placeholder="Promo Code" className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-black transition-all uppercase placeholder:normal-case" />
                   </div>
                   <button className="bg-black text-white px-6 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors">Apply</button>
                 </div>
              </div>
              
              <div className="flex justify-between items-end mb-10">
                <span className="text-sm font-bold uppercase tracking-widest text-black">Total</span>
                <span className="text-5xl font-black text-black tracking-tighter">{formatINR(totalCents)}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all hover:bg-gray-900 shadow-xl flex items-center justify-center gap-3 mb-6"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center justify-center gap-2">
                 <Lock className="w-3 h-3" />
                 Secure Encrypted Transaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
