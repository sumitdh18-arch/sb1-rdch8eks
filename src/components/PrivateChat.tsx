import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useMessages } from '../hooks/useMessages';
import { usePresence } from '../hooks/usePresence';
import { usePrivateChats } from '../hooks/usePrivateChats';
import { useFileUpload } from '../hooks/useFileUpload';
import { useReports } from '../hooks/useReports';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Send, Image, Phone, MoreVertical, Flag, 
  Block, UserX, X, CheckCheck, Activity 
} from 'lucide-react';
import { formatTime, playNotificationSound } from '../utils/helpers';

export default function PrivateChat() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { state, dispatch } = useApp();
  const { onlineUsers } = usePresence(user);
  const { blockUser, unblockUser } = usePrivateChats(user?.id);
  const { createReport } = useReports(user?.id);
  const { uploadImage, uploading: fileUploading } = useFileUpload();
  
  const { messages, loading, sendMessage } = useMessages(
    undefined, // chatRoomId
    state.selectedPrivateChat || undefined // privateChatId
  );

  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [reportingMessage, setReportingMessage] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBack = () => {
    if (state.previousPage) {
      dispatch({ type: 'SET_PAGE', payload: state.previousPage });
    } else {
      dispatch({ type: 'SET_PAGE', payload: 'private-chats' });
    }
    dispatch({ type: 'SELECT_PRIVATE_CHAT', payload: null });
    dispatch({ type: 'CLEAR_CHAT_PARTNER_NAME' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !profile || !state.selectedPrivateChat || isSending) return;

    const messageContent = message.trim();
    setMessage(''); // Clear input immediately for better UX
    setIsSending(true);
    
    try {
      console.log('Sending private message:', messageContent);
      
      const { error } = await sendMessage(
        messageContent,
        user.id,
        profile.username
      );

      if (error) {
        console.error('Failed to send message:', error);
        // Restore message on error
        setMessage(messageContent);
      } else {
        console.log('Private message sent successfully');
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error sending private message:', error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile || !state.selectedPrivateChat || isSending || fileUploading) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB');
      return;
    }

    setIsSending(true);
    
    try {
      // Upload to Supabase Storage
      const { url: uploadedUrl, error: uploadError } = await uploadImage(file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Failed to upload image. Please try again.');
        return;
      }
      
      if (!uploadedUrl) {
        alert('Failed to upload image. Please try again.');
        return;
      }
      
      // Send the image message with uploaded URL
      const { error } = await sendMessage(
        uploadedUrl,
        user.id,
        profile.username,
        'image'
      );

      if (!error) {
        playNotificationSound();
      } else {
        console.error('Error sending image:', error);
        alert('Failed to send image message. Please try again.');
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleBlockUser = async () => {
    if (!state.selectedPrivateChat) return;
    
    if (confirm('Are you sure you want to block this user? You will no longer receive messages from them.')) {
      try {
        const { error } = await blockUser(state.selectedPrivateChat);
        if (!error) {
          setShowMenu(false);
          alert('User has been blocked');
        } else {
          alert('Failed to block user');
        }
      } catch (error) {
        console.error('Error blocking user:', error);
        alert('Failed to block user');
      }
    }
  };

  const handleUnblockUser = async () => {
    if (!state.selectedPrivateChat) return;
    
    try {
      const { error } = await unblockUser(state.selectedPrivateChat);
      if (!error) {
        setShowMenu(false);
        alert('User has been unblocked');
      } else {
        alert('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    }
  };

  const handleReportMessage = async (messageId: string, reason: string) => {
    const reportedMessage = messages.find(msg => msg.id === messageId);
    if (!reportedMessage || !user) return;

    try {
      const { error } = await createReport(
        reportedMessage.senderId,
        reason,
        'other',
        messageId
      );

      if (!error) {
        console.log('Message reported successfully');
        setReportingMessage(null);
        setReportReason('');
        alert('Message has been reported to administrators');
      } else {
        console.error('Failed to report message:', error);
        alert('Failed to report message');
      }
    } catch (error) {
      console.error('Error reporting message:', error);
      alert('Failed to report message');
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    
    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm p-2 bg-red-50 rounded';
    errorDiv.textContent = 'Failed to load image';
    img.parentNode?.insertBefore(errorDiv, img);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    // Ensure image doesn't exceed container width
    if (img.naturalWidth > 300) {
      img.style.maxWidth = '300px';
      img.style.height = 'auto';
    }
  };

  // Get current private chat info
  const currentChat = state.privateChats.find(chat => chat.id === state.selectedPrivateChat);
  const otherUserId = currentChat?.participants.find(id => id !== user?.id);
  
  // Get other user info from various sources
  const getOtherUserInfo = () => {
    if (!otherUserId) return null;
    
    // First check presence users for most accurate online status
    const presenceUser = onlineUsers.find(p => p.id === otherUserId);
    if (presenceUser) {
      return {
        id: presenceUser.id,
        username: presenceUser.username,
        avatar: presenceUser.avatar_url,
        isOnline: true
      };
    }
    
    // Then check chat partners
    const chatPartner = state.chatPartners.find(p => p.id === otherUserId);
    if (chatPartner) {
      return {
        ...chatPartner,
        isOnline: false
      };
    }
    
    // Use stored chat partner name if available
    if (state.selectedChatPartnerName) {
      return {
        id: otherUserId,
        username: state.selectedChatPartnerName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        isOnline: false
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

  const otherUser = getOtherUserInfo();
  const isBlocked = currentChat?.blockedBy === user?.id;
  const isBlockedByOther = currentChat?.blockedBy && currentChat.blockedBy !== user?.id;

  const reportReasons = [
    'Spam or unwanted content',
    'Inappropriate language',
    'Harassment or bullying',
    'Hate speech',
    'Adult content',
    'Other'
  ];

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Chat not found</p>
          <button
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 py-2 max-w-4xl flex-1 flex flex-col min-h-0">
        {/* Header - Fixed at top */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-2 sm:mb-4 shadow-sm border border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 transition-colors p-1 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <img 
                src={otherUser.avatar} 
                alt="Avatar" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
              />
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {otherUser.username}
                </h1>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${otherUser.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {otherUser.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-10">
                  <button
                    onClick={() => {
                      console.log('Start audio call with:', otherUser.username);
                      setShowMenu(false);
                      dispatch({ type: 'SET_PAGE', payload: 'audio-call' });
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Phone className="w-4 h-4 text-green-600" />
                    Start Audio Call
                  </button>
                  
                  {isBlocked ? (
                    <button
                      onClick={handleUnblockUser}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-green-600"
                    >
                      <UserX className="w-4 h-4" />
                      Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={handleBlockUser}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <Block className="w-4 h-4" />
                      Block User
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area - Flexible height with proper scrolling */}
        <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col min-h-0">
          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            {isBlockedByOther ? (
              <div className="text-center py-8">
                <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Chat Blocked</h3>
                <p className="text-gray-500">This user has blocked you. You cannot send or receive messages.</p>
              </div>
            ) : isBlocked ? (
              <div className="text-center py-8">
                <Block className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">User Blocked</h3>
                <p className="text-gray-500 mb-4">You have blocked this user. Unblock to resume conversation.</p>
                <button
                  onClick={handleUnblockUser}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Unblock User
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {/* Chat start indicator */}
                <div className="text-center py-2">
                  <div className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    Private conversation with {otherUser.username}
                  </div>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col group">
                    <div className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className="relative max-w-[85%] sm:max-w-xs lg:max-w-md">
                        <div className={`${
                          msg.senderId === user?.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm'
                        } rounded-2xl px-3 sm:px-4 py-2`}>
                          {msg.type === 'image' ? (
                            <div className="relative">
                              <img 
                                src={msg.content} 
                                alt="Shared image" 
                                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ maxWidth: '300px', maxHeight: '400px' }}
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                                onClick={() => window.open(msg.content, '_blank')}
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <p className="break-words text-sm sm:text-base">{msg.content}</p>
                          )}
                        </div>
                        
                        {/* Hidden report button for messages from other user */}
                        {msg.senderId !== user?.id && (
                          <button
                            onClick={() => setReportingMessage(msg.id)}
                            className="absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 hover:bg-red-100 rounded-full p-1"
                            title="Report message"
                          >
                            <Flag className="w-3 h-3 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 px-1 flex items-center gap-1 ${
                      msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.senderId === user?.id && (
                        <span className="flex items-center">
                          {msg.read ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : msg.delivered ? (
                            <CheckCheck className="w-3 h-3 text-gray-400" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          {!isBlocked && !isBlockedByOther && (
            <div className="flex-shrink-0 p-2 sm:p-4 border-t border-white/20 bg-white/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  disabled={isSending || fileUploading}
                >
                  {fileUploading ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  )}
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${otherUser.username}...`}
                    className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base max-h-20"
                    rows={1}
                    style={{ minHeight: '40px' }}
                    disabled={isSending}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom padding for footer */}
      <div className="h-16 flex-shrink-0"></div>

      {/* Report Message Modal */}
      {reportingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Report Message</h3>
              <button
                onClick={() => {
                  setReportingMessage(null);
                  setReportReason('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Why are you reporting this message?</p>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {reportReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                    reportReason === reason
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReportingMessage(null);
                  setReportReason('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReportMessage(reportingMessage, reportReason)}
                disabled={!reportReason}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}