import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { PrivateChat } from '../types'

export function usePrivateChats(userId?: string | null) {
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([])
  const [loading, setLoading] = useState(true)

  const validUserId =
    typeof userId === 'string' && userId.trim() ? userId.trim() : null

  useEffect(() => {
    if (validUserId) {
      fetchPrivateChats()
      const channel = subscribeToPrivateChats()
      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      setPrivateChats([])
      setLoading(false)
    }
  }, [validUserId])

  const fetchPrivateChats = async () => {
    if (!validUserId) return

    try {
      setLoading(true)

      // ✅ We now query the base table with messages joined
      const { data, error } = await supabase
        .from('private_chats')
        .select(`
          id,
          participant_1,
          participant_2,
          blocked_by,
          created_at,
          last_activity,
          participant_1_profile:profiles!private_chats_participant_1_fkey(username, avatar_url),
          participant_2_profile:profiles!private_chats_participant_2_fkey(username, avatar_url),
          messages (
            id,
            content,
            sender_id,
            sender_name,
            message_type,
            created_at,
            is_read
          )
        `)
        .or(`participant_1.eq.${validUserId},participant_2.eq.${validUserId}`)
        .order('last_activity', { ascending: false })

      if (error) throw error

      const chats: PrivateChat[] = (data || []).map((chat: any) => {
        const messages = (chat.messages || []).map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          content: msg.content,
          type: msg.message_type,
          timestamp: new Date(msg.created_at),
          chatId: chat.id,
          read: msg.is_read,
          delivered: true,
        }))

        const unreadCount = (chat.messages || []).filter(
          (msg: any) => !msg.is_read && msg.sender_id !== validUserId
        ).length

        return {
          id: chat.id,
          participants: [chat.participant_1, chat.participant_2],
          messages,
          createdAt: new Date(chat.created_at),
          lastActivity: new Date(chat.last_activity),
          unreadCount,
          blockedBy: chat.blocked_by,
          participant_1_username: chat.participant_1_profile?.username,
          participant_1_avatar: chat.participant_1_profile?.avatar_url,
          participant_2_username: chat.participant_2_profile?.username,
          participant_2_avatar: chat.participant_2_profile?.avatar_url,
        }
      })

      setPrivateChats(chats)
    } catch (err) {
      console.error('Error fetching private chats:', err)
      setPrivateChats([])
    } finally {
      setLoading(false)
    }
  }

  const subscribeToPrivateChats = () => {
    return supabase
      .channel('private_chats_and_messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'private_chats' },
        () => fetchPrivateChats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchPrivateChats()
      )
      .subscribe()
  }

  const createPrivateChat = async (otherUserId: string) => {
    if (!validUserId) return { data: null, error: 'Not logged in' }

    try {
      // ✅ Check if chat exists
      const { data: existing, error: checkError } = await supabase
        .from('private_chats')
        .select('*')
        .or(
          `and(participant_1.eq.${validUserId},participant_2.eq.${otherUserId}),
           and(participant_1.eq.${otherUserId},participant_2.eq.${validUserId})`
        )
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existing) {
        await fetchPrivateChats()
        return { data: existing, error: null }
      }

      // ✅ Create new chat
      const { data: newChat, error: createError } = await supabase
        .from('private_chats')
        .insert({
          participant_1: validUserId,
          participant_2: otherUserId,
          last_activity: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) throw createError

      await fetchPrivateChats()
      return { data: newChat, error: null }
    } catch (err) {
      console.error('Error creating chat:', err)
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }

  const blockUser = async (chatId: string) => {
    if (!validUserId) return { error: 'Not logged in' }

    try {
      const { error } = await supabase
        .from('private_chats')
        .update({ blocked_by: validUserId })
        .eq('id', chatId)

      if (error) throw error
      await fetchPrivateChats()
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  const unblockUser = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('private_chats')
        .update({ blocked_by: null })
        .eq('id', chatId)

      if (error) throw error
      await fetchPrivateChats()
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  return {
    privateChats,
    loading,
    createPrivateChat,
    blockUser,
    unblockUser,
    refetch: fetchPrivateChats,
  }
}
