import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchOrders, getKpis, reindex } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, ShoppingBag, DollarSign, Clock, TrendingUp, MoreHorizontal, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';

const AdminOrders = () => {
  const [kpis, setKpis] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReindexing, setIsReindexing] = useState(false);
  
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    page: 0,
    size: 20
  });
  
  const [totalPages, setTotalPages] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const searchParams = {
        keyword: filters.keyword || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
        minAmount: filters.minAmount ? parseInt(filters.minAmount, 10) * 100 : undefined, // Convert to cents
        maxAmount: filters.maxAmount ? parseInt(filters.maxAmount, 10) * 100 : undefined, // Convert to cents
        page: filters.page,
        size: filters.size,
        sortBy: 'order_date',
        sortDir: 'desc'
      };

      // Remove undefined values
      Object.keys(searchParams).forEach(key => searchParams[key] === undefined && delete searchParams[key]);

      const searchRes = await searchOrders(searchParams);
      
      setKpis({
        totalOrders: searchRes.data.totalHits || 0,
        totalRevenueCents: searchRes.data.totalRevenue || 0,
        statusCounts: searchRes.data.statusCounts || {}
      });
      
      setResults(searchRes.data.orders || searchRes.data.data || []);
      setTotalPages(Math.ceil((searchRes.data.totalHits || 0) / (filters.size || 20)));
      setError(null);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value, 
      page: 0 // Reset to first page when filters change
    }));
  };
  
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleReindex = async () => {
    if (window.confirm('Trigger full reindex from MongoDB to OpenSearch?')) {
      setIsReindexing(true);
      try {
        await reindex();
        alert('Reindex triggered successfully!');
        fetchDashboardData();
      } catch (err) {
        alert('Reindex failed.');
      } finally {
        setIsReindexing(false);
      }
    }
  };

  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#E5E5E5'];

  return (
    <div className="font-sans" style={{ backgroundColor: 'var(--bg-admin)' }}>
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Sidebar Filters - Dark theme per spec */}
        <aside className="w-full xl:w-72 shrink-0">
          <div className="p-6 rounded-xl shadow-sm sticky top-24" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 tracking-tighter" style={{ color: 'var(--sidebar-text)' }}>
              <Filter className="w-5 h-5" /> Filters
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--sidebar-text)' }}>Order Status</label>
                <div className="relative">
                  <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--sidebar-text)' }}>
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none" style={{ color: 'var(--sidebar-text)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--sidebar-text)' }}>Date Range</label>
                <div className="flex flex-col gap-3">
                  <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all uppercase" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--sidebar-text)' }} />
                  <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all uppercase" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--sidebar-text)' }} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--sidebar-text)' }}>Amount Range (₹)</label>
                <div className="flex gap-3">
                  <input type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} className="w-1/2 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all" placeholder="Min" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--sidebar-text)' }} />
                  <input type="number" name="maxAmount" value={filters.maxAmount} onChange={handleFilterChange} className="w-1/2 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none transition-all" placeholder="Max" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--sidebar-text)' }} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <button 
                onClick={handleReindex} 
                disabled={isReindexing}
                className="w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              >
                {isReindexing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Syncing...</> : <><RefreshCw className="w-4 h-4" /> Rebuild Index</>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div>
                <h1 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>Order Analytics</h1>
                <p className="mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Real-time store performance & management.</p>
             </div>
             
             {/* Omni-Search Bar */}
             <div className="relative w-full md:w-[400px]">
                <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Search orders, customers..."
                  className="w-full rounded-lg py-3 pl-14 pr-6 text-sm font-bold focus:outline-none transition-all shadow-sm"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
             </div>
          </div>
          
          {/* KPI Dashboard - Max 2 cards width per spec */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-xl shadow-sm relative overflow-hidden group transition-colors" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--accent-primary)' }}><ShoppingBag className="w-5 h-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Total Orders</span>
              <span className="text-3xl font-black text-tabular" style={{ color: 'var(--text-primary)' }}>{kpis?.totalOrders || 0}</span>
              <span className="text-xs mt-2 block" style={{ color: 'var(--text-secondary)' }}>All time</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-xl shadow-sm relative overflow-hidden group transition-colors" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--accent-primary)' }}><DollarSign className="w-5 h-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-secondary)' }}>Total Revenue</span>
              <span className="text-3xl font-black text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(kpis?.totalRevenueCents || 0)}</span>
              <span className="text-xs mt-2 block" style={{ color: 'var(--text-secondary)' }}>All time</span>
            </motion.div>
          </div>
          

          {/* Results Data Table - Sticky header, status pills, right-align amount */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
               <h3 className="font-black text-lg tracking-tighter" style={{ color: 'var(--text-primary)' }}>Recent Orders</h3>
               <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-base)' }}>{results.length} found</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--bg-base)' }}>
                  <tr className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    <th className="p-4 font-bold border-b" style={{ borderColor: 'var(--border)' }}>Order ID</th>
                    <th className="p-4 font-bold border-b" style={{ borderColor: 'var(--border)' }}>Date</th>
                    <th className="p-4 font-bold border-b" style={{ borderColor: 'var(--border)' }}>Customer</th>
                    <th className="p-4 font-bold text-right border-b" style={{ borderColor: 'var(--border)' }}>Amount</th>
                    <th className="p-4 font-bold border-b" style={{ borderColor: 'var(--border)' }}>Status</th>
                    <th className="p-4 font-bold text-right border-b" style={{ borderColor: 'var(--border)' }}>Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-16 text-center">
                        <div className="w-10 h-10 border-4 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-primary)' }}></div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="p-16 text-center">
                        <div className="mx-auto max-w-md p-6 rounded-xl text-sm font-bold flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger)', border: '1px solid', color: 'var(--danger)' }}>
                          <AlertCircle className="w-6 h-6 shrink-0" />
                          <p>{error}</p>
                          <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg shadow-sm">Try Again</button>
                        </div>
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-base)' }}>
                           <Search className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <p className="font-black text-lg tracking-tighter mb-2" style={{ color: 'var(--text-primary)' }}>No orders match these filters</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    results.map((order) => (
                      <tr key={order.id || order.orderId} className="border-b hover:bg-gray-50 transition-colors group" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-4 font-black transition-colors cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                          <Link to={`/admin/orders/${order.id || order.orderId}`}>#{order.id || order.orderId}</Link>
                        </td>
                        <td className="p-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{new Date(order.orderDate || order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="p-4 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                           <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ backgroundColor: 'var(--accent-primary)' }}>
                             {(order.customer?.name || order.customer?.firstName || 'U').charAt(0).toUpperCase()}
                           </div>
                           {order.customer?.name || order.customer?.firstName}
                        </td>
                        <td className="p-4 font-black text-right text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(order.totalCents || order.totalMinor)}</td>
                        <td className="p-4">
                          <span className={`badge badge-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/admin/orders/${order.id || order.orderId}`} className="inline-flex items-center justify-center p-2 rounded-lg transition-all" style={{ color: 'var(--text-secondary)' }}>
                            <MoreHorizontal className="w-5 h-5" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                 <button 
                   disabled={filters.page === 0} 
                   onClick={() => handlePageChange(filters.page - 1)}
                   className="w-10 h-10 rounded-lg border flex items-center justify-center disabled:opacity-30 transition-all"
                   style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                 >
                   <ChevronLeft className="w-5 h-5" />
                 </button>
                 <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Page {filters.page + 1} of {totalPages}</span>
                 <button 
                   disabled={filters.page === totalPages - 1}
                   onClick={() => handlePageChange(filters.page + 1)}
                   className="w-10 h-10 rounded-lg border flex items-center justify-center disabled:opacity-30 transition-all"
                   style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                 >
                   <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
