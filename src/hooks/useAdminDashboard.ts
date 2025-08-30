import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  total_users: number
  online_users: number
  total_chat_rooms: number
  total_messages: number
  pending_reports: number
  banned_users: number
  total_notifications: number
  total_private_chats: number
  messages_today: number
  new_users_today: number
  reports_today: number
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
    
    // Set up real-time subscriptions for live updates
    const channels = [
      supabase.channel('dashboard_profiles').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => fetchDashboardStats()
      ),
      supabase.channel('dashboard_messages').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        () => fetchDashboardStats()
      ),
      supabase.channel('dashboard_reports').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reports' }, 
        () => fetchDashboardStats()
      ),
      supabase.channel('dashboard_chat_rooms').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_rooms' }, 
        () => fetchDashboardStats()
      )
    ]

    channels.forEach(channel => channel.subscribe())

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
      clearInterval(interval)
    }
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalChatRooms },
        { count: totalMessages },
        { count: pendingReports },
        { count: totalNotifications },
        { count: totalPrivateChats }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('chat_rooms').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase.from('private_chats').select('*', { count: 'exact', head: true })
      ])

      // Get online users (active within 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count: onlineUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true)
        .gte('last_seen', fiveMinutesAgo)

      // Get today's stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const [
        { count: newUsersToday },
        { count: messagesToday },
        { count: reportsToday }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', todayISO)
      ])
      
      const dashboardStats: DashboardStats = {
        total_users: totalUsers || 0,
        online_users: onlineUsers || 0,
        total_chat_rooms: totalChatRooms || 0,
        total_messages: totalMessages || 0,
        pending_reports: pendingReports || 0,
        banned_users: 0, // This would need to be tracked separately
        total_notifications: totalNotifications || 0,
        total_private_chats: totalPrivateChats || 0,
        messages_today: messagesToday || 0,
        new_users_today: newUsersToday || 0,
        reports_today: reportsToday || 0
      }
      
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    refetch: fetchDashboardStats
  }
}