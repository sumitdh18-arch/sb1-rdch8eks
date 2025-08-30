import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useApp } from '../context/AppContext'
import { saveUserData } from '../utils/storage'
import { User } from '../types'

interface AuthWrapperProps {
  children: React.ReactNode
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('Error caught by boundary:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthWrapper Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered an error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return <>{this.props.children}</>
  }
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, updateOnlineStatus } = useProfile(user)
  const { state, dispatch } = useApp()

  // Update app state when profile changes
  React.useEffect(() => {
    if (profile && user) {
      console.log('Creating app user from profile:', profile)
      
      const appUser: User = {
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar_url,
        isOnline: profile.is_online,
        lastSeen: new Date(profile.last_seen),
        blockedUsers: []
      }

      // Only update if user has changed
      if (!state.currentUser || 
          state.currentUser.id !== appUser.id || 
          state.currentUser.username !== appUser.username) {
        console.log('Setting current user in app state:', appUser)
        dispatch({ type: 'SET_USER', payload: appUser })
        
        // Save user data to localStorage for 24-hour persistence
        const dataToSave = {
          currentUser: appUser,
          chatPartners: state.chatPartners,
          privateChats: state.privateChats,
          notifications: state.notifications,
          usedUsernames: state.usedUsernames
        }
        saveUserData(dataToSave)
        
        // Navigate to chat rooms if coming from setup pages
        if ((state.currentPage === 'home' || 
             state.currentPage === 'username-setup' || 
             state.currentPage === 'authenticated-username-setup') &&
            state.currentPage !== 'chat-rooms') {
          console.log('Navigating to chat-rooms from:', state.currentPage)
          setTimeout(() => {
            dispatch({ type: 'SET_PAGE', payload: 'chat-rooms' })
          }, 100)
        }
      }
    } else if (!user && state.currentUser) {
      // User logged out
      console.log('User logged out, clearing data')
      dispatch({ type: 'CLEAR_DATA' })
      dispatch({ type: 'SET_PAGE', payload: 'home' })
    }
  }, [profile, user, state.currentUser, dispatch, state.currentPage, state.chatPartners, state.privateChats, state.notifications, state.usedUsernames])

  // Update online status when component mounts/unmounts
  React.useEffect(() => {
    if (profile && user && updateOnlineStatus) {
      updateOnlineStatus(true)

      const handleBeforeUnload = () => {
        updateOnlineStatus(false)
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        updateOnlineStatus(false)
      }
    }
  }, [profile, user, updateOnlineStatus])

  // Enhanced loading state checks
  const isLoading = authLoading || 
                   (user && profileLoading) || 
                   (user && profile && !state.currentUser) ||
                   state.isInitializing

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading ? 'Authenticating...' : 
             profileLoading ? 'Loading profile...' : 
             'Setting up your account...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}