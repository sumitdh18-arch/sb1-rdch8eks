import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Message, ChatRoom, PrivateChat, Notification, AudioCall, Admin, Report, BlogPost } from '../types';
import { generateRandomUsername, generateUserId, generateNotificationId } from '../utils/helpers';
import { saveUserData, loadUserData, clearUserData, startAutoSave } from '../utils/storage';

interface ChatPartner {
  id: string;
  username: string;
  avatar: string;
}

interface AppState {
  currentUser: User | null;
  currentAdmin: Admin | null;
  allUsers: User[];
  adminUsers: Admin[];
  chatRooms: ChatRoom[];
  privateChats: PrivateChat[];
  notifications: Notification[];
  reports: Report[];
  blogPosts: BlogPost[];
  activeCall: AudioCall | null;
  currentPage: string;
  previousPage: string | null;
  selectedChatRoom: string | null;
  selectedPrivateChat: string | null;
  selectedChatPartnerName: string | null;
  chatPartners: ChatPartner[];
  usedUsernames: string[];
  showExitWarning: boolean;
  bannedUsers: string[];
  broadcastHistory: Array<{
    id: string;
    message: string;
    target: string;
    sentBy: string;
    timestamp: Date;
    recipients: number;
  }>;
  dataExpiresAt: Date | null;
  isInitializing: boolean;
}

type AppAction = 
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_DATA' }
  | { type: 'SET_ADMIN_SESSION'; payload: Admin }
  | { type: 'CLEAR_ADMIN_SESSION' }
  | { type: 'SET_PAGE'; payload: string }
  | { type: 'SET_PREVIOUS_PAGE'; payload: string }
  | { type: 'SELECT_CHAT_ROOM'; payload: string | null }
  | { type: 'SELECT_PRIVATE_CHAT'; payload: string | null }
  | { type: 'SET_CHAT_PARTNER_NAME'; payload: string }
  | { type: 'CLEAR_CHAT_PARTNER_NAME' }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'INCREMENT_BLOG_READ_COUNT'; payload: string }
  | { type: 'SET_ACTIVE_CALL'; payload: AudioCall | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; isOnline: boolean } }
  | { type: 'SET_SHOW_EXIT_WARNING'; payload: boolean }
  | { type: 'ADD_CHAT_PARTNER'; payload: ChatPartner }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'SET_CHAT_ROOMS'; payload: ChatRoom[] }
  | { type: 'SET_PRIVATE_CHATS'; payload: PrivateChat[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_REPORTS'; payload: Report[] }
  | { type: 'SET_BLOG_POSTS'; payload: BlogPost[] }
  | { type: 'MARK_MESSAGES_READ'; payload: { chatId: string; userId: string } }
  | { type: 'BAN_USER'; payload: string }
  | { type: 'UNBAN_USER'; payload: string }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'MUTE_USER'; payload: { userId: string; duration: number } }
  | { type: 'WARN_USER'; payload: { userId: string; reason: string } }
  | { type: 'BLOCK_USER'; payload: { blockerId: string; blockedId: string } }
  | { type: 'UNBLOCK_USER'; payload: { blockerId: string; blockedId: string } }
  | { type: 'START_PRIVATE_CHAT'; payload: { userId: string; userName: string } }
  | { type: 'JOIN_CHAT_ROOM'; payload: string }
  | { type: 'END_CALL' }
  | { type: 'ADD_BROADCAST'; payload: { id: string; message: string; target: string; sentBy: string; timestamp: Date; recipients: number } }
  | { type: 'SET_DATA_EXPIRES_AT'; payload: Date }
  | { type: 'SET_INITIALIZING'; payload: boolean };

const initialState: AppState = {
  currentUser: null,
  currentAdmin: null,
  allUsers: [],
  adminUsers: [],
  chatRooms: [],
  privateChats: [],
  notifications: [],
  reports: [],
  blogPosts: [],
  activeCall: null,
  currentPage: 'home',
  previousPage: null,
  selectedChatRoom: null,
  selectedPrivateChat: null,
  selectedChatPartnerName: null,
  chatPartners: [],
  usedUsernames: [],
  showExitWarning: false,
  bannedUsers: [],
  broadcastHistory: [],
  dataExpiresAt: null,
  isInitializing: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        usedUsernames: [...state.usedUsernames, action.payload.username]
      };

    case 'CLEAR_DATA':
      return {
        ...initialState,
        isInitializing: false
      };

    case 'SET_ADMIN_SESSION':
      return {
        ...state,
        currentAdmin: action.payload
      };

    case 'CLEAR_ADMIN_SESSION':
      return {
        ...state,
        currentAdmin: null
      };

    case 'SET_PAGE':
      return {
        ...state,
        previousPage: state.currentPage,
        currentPage: action.payload
      };

    case 'SET_PREVIOUS_PAGE':
      return {
        ...state,
        previousPage: action.payload
      };

    case 'SELECT_CHAT_ROOM':
      return {
        ...state,
        selectedChatRoom: action.payload,
        selectedPrivateChat: null,
        selectedChatPartnerName: null
      };

    case 'SELECT_PRIVATE_CHAT':
      return {
        ...state,
        selectedPrivateChat: action.payload,
        selectedChatRoom: null
      };

    case 'SET_CHAT_PARTNER_NAME':
      return {
        ...state,
        selectedChatPartnerName: action.payload
      };

    case 'CLEAR_CHAT_PARTNER_NAME':
      return {
        ...state,
        selectedChatPartnerName: null
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        // Messages are handled by Supabase hooks, not local state
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      };

    case 'INCREMENT_BLOG_READ_COUNT':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload ? { ...post, readCount: post.readCount + 1 } : post
        )
      };

    case 'SET_ACTIVE_CALL':
      return {
        ...state,
        activeCall: action.payload
      };

    case 'ADD_USER':
      return {
        ...state,
        allUsers: [...state.allUsers, action.payload]
      };

    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        allUsers: state.allUsers.map(user =>
          user.id === action.payload.userId
            ? { ...user, isOnline: action.payload.isOnline }
            : user
        )
      };

    case 'SET_SHOW_EXIT_WARNING':
      return {
        ...state,
        showExitWarning: action.payload
      };

    case 'ADD_CHAT_PARTNER':
      const existingPartner = state.chatPartners.find(p => p.id === action.payload.id);
      if (existingPartner) {
        return state;
      }
      return {
        ...state,
        chatPartners: [...state.chatPartners, action.payload]
      };

    case 'ADD_REPORT':
      return {
        ...state,
        reports: [action.payload, ...state.reports]
      };

    case 'SET_CHAT_ROOMS':
      return {
        ...state,
        chatRooms: action.payload
      };

    case 'SET_PRIVATE_CHATS':
      return {
        ...state,
        privateChats: action.payload
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      };

    case 'SET_REPORTS':
      return {
        ...state,
        reports: action.payload
      };

    case 'SET_BLOG_POSTS':
      return {
        ...state,
        blogPosts: action.payload
      };

    case 'MARK_MESSAGES_READ':
      // Add defensive check to prevent undefined errors
      if (!action.payload || !action.payload.chatId || !action.payload.userId) {
        console.warn('MARK_MESSAGES_READ: Invalid payload', action.payload);
        return state;
      }
      
      return {
        ...state,
        privateChats: state.privateChats.map(chat => {
          if (chat.id === action.payload.chatId) {
            return {
              ...chat,
              unreadCount: 0,
              messages: chat.messages.map(message => ({
                ...message,
                read: message.senderId !== action.payload.userId ? true : message.read
              }))
            };
          }
          return chat;
        })
      };

    case 'BAN_USER':
      return {
        ...state,
        bannedUsers: [...state.bannedUsers, action.payload]
      };

    case 'UNBAN_USER':
      return {
        ...state,
        bannedUsers: state.bannedUsers.filter(id => id !== action.payload)
      };

    case 'DELETE_USER':
      return {
        ...state,
        allUsers: state.allUsers.filter(user => user.id !== action.payload),
        bannedUsers: state.bannedUsers.filter(id => id !== action.payload)
      };

    case 'MUTE_USER':
      // In a real app, this would set a mute timestamp
      return {
        ...state,
        // For now, just return state as muting is handled by backend
      };

    case 'WARN_USER':
      // Warnings are handled through notifications
      return state;

    case 'BLOCK_USER':
      return {
        ...state,
        privateChats: state.privateChats.map(chat => {
          if (chat.participants.includes(action.payload.blockerId) && 
              chat.participants.includes(action.payload.blockedId)) {
            return { ...chat, blockedBy: action.payload.blockerId };
          }
          return chat;
        })
      };

    case 'UNBLOCK_USER':
      return {
        ...state,
        privateChats: state.privateChats.map(chat => {
          if (chat.participants.includes(action.payload.blockerId) && 
              chat.participants.includes(action.payload.blockedId) &&
              chat.blockedBy === action.payload.blockerId) {
            return { ...chat, blockedBy: undefined };
          }
          return chat;
        })
      };

    case 'START_PRIVATE_CHAT':
      // This action is handled by navigation logic
      return state;

    case 'JOIN_CHAT_ROOM':
      // This action is handled by navigation logic
      return state;

    case 'END_CALL':
      return {
        ...state,
        activeCall: null
      };

    case 'ADD_BROADCAST':
      return {
        ...state,
        broadcastHistory: [action.payload, ...state.broadcastHistory]
      };

    case 'SET_DATA_EXPIRES_AT':
      return {
        ...state,
        dataExpiresAt: action.payload
      };

    case 'SET_INITIALIZING':
      return {
        ...state,
        isInitializing: action.payload
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isUsernameAvailable: (username: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const isUsernameAvailable = (username: string) => {
    return !state.usedUsernames.includes(username);
  };

  // Load initial data from enhanced localStorage with 24-hour retention
  useEffect(() => {
    try {
      const savedData = loadUserData();
      if (savedData) {
        console.log('Loading saved user data from localStorage');
        
        // Restore user data if available
        if (savedData.currentUser) {
          dispatch({ type: 'SET_CURRENT_USER', payload: savedData.currentUser });
        }
        
        // Restore chat partners
        if (savedData.chatPartners) {
          savedData.chatPartners.forEach((partner: ChatPartner) => {
            dispatch({ type: 'ADD_CHAT_PARTNER', payload: partner });
          });
        }
        
        // Restore private chats
        if (savedData.privateChats) {
          dispatch({ type: 'SET_PRIVATE_CHATS', payload: savedData.privateChats });
        }
        
        // Restore notifications
        if (savedData.notifications) {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: savedData.notifications });
        }
        
        // Restore used usernames
        if (savedData.usedUsernames) {
          savedData.usedUsernames.forEach((username: string) => {
            // Add to used usernames without triggering user creation
          });
        }
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    } finally {
      dispatch({ type: 'SET_INITIALIZING', payload: false });
    }
  }, []);

  // Auto-save user data every minute and on state changes
  useEffect(() => {
    if (!state.isInitializing) {
      const dataToSave = {
        currentUser: state.currentUser,
        chatPartners: state.chatPartners,
        privateChats: state.privateChats,
        notifications: state.notifications,
        usedUsernames: state.usedUsernames,
        sessionData: {
          currentPage: state.currentPage,
          selectedChatRoom: state.selectedChatRoom,
          selectedPrivateChat: state.selectedPrivateChat
        }
      };
      
      saveUserData(dataToSave);
    }
  }, [
    state.currentUser, 
    state.chatPartners, 
    state.privateChats, 
    state.notifications, 
    state.usedUsernames, 
    state.isInitializing
  ]);

  // Start auto-save system
  useEffect(() => {
    if (!state.isInitializing && state.currentUser) {
      const cleanup = startAutoSave(() => ({
        currentUser: state.currentUser,
        chatPartners: state.chatPartners,
        privateChats: state.privateChats,
        notifications: state.notifications,
        usedUsernames: state.usedUsernames,
        sessionData: {
          currentPage: state.currentPage,
          selectedChatRoom: state.selectedChatRoom,
          selectedPrivateChat: state.selectedPrivateChat
        }
      }));
      
      return cleanup;
    }
  }, [state.isInitializing, state.currentUser]);

  // Mark messages as read when opening a private chat
  useEffect(() => {
    // Enhanced validation with detailed logging
    console.log('useEffect triggered - selectedPrivateChat:', state.selectedPrivateChat, 'currentUser:', state.currentUser);
    
    if (state.selectedPrivateChat && state.currentUser) {
      // Additional type and value checks
      if (typeof state.selectedPrivateChat === 'string' && 
          state.selectedPrivateChat.trim() !== '' &&
          state.currentUser.id && 
          typeof state.currentUser.id === 'string' &&
          state.currentUser.id.trim() !== '') {
        
        const payload = {
          chatId: state.selectedPrivateChat,
          userId: state.currentUser.id
        };
        
        console.log('Dispatching MARK_MESSAGES_READ with valid payload:', payload);
        
        try {
          dispatch({ 
            type: 'MARK_MESSAGES_READ', 
            payload 
          });
        } catch (error) {
          console.error('Error dispatching MARK_MESSAGES_READ:', error);
        }
      } else {
        console.warn('Invalid values detected:', {
          selectedPrivateChat: state.selectedPrivateChat,
          selectedPrivateChatType: typeof state.selectedPrivateChat,
          currentUserId: state.currentUser?.id,
          currentUserIdType: typeof state.currentUser?.id
        });
      }
    } else {
      console.log('Skipping MARK_MESSAGES_READ dispatch - missing required values');
    }
  }, [state.selectedPrivateChat, state.currentUser]);

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'anonymous_chat_data' && e.newValue) {
        try {
          const newData = loadUserData();
          if (newData && newData.currentUser && newData.currentUser !== state.currentUser) {
            dispatch({ type: 'SET_CURRENT_USER', payload: newData.currentUser });
          }
        } catch (error) {
          console.error('Error syncing state across tabs:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.currentUser]);

  return (
    <AppContext.Provider value={{ state, dispatch, isUsernameAvailable }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}