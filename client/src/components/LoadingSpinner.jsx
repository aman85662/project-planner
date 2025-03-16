import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  // Define size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
    xlarge: 'h-16 w-16 border-4'
  };
  
  // Define color classes
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };
  
  // Combine classes
  const spinnerClasses = `animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${colorClasses[color]}`;
  
  return (
    <div className="flex justify-center items-center">
      <div className={spinnerClasses} role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 