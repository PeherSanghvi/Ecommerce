import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            // Verify the user has required fields
            if (userData._id && userData.email) {
              setUser(userData);
            } else {
              // Invalid user data, clear it
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (parseError) {
            console.error('Failed to parse saved user:', parseError);
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeUser();
  }, []);

  const login = async (email, password) => {
    try {
      // Validate email
      if (!email || typeof email !== 'string' || !email.trim()) {
        return { success: false, error: 'Email is required' };
      }

      // Call backend login API with real MongoDB user lookup
      const response = await api.post('/auth/login', { email });

      if (response.data?.success && response.data?.user) {
        const userData = response.data.user;
        // Verify user object has required fields
        if (!userData._id || !userData.email) {
          console.error('Invalid user response from server:', userData);
          return { success: false, error: 'Invalid user data received' };
        }
        // Store user with real MongoDB ObjectId
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: response.data?.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed' 
      };
    }
  };

  const register = async (firstName, lastName, email, phone = '') => {
    try {
      // Validate inputs
      if (!firstName || !lastName || !email) {
        return { success: false, error: 'Name and email are required' };
      }

      // Call backend register API
      const response = await api.post('/auth/register', {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: phone || '9876543210', // Provide default if not given
        // Use default address if not provided
        address: {
          street: '123 Default Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        }
      });

      if (response.data?.success && response.data?.user) {
        const userData = response.data.user;
        // Verify user object has required fields
        if (!userData._id || !userData.email) {
          console.error('Invalid user response from server:', userData);
          return { success: false, error: 'Invalid user data received' };
        }
        // Store user with real MongoDB ObjectId
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: response.data?.error || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!user._id
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
