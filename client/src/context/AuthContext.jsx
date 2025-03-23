import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Set default auth header for axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (err) {
        console.error('Failed to parse stored user data', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Registering with data:', userData);
      const response = await axios.post('/api/users/register', userData);
      const newUser = response.data;
      
      // Store user in state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Set default auth header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${newUser.token}`;
      
      return newUser;
    } catch (err) {
      console.error('Registration error:', err);
      
      let message = 'Registration failed';
      
      // Extract the error message from the response if available
      if (err.response) {
        console.log('Error response:', err.response.data);
        message = err.response.data.message || 'An error occurred during registration';
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Logging in with:', credentials.email);
      const response = await axios.post('/api/users/login', credentials);
      const loggedInUser = response.data;
      
      // Store user in state and localStorage
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      // Set default auth header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${loggedInUser.token}`;
      
      return loggedInUser;
    } catch (err) {
      console.error('Login error:', err);
      
      let message = 'Login failed';
      
      // Extract the error message from the response if available
      if (err.response) {
        console.log('Error response:', err.response.data);
        message = err.response.data.message || 'Invalid credentials';
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    // Remove user from state and localStorage
    setUser(null);
    localStorage.removeItem('user');
    
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put('/api/users/profile', userData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const updatedUser = response.data;
      
      // Update user in state and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      console.error('Profile update error:', err);
      
      let message = 'Profile update failed';
      
      // Extract the error message from the response if available
      if (err.response) {
        message = err.response.data.message || 'An error occurred updating your profile';
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 