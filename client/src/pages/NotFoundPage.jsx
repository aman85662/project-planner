import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center py-12 px-4 text-center">
      <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-xl text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary text-lg px-6 py-3">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage; 