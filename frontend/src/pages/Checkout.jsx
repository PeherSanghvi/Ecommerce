import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, CreditCard, ShoppingBag, MapPin, Search, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';

// Validate if a string is a valid MongoDB ObjectId (24-character hex string)
function isValidMongoDBObjectId(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

const Checkout = () => {
  const { cart, clearCart, subtotalCents, shippingCents, taxCents, totalCents } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState('addr-1');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(null);

  if (!cart || cart.items.length === 0) {
    if (!orderSuccess) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#FAFAFA] font-sans">
          <div className="w-24 h-24 bg-[#F4F4F5] rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-[#A1A1AA]" />
          </div>
          <h2 className="text-3xl font-black text-[#09090B] mb-4 tracking-tighter">Your bag is empty</h2>
          <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 bg-[#09090B] text-white font-semibold text-sm tracking-widest uppercase rounded-full transition-all hover:bg-[#27272A]">
            Continue Shopping
          </Link>
        </div>
      );
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate cart items
      if (!cart || !cart.items || cart.items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }

      // Validate each item has required fields
      const validationErrors = [];
      cart.items.forEach((item, idx) => {
        if (!item.productId || typeof item.productId !== 'string' || item.productId.trim() === '') {
          validationErrors.push(`Item ${idx + 1}: Product ID is missing or invalid`);
        }
        if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          validationErrors.push(`Item ${idx + 1}: Quantity is invalid`);
        }
        if (typeof item.unitPriceCents !== 'number' || item.unitPriceCents < 0) {
          validationErrors.push(`Item ${idx + 1}: Price is invalid`);
        }
        if (!item.title || item.title.trim() === '') {
          validationErrors.push(`Item ${idx + 1}: Title is missing`);
        }
      });

      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        setError('Cart validation failed: ' + validationErrors.join(', '));
        setLoading(false);
        return;
      }

      const key = idempotencyKey || crypto.randomUUID();
      if (!idempotencyKey) setIdempotencyKey(key);
      
      // Build payload with real MongoDB ObjectId from user context
      // Use _id if available (MongoDB ObjectId string), fallback to id
      const customerId = user?._id || user?.id || ''; // Empty string for guest checkout

      // Validate customerId is a valid MongoDB ObjectId (24-character hex string)
      if (customerId && !isValidMongoDBObjectId(customerId)) {
        console.error('Invalid user ID format:', customerId);
        setError('Session expired. Your user ID is invalid. Please login again.');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      const payload = {
        customerId, // Real MongoDB ObjectId or empty for guest
        items: cart.items.map(i => {
          return {
            productId: String(i.productId).trim(),
            quantity: parseInt(i.quantity, 10),
            title: i.title,
            unitPrice: Math.round(i.unitPriceCents),
          };
        }),
        idempotencyKey: key
      };

      console.log('Sending checkout payload:', payload);
      console.log('User ID validation:', { customerId, isValid: isValidMongoDBObjectId(customerId) });
      
      const response = await api.post('/orders', payload);
      console.log('Order response:', response.data);
      
      setPlacedOrderId(response.data.order?._id || response.data.order?.id || response.data.orderId);
      setOrderSuccess(true);
      await clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center px-4 font-sans" style={{ backgroundColor: 'var(--bg-base)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring' }}
          className="max-w-2xl w-full text-center"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 relative" style={{ backgroundColor: 'var(--success-light)' }}>
             <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--success)' }} />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Order Confirmed</h1>
          <p className="text-lg mb-2 font-light" style={{ color: 'var(--text-secondary)' }}>Thank you for your purchase.</p>
          <p className="mb-10 font-light" style={{ color: 'var(--text-secondary)' }}>Your order number is <span className="font-bold pb-0.5" style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--accent-primary)' }}>#{placedOrderId}</span></p>
          
          <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-[#09090B] text-white font-semibold text-sm tracking-widest uppercase rounded-full transition-all hover:bg-[#27272A]">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  const total = totalCents;  // Use calculated total from context
  
  const addresses = [
    { id: 'addr-1', name: 'Home', address: '123 Premium Ave, NY 10001', default: true },
    { id: 'addr-2', name: 'Office', address: '456 Business Blvd, NY 10012', default: false }
  ];

  return (
    <div className="min-h-screen py-10 font-sans" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="container-storefront">
        
        <div className="mb-12">
           <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
              {[
                { num: 1, label: 'Shipping' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Review' }
              ].map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className={`flex items-center gap-2`} style={{ color: step === s.num ? 'var(--text-primary)' : step > s.num ? 'var(--text-secondary)' : 'var(--text-3)' }}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${step === s.num ? 'text-white' : ''}`} style={{ backgroundColor: step === s.num ? 'var(--accent-primary)' : step > s.num ? 'var(--success)' : 'transparent', border: step === s.num ? 'none' : '1px solid var(--border)' }}>
                      {step > s.num ? <CheckCircle2 className="w-3 h-3" /> : s.num}
                    </div>
                    {s.label}
                  </div>
                  {idx < 2 && <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-3)' }} />}
                </React.Fragment>
              ))}
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1">
            <div className="min-h-[400px]">
              
              {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-8">
                  <h2 className="text-3xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Shipping Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id}
                        onClick={() => setAddressId(addr.id)}
                        className={`p-6 rounded-xl cursor-pointer transition-all border-2`}
                        style={{ backgroundColor: addressId === addr.id ? 'var(--primary-light)' : 'var(--surface)', borderColor: addressId === addr.id ? 'var(--accent-primary)' : 'var(--border)' }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{addr.name}</h3>
                          {addr.default && <span className="text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest" style={{ backgroundColor: 'var(--accent-primary)' }}>Default</span>}
                        </div>
                        <p className="font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{addr.address}</p>
                        <div className={`mt-4 w-5 h-5 rounded-full border-2 flex items-center justify-center`} style={{ borderColor: addressId === addr.id ? 'var(--accent-primary)' : 'var(--border)' }}>
                          {addressId === addr.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => setStep(2)} className="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg transition-colors" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8">
                  <h2 className="text-3xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Payment Method</h2>
                  <div className="space-y-4 mb-10">
                    {[
                      { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" /> },
                      { id: 'paypal', name: 'PayPal', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg> },
                      { id: 'cod', name: 'Cash on Delivery', icon: <ShoppingBag className="w-5 h-5" /> }
                    ].map(method => (
                      <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-5 rounded-xl cursor-pointer transition-all flex items-center gap-6 border-2`}
                        style={{ backgroundColor: paymentMethod === method.id ? 'var(--primary-light)' : 'var(--surface)', borderColor: paymentMethod === method.id ? 'var(--accent-primary)' : 'var(--border)' }}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0`} style={{ borderColor: paymentMethod === method.id ? 'var(--accent-primary)' : 'var(--border)' }}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>}
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                           {method.icon}
                        </div>
                        <span className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{method.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      Back
                    </button>
                    <button onClick={() => setStep(3)} className="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg transition-colors" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                      Review Order
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8">
                  <h2 className="text-3xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Review Order</h2>
                  
                  <div className="rounded-xl p-8 border mb-8" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                     <div className="flex justify-between items-start mb-6 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Shipping To</p>
                         <p className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{addresses.find(a => a.id === addressId)?.name}</p>
                         <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>{addresses.find(a => a.id === addressId)?.address}</p>
                       </div>
                       <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest pb-1 transition-colors" style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)' }}>Edit</button>
                     </div>
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Payment Method</p>
                         <p className="font-black text-lg capitalize" style={{ color: 'var(--text-primary)' }}>
                           {paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
                         </p>
                       </div>
                       <button onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest pb-1 transition-colors" style={{ color: 'var(--accent-primary)', borderBottom: '2px solid var(--accent-primary)' }}>Edit</button>
                     </div>
                  </div>

                  {error && (
                    <div className="px-6 py-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger)', border: '1px solid', color: 'var(--danger)' }}>
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button onClick={() => setStep(2)} className="text-xs font-bold uppercase tracking-widest transition-colors" style={{ color: 'var(--text-secondary)' }}>
                      Back
                    </button>
                    <button 
                      onClick={handlePlaceOrder} 
                      disabled={loading}
                      className="px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
                      style={{ backgroundColor: 'var(--accent-cta)', color: 'white' }}
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                      ) : (
                        <>Place Order <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          <div className="lg:w-[400px] shrink-0">
            <div className="rounded-xl p-8 sticky top-10 border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <h2 className="text-xl font-black mb-6 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Order Items</h2>
              
              <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-2">
                 {cart.items.map(item => (
                   <div key={item.productId} className="flex gap-4">
                     <div className="w-16 h-16 rounded-lg p-2 border shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                       <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} alt={item.title} className="w-full h-full object-contain" />
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                       <h4 className="text-sm font-bold line-clamp-1 mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                       <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>Qty {item.quantity}</p>
                       <p className="text-lg font-black tracking-tight text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(item.unitPriceCents)}</p>
                     </div>
                   </div>
                 ))}
              </div>

              <div className="space-y-3 mb-6 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="text-sm text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  <span>Shipping</span>
                  <span className="text-sm font-bold" style={{ color: shippingCents === 0 ? '#1E8E5A' : 'var(--text-primary)' }}>
                    {shippingCents === 0 ? 'Complimentary' : formatINR(shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  <span>Tax (8%)</span>
                  <span className="text-sm text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(taxCents)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="text-3xl font-black tracking-tight text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(totalCents)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
