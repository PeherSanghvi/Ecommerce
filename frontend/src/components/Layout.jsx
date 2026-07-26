import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './layout/Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-1">
                <span className="text-orange-400">a</span>
                mazon<span className="text-orange-400 text-sm">POC</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Proof of concept integrating MongoDB Community Edition with OpenSearch.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Get to Know Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">About Amazon</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Make Money with Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:underline">Sell products</a></li>
                <li><a href="#" className="hover:underline">Sell apps</a></li>
                <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Let Us Help You</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:underline">Your Account</a></li>
                <li><a href="#" className="hover:underline">Your Orders</a></li>
                <li><a href="#" className="hover:underline">Help</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 AmazonPOC. Proof of concept assignment.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:underline">Conditions of Use</a>
              <a href="#" className="hover:underline">Privacy Notice</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
