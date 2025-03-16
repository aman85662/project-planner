import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center py-12 px-4 text-center">
      <div className="text-9xl font-bold text-red-500 mb-4">403</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
      <p className="text-xl text-gray-600 max-w-md mb-8">
        Sorry, you don't have permission to access this page.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4">
        <button 
          onClick={handleGoBack} 
          className="btn-outline"
        >
          Go Back
        </button>
        
        {user ? (
          <Link 
            to={user.role === 'teacher' ? '/teacher' : '/student'} 
            className="btn-primary"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage; 