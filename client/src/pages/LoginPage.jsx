import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import LoadingSpinner from '@components/LoadingSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting:', user);
      const path = user.role === 'teacher' ? '/teacher' : '/student';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with email:', email);
      const response = await login({ email, password });
      console.log('Login successful:', response);
      
      // Redirect handled by useEffect
    } catch (err) {
      console.error('Login error in component:', err);
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary-600 py-4 px-6">
        <h2 className="text-2xl font-bold text-white">Login to Your Account</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="py-6 px-8">
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full py-2 px-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex justify-center items-center">
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Logging in...</span>
            </span>
          ) : (
            'Login'
          )}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 