import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { usePresence } from '../hooks/usePresence';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  MessageSquare, 
  Flag, 
  UserX, 
  Activity, 
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { stats, loading } = useAdminDashboard();
  const { user } = useAuth();
  const { totalOnlineCount } = usePresence(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-white">Loading dashboard...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">Unable to load dashboard statistics</p>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.new_users_today || 0} today`
    },
    {
      title: 'Online Now',
      value: totalOnlineCount || stats?.online_users || 0,
      icon: Activity,
      color: 'bg-green-500',
      change: `${stats?.total_users ? Math.round(((totalOnlineCount || stats?.online_users || 0) / stats.total_users) * 100) : 0}% active`
    },
    {
      title: 'Chat Rooms',
      value: stats?.total_chat_rooms || 0,
      icon: MessageSquare,
      color: 'bg-purple-500',
      change: 'All active'
    },
    {
      title: 'Total Messages',
      value: stats?.total_messages || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: `+${stats?.messages_today || 0} today`
    },
    {
      title: 'Pending Reports',
      value: stats?.pending_reports || 0,
      icon: Flag,
      color: 'bg-red-500',
      change: (stats?.pending_reports || 0) > 0 ? 'Needs attention' : 'All clear'
    },
    {
      title: 'Banned Users',
      value: stats?.banned_users || 0,
      icon: UserX,
      color: 'bg-gray-500',
      change: 'Moderated'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/70">Overview of your anonymous chat platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-sm text-white/60 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">New Users</span>
              <span className="text-sm font-medium text-white">{stats?.new_users_today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Messages Sent</span>
              <span className="text-sm font-medium text-white">{stats?.messages_today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Reports Filed</span>
              <span className="text-sm font-medium text-white">{stats?.reports_today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Private Chats</span>
              <span className="text-sm font-medium text-white">{stats?.total_private_chats || 0}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-white/70">Database: Operational</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-white/70">Real-time: Connected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${(stats?.pending_reports || 0) > 10 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-white/70">Moderation: {(stats?.pending_reports || 0) > 10 ? 'Attention Needed' : 'Normal'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-white/70">Storage: Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Manage Users</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Monitor Chats</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Flag className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Review Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}