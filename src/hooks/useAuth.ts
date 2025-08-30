import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
        }
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const signInAnonymously = async (username: string) => {
    // Create anonymous user with email-like format using example.com domain
    const anonymousEmail = `${username.toLowerCase()}@example.com`
    const anonymousPassword = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabase.auth.signUp({
      email: anonymousEmail,
      password: anonymousPassword,
      options: {
        data: {
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
          is_anonymous: true
        }
      }
    })
    
    // If user was created successfully, also create the profile
    if (data.user && !error) {
      try {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
            is_online: true,
            last_seen: new Date().toISOString()
          })
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
      }
    }
    
    return { data, error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInAnonymously
  }
}