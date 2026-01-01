import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, LogOut, User, Briefcase, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'labour':
        return '/labour/dashboard';
      case 'client':
        return '/client/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl group-hover:shadow-glow transition-all duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              ServiceHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/jobs"
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Jobs</span>
                </Link>

                {user?.role === 'client' && (
                  <Link
                    to="/client/browse"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105"
                  >
                    Browse Workers
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-4">
                  <div className="px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                    <span className="text-sm font-semibold text-gray-800">
                      {user?.role === 'labour' && user?.labour?.name}
                      {user?.role === 'client' && user?.client?.name}
                      {user?.role === 'admin' && 'Admin'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-danger-600 font-medium transition-all duration-200 hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 hover:scale-105"
                >
                  Login
                </Link>
                
                <div className="flex items-center space-x-3">
                  <Link
                    to="/signup/client"
                    className="btn btn-outline text-sm"
                  >
                    Join as Client
                  </Link>
                  <Link
                    to="/signup/labour"
                    className="btn btn-primary text-sm"
                  >
                    Join as Worker
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600"
              >
                <LogOut className="w-6 h-6" />
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;