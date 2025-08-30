import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { 
  BarChart3, Users, MessageSquare, Flag, UserX, Megaphone, 
  Shield, LogOut, BookOpen, Settings, Home
} from 'lucide-react';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import ChatRoomManagement from './ChatRoomManagement';
import ReportManagement from './ReportManagement';
import BannedUsers from './BannedUsers';
import Broadcast from './Broadcast';
import AdminManagement from './AdminManagement';
import BlogManagement from './BlogManagement';

export default function AdminPanel() {
  const { state, dispatch } = useApp();
  const { admin, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch({ type: 'CLEAR_ADMIN_SESSION' });
      dispatch({ type: 'SET_PAGE', payload: 'admin-login' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      dispatch({ type: 'CLEAR_ADMIN_SESSION' });
      dispatch({ type: 'SET_PAGE', payload: 'admin-login' });
    }
  };

  const handleBackToSite = () => {
    window.location.href = '/';
  };

  const hasPermission = (action: string) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions.includes(action);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: 'view_analytics' },
    { id: 'users', label: 'Users', icon: Users, permission: 'manage_users' },
    { id: 'rooms', label: 'Chat Rooms', icon: MessageSquare, permission: 'manage_rooms' },
    { id: 'reports', label: 'Reports', icon: Flag, permission: 'manage_reports' },
    { id: 'banned', label: 'Banned Users', icon: UserX, permission: 'manage_users' },
    { id: 'broadcast', label: 'Broadcast', icon: Megaphone, permission: 'broadcast' },
    { id: 'blog', label: 'Blog', icon: BookOpen, permission: 'manage_blogs' },
    { id: 'admins', label: 'Admin Management', icon: Shield, permission: 'manage_admins' },
  ];

  const visibleTabs = tabs.filter(tab => hasPermission(tab.permission));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'rooms':
        return <ChatRoomManagement />;
      case 'reports':
        return <ReportManagement />;
      case 'banned':
        return <BannedUsers />;
      case 'broadcast':
        return <Broadcast />;
      case 'blog':
        return <BlogManagement />;
      case 'admins':
        return <AdminManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 mb-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-white/70">
                  Welcome back, {admin?.email} ({admin?.role.replace('_', ' ')})
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSite}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Site
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-2 mb-6 shadow-xl border border-white/20">
          <div className="flex flex-wrap gap-2">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 shadow-xl border border-white/20">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}