import React, { useState } from 'react';
import { useCheckout } from '../../context/CheckoutContext';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, AlertCircle } from 'lucide-react';

const ShippingAddressStep = ({ onContinue, errors, setErrors }) => {
  const { checkoutData, updateShippingAddress } = useCheckout();
  const [formData, setFormData] = useState(checkoutData.shippingAddress);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pinCode.trim() || !/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Valid 6-digit PIN code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      updateShippingAddress(formData);
      onContinue();
    }
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3 border rounded-lg font-medium outline-none transition-all
    ${errors[fieldName] 
      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
      : 'border-gray-300 bg-white focus:border-black focus:ring-1 focus:ring-black'
    }
  `;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-8 border border-gray-200">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          <MapPin className="w-5 h-5" />
        </div>
        <h2 className="text-3xl font-black text-black tracking-tighter">Shipping Address</h2>
      </div>

      <div className="space-y-6">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputClasses('fullName')}
          />
          {errors.fullName && (
            <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="98765 43210"
              className={inputClasses('phone')}
            />
            {errors.phone && (
              <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={inputClasses('email')}
            />
            {errors.email && (
              <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Street Address
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="123 Main Street, Apt 4B"
            className={inputClasses('street')}
          />
          {errors.street && (
            <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.street}
            </p>
          )}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Bangalore"
              className={inputClasses('city')}
            />
            {errors.city && (
              <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={inputClasses('state')}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.state}
              </p>
            )}
          </div>
        </div>

        {/* PIN Code & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              PIN Code
            </label>
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              placeholder="560001"
              maxLength="6"
              className={inputClasses('pinCode')}
            />
            {errors.pinCode && (
              <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.pinCode}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value="India"
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-8 border-t border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-black font-bold uppercase tracking-wider rounded-lg transition-all hover:border-black hover:bg-gray-50"
          >
            Back to Cart
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-4 bg-black text-white font-bold uppercase tracking-wider rounded-lg transition-all hover:bg-gray-900 flex items-center justify-center gap-2"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ShippingAddressStep;
