import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, User, LogOut, Bell, Info, Mail, Shield, 
  Edit, Settings, FileText, MessageSquare, BookOpen
} from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import LogoutModal from './LogoutModal';
import ChangeUsernameModal from './ChangeUsernameModal';

export default function Profile() {
  const { state, dispatch } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' });
  };

  const handleAboutUs = () => {
    dispatch({ type: 'SET_PAGE', payload: 'about' });
  };

  const handleContactUs = () => {
    dispatch({ type: 'SET_PAGE', payload: 'contact' });
  };

  const handlePrivacy = () => {
    dispatch({ type: 'SET_PAGE', payload: 'privacy' });
  };

  const handleNotifications = () => {
    dispatch({ type: 'SET_PAGE', payload: 'notifications' });
  };

  const handleBlog = () => {
    dispatch({ type: 'SET_PAGE', payload: 'blog' });
  };

  // Get admin notifications
  const adminNotifications = state.notifications.filter(n => n.type === 'admin_action' && !n.read);
  const totalNotifications = state.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <img 
                  src={state.currentUser?.avatar} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Profile</h1>
                  <p className="text-sm text-gray-600">{state.currentUser?.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Actions
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowUsernameModal(true)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Change Username</p>
                  <p className="text-sm text-gray-500">Update your display name</p>
                </div>
              </button>
              
              <button
                onClick={handleNotifications}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">View admin messages and updates</p>
                </div>
                {totalNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Logout</p>
                  <p className="text-sm text-red-500">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Notifications */}
          {adminNotifications.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                Admin Notifications
              </h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {adminNotifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-orange-900">{notification.title}</p>
                        <p className="text-sm text-orange-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-orange-600 mt-2">
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {adminNotifications.length > 5 && (
                  <button
                    onClick={handleNotifications}
                    className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2"
                  >
                    View all notifications ({adminNotifications.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* App Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              App Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleBlog}
                className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900">Blog</p>
                  <p className="text-sm text-gray-500">Read latest updates</p>
                </div>
              </button>

              <button
                onClick={handleAboutUs}
                className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">About Us</p>
                  <p className="text-sm text-gray-500">Learn about our platform</p>
                </div>
              </button>
              
              <button
                onClick={handleContactUs}
                className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Mail className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Contact Us</p>
                  <p className="text-sm text-gray-500">Get in touch with support</p>
                </div>
              </button>
              
              <button
                onClick={handlePrivacy}
                className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-sm text-gray-500">Read our privacy terms</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />

      <ChangeUsernameModal 
        isOpen={showUsernameModal} 
        onClose={() => setShowUsernameModal(false)} 
      />
    </div>
  );
}