import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import ShippingAddressStep from './checkout/ShippingAddressStep';
import ReviewOrderStep from './checkout/ReviewOrderStep';
import PaymentMethodStep from './checkout/PaymentMethodStep';

const CheckoutFlow = () => {
  const { cart } = useCart();
  const { checkoutData } = useCheckout();
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirect if no cart items
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white font-sans">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-black mb-4 tracking-tighter">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold text-sm tracking-widest uppercase rounded-lg transition-all hover:bg-gray-900"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleContinue = (newStep) => {
    setStep(newStep);
  };

  const handleBack = (newStep) => {
    setStep(newStep);
  };

  return (
    <div className="min-h-screen bg-white font-sans py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center justify-between"
        >
          {[
            { number: 1, label: 'Shipping', icon: '📍' },
            { number: 2, label: 'Review', icon: '📋' },
            { number: 3, label: 'Payment', icon: '💳' },
            { number: 4, label: 'Place Order', icon: '✓' }
          ].map((s, idx) => (
            <div key={s.number} className="flex-1 flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                    step >= s.number
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step > s.number ? <CheckCircle2 className="w-6 h-6" /> : s.number}
                </div>
                <span
                  className={`ml-3 font-bold uppercase tracking-wider text-sm ${
                    step >= s.number ? 'text-black' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-all ${
                    step > s.number ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Form Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShippingAddressStep 
                    onContinue={() => handleContinue(2)}
                    errors={validationErrors}
                    setErrors={setValidationErrors}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReviewOrderStep 
                    onContinue={() => handleContinue(3)}
                    onBack={() => handleContinue(1)}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodStep 
                    onContinue={() => handleContinue(4)}
                    onBack={() => handleContinue(2)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-8 sticky top-8 border border-gray-200">
              <h2 className="text-2xl font-black text-black mb-8 tracking-tighter">Order Summary</h2>
              
              <div className="space-y-4 mb-8 border-b border-gray-200 pb-8">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-bold text-black mb-1 line-clamp-1">{item.title}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-black text-right ml-4">
                      ₹{Math.round((item.unitPriceCents * item.quantity) / 100).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Math.round(cart.items.reduce((sum, i) => sum + (i.unitPriceCents * i.quantity), 0) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Complimentary</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-600">
                  <span>Tax (8%)</span>
                  <span>₹{Math.round((cart.items.reduce((sum, i) => sum + (i.unitPriceCents * i.quantity), 0) * 0.08) / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold uppercase tracking-wider text-black">Total</span>
                  <span className="text-3xl font-black text-black">
                    ₹{Math.round((cart.items.reduce((sum, i) => sum + (i.unitPriceCents * i.quantity), 0) * 1.08) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;
