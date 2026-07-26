import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Store, LogOut, Menu, Bell, Hexagon } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useUser();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, activeMatch: '/admin/dashboard' },
    { name: 'Orders', href: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, activeMatch: '/admin/orders' },
    { name: 'Storefront', href: '/products', icon: <Store className="w-5 h-5" /> },
  ];

  const isActive = (href, match) => {
    if (match && location.pathname.startsWith(match)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {!sidebarOpen && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
             onClick={() => setSidebarOpen(true)}
           />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 lg:static lg:block overflow-hidden flex flex-col shrink-0`}
      >
        <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <Hexagon className="w-8 h-8 text-black fill-black" />
            <span className="text-xl font-black text-black tracking-tighter">AURA<span className="text-gray-400 font-light ml-1">Admin</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6">
          <p className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Management</p>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href, item.activeMatch);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    active
                      ? 'bg-black text-white shadow-lg'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <span className={`${active ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-4 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black font-black border border-gray-200">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-black truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate">{user?.email || 'admin@aura.com'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-black text-black tracking-tighter hidden sm:block">Dashboard Overview</h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-colors relative">
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                <Bell className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 sm:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
