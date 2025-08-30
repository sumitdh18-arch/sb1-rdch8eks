import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Eye, EyeOff, AlertCircle, Mail, Lock, UserPlus, CheckCircle, Key, X } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminLogin() {
  const { dispatch } = useApp();
  const { admin, signIn, resetAdminCredentials, loading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetData, setResetData] = useState({ email: '', password: '', confirmPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (admin && !authLoading) {
      dispatch({ type: 'SET_ADMIN_SESSION', payload: admin });
      dispatch({ type: 'SET_PAGE', payload: 'admin-panel' });
    }
  }, [admin, authLoading, dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password');
        return;
      }

      const { data, error: authError } = await signIn(email.trim(), password);
      
      if (authError) {
        setError(authError);
      } else if (data) {
        setSuccess('Login successful! Redirecting...');
        dispatch({ type: 'SET_ADMIN_SESSION', payload: data });
        
        // Small delay for better UX
        setTimeout(() => {
          dispatch({ type: 'SET_PAGE', payload: 'admin-panel' });
        }, 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleDemoLogin = (role: 'super_admin' | 'moderator' | 'support') => {
    const demoCredentials = {
      super_admin: { email: 'sumitdhanuk2000@gmail.com', password: 'asdfghjkl' },
      moderator: { email: 'moderator@chatapp.com', password: 'mod123' },
      support: { email: 'support@chatapp.com', password: 'support123' }
    };

    const creds = demoCredentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
    setSuccess('');
  };

  const handleResetCredentials = async () => {
    if (!resetData.email || !resetData.password || !resetData.confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (resetData.password !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (resetData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      const { error: resetError } = await resetAdminCredentials(resetData.email, resetData.password);
      
      if (resetError) {
        setError(resetError);
      } else {
        setSuccess('Credentials updated successfully!');
        setShowResetModal(false);
        setResetData({ email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setError('Failed to reset credentials. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // Show loading while checking existing session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-white/70">Secure access to administration panel</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={handleBackToHome}
              className="text-white/60 hover:text-white text-sm transition-colors"
              disabled={isLoading}
            >
              ← Back to Home
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-300 mb-3 font-medium">Admin Login Credentials:</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('super_admin')}
                  disabled={isLoading}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 text-red-400" />
                    <span className="text-xs font-medium text-red-300">Super Admin</span>
                  </div>
                  <p className="text-xs text-white/70">sumitdhanuk2000@gmail.com / asdfghjkl</p>
                  <p className="text-xs text-white/50">Full system access</p>
                </button>

                <button
                  onClick={() => setShowResetModal(true)}
                  disabled={isLoading}
                  className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300">Reset Credentials</span>
                  </div>
                  <p className="text-xs text-white/50">Update admin email and password</p>
                </button>
              </div>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-xs text-green-300">
                <strong>Ready to use:</strong> The admin account is pre-configured in your database.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Credentials Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Reset Admin Credentials</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                <input
                  type="email"
                  value={resetData.email}
                  onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={resetData.password}
                  onChange={(e) => setResetData({ ...resetData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={resetData.confirmPassword}
                  onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will update your admin credentials. Make sure to remember the new details.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCredentials}
                disabled={resetLoading}
                className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {resetLoading ? 'Updating...' : 'Reset Credentials'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}