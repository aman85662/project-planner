import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import LoadingSpinner from '@components/LoadingSpinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    enrollmentNumber: '',
    rollNumber: '',
    department: '',
    year: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { register, user } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect
  useEffect(() => {
    if (user) {
      console.log('User logged in, redirecting:', user);
      const path = user.role === 'teacher' ? '/teacher' : '/student';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    if (formData.role === 'student') {
      if (!formData.enrollmentNumber || !formData.rollNumber || !formData.department || !formData.year) {
        setFormError('All student information fields are required');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      
      if (registerData.role !== 'student') {
        delete registerData.enrollmentNumber;
        delete registerData.rollNumber;
        delete registerData.department;
        delete registerData.year;
        delete registerData.phoneNumber;
      }
      
      console.log('Submitting registration data:', registerData);
      const response = await register(registerData);
      console.log('Registration successful:', response);
      
      // The redirect will be handled by the useEffect when user state is updated
    } catch (err) {
      console.error('Registration error in component:', err);
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary-600 py-4 px-6">
        <h2 className="text-2xl font-bold text-white">Create an Account</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="py-6 px-8">
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your password"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="role" className="form-label">
            I am a
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        
        {formData.role === 'student' && (
          <>
            <div className="mb-4">
              <label htmlFor="enrollmentNumber" className="form-label">
                Enrollment Number
              </label>
              <input
                id="enrollmentNumber"
                name="enrollmentNumber"
                type="text"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter enrollment number"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="rollNumber" className="form-label">
                Roll Number
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                value={formData.rollNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter roll number"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="department" className="form-label">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter department"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="year" className="form-label">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter phone number (optional)"
              />
            </div>
          </>
        )}
        
        <button
          type="submit"
          className="btn-primary w-full py-2 px-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex justify-center items-center">
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Registering...</span>
            </span>
          ) : (
            'Register'
          )}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700">
            Login here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage; 