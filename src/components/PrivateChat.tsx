import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import { useReports } from '../hooks/useReports';
import { usePrivateChats } from '../hooks/usePrivateChats';
import { useFileUpload } from '../hooks/useFileUpload';
import { usePresence } from '../hooks/usePresence';
import { ArrowLeft, Send, Image, MoreVertical, Phone, Flag, X, UserX, CheckCheck, Upload } from 'lucide-react';
import { formatTime, playNotificationSound, generateNotificationId } from '../utils/helpers';
import { Notification } from '../types';

export default function PrivateChat() {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { onlineUsers } = usePresence(user);
  
  // State hooks
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [reportingMessage, setReportingMessage] = useState<string | null>(null);
  
  // Ref hooks
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom hooks - MUST be called unconditionally
  const { messages, sendMessage: sendMessageToDb, loading: messagesLoading } = useMessages(undefined, state.selectedPrivateChat || undefined);
  const { createReport } = useReports(user?.id);
  const { uploadImage } = useFileUpload();
  const { privateChats, loading: chatsLoading } = usePrivateChats(user?.id);
  const { uploading: fileUploading } = useFileUpload();

  // Derived state - use real-time data from Supabase
  const currentChat = privateChats.find((chat: any) => chat.id === state.selectedPrivateChat);
  const otherUserId = currentChat?.participants.find((id: string) => id !== user?.id);

  // Memoized user info - using useMemo to prevent recalculation
  const otherUser = React.useMemo(() => {
    if (!otherUserId) return null;
    
    // Try to get user info from current chat data first
    if (currentChat) {
      const isParticipant1 = currentChat.participant_1_username && currentChat.participants[0] === otherUserId;
      const isParticipant2 = currentChat.participant_2_username && currentChat.participants[1] === otherUserId;
      
      if (isParticipant1) {
        return {
          id: otherUserId,
          username: currentChat.participant_1_username,
          avatar: currentChat.participant_1_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
          isOnline: onlineUsers.some(p => p.id === otherUserId)
        };
      } else if (isParticipant2) {
        return {
          id: otherUserId,
          username: currentChat.participant_2_username,
          avatar: currentChat.participant_2_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
          isOnline: onlineUsers.some(p => p.id === otherUserId)
        };
      }
    }
    
    // Fallback to basic info
    return {
      id: otherUserId,
      username: state.selectedChatPartnerName || `User${otherUserId.slice(-3)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      isOnline: onlineUsers.some(p => p.id === otherUserId)
    };

  const isBlocked = currentChat?.blockedBy === user?.id;
  const isBlockedByOther = currentChat?.blockedBy && currentChat.blockedBy !== user?.id;

  // EVENT HANDLERS - MUST BE DECLARED BEFORE CONDITIONAL RETURNS
  const handleBack = () => {
    const previousPage = state.previousPage;
    if (previousPage === 'chat-room') {
      dispatch({ type: 'SET_PAGE', payload: 'chat-room' });
    } else if (previousPage === 'online-users') {
      dispatch({ type: 'SET_PAGE', payload: 'online-users' });
    } else {
      dispatch({ type: 'SET_PAGE', payload: 'private-chats' });
    }
    dispatch({ type: 'SELECT_PRIVATE_CHAT', payload: null });
    dispatch({ type: 'CLEAR_CHAT_PARTNER_NAME' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !currentChat || isBlocked || isBlockedByOther) return;

    const messageContent = message.trim();
    setMessage(''); // Clear input immediately
    
    try {
      const { error } = await sendMessageToDb(
        messageContent,
        user.id,
        state.currentUser?.username || 'Anonymous'
      );

      if (!error) {
        playNotificationSound();
      } else {
        // Restore message on error
        setMessage(messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !currentChat || isBlocked || isBlockedByOther || fileUploading) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
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
      const { error: sendError } = await sendMessageToDb(
        uploadedUrl,
        user.id,
        state.currentUser?.username || 'Anonymous',
        'image'
      );

      if (sendError) {
        console.error('Error sending image message:', sendError);
        alert('Failed to send image message. Please try again.');
      } else {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm p-2 bg-red-50 rounded';
    errorDiv.textContent = 'Failed to load image';
    img.parentNode?.insertBefore(errorDiv, img);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth > 300) {
      img.style.maxWidth = '300px';
      img.style.height = 'auto';
    }
  };

  const handleStartCall = () => {
    if (isBlocked || isBlockedByOther) return;
    dispatch({ type: 'SET_PREVIOUS_PAGE', payload: state.currentPage });
    dispatch({ type: 'SET_PAGE', payload: 'audio-call' });
    setShowMenu(false);
  };

  const handleBlockUser = () => {
    if (!otherUser || !state.currentUser) return;
    
    dispatch({ 
      type: 'BLOCK_USER', 
      payload: { 
        blockerId: state.currentUser.id, 
        blockedId: otherUser.id 
      } 
    });
    
    const blockNotification: Notification = {
      id: generateNotificationId(),
      type: 'system',
      title: 'User Blocked',
      message: `You have blocked ${otherUser.username || 'User'}. They can no longer send you messages.`,
      timestamp: new Date(),
      read: false,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: blockNotification });
    setShowMenu(false);
  };

  const handleUnblockUser = () => {
    if (!otherUser || !state.currentUser) return;
    
    dispatch({ 
      type: 'UNBLOCK_USER', 
      payload: { 
        blockerId: state.currentUser.id, 
        blockedId: otherUser.id 
      } 
    });
    
    const unblockNotification: Notification = {
      id: generateNotificationId(),
      type: 'system',
      title: 'User Unblocked',
      message: `You have unblocked ${otherUser.username || 'User'}. You can now chat normally.`,
      timestamp: new Date(),
      read: false,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: unblockNotification });
    setShowMenu(false);
  };

  const handleReportUser = (reportReason: string) => {
    if (!otherUser || !state.currentUser) return;

    const report = {
      id: generateNotificationId(),
      reportedBy: state.currentUser.id,
      reportedUser: otherUser.id,
      reason: reportReason,
      timestamp: new Date(),
      status: 'pending' as const,
      category: 'other' as const,
    };

    dispatch({ type: 'ADD_REPORT', payload: report });

    const reportNotification: Notification = {
      id: generateNotificationId(),
      type: 'system',
      title: 'User Reported',
      message: `You reported ${otherUser.username || 'User'} for: ${reportReason}. Our team will review this report.`,
      timestamp: new Date(),
      read: false,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: reportNotification });
    setShowReportModal(false);
    setReportReason('');
    setShowMenu(false);
  };

  const handleReportMessage = async (messageId: string, reportReason: string) => {
    const reportedMessage = messages.find(msg => msg.id === messageId);
    if (!reportedMessage || !user) return;

    try {
      const { error } = await createReport(
        reportedMessage.senderId,
        reportReason,
        'other',
        messageId
      );

      if (!error) {
        setReportingMessage(null);
        setReportReason('');
      }
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  // Effect hooks
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // NOW WE CAN DO CONDITIONAL RENDERING - AFTER ALL HOOKS ARE DECLARED
  if (messagesLoading || chatsLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if ((!chatsLoading && !currentChat) || (!chatsLoading && currentChat && !otherUser)) {
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

  const reportReasons = [
    'Harassment or bullying',
    'Inappropriate behavior',
    'Spam or unwanted messages',
    'Hate speech',
    'Inappropriate content sharing',
    'Impersonation',
    'Other'
  ];

  // MAIN RENDER - ALL HOOKS HAVE BEEN CALLED ABOVE
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 py-2 max-w-4xl flex-1 flex flex-col min-h-0">
        {/* Header - Fixed at top */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-2 sm:mb-4 shadow-sm border border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <img src={otherUser?.avatar} alt="Avatar" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-800">{otherUser?.username || 'User'}</h1>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${otherUser?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {otherUser?.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={handleMenuClick}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-[70]">
                  {!isBlocked && !isBlockedByOther && (
                    <button
                      onClick={handleStartCall}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm"
                    >
                      <Phone className="w-4 h-4 text-green-600" />
                      <span>Audio Call</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report User</span>
                  </button>
                  {isBlocked ? (
                    <button
                      onClick={handleUnblockUser}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-green-600"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Unblock User</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleBlockUser}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Block User</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area - Flexible height with proper scrolling */}
        <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col group">
                  <div className={`flex ${msg.senderId === state.currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className="relative max-w-[85%] sm:max-w-xs lg:max-w-md">
                      <div className={`${
                        msg.senderId === state.currentUser?.id
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
                            {isUploading && msg.senderId === user?.id && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <div className="text-white text-sm">Uploading...</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="break-words text-sm sm:text-base">{msg.content}</p>
                        )}
                      </div>
                      
                      {msg.senderId !== state.currentUser?.id && !isBlocked && !isBlockedByOther && (
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
                    msg.senderId === state.currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.senderId === state.currentUser?.id && (
                      <div className="flex-shrink-0">
                        {msg.read ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : msg.delivered ? (
                          <CheckCheck className="w-3 h-3 text-gray-400" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex-shrink-0 p-2 sm:p-4 border-t border-white/20 bg-white/50">
            {isBlockedByOther ? (
              <div className="text-center py-4">
                <p className="text-gray-500">This user has blocked you. You cannot send messages.</p>
              </div>
            ) : isBlocked ? (
              <div className="text-center py-4">
                <p className="text-gray-500">You blocked this profile</p>
                <button
                  onClick={handleUnblockUser}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Unblock to continue chatting
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || fileUploading}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                >
                  {isUploading || fileUploading ? (
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
                    placeholder="Type a message..."
                    className="w-full px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base max-h-20"
                    rows={1}
                    style={{ minHeight: '40px' }}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-16 flex-shrink-0"></div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Report User</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Why are you reporting <span className="font-semibold">{otherUser?.username || 'User'}</span>?
            </p>
            
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
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Reports are reviewed by our moderation team. False reports may result in restrictions on your account.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReportUser(reportReason)}
                disabled={!reportReason}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                Report User
              </button>
            </div>
          </div>
        </div>
      )}

      {reportingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Report Message</h3>
              <button
                onClick={() => setReportingMessage(null)}
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
                onClick={() => setReportingMessage(null)}
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