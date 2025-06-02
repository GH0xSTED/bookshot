import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Calendar, Home, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Studios', path: '/studios', icon: <Calendar size={18} /> },
    { name: 'My Bookings', path: '/bookings', icon: <Calendar size={18} /> },
    ...(isAdmin ? [
      { name: 'Admin', path: '/admin', icon: <Settings size={18} /> }
    ] : []),
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BOOKSHOT</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}

            {user ? (
              <div className="ml-3 relative flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <UserIcon size={18} className="mr-1" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === link.path
                    ? 'border-primary-500 text-primary-700 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-2">{link.icon}</span>
                  <span>{link.name}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="flex flex-col">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                >
                  <span className="flex items-center">
                    <UserIcon size={18} className="mr-2" />
                    <span>Profile</span>
                  </span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                >
                  <span className="flex items-center">
                    <LogOut size={18} className="mr-2" />
                    <span>Sign out</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:text-primary-800 hover:bg-primary-50 hover:border-primary-300"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}