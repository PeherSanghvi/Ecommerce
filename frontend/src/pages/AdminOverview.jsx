import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchOrders, getProducts } from '../api';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertCircle, ArrowRight, Star } from 'lucide-react';
import { formatINR } from '../utils/currency';

const AdminOverview = () => {
  const [data, setData] = useState({
    totalRevenueCents: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [],
    latestProducts: [],
    topSellingProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch Orders KPIs and Recent Orders
        const ordersRes = await searchOrders({
          page: 0,
          size: 5,
          sortBy: 'order_date',
          sortDir: 'desc'
        });

        // Fetch Products Data
        const productsRes = await getProducts(1, 5, { sortBy: 'createdAt', order: 'desc' });
        
        // Fetch Top Selling (using highest price or rating for now since we don't have a specific top-selling API, but it's real DB data)
        const topProductsRes = await getProducts(1, 5, { sortBy: 'rating', order: 'desc' });

        setData({
          totalRevenueCents: ordersRes.data.totalRevenue || 0,
          totalOrders: ordersRes.data.totalHits || 0,
          totalProducts: productsRes.data.pagination?.total || productsRes.data.data?.length || 0,
          recentOrders: ordersRes.data.orders || ordersRes.data.data || [],
          latestProducts: productsRes.data.data || [],
          topSellingProducts: topProductsRes.data.data || []
        });
        setError(null);
      } catch (err) {
        console.error('Dashboard Overview error:', err);
        setError('Failed to load dashboard overview data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const balanceCents = data.totalRevenueCents * 0.9; // 10% service charge subtracted

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl text-sm font-bold flex items-center gap-3 bg-red-50 text-red-600 border border-red-200">
        <AlertCircle className="w-5 h-5 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Account Balance</p>
          <p className="text-3xl font-black text-black tracking-tighter">{formatINR(balanceCents)}</p>
          <p className="text-xs font-bold text-gray-400 mt-2">After 10% service charge</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-black tracking-tighter">{formatINR(data.totalRevenueCents)}</p>
          <p className="text-xs font-bold text-gray-400 mt-2">Gross revenue</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Orders</p>
          <p className="text-3xl font-black text-black tracking-tighter">{data.totalOrders}</p>
          <p className="text-xs font-bold text-gray-400 mt-2">All time</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Products</p>
          <p className="text-3xl font-black text-black tracking-tighter">{data.totalProducts}</p>
          <p className="text-xs font-bold text-gray-400 mt-2">Active items</p>
        </motion.div>
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Selling Products */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tighter flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Top Selling Products</h3>
            <Link to="/products" className="text-xs font-bold flex items-center gap-1 text-black hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {data.topSellingProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold text-sm">No products yet</div>
            ) : (
              data.topSellingProducts.map((product) => (
                <div key={product._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black text-sm truncate">{product.title}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-black text-sm">{formatINR(product.price_minor || 0)}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">Rating: {product.rating}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tighter flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-purple-500" /> Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold flex items-center gap-1 text-black hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50 flex-1">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-bold text-sm">No orders yet</div>
            ) : (
              data.recentOrders.map((order) => (
                <Link key={order.id || order.orderId} to={`/admin/orders/${order.id || order.orderId}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-black text-sm">Order #{order.id || order.orderId}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{order.customer?.name || order.customer?.firstName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-black text-sm">{formatINR(order.totalCents || order.totalMinor)}</p>
                    <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Latest Products */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tighter flex items-center gap-2"><Package className="w-5 h-5 text-blue-500" /> Latest Products</h3>
          <Link to="/products" className="text-xs font-bold flex items-center gap-1 text-black hover:underline">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.latestProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold text-sm">No products yet</div>
          ) : (
            data.latestProducts.slice(0, 5).map((product) => (
              <div key={product._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black text-sm truncate">{product.title}</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">{product.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-black text-sm">{formatINR(product.price_minor || 0)}</p>
                  <p className="text-xs font-bold text-gray-400 mt-1">Stock: {product.stock}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

    </div>
  );
};

export default AdminOverview;
