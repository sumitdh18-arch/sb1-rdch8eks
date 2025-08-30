import React, { useState } from 'react';
import { Megaphone, Send, Users, MessageSquare, User } from 'lucide-react';

export default function Broadcast() {
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'room' | 'user'>('all');
  const [targetId, setTargetId] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      // In a real implementation, you'd send the broadcast message
      console.log('Sending broadcast:', { message, targetType, targetId });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Broadcast message sent successfully!');
      setMessage('');
      setTargetId('');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast message');
    } finally {
      setSending(false);
    }
  };

  const getTargetDescription = () => {
    switch (targetType) {
      case 'all':
        return 'All users on the platform';
      case 'room':
        return 'Users in a specific chat room';
      case 'user':
        return 'A specific user';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Broadcast Messages</h1>
          <p className="text-white/70">Send announcements to users</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <Megaphone className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">Admin Broadcast</span>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="space-y-6">
          {/* Target Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Broadcast Target</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setTargetType('all')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  targetType === 'all'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-medium">All Users</h3>
                <p className="text-white/60 text-sm">Send to everyone</p>
              </button>

              <button
                onClick={() => setTargetType('room')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  targetType === 'room'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-medium">Chat Room</h3>
                <p className="text-white/60 text-sm">Send to a room</p>
              </button>

              <button
                onClick={() => setTargetType('user')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  targetType === 'user'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <User className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-medium">Specific User</h3>
                <p className="text-white/60 text-sm">Send to one user</p>
              </button>
            </div>
          </div>

          {/* Target ID Input */}
          {(targetType === 'room' || targetType === 'user') && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {targetType === 'room' ? 'Room ID' : 'User ID'}
              </label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder={targetType === 'room' ? 'Enter room ID' : 'Enter user ID'}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Broadcast Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your broadcast message..."
              rows={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-white/50 text-sm">{message.length}/500 characters</p>
              <p className="text-white/60 text-sm">Target: {getTargetDescription()}</p>
            </div>
          </div>

          {/* Preview */}
          {message.trim() && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-blue-400 font-medium mb-2">Message Preview</h4>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Admin Announcement</span>
                </div>
                <p className="text-white">{message}</p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendBroadcast}
            disabled={!message.trim() || sending || (targetType !== 'all' && !targetId.trim())}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending Broadcast...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Broadcast Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Broadcasts */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Broadcasts</h3>
        <div className="text-center py-8">
          <Megaphone className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/50">No recent broadcasts</p>
        </div>
      </div>
    </div>
  );
}