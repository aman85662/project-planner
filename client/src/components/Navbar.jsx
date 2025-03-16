import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useAuth } from '@context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Determine navigation links based on user role
  const getNavLinks = () => {
    const commonLinks = [
      { to: '/', label: 'Home' },
    ];

    if (!user) {
      return [
        ...commonLinks,
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Register' },
      ];
    }

    if (user.role === 'teacher') {
      return [
        ...commonLinks,
        { to: '/teacher', label: 'Dashboard' },
        { to: '/projects', label: 'Projects' },
        { to: '/students', label: 'Students' },
      ];
    }

    if (user.role === 'student') {
      return [
        ...commonLinks,
        { to: '/student', label: 'Dashboard' },
        { to: '/projects', label: 'My Projects' },
      ];
    }

    return commonLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            Project Planner
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-medium hover:text-primary-200 transition-colors ${
                    isActive ? 'text-white border-b-2 border-white' : 'text-primary-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-600">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `block py-2 font-medium hover:text-primary-200 transition-colors ${
                        isActive ? 'text-white font-bold' : 'text-primary-100'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {user && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-primary-100 font-medium hover:text-primary-200 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar; 