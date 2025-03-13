import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Project Planner
        </Link>
        <div className="space-x-4">
          <Link to="/teacher" className="text-white hover:text-blue-200 transition-colors">
            Teacher Page
          </Link>
          <Link to="/student" className="text-white hover:text-blue-200 transition-colors">
            Student Page
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 