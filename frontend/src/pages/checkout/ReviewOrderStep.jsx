import React from 'react';
import { useCart } from '../../context/CartContext';
import { useCheckout } from '../../context/CheckoutContext';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Truck, Clock, Edit2 } from 'lucide-react';

const ReviewOrderStep = ({ onContinue, onBack }) => {
  const { cart } = useCart();
  const { checkoutData } = useCheckout();

  const subtotalCents = cart.items.reduce((sum, item) => sum + (item.unitPriceCents * item.quantity), 0);
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents + taxCents;

  // Calculate estimated delivery date (3-5 business days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      
      {/* Order Items */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-black text-black mb-8 tracking-tighter">Review Your Order</h2>
        
        <div className="space-y-6 mb-8 border-b border-gray-200 pb-8">
          {cart.items.map(item => (
            <div key={item.productId} className="flex gap-6">
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                <img 
                  src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'} 
                  alt={item.title}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-black text-black mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{item.brand || 'AURA Exclusive'}</p>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Qty: <span className="font-bold text-black">{item.quantity}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: <span className="font-bold text-black">₹{Math.round(item.unitPriceCents / 100).toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-lg font-black text-black">
                    ₹{Math.round((item.unitPriceCents * item.quantity) / 100).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-bold text-black">₹{Math.round(subtotalCents / 100).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-bold text-green-600">Complimentary</span>
          </div>
          <div className="flex justify-between text-sm border-b border-gray-200 pb-3">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="font-bold text-black">₹{Math.round(taxCents / 100).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-lg pt-3">
            <span className="font-bold text-black">Total</span>
            <span className="text-2xl font-black text-black">₹{Math.round(totalCents / 100).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-black tracking-tighter">Shipping Address</h3>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <p className="font-bold text-black mb-4">{checkoutData.shippingAddress.fullName}</p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>{checkoutData.shippingAddress.street}</p>
            <p>
              {checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} {checkoutData.shippingAddress.pinCode}
            </p>
            <p>{checkoutData.shippingAddress.country}</p>
            <p className="text-gray-600 pt-3 border-t border-gray-300 mt-3">
              Phone: {checkoutData.shippingAddress.phone}
            </p>
            <p className="text-gray-600">
              Email: {checkoutData.shippingAddress.email}
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
            <Truck className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black mb-2 tracking-tighter">Estimated Delivery</h3>
            <p className="text-gray-600 mb-1">Your order will arrive by</p>
            <p className="text-xl font-black text-black">
              {deliveryDate.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-600 mt-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Free shipping on this order
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-4 border-2 border-gray-300 text-black font-bold uppercase tracking-wider rounded-lg transition-all hover:border-black hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-gray-900 flex items-center justify-center gap-2"
        >
          Choose Payment <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewOrderStep;
