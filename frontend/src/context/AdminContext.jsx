import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize admin from localStorage on mount
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const savedAdmin = localStorage.getItem('admin');
        const savedToken = localStorage.getItem('adminToken');
        
        if (savedAdmin && savedToken) {
          try {
            const adminData = JSON.parse(savedAdmin);
            // Verify admin has required fields and ADMIN role
            if (adminData._id && adminData.email && adminData.role === 'ADMIN') {
              setAdmin(adminData);
              setToken(savedToken);
            } else {
              // Invalid admin data, clear it
              localStorage.removeItem('admin');
              localStorage.removeItem('adminToken');
              setAdmin(null);
              setToken(null);
            }
          } catch (parseError) {
            console.error('Failed to parse saved admin:', parseError);
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            setAdmin(null);
            setToken(null);
          }
        } else {
          setAdmin(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAdmin();
  }, []);

  const login = async (email, password) => {
    try {
      // Validate email
      if (!email || typeof email !== 'string' || !email.trim()) {
        return { success: false, error: 'Email is required' };
      }
      
      if (!password) {
        return { success: false, error: 'Password is required' };
      }

      // Call admin login API
      const response = await api.post('/auth/admin/login', { email, password });

      if (response.data?.success && response.data?.user) {
        const adminData = response.data.user;
        const adminToken = response.data.token;
        
        // Verify admin object has required fields and ADMIN role
        if (!adminData._id || !adminData.email || adminData.role !== 'ADMIN') {
          console.error('Invalid admin response from server:', adminData);
          return { success: false, error: 'Invalid admin credentials' };
        }
        
        // Store admin with ADMIN role verification
        setAdmin(adminData);
        setToken(adminToken);
        localStorage.setItem('admin', JSON.stringify(adminData));
        localStorage.setItem('adminToken', adminToken);
        
        // Set token in API headers for future requests
        if (adminToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
          api.defaults.headers.common['X-Admin-Token'] = adminToken;
          api.defaults.headers.common['X-User-Id'] = adminData._id;
          api.defaults.headers.common['X-User-Role'] = 'ADMIN';
        }
        
        return { success: true };
      }

      return { success: false, error: response.data?.error || 'Admin login failed' };
    } catch (error) {
      console.error('Admin login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Admin login failed' 
      };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    
    // Clear token from API headers
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['X-Admin-Token'];
    delete api.defaults.headers.common['X-User-Id'];
    delete api.defaults.headers.common['X-User-Role'];
  };

  // Set token in headers whenever it changes
  useEffect(() => {
    if (token && admin) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['X-Admin-Token'] = token;
      api.defaults.headers.common['X-User-Id'] = admin._id;
      api.defaults.headers.common['X-User-Role'] = 'ADMIN';
    } else {
      delete api.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['X-Admin-Token'];
      delete api.defaults.headers.common['X-User-Id'];
      delete api.defaults.headers.common['X-User-Role'];
    }
  }, [token, admin]);

  const value = {
    admin,
    token,
    loading,
    isInitialized,
    login,
    logout,
    isAuthenticated: !!admin && !!admin._id && admin.role === 'ADMIN',
    isAdmin: admin?.role === 'ADMIN'
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
