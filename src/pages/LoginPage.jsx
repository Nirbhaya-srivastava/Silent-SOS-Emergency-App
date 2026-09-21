import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(role);
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#f7f9f9]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#0f4c5c] text-white flex items-center justify-center mx-auto mb-3 shadow">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Silent SOS</h1>
          <p className="text-xs text-gray-500 mt-1">Discreet emergency assistance platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast-Login Strip */}
        <div className="mb-6 p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
          <span className="block text-[11px] font-semibold text-[#0f4c5c] uppercase tracking-wider mb-2">
            Demo Accounts (One-Click Test)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-demo-user"
              onClick={() => handleDemo('user')}
              disabled={loading}
              className="flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-white hover:bg-gray-50 border border-teal-200 text-xs font-medium text-gray-800 rounded-lg shadow-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#2a9d8f]" />
              <span>User Demo</span>
            </button>
            <button
              type="button"
              id="btn-demo-admin"
              onClick={() => handleDemo('admin')}
              disabled={loading}
              className="flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-white hover:bg-gray-50 border border-teal-200 text-xs font-medium text-gray-800 rounded-lg shadow-xs transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#e63946]" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4c5c] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#0f4c5c] hover:bg-[#0a3641] text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Need a secure account?{' '}
          <Link to="/register" className="font-semibold text-[#0f4c5c] hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
