import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Calendar, CreditCard, Truck, ChevronRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  // Redirect if no order data
  useEffect(() => {
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-sans py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Animation */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="relative w-24 h-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-full border-4 border-transparent border-t-green-600 border-r-green-600" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-12 text-white text-center">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Order Confirmed!</h1>
            <p className="text-lg font-light">Thank you for your purchase</p>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12 space-y-12">
            
            {/* Order ID */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center border-b border-gray-200 pb-8"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">Order Number</p>
              <p className="text-3xl font-black text-black tracking-tight font-mono">#{orderData.orderId}</p>
              <p className="text-sm text-gray-600 mt-4">
                Order placed on {orderData.date}
              </p>
            </motion.div>

            {/* Key Details Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              
              {/* Shipping Address */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black text-black">Shipping Address</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-bold">{orderData.shippingAddress.fullName}</p>
                  <p>{orderData.shippingAddress.street}</p>
                  <p>
                    {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{' '}
                    {orderData.shippingAddress.pinCode}
                  </p>
                  <p className="pt-2 border-t border-blue-300 mt-2">
                    📞 {orderData.shippingAddress.phone}
                  </p>
                  <p>📧 {orderData.shippingAddress.email}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-4">
                
                {/* Estimated Delivery */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-black text-black">Estimated Delivery</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Your order will arrive by</p>
                  <p className="text-xl font-black text-green-600">{orderData.estimatedDelivery}</p>
                </div>

                {/* Payment Method */}
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-black text-black">Payment Method</h3>
                  </div>
                  <p className="text-sm font-bold text-purple-600">{orderData.paymentMethod}</p>
                </div>

              </div>
            </motion.div>

            {/* Order Amount */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-black text-lg">Total Amount Payable</span>
                <span className="text-4xl font-black text-black">
                  ₹{Math.round(orderData.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8"
            >
              <button
                onClick={() => navigate('/orders')}
                className="px-8 py-4 border-2 border-black text-black font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-black hover:text-white flex items-center justify-center gap-2"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-gray-900 flex items-center justify-center gap-2"
              >
                Continue Shopping <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 flex gap-4">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-blue-600">!</span>
              </div>
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">Next Steps</p>
                <p className="text-sm text-blue-800">
                  A confirmation email has been sent to {orderData.shippingAddress.email}. 
                  You can track your order from the "My Orders" page.
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-600 font-light">
            Need help? <button className="text-blue-600 font-bold hover:underline">Contact Support</button>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default OrderSuccess;
