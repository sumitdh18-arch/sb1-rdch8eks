import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { usePresence } from '../hooks/usePresence';
import { useMessages } from '../hooks/useMessages';
import { MessageCircle, Users, UserCheck, User } from 'lucide-react';

export default function Footer() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { totalOnlineCount = 0 } = usePresence(user);

  // Calculate total unread messages across all private chats
  const totalUnreadMessages = React.useMemo(() => {
    return state.privateChats.reduce((total, chat) => {
      return total + (chat.unreadCount || 0);
    }, 0);
  }, [state.privateChats]);

  // Pages where footer should be hidden
  const hideFooterPages = [
    'home',
    'username-setup',
    'authenticated-username-setup',
    'about',
    'contact',
    'privacy',
  ];

  // Event handlers
  const handleChatRooms = () => {
    dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' });
  };

  const handlePrivateChats = () => {
    dispatch({ type: 'SET_PAGE', payload: 'private-chats' });
  };

  const handleOnlineUsers = () => {
    dispatch({ type: 'SET_PAGE', payload: 'online-users' });
  };

  const handleProfile = () => {
    dispatch({ type: 'SET_PAGE', payload: 'profile' });
  };

  // Hide footer after hooks are called
  if (!user || hideFooterPages.includes(state.currentPage)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 px-2 sm:px-4 py-2 z-40 shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-around items-center">
          <button
            onClick={handleChatRooms}
            className={`flex flex-col items-center gap-1 py-2 px-2 sm:px-4 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              state.currentPage === 'chat-rooms' || state.currentPage === 'chat-room'
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium truncate">Rooms</span>
          </button>

          <button
            onClick={handlePrivateChats}
            className={`flex flex-col items-center gap-1 py-2 px-2 sm:px-4 rounded-xl transition-all duration-200 relative min-w-0 flex-1 ${
              state.currentPage === 'private-chats' || state.currentPage === 'private-chat'
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium truncate">Chats</span>
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
              </span>
            )}
          </button>

          <button
            onClick={handleOnlineUsers}
            className={`flex flex-col items-center gap-1 py-2 px-2 sm:px-4 rounded-xl transition-all duration-200 relative min-w-0 flex-1 ${
              state.currentPage === 'online-users'
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium truncate">Online</span>
            {totalOnlineCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs animate-pulse">
                {totalOnlineCount > 99 ? '99+' : totalOnlineCount}
              </span>
            )}
          </button>

          <button
            onClick={handleProfile}
            className={`flex flex-col items-center gap-1 py-2 px-2 sm:px-4 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
              state.currentPage === 'profile' || state.currentPage === 'notifications'
                ? 'bg-blue-100 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs font-medium truncate">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}