import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../api';
import { motion } from 'framer-motion';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatINR } from '../utils/currency';

const Orders = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('User not authenticated');
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = user?.id || user?._id;
      
      // Fetch orders for this customer using the correct endpoint
      const response = await api.get(`/orders/customer/${userId}`);
      
      const ordersData = response.data?.orders || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !orders.length) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Orders</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
          <p className="text-gray-600 mb-8">Start shopping to see your orders here.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">Order History</h1>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div 
              key={order._id || order.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                    <p className="font-semibold">{new Date(order.order_date || order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-semibold">{formatINR(order.total_minor || order.totalMinor)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-semibold">#{order._id?.toString().slice(-8) || order.id}</p>
                  </div>
                </div>
                <Link 
                  to={`/orders/${order._id || order.id}`} 
                  className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto">
                {order.items?.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="shrink-0 w-16 h-16 bg-white rounded-lg p-2 border border-gray-200">
                    <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                ))}
                {order.items?.length > 4 && (
                  <div className="shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
