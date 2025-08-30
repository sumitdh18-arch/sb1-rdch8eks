import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useChatRooms } from '../hooks/useChatRooms';
import { usePresence } from '../hooks/usePresence';
import { useApp } from '../context/AppContext';
import { Users, MessageSquare, Clock, Activity, MessageCircle } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

export default function SupabaseChatRoomList() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { chatRooms, loading } = useChatRooms();
  const { onlineUsers } = usePresence(user);
  const { dispatch } = useApp();

  const handleJoinRoom = (roomId: string) => {
    dispatch({ type: 'SELECT_CHAT_ROOM', payload: roomId });
    dispatch({ type: 'SET_PAGE', payload: 'chat-room' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Anonymous Chat Rooms - Join Free Online Chat Communities</h1>
        <p>Discover and join anonymous chat rooms on various topics. Connect with people worldwide in secure, private chat environments. Free registration, instant access.</p>
        {chatRooms.map((room) => (
          <div key={room.id}>
            <h2>{room.name} - Anonymous Chat Room</h2>
            <p>{room.description}</p>
          </div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Chat Rooms</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatRooms.map((room) => {
            // Simulate room-specific online users (in real implementation, you'd track this)
            const roomOnlineUsers = onlineUsers.filter(() => Math.random() > 0.3);
            
            return (
              <div
                key={room.id}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border border-white/20 cursor-pointer group"
                onClick={() => handleJoinRoom(room.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{onlineUsers.length}</span>
                    </div>
                    {roomOnlineUsers.length > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">{roomOnlineUsers.length}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{room.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Created {formatRelativeTime(room.createdAt)}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-full group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                    Join
                  </div>
                </div>

                {/* Online users preview */}
                {roomOnlineUsers.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {roomOnlineUsers.slice(0, 3).map((user) => (
                        <img
                          key={user.id}
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-6 h-6 rounded-full border-2 border-white"
                          title={user.username}
                        />
                      ))}
                      {roomOnlineUsers.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{roomOnlineUsers.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">online now</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
            <MessageSquare className="w-4 h-4" />
            <span>Click on any username in chat rooms to start a private conversation</span>
          </div>
        </div>

        {/* All Active Users Across Rooms */}
        <div className="mt-6 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Active Users Across All Rooms ({onlineUsers.length})
            </h3>
            
            {onlineUsers.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3">
                {onlineUsers.slice(0, 12).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full px-3 py-2 cursor-pointer transition-colors group"
                    onClick={() => {
                      // Start private chat when clicking on user
                      console.log('Starting chat with user from active list:', user.username);
                      // You can implement the same private chat logic here
                    }}
                  >
                    <img 
                      src={user.avatar_url} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-green-800 group-hover:text-green-900">
                      {user.username}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ))}
                {onlineUsers.length > 12 && (
                  <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-2">
                    <span className="text-sm text-gray-600">+{onlineUsers.length - 12} more</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">No users currently active</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}