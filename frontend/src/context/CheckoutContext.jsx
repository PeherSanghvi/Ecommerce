import { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext();

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {
      fullName: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India'
    },
    paymentMethod: 'cod', // cod or online
    orderData: null
  });

  const updateShippingAddress = (address) => {
    setCheckoutData(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, ...address }
    }));
  };

  const setPaymentMethod = (method) => {
    setCheckoutData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const setOrderData = (data) => {
    setCheckoutData(prev => ({
      ...prev,
      orderData: data
    }));
  };

  const resetCheckout = () => {
    setCheckoutData({
      shippingAddress: {
        fullName: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India'
      },
      paymentMethod: 'cod',
      orderData: null
    });
  };

  const value = {
    checkoutData,
    updateShippingAddress,
    setPaymentMethod,
    setOrderData,
    resetCheckout
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
