import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { clearUserData } from '../utils/storage';
import { X, LogOut, AlertTriangle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { dispatch } = useApp();
  const { signOut } = useAuth();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      // Sign out from Supabase (clears session)
      await signOut();
      
      // Clear local storage data
      clearUserData();
      
      // Clear app state
      dispatch({ type: 'CLEAR_DATA' });
      
      // Navigate to home page
      dispatch({ type: 'SET_PAGE', payload: 'home' });
      
      onClose();
    } catch (error) {
      console.error('Error during logout:', error);
      // Still proceed with local cleanup even if Supabase logout fails
      clearUserData();
      dispatch({ type: 'CLEAR_DATA' });
      dispatch({ type: 'SET_PAGE', payload: 'home' });
      onClose();
    }
  };

    // Clear all user data

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            Are you sure you want to log out?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> All your chat data, messages, and session information will be permanently deleted from this device.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}