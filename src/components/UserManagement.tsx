import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Search, MoreVertical, Ban, UserX, Eye, AlertTriangle } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  is_online: boolean;
  last_seen: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBanUser = async (userId: string) => {
    try {
      // In a real implementation, you'd have a banned_users table
      console.log('Banning user:', userId);
      // For now, just log the action
      alert('User ban functionality would be implemented here');
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/70">Manage registered users and their activities</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <span className="text-white font-medium">{users.length} Total Users</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-4 text-white font-medium">User</th>
                <th className="text-left p-4 text-white font-medium">Status</th>
                <th className="text-left p-4 text-white font-medium">Joined</th>
                <th className="text-left p-4 text-white font-medium">Last Seen</th>
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
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-white/50 text-sm">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className={`text-sm ${user.is_online ? 'text-green-400' : 'text-gray-400'}`}>
                        {user.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white/70 text-sm">
                      {formatRelativeTime(new Date(user.created_at))}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white/70 text-sm">
                      {formatRelativeTime(new Date(user.last_seen))}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-white/70" />
                      </button>
                      
                      {selectedUser === user.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px] z-10">
                          <button
                            onClick={() => {
                              console.log('View user details:', user.id);
                              setSelectedUser(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              handleBanUser(user.id);
                              setSelectedUser(null);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                          >
                            <Ban className="w-4 h-4" />
                            Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/70 mb-2">No users found</h3>
          <p className="text-white/50">
            {searchTerm ? 'Try adjusting your search criteria.' : 'No users have registered yet.'}
          </p>
        </div>
      )}
    </div>
  );
}