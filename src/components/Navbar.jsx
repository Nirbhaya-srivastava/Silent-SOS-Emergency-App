import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Users, Clock, ShieldAlert, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header id="main-header" className="bg-[#0f4c5c] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              id="brand-logo-link"
              className="flex items-center space-x-2.5 font-semibold text-lg tracking-tight focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
            >
              <span className="w-8 h-8 rounded-lg bg-[#2a9d8f] flex items-center justify-center text-white shadow-inner">
                <Shield className="w-5 h-5" />
              </span>
              <span className="text-white font-medium text-lg">Silent SOS</span>
            </Link>
            <span className="hidden sm:inline-block text-xs bg-[#0a3641] text-teal-200 px-2 py-0.5 rounded-full font-medium">
              Discreet Safety Mode
            </span>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                id="nav-link-dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#0a3641] text-white'
                    : 'text-teal-100 hover:bg-[#0a3641]/60 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/contacts"
                id="nav-link-contacts"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/contacts'
                    ? 'bg-[#0a3641] text-white'
                    : 'text-teal-100 hover:bg-[#0a3641]/60 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Contacts</span>
              </Link>
              <Link
                to="/history"
                id="nav-link-history"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/history'
                    ? 'bg-[#0a3641] text-white'
                    : 'text-teal-100 hover:bg-[#0a3641]/60 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Alert History</span>
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  id="nav-link-admin"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-[#e63946] text-white'
                      : 'text-teal-100 hover:bg-[#0a3641]/60 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Portal</span>
                </Link>
              )}
            </nav>
          )}

          {/* User Status & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <>
                
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-medium text-white">{user.name}</span>
                  <span className="text-[11px] text-teal-200 capitalize">{user.role}</span>
                </div>

                <button
                  type="button"
                  id="btn-logout"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  title="Sign out"
                  className="p-2 text-teal-200 hover:text-white hover:bg-[#0a3641] rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Sign out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0a3641] rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="nav-register-btn"
                  className="px-3 py-1.5 text-sm font-medium bg-[#2a9d8f] hover:bg-[#238276] text-white rounded-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            {user && (
              <button
                type="button"
                id="btn-mobile-menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-teal-100 hover:text-white hover:bg-[#0a3641] rounded-md"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {user && mobileMenuOpen && (
        <div id="mobile-nav-panel" className="md:hidden bg-[#0a3641] border-t border-teal-800 px-4 pt-2 pb-4 space-y-1">
          <div className="py-2 border-b border-teal-800/80 mb-2">
            <p className="text-xs text-teal-300">Signed in as</p>
            <p className="text-sm font-semibold text-white">{user.name} ({user.role})</p>
          </div>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/' ? 'bg-[#0f4c5c] text-white' : 'text-teal-100 hover:bg-[#0f4c5c]'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/contacts"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/contacts' ? 'bg-[#0f4c5c] text-white' : 'text-teal-100 hover:bg-[#0f4c5c]'
            }`}
          >
            Emergency Contacts
          </Link>
          <Link
            to="/history"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/history' ? 'bg-[#0f4c5c] text-white' : 'text-teal-100 hover:bg-[#0f4c5c]'
            }`}
          >
            Alert History
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium text-white ${
                location.pathname === '/admin' ? 'bg-[#e63946]' : 'hover:bg-[#0f4c5c]'
              }`}
            >
              Admin Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
