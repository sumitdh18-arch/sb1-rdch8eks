import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  username: string
  avatar_url: string
  created_at: string
  updated_at: string
  is_online: boolean
  last_seen: string
}

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle()

      if (error) {
        throw error
      } else if (data) {
        setProfile(data)
      } else {
        // Profile doesn't exist, set to null and let other components handle creation
        setProfile(null)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    try {
      const username = user?.user_metadata?.username || `User${user?.id?.slice(-4)}`
      const avatar_url = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user!.id,
          username,
          avatar_url,
          is_online: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      console.error('Error creating profile:', error)
      return { data: null, error }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      console.log('Updating profile with:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      
      // If username was updated, update it everywhere
      if (updates.username) {
        console.log('Username updated, updating messages table...');
        
        // Update all messages from this user
        await supabase
          .from('messages')
          .update({ sender_name: updates.username })
          .eq('sender_id', user!.id)
          
        console.log('Messages table updated with new username');
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      await supabase
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user!.id)
    } catch (error) {
      console.error('Error updating online status:', error)
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    updateOnlineStatus,
    refetch: getProfile
  }
}