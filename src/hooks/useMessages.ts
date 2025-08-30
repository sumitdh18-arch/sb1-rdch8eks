import { useEffect, useState, useRef, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Message } from '../types'

export function useMessages(chatRoomId?: string, privateChatId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const currentChatRef = useRef<string | undefined>()

  // Update current chat reference
  useEffect(() => {
    currentChatRef.current = chatRoomId || privateChatId
  }, [chatRoomId, privateChatId])

  const fetchMessages = useCallback(async () => {
    if (!chatRoomId && !privateChatId) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })

      if (chatRoomId) {
        query = query.eq('chat_room_id', chatRoomId)
      } else if (privateChatId) {
        query = query.eq('private_chat_id', privateChatId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
        return
      }

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        type: msg.message_type as 'text' | 'image' | 'audio',
        timestamp: new Date(msg.created_at),
        chatId: privateChatId || chatRoomId,
        read: msg.is_read,
        delivered: true
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }, [chatRoomId, privateChatId])

  const subscribeToMessages = useCallback(() => {
    if (!chatRoomId && !privateChatId) return

    // Remove existing channel
    if (channelRef.current) {
      console.log('Removing existing channel')
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    // Create unique channel name
    const channelName = chatRoomId 
      ? `messages_room_${chatRoomId}` 
      : `messages_private_${privateChatId}`

    console.log('Creating new channel:', channelName)

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: 'user' }
        }
      })
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: chatRoomId 
            ? `chat_room_id=eq.${chatRoomId}`
            : `private_chat_id=eq.${privateChatId}`
        },
        (payload) => {
          console.log('Real-time message received:', payload)
          
          if (currentChatRef.current === (chatRoomId || privateChatId)) {
            const newMessage: Message = {
              id: payload.new.id,
              senderId: payload.new.sender_id,
              senderName: payload.new.sender_name,
              content: payload.new.content,
              type: payload.new.message_type,
              timestamp: new Date(payload.new.created_at),
              chatId: privateChatId || chatRoomId,
              read: payload.new.is_read,
              delivered: true
            }
            
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id)
              if (exists) {
                console.log('Message already exists, skipping')
                return prev
              }
              console.log('Adding new message to state')
              return [...prev, newMessage]
            })
          }
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: chatRoomId 
            ? `chat_room_id=eq.${chatRoomId}`
            : `private_chat_id=eq.${privateChatId}`
        },
        (payload) => {
          console.log('Message updated:', payload)
          if (currentChatRef.current === (chatRoomId || privateChatId)) {
            setMessages(prev => prev.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, read: payload.new.is_read }
                : msg
            ))
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status, 'for channel:', channelName)
      })

    channelRef.current = channel
  }, [chatRoomId, privateChatId])

  // Initialize when chat changes
  useEffect(() => {
    if (chatRoomId || privateChatId) {
      console.log('Chat changed, initializing:', { chatRoomId, privateChatId })
      setMessages([])
      fetchMessages()
      subscribeToMessages()
    } else {
      setMessages([])
      setLoading(false)
    }

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up channel')
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [chatRoomId, privateChatId, fetchMessages, subscribeToMessages])

  const sendMessage = async (content: string, senderId: string, senderName: string, type: 'text' | 'image' | 'audio' = 'text') => {
    try {
      console.log('Sending message:', { content, senderId, senderName, chatRoomId, privateChatId })
      
      const messageData = {
        content,
        sender_id: senderId,
        sender_name: senderName,
        message_type: type,
        ...(chatRoomId ? { chat_room_id: chatRoomId } : { private_chat_id: privateChatId })
      }

      // Add optimistic update for instant message display
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}-${Math.random()}`,
        senderId,
        senderName,
        content,
        type,
        timestamp: new Date(),
        chatId: privateChatId || chatRoomId,
        read: false,
        delivered: false
      }
      setMessages(prev => [...prev, optimisticMessage])

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
        throw error
      }

      console.log('Message sent successfully:', data)

      // Replace optimistic message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? {
              ...msg,
              id: data.id,
              delivered: true
            }
          : msg
      ))

      // Update private chat last activity if applicable
      if (privateChatId) {
        await supabase
          .from('private_chats')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', privateChatId)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error sending message:', error)
      return { data: null, error }
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  }
}