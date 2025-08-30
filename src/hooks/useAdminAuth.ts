import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'moderator' | 'support'
  permissions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminSession()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await checkAdminSession()
      } else if (event === 'SIGNED_OUT') {
        setAdmin(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminSession = async () => {
    try {
      setLoading(true)
      
      // Get current Supabase auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setAdmin(null)
        return
      }

      if (!session?.user) {
        setAdmin(null)
        return
      }

      // Check if user exists in admin_users table and is active
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .eq('is_active', true)
        .single()

      if (adminError) {
        console.error('Admin lookup error:', adminError)
        // If user not found in admin_users, sign them out
        if (adminError.code === 'PGRST116') {
          await supabase.auth.signOut()
        }
        setAdmin(null)
        return
      }

      if (adminData && adminData.is_active) {
        setAdmin(adminData as AdminUser)
      } else {
        // User exists but is not active, sign them out
        await supabase.auth.signOut()
        setAdmin(null)
      }
    } catch (error) {
      console.error('Error checking admin session:', error)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Use the custom function to verify admin credentials
      const { data: adminData, error: adminError } = await supabase
        .rpc('verify_admin_password', {
          email_input: email.trim(),
          password_input: password
        })

      if (adminError) {
        console.error('Admin verification error:', adminError)
        return { data: null, error: 'Login failed. Please check your credentials.' }
      }

      if (!adminData || adminData.length === 0) {
        return { data: null, error: 'Invalid email or password' }
      }

      const adminUser = adminData[0] as AdminUser
      
      // Update last login timestamp
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id)

      setAdmin(adminUser)
      
      return { data: adminUser, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
      
      // Clear admin state
      setAdmin(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetAdminCredentials = async (newEmail: string, newPassword: string) => {
    try {
      setLoading(true)
      
      // This would typically be done by a super admin
      // For demo purposes, we'll show how it could work
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        return { error: 'Not authenticated' }
      }

      // Update email in auth
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (emailError) {
        return { error: emailError.message }
      }

      // Update password in auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (passwordError) {
        return { error: passwordError.message }
      }

      // Update email in admin_users table
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ email: newEmail })
        .eq('id', currentUser.id)

      if (updateError) {
        return { error: updateError.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error resetting credentials:', error)
      return { error: error instanceof Error ? error.message : 'Reset failed' }
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string) => {
    if (!admin) return false
    if (admin.role === 'super_admin') return true
    return admin.permissions.includes(permission)
  }

  const refreshSession = async () => {
    await checkAdminSession()
  }

  return {
    admin,
    loading,
    signIn,
    signOut,
    resetAdminCredentials,
    hasPermission,
    refreshSession,
    refetch: checkAdminSession
  }
}