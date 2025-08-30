import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Notification } from '../types'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      subscribeToNotifications()
    }
  }, [userId])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedNotifications: Notification[] = data.map(notif => ({
        id: notif.id,
        type: notif.type as 'message' | 'call' | 'system' | 'admin_action',
        title: notif.title,
        message: notif.message,
        from: notif.from_user,
        timestamp: new Date(notif.created_at),
        read: notif.is_read,
        actionType: notif.action_type,
        reportId: notif.report_id
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    if (!userId) return

    return supabase
      .channel('notifications_changes')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            from: payload.new.from_user,
            timestamp: new Date(payload.new.created_at),
            read: payload.new.is_read,
            actionType: payload.new.action_type,
            reportId: payload.new.report_id
          }
          setNotifications(prev => [newNotification, ...prev])
        }
      )
      .subscribe()
  }

  const createNotification = async (
    targetUserId: string,
    type: 'message' | 'call' | 'system' | 'admin_action',
    title: string,
    message: string,
    fromUserId?: string,
    actionType?: string,
    reportId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type,
          title,
          message,
          from_user: fromUserId,
          action_type: actionType,
          report_id: reportId
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { data: null, error }
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}