import React, { useState, useEffect } from 'react';
import { UserX, Search, RotateCcw, Calendar } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface BannedUser {
  id: string;
  username: string;
  avatar_url: string;
  banned_at: string;
  banned_by: string;
  reason: string;
  ban_expires: string | null;
}

export default function BannedUsers() {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading banned users
    setTimeout(() => {
      setBannedUsers([]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;
    
    try {
      // In a real implementation, you'd remove from banned_users table
      console.log('Unbanning user:', userId);
      setBannedUsers(prev => prev.filter(user => user.id !== userId));
      alert('User has been unbanned successfully');
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    }
  };

  const filteredUsers = bannedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading banned users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Banned Users</h1>
          <p className="text-white/70">Manage banned users and their restrictions</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <span className="text-white font-medium">{bannedUsers.length} Banned Users</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search banned users..."
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {bannedUsers.length === 0 ? (
        <div className="text-center py-12">
          <UserX className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No banned users</h3>
          <p className="text-white/50">No users are currently banned from the platform.</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-4 text-white font-medium">User</th>
                  <th className="text-left p-4 text-white font-medium">Reason</th>
                  <th className="text-left p-4 text-white font-medium">Banned</th>
                  <th className="text-left p-4 text-white font-medium">Expires</th>
                  <th className="text-left p-4 text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-10 h-10 rounded-full opacity-50"
                        />
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-white/50 text-sm">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white/70 text-sm">{user.reason}</p>
                      <p className="text-white/50 text-xs">By: {user.banned_by}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white/70 text-sm">
                        {formatRelativeTime(new Date(user.banned_at))}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.ban_expires ? (
                        <div className="flex items-center gap-1 text-orange-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {formatRelativeTime(new Date(user.ban_expires))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-red-400 text-sm">Permanent</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleUnbanUser(user.id)}
                        className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Unban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && bannedUsers.length > 0 && (
        <div className="text-center py-12">
          <UserX className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No users found</h3>
          <p className="text-white/50">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}