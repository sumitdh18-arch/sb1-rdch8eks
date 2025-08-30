import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface ChatRoom {
  id: string
  name: string
  description: string
  createdAt: Date
  createdBy: string
}

export function useChatRooms() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChatRooms()
    subscribeToChanges()
  }, [])

  const fetchChatRooms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const rooms: ChatRoom[] = (data || []).map(room => ({
        id: room.id,
        name: room.name,
        description: room.description || '',
        createdAt: new Date(room.created_at),
        createdBy: room.created_by || 'system'
      }))

      setChatRooms(rooms)
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
      // Set default rooms if fetch fails
      setChatRooms([
        {
          id: 'general',
          name: 'General Chat',
          description: 'Welcome to the general discussion room',
          createdAt: new Date(),
          createdBy: 'system'
        },
        {
          id: 'random',
          name: 'Random',
          description: 'Talk about anything and everything',
          createdAt: new Date(),
          createdBy: 'system'
        },
        {
          id: 'tech',
          name: 'Tech Talk',
          description: 'Discuss technology, programming, and innovation',
          createdAt: new Date(),
          createdBy: 'system'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_rooms' },
        () => {
          fetchChatRooms()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const createChatRoom = async (name: string, description: string) => {
    try {
      const roomId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          id: roomId,
          name,
          description,
          created_by: 'admin'
        })
        .select()
        .single()

      if (error) throw error
      await fetchChatRooms()
      return { data, error: null }
    } catch (error) {
      console.error('Error creating chat room:', error)
      return { data: null, error }
    }
  }

  return {
    chatRooms,
    loading,
    createChatRoom,
    refetch: fetchChatRooms
  }
}