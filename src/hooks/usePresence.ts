import { useEffect, useState, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface OnlineUser {
  id: string
  username: string
  avatar_url: string
  presence_ref: string
  last_seen: string
  is_online: boolean
}

export function usePresence(user: User | null, roomId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!user) {
      setOnlineUsers([])
      setLoading(false)
      return
    }

    // Update user presence in database
    const updatePresence = async (isOnline: boolean) => {
      try {
        await supabase.rpc('update_user_presence', {
          user_id: user.id,
          is_online: isOnline
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Mark user as online when component mounts
    updatePresence(true);

    // Use global presence channel for all users
    const channelName = 'global_presence'
    
    // Remove existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Clear existing heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id
        }
      }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const users: OnlineUser[] = []
        
        for (const userId in presenceState) {
          const presences = presenceState[userId]
          if (presences.length > 0) {
            const presence = presences[0]
            const lastSeen = new Date(presence.last_seen || presence.online_at)
            const now = new Date()
            const timeDiff = now.getTime() - lastSeen.getTime()
            const isOnline = timeDiff < 5 * 60 * 1000 // 5 minutes threshold
            
            if (isOnline) { // Only include users who are truly online
              users.push({
                id: userId,
                username: presence.username,
                avatar_url: presence.avatar_url,
                presence_ref: presence.presence_ref,
                last_seen: presence.last_seen || presence.online_at,
                is_online: true
              })
            }
          }
        }
        
        console.log('Presence sync - online users:', users.length)
        setOnlineUsers(users)
        setLoading(false)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined presence:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left presence:', key, leftPresences)
      })
      .subscribe(async (status) => {
        console.log('Presence subscription status:', status, 'for channel:', channelName)
        if (status === 'SUBSCRIBED') {
          // Get user profile for presence data
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single()

          if (profile) {
            await channel.track({
              username: profile.username,
              avatar_url: profile.avatar_url,
              online_at: new Date().toISOString(),
              last_seen: new Date().toISOString()
            })
            console.log('Tracking global presence for user:', profile.username)

            // Update database online status using RPC
            await updatePresence(true);
          }
        }
      })

    // Store the channel reference
    channelRef.current = channel

    // Set up heartbeat to keep presence alive and update activity
    heartbeatRef.current = setInterval(async () => {
      if (channelRef.current && !document.hidden) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()

        if (profile) {
          const now = new Date().toISOString()
          await channelRef.current.track({
            username: profile.username,
            avatar_url: profile.avatar_url,
            online_at: now,
            last_seen: now
          })

          // Update database using RPC
          await updatePresence(true);
          
          lastActivityRef.current = Date.now()
        }
      }
    }, 30000) // Update every 30 seconds

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Page is hidden, mark as offline using RPC
        await updatePresence(false);
      } else {
        // Page is visible, mark as online and restart heartbeat
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()

        if (profile && channelRef.current) {
          const now = new Date().toISOString()
          await channelRef.current.track({
            username: profile.username,
            avatar_url: profile.avatar_url,
            online_at: now,
            last_seen: now
          })

          await updatePresence(true);
        }
      }
    }

    // Handle beforeunload to mark offline
    const handleBeforeUnload = async () => {
      await updatePresence(false);
    }

    // Track user activity
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('mousedown', handleUserActivity)
    document.addEventListener('keydown', handleUserActivity)
    document.addEventListener('scroll', handleUserActivity)

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('mousedown', handleUserActivity)
      document.removeEventListener('keydown', handleUserActivity)
      document.removeEventListener('scroll', handleUserActivity)
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
      
      if (channelRef.current) {
        // Mark as offline before leaving
        updatePresence(false).then(() => {
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
            channelRef.current = null
          }
        })
      }
    }
  }, [user, roomId])

  // Filter out users who haven't been active in the last 5 minutes
  const activeOnlineUsers = onlineUsers.filter(user => {
    const lastSeen = new Date(user.last_seen)
    const now = new Date()
    const timeDiff = now.getTime() - lastSeen.getTime()
    return timeDiff < 5 * 60 * 1000 // 5 minutes
  })

  return {
    onlineUsers: activeOnlineUsers.filter(u => u.id !== user?.id), // Exclude current user
    loading,
    totalOnlineCount: activeOnlineUsers.length
  }
}