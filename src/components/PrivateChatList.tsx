import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { usePrivateChats } from '../hooks/usePrivateChats';
import { usePresence } from '../hooks/usePresence';
import { MessageCircle, Clock, User, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

export default function PrivateChatList() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { onlineUsers } = usePresence(user);
  
  // Use user?.id to get the string UUID
  const { privateChats, loading } = usePrivateChats(user?.id);

  // Show loading state if privateChats are loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center pb-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading private chats...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center pb-16">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view private chats.</p>
        </div>
      </div>
    );
  }

  const handleOpenChat = (chatId: string, otherUserId: string, otherUsername: string) => {
    console.log('Opening chat:', { chatId, otherUserId, otherUsername });
    
    // Store chat partner info
    const otherUser = {
      id: otherUserId,
      username: otherUsername,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`
    };
    
    // Add to chat partners if not already there
    const existingPartner = state.chatPartners.find(p => p.id === otherUserId);
    if (!existingPartner) {
      dispatch({ type: 'ADD_CHAT_PARTNER', payload: otherUser });
    }
    
    // Set chat partner name and navigate
    dispatch({ type: 'SET_CHAT_PARTNER_NAME', payload: otherUsername });
    dispatch({ type: 'SELECT_PRIVATE_CHAT', payload: chatId });
    dispatch({ type: 'SET_PAGE', payload: 'private-chat' });
  };

  const getOtherUserInfo = (chat: any) => {
    const otherUserId = chat.participants.find((id: string) => id !== user.id);
    
    if (!otherUserId) return null;
    
    // First check presence users for most accurate online status
    const presenceUser = onlineUsers.find(p => p.id === otherUserId);
    if (presenceUser) {
      return {
        id: presenceUser.id,
        username: presenceUser.username,
        avatar: presenceUser.avatar_url,
        isOnline: true // If in presence, definitely online
      };
    }
    
    // Then try to find in chat partners
    const chatPartner = state.chatPartners.find(p => p.id === otherUserId);
    if (chatPartner) {
      return {
        ...chatPartner,
        id: chatPartner.id,
        avatar: chatPartner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        isOnline: false // Not in presence, so offline
      };
    }
    
    // Then try to find in all users
    const userFromAllUsers = state.allUsers.find(u => u.id === otherUserId);
    if (userFromAllUsers) {
      return {
        id: userFromAllUsers.id,
        username: userFromAllUsers.username,
        avatar: userFromAllUsers.avatar,
        isOnline: false // Not in presence, so offline
      };
    }
    
    // Fallback
    return {
      id: otherUserId,
      username: `User${otherUserId.slice(-3)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      isOnline: false
    };
  };

  // Sort chats by last activity (unread first, then by time)
  const sortedChats = [...privateChats].sort((a, b) => {
    // Unread chats first
    if ((a.unreadCount || 0) > 0 && (b.unreadCount || 0) === 0) return -1;
    if ((b.unreadCount || 0) > 0 && (a.unreadCount || 0) === 0) return 1;
    
    // Then by last activity
    return new Date(b.lastActivity || b.createdAt).getTime() - new Date(a.lastActivity || a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Private Chats</h1>
        </div>

        {sortedChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No private chats yet</h3>
            <p className="text-gray-500 mb-6">Start a conversation by clicking on a username in any chat room</p>
            <button
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' })}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full transition-all duration-300"
            >
              Browse Chat Rooms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedChats.map((chat) => {
              const otherUser = getOtherUserInfo(chat);
              
              if (!otherUser) return null; // Skip if no other user found
              
              const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
              const isBlocked = chat.blockedBy === state.currentUser?.id;
              const isBlockedByOther = chat.blockedBy && chat.blockedBy !== state.currentUser?.id;
              
              return (
                <div
                  key={chat.id}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border border-white/20 cursor-pointer group relative"
                  onClick={() => handleOpenChat(chat.id, otherUser.id, otherUser.username)}
                >
                  {/* Unread indicator */}
                  {(chat.unreadCount || 0) > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {chat.unreadCount! > 9 ? '9+' : chat.unreadCount}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <img 
                      src={otherUser.avatar} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {otherUser.username}
                        </h3>
                        <div className={`flex items-center gap-1 ${otherUser.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${otherUser.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className="text-sm">{otherUser.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                      
                      {isBlocked ? (
                        <p className="text-gray-500 text-sm mb-2">You blocked this user</p>
                      ) : isBlockedByOther ? (
                        <p className="text-gray-500 text-sm mb-2">This user has blocked you</p>
                      ) : lastMessage ? (
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-600 truncate flex-1">
                              {lastMessage.senderId === state.currentUser?.id ? 'You: ' : ''}
                              {lastMessage.type === 'image' ? '📷 Image' : lastMessage.content}
                            </p>
                            {lastMessage.senderId === state.currentUser?.id && (
                              <div className="flex-shrink-0">
                                {lastMessage.read ? (
                                  <CheckCheck className="w-4 h-4 text-blue-500" />
                                ) : lastMessage.delivered ? (
                                  <CheckCheck className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(lastMessage.timestamp)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm mb-2">No messages yet</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MessageCircle className="w-4 h-4" />
                          <span>{chat.messages ? chat.messages.length : 0} messages</span>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-full group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                          Open
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}