import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { usePresence } from '../hooks/usePresence';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MessageCircle, User, Activity, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
}

export default function OnlineUsers() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { onlineUsers: presenceUsers } = usePresence(user);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all users from database
  const fetchAllUsers = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (error) throw error;

      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();

    // Subscribe to profile changes for real-time updates
    const channel = supabase
      .channel('profiles_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchAllUsers();
        }
      )
      .subscribe();

    // Refresh every 30 seconds to ensure data is current
    const interval = setInterval(fetchAllUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const handleBack = () => {
    dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' });
  };

  const handleRefresh = () => {
    fetchAllUsers();
  };

  const handleStartChat = async (userId: string, userName: string) => {
    if (!user?.id) {
      alert('Please log in to start a chat.');
      return;
    }
    
    try {
      // ✅ Use RPC instead of usePrivateChats
      const { data: chatId, error } = await supabase.rpc(
        'find_or_create_private_chat',
        { p1: user.id, p2: userId }
      );

      if (error) {
        console.error('Failed to create/find private chat:', error);
        alert(`Failed to start chat with ${userName}. Please try again.`);
        return;
      }

      if (chatId) {
        const otherUser = {
          id: userId,
          username: userName,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}&backgroundColor=b6e3f4,c0aede,d1d4f9`
        };
        
        const existingPartner = state.chatPartners.find(p => p.id === userId);
        if (!existingPartner) {
          dispatch({ type: 'ADD_CHAT_PARTNER', payload: otherUser });
        }

        dispatch({ type: 'SET_CHAT_PARTNER_NAME', payload: userName });
        dispatch({ type: 'SELECT_PRIVATE_CHAT', payload: chatId });
        dispatch({ type: 'SET_PREVIOUS_PAGE', payload: 'online-users' });
        dispatch({ type: 'SET_PAGE', payload: 'private-chat' });
      }
    } catch (err) {
      console.error('Error starting private chat:', err);
      alert(`Failed to start chat with ${userName}. Please try again.`);
    }
  };

  // Merge presence data with database data for most accurate online status
  const getUsersWithPresence = () => {
    return allUsers.map(dbUser => {
      const presenceUser = presenceUsers.find(p => p.id === dbUser.id);
      const lastSeen = new Date(dbUser.last_seen);
      const now = new Date();
      const timeDiff = now.getTime() - lastSeen.getTime();
      const isRecentlyActive = timeDiff < 5 * 60 * 1000; // 5 minutes
      
      return {
        ...dbUser,
        is_online: presenceUser ? true : (dbUser.is_online && isRecentlyActive),
        presence_active: !!presenceUser
      };
    }).filter(user => user.id !== profile?.id); // Exclude current user
  };

  const usersWithPresence = getUsersWithPresence();
  const onlineUsers = usersWithPresence.filter(user => user.is_online || user.presence_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center pb-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Online Users</h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/70 hover:bg-white/90 text-gray-700 px-3 py-2 rounded-lg transition-colors border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {onlineUsers.length} Online
            </div>
          </div>
        </div>

        {onlineUsers.length > 0 ? (
          <div className="space-y-4">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border border-white/20 cursor-pointer group"
                onClick={() => handleStartChat(user.id, user.username)}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={user.avatar_url} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {user.username}
                      </h3>
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                          {user.presence_active ? 'Active Now' : 'Online'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-sm">
                        {user.presence_active ? 'Currently active' : `Last seen ${formatRelativeTime(new Date(user.last_seen))}`}
                      </p>
                      
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-full group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>Chat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No users online</h3>
            <p className="text-gray-500">Be the first to join the community!</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
            <Activity className="w-4 h-4" />
            <span>
              {onlineUsers.length} users online • Updated every 30 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
