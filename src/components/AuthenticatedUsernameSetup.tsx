import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useApp } from '../context/AppContext'
import { User, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react'
import { generateRandomUsername } from '../utils/helpers'

export default function AuthenticatedUsernameSetup() {
  const { user, signInAnonymously } = useAuth()
  const { profile, updateProfile } = useProfile(user)
  const { dispatch } = useApp()
  const [username, setUsername] = useState(generateRandomUsername())
  const [isCustom, setIsCustom] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerateNew = () => {
    const newUsername = generateRandomUsername()
    setUsername(newUsername)
    setIsCustom(false)
    setError('')
  }

  const handleCustomChange = (value: string) => {
    setUsername(value)
    setIsCustom(true)
    setError('')
  }

  const handleContinue = async () => {
    const trimmedUsername = username.trim()
    
    if (!trimmedUsername) {
      setError('Username cannot be empty')
      return
    }
    
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (user) {
        if (profile) {
          // Update existing profile
          const { error: updateError } = await updateProfile({
            username: trimmedUsername
          })
          
          if (updateError) {
            setError('Failed to update username. Please try again.')
            return
          }
          
          // Update local state
          const updatedUser = {
            id: user.id,
            username: trimmedUsername,
            avatar: profile.avatar_url,
            isOnline: true,
            lastSeen: new Date(),
            blockedUsers: []
          }
          
          dispatch({ type: 'SET_USER', payload: updatedUser })
          
          // Navigate immediately
          dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' })
        } else {
          // User exists but no profile yet, create profile
          const { error: signUpError } = await signInAnonymously(trimmedUsername)
          
          if (signUpError) {
            setError('Failed to create profile. Please try again.')
            return
          }
        }
      } else {
        // No user, create new anonymous account
        const { error: signUpError } = await signInAnonymously(trimmedUsername)
        
        if (signUpError) {
          setError('Failed to create account. Please try again.')
          return
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Username</h1>
            <p className="text-gray-600">This will be your anonymous identity in chat rooms</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-lg ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  placeholder="Enter username..."
                  maxLength={20}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleGenerateNew}
                  disabled={loading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                  title="Generate new username"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {username.length}/20 characters
                </p>
                {error && (
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">{error}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Privacy Notice</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your identity remains completely anonymous</li>
                <li>• Username must be unique across all users</li>
                <li>• Your session persists across devices</li>
                <li>• You can change your username anytime</li>
              </ul>
            </div>

            <button
              onClick={handleContinue}
              disabled={!username.trim() || !!error || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <span>Continue to Chat</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleGenerateNew}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
              >
                Generate Different Username
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}