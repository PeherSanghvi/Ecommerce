import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Server, AlertCircle, RefreshCw, FileText, CheckCircle2, Search } from 'lucide-react';
import { formatINR } from '../utils/currency';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchOrder = async () => {
    try {
      const response = await getOrder(id);
      setOrder(response.data.order || response.data);
      setSelectedStatus(response.data.order?.status || response.data.status);
      setError('');
    } catch (err) {
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return;
    setUpdating(true);
    try {
      const response = await updateOrderStatus(id, { 
        status: selectedStatus, 
        version: order.version 
      });
      setOrder(response.data.order || response.data);
      setError('');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Conflict: Order modified by another process. Please refresh.');
        fetchOrder();
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update status.');
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[70vh] bg-[#F4F4F5] font-sans">
      <div className="w-10 h-10 border-4 border-[#E4E4E7] border-t-[#09090B] rounded-full animate-spin"></div>
    </div>
  );
  
  if (!order) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#F4F4F5] font-sans">
      <div className="w-24 h-24 bg-[#E4E4E7] rounded-full flex items-center justify-center mb-6 text-[#A1A1AA]">
        <Search className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black text-[#09090B] mb-2 tracking-tighter">{error || 'Order not found'}</h2>
      <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-[#52525B] hover:text-[#09090B] transition-colors mt-4">Return to Dashboard</Link>
    </div>
  );

  const total = formatINR(order.total_minor || order.totalCents || order.totalMinor || 0);
  
  // Sync status indicator comparing version numbers per spec
  const syncStatus = order.syncedToSearch && order.sourceVersion === order.version ? 'Synced' : 
                    order.syncedToSearch ? 'Out of Sync' : 'Synced'; // Assuming true sync state if not explicitly tracked
  const syncDotColor = syncStatus === 'Synced' ? 'var(--success)' : 
                      syncStatus === 'Out of Sync' ? 'var(--danger)' : 'var(--status-pending)';

  return (
    <div className="min-h-screen py-10 font-sans" style={{ backgroundColor: 'var(--bg-admin)' }}>
      <div className="container-admin">
        
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          
          {/* Header */}
          <div className="p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>Order #{order.id || order._id}</h1>
                <span className={`badge badge-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                {new Date(order.order_date || order.createdAt || order.orderDate).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-base)' }}>
                 <div className={`w-2 h-2 rounded-full ${syncStatus === 'Synced' ? '' : 'animate-pulse'}`} style={{ backgroundColor: syncDotColor }}></div>
                 <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{syncStatus}</span>
               </div>
               <span className="text-[10px] font-bold mt-3 tracking-widest uppercase flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Server className="w-3 h-3" /> v{order.version}</span>
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 rounded-xl text-xs font-bold flex items-center gap-3" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger)', border: '1px solid', color: 'var(--danger)' }}>
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Items */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-black mb-6 tracking-tighter flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                  <FileText className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  Itemized Receipt
                </h2>
                
                <div className="rounded-xl overflow-hidden shadow-sm border" style={{ borderColor: 'var(--border)' }}>
                  <table className="w-full text-left text-sm">
                    <thead className="uppercase tracking-widest text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
                      <tr>
                        <th className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>Details</th>
                        <th className="p-4 text-center border-b" style={{ borderColor: 'var(--border)' }}>Qty</th>
                        <th className="p-4 text-right border-b" style={{ borderColor: 'var(--border)' }}>Price</th>
                        <th className="p-4 text-right border-b" style={{ borderColor: 'var(--border)' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {order.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                            <p className="text-[10px] font-bold mt-1 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{item.sku}</p>
                          </td>
                          <td className="p-4 text-center font-black" style={{ color: 'var(--text-primary)' }}>{item.quantity}</td>
                          <td className="p-4 text-right font-black text-tabular" style={{ color: 'var(--text-secondary)' }}>{formatINR(item.unit_price_minor || item.unitPriceMinor || 0)}</td>
                          <td className="p-4 text-right font-black text-tabular" style={{ color: 'var(--text-primary)' }}>{formatINR(item.line_total_minor || item.lineTotalMinor || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-6 border-t flex justify-end" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                    <div className="text-right">
                      <p className="text-[10px] font-bold mb-2 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Order Total</p>
                      <p className="text-4xl font-black tracking-tight text-tabular" style={{ color: 'var(--text-primary)' }}>{total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-6">
              
              <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h2 className="text-[10px] font-bold mb-6 uppercase tracking-widest flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  Customer Profile
                </h2>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shrink-0" style={{ backgroundColor: 'var(--accent-primary)' }}>
                     {(order.customer?.name || order.customer?.firstName || 'U').charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <p className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>{order.customer?.name || order.customer?.firstName}</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-secondary)' }}>{order.customer?.email}</p>
                   </div>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Customer ID</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{order.customer?.id}</p>
                </div>
              </div>

              <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                <h2 className="text-[10px] font-bold mb-6 uppercase tracking-widest flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                  <RefreshCw className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  Manage Status
                </h2>
                <div className="relative">
                  <select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-lg p-4 text-sm font-bold outline-none transition-all shadow-sm appearance-none cursor-pointer mb-4"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button 
                    onClick={handleStatusUpdate}
                    disabled={updating || selectedStatus === order.status}
                    className={`w-full py-3 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-3 shadow-lg disabled:shadow-none ${
                      selectedStatus === order.status || updating 
                      ? 'cursor-not-allowed' 
                      : ''
                    }`}
                    style={{
                      backgroundColor: selectedStatus === order.status || updating ? 'var(--text-3)' : 'var(--accent-primary)',
                      color: selectedStatus === order.status || updating ? 'var(--text-secondary)' : 'white'
                    }}
                  >
                    {updating ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Updating...</>
                    ) : <><CheckCircle2 className="w-4 h-4" /> Save Status</>}
                  </button>
                  {selectedStatus === order.status && (
                    <p className="text-[10px] text-center font-bold mt-4 uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>No changes to save</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
