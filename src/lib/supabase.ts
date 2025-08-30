import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string
          created_at: string
          updated_at: string
          is_online: boolean
          last_seen: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
          is_online?: boolean
          last_seen?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string
          updated_at?: string
          is_online?: boolean
          last_seen?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_by?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          sender_name: string
          chat_room_id: string | null
          private_chat_id: string | null
          message_type: 'text' | 'image' | 'audio'
          created_at: string
          is_read: boolean
        }
        Insert: {
          id?: string
          content: string
          sender_id: string
          sender_name: string
          chat_room_id?: string | null
          private_chat_id?: string | null
          message_type?: 'text' | 'image' | 'audio'
          created_at?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          content?: string
          is_read?: boolean
        }
      }
      private_chats: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          created_at: string
          last_activity: string
          blocked_by: string | null
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          created_at?: string
          last_activity?: string
          blocked_by?: string | null
        }
        Update: {
          id?: string
          last_activity?: string
          blocked_by?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'call' | 'system' | 'admin_action'
          title: string
          message: string
          from_user: string | null
          created_at: string
          is_read: boolean
          action_type: string | null
          report_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'call' | 'system' | 'admin_action'
          title: string
          message: string
          from_user?: string | null
          created_at?: string
          is_read?: boolean
          action_type?: string | null
          report_id?: string | null
        }
        Update: {
          id?: string
          is_read?: boolean
        }
      }
      reports: {
        Row: {
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
        Insert: {
          id?: string
          reported_by: string
          reported_user: string
          reported_message?: string | null
          reason: string
          created_at?: string
          status?: 'pending' | 'resolved' | 'dismissed' | 'escalated'
          action?: string | null
          action_by?: string | null
          action_timestamp?: string | null
          admin_notes?: string | null
          category?: 'harassment' | 'spam' | 'inappropriate_content' | 'hate_speech' | 'other'
        }
        Update: {
          id?: string
          status?: 'pending' | 'resolved' | 'dismissed' | 'escalated'
          action?: string | null
          action_by?: string | null
          action_timestamp?: string | null
          admin_notes?: string | null
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          author: string
          author_id: string
          created_at: string
          updated_at: string
          published: boolean
          tags: string[]
          read_count: number
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          author: string
          author_id: string
          created_at?: string
          updated_at?: string
          published?: boolean
          tags?: string[]
          read_count?: number
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          updated_at?: string
          published?: boolean
          tags?: string[]
          read_count?: number
        }
      }
    }
  }
}