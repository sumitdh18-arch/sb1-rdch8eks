import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { X, User, RefreshCw, AlertCircle } from 'lucide-react';
import { generateRandomUsername } from '../utils/helpers';

interface ChangeUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeUsernameModal({ isOpen, onClose }: ChangeUsernameModalProps) {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile(user);
  const [loading, setLoading] = useState(false);
  const [newUsername, setNewUsername] = useState(state.currentUser?.username || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateNew = () => {
    let username;
    let attempts = 0;
    do {
      username = generateRandomUsername();
      attempts++;
    } while (attempts < 10); // Remove availability check for now
    
    setNewUsername(username);
    setError('');
  };

  const handleChange = (value: string) => {
    setNewUsername(value);
    setError('');
  };

  const handleSave = async () => {
    const trimmedUsername = newUsername.trim();
    
    if (!trimmedUsername) {
      setError('Username cannot be empty');
      return;
    }
    
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    
    if (trimmedUsername === profile?.username) {
      setError('Please choose a different username');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Update username in Supabase
      const { error: updateError } = await updateProfile({
        username: trimmedUsername
      });
      
      if (updateError) {
        setError('Failed to update username. Please try again.');
        return;
      }
      
      // Update local state
      if (state.currentUser) {
        const updatedUser = {
          ...state.currentUser,
          username: trimmedUsername
        };
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
      
      onClose();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Change Username</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="Enter new username..."
              maxLength={20}
              disabled={loading}
            />
            <button
              onClick={handleGenerateNew}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Generate new username"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              {newUsername.length}/20 characters
            </p>
            {error && (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">{error}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!newUsername.trim() || !!error || loading}
            className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}