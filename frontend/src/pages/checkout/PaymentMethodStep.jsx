import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useCheckout } from '../../context/CheckoutContext';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion } from 'framer-motion';
import { ChevronRight, Truck, CreditCard, AlertCircle } from 'lucide-react';

// Validate if a string is a valid MongoDB ObjectId (24-character hex string)
function isValidMongoDBObjectId(id) {
  if (typeof id !== 'string') return false;
  // MongoDB ObjectId is 24 hexadecimal characters
  return /^[0-9a-fA-F]{24}$/.test(id);
}

const PaymentMethodStep = ({ onBack }) => {
  const { cart, clearCart, subtotalCents, shippingCents, taxCents, totalCents } = useCart();
  const { checkoutData, resetCheckout } = useCheckout();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate cart
      if (!cart || cart.items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }

      // Validate customerId is a valid MongoDB ObjectId (24-character hex string)
      const customerId = user?._id || user?.id || '';
      
      // Check if customerId looks like a fake ID (e.g., "user-1784813145539")
      if (customerId && !isValidMongoDBObjectId(customerId)) {
        console.error('Invalid user ID format:', customerId);
        setError('Session expired. Please login again.');
        // Clear invalid user data
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      // For authenticated users, customerId must be provided
      if (!customerId) {
        setError('Please login to continue.');
        setLoading(false);
        return;
      }

      const key = crypto.randomUUID();

      const payload = {
        customerId,
        items: cart.items.map(i => ({
          productId: String(i.productId).trim(),
          quantity: parseInt(i.quantity, 10),
          title: i.title,
          unitPrice: Math.round(i.unitPriceCents),
        })),
        idempotencyKey: key
      };

      console.log('Placing order:', payload);
      console.log('User ID validation:', { customerId, isValid: isValidMongoDBObjectId(customerId) });

      // Create order via API
      const response = await api.post('/orders', payload);
      
      if (response.data?.success) {
        const orderId = response.data.order?._id || response.data.order?.id;
        
        // Store order details for success page
        const orderData = {
          orderId,
          date: new Date().toLocaleDateString('en-IN'),
          paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
          shippingAddress: checkoutData.shippingAddress,
          totalAmount: totalCents / 100,
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        };

        // Clear cart and checkout data
        await clearCart();
        resetCheckout();

        // Navigate to success page with order data
        navigate('/order-success', { state: { orderData } });
      }
    } catch (err) {
      console.error('Order error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      
      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-black text-black mb-8 tracking-tighter">Payment Method</h2>

        <div className="space-y-4">
          {[
            { 
              id: 'cod', 
              name: 'Cash on Delivery', 
              description: 'Pay when your order is delivered',
              icon: '💵'
            },
            { 
              id: 'online', 
              name: 'Online Payment', 
              description: 'Credit/Debit Card or UPI',
              icon: '💳',
              disabled: true
            }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => !method.disabled && setPaymentMethod(method.id)}
              disabled={method.disabled}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                paymentMethod === method.id && !method.disabled
                  ? 'border-black bg-black/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    borderColor: paymentMethod === method.id && !method.disabled ? '#000' : '#ccc',
                    backgroundColor: paymentMethod === method.id && !method.disabled ? '#000' : 'transparent'
                  }}
                >
                  {paymentMethod === method.id && !method.disabled && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{method.icon}</span>
                    <h3 className="text-lg font-black text-black">{method.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  {method.disabled && (
                    <p className="text-xs text-gray-500 mt-2">Coming soon</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <h3 className="text-xl font-black text-black mb-6 tracking-tighter">Order Summary</h3>
        
        <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
            <span className="font-bold">₹{Math.round(subtotalCents / 100).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-bold text-green-600">Complimentary</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="font-bold">₹{Math.round(taxCents / 100).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <span className="font-bold text-black">Total Amount</span>
          <span className="text-3xl font-black">₹{Math.round(totalCents / 100).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Terms & Safety */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-green-900 mb-1">Safe & Secure</p>
          <p className="text-sm text-green-800">
            Your order is protected. We use industry-standard encryption to keep your information safe.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-4 border-2 border-gray-300 text-black font-bold uppercase tracking-wider rounded-lg transition-all hover:border-black hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="flex-1 px-6 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Place Order <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentMethodStep;
