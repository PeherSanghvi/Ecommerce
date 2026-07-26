import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, ArrowLeft, CheckCircle, Truck, Clock } from 'lucide-react';
import { formatINR } from '../utils/currency';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error(error);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">Order not found</p>
          <Link to="/orders" className="text-black font-medium hover:underline">
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = formatINR(order.subtotal_minor || order.subtotalMinor || 0);
  const shipping = formatINR(order.shipping_minor || order.shippingMinor || 0);
  const total = formatINR(order.total_minor || order.totalMinor || 0);
  const steps = [
    { label: 'Order Placed', status: 'PENDING', icon: <Clock className="w-4 h-4" /> },
    { label: 'Processing', status: 'PROCESSING', icon: <Package className="w-4 h-4" /> },
    { label: 'Shipped', status: 'SHIPPED', icon: <Truck className="w-4 h-4" /> },
    { label: 'Delivered', status: 'DELIVERED', icon: <CheckCircle className="w-4 h-4" /> }
  ];
  
  let currentStepIndex = steps.findIndex(s => s.status === order.status);
  if (currentStepIndex === -1) {
    if (order.status === 'CANCELLED') currentStepIndex = 0;
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gray-50 rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order #{order.id}</h1>
                <p className="text-gray-600 text-sm">
                  Placed on {new Date(order.orderDate || order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </div>
            </div>

            {order.status !== 'CANCELLED' && (
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full transition-all duration-500" 
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                ></div>
                <div className="flex justify-between relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all ${
                          isCompleted ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        <span className={`text-xs font-medium ${isCurrent ? 'text-black' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-6">Items</h2>
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                {order.items?.map((item, idx) => (
                    <div className="flex gap-4 p-6 border-b border-gray-200 last:border-b-0">
                      <div className="w-20 h-20 bg-white rounded-xl p-2 shrink-0">
                        <img src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80'} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">Qty: {item.quantity}</p>
                        <p className="font-bold">{formatINR(item.unit_price_minor || item.unitPriceCents || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatINR(item.line_total_minor || (item.unit_price_minor * item.quantity) || 0)}</p>
                      </div>
                    </div>
                ))}
                <div className="p-6 bg-white">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{shipping === formatINR(0) ? 'Free' : shipping}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatINR(0)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-xl">{total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Shipping Address
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-black mb-1">{order.customer?.name || order.customer?.firstName}</p>
                  <p>123 Premium Avenue</p>
                  <p>Suite 400</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Payment Method
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold text-black">•••• •••• •••• 4242</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;
