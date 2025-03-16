import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Manage Student Projects with Ease
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          A comprehensive platform for teachers and students to collaborate on projects,
          track progress, and achieve academic success.
        </p>
        
        {!user ? (
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary text-lg px-6 py-3"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn-outline text-lg px-6 py-3"
            >
              Login
            </Link>
          </div>
        ) : (
          <Link
            to={user.role === 'teacher' ? '/teacher' : '/student'}
            className="btn-primary text-lg px-6 py-3"
          >
            Go to Dashboard
          </Link>
        )}
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">
                <i className="fas fa-tasks"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Project Tracking</h3>
              <p className="text-gray-600">
                Track project progress with milestones and completion status. Stay on top of deadlines.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Student Management</h3>
              <p className="text-gray-600">
                Easily manage student information, assignments, and progress all in one place.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-primary-600 text-4xl mb-4">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Feedback</h3>
              <p className="text-gray-600">
                Provide and receive feedback on projects to ensure continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Join the platform that's helping educators and students collaborate more effectively.
        </p>
        
        {!user ? (
          <Link
            to="/register"
            className="btn-primary text-lg px-6 py-3"
          >
            Sign Up Now
          </Link>
        ) : (
          <Link
            to={user.role === 'teacher' ? '/teacher' : '/student'}
            className="btn-primary text-lg px-6 py-3"
          >
            Go to Dashboard
          </Link>
        )}
      </section>
    </div>
  );
};

export default HomePage; 