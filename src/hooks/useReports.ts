import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Report {
  id: string
  reported_by: string
  reported_user: string
  reported_message: string | null
  reason: string
  created_at: string
  status: 'pending' | 'resolved' | 'dismissed' | 'escalated'
  action: string | null
  action_by: string | null
  action_timestamp: string | null
  admin_notes: string | null
  category: 'harassment' | 'spam' | 'inappropriate_content' | 'hate_speech' | 'other'
}

export function useReports(userId?: string) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchReports()
    }
  }, [userId])

  const fetchReports = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reported_by', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const createReport = async (
    reportedUserId: string,
    reason: string,
    category: 'harassment' | 'spam' | 'inappropriate_content' | 'hate_speech' | 'other' = 'other',
    messageId?: string
  ) => {
    if (!userId) {
      return { data: null, error: 'User not authenticated' }
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          reported_by: userId,
          reported_user: reportedUserId,
          reported_message: messageId || null,
          reason,
          category,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      
      // Refresh reports list
      await fetchReports()
      
      return { data, error: null }
    } catch (error) {
      console.error('Error creating report:', error)
      return { data: null, error }
    }
  }

  const updateReportStatus = async (
    reportId: string, 
    status: 'pending' | 'resolved' | 'dismissed' | 'escalated',
    adminNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          admin_notes: adminNotes,
          action_timestamp: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error
      await fetchReports()
      return { error: null }
    } catch (error) {
      console.error('Error updating report:', error)
      return { error }
    }
  }

  return {
    reports,
    loading,
    createReport,
    updateReportStatus,
    refetch: fetchReports
  }
}