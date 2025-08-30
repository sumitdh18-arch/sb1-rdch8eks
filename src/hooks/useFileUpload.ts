import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadImage = async (file: File): Promise<{ url: string | null; error: any }> => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Validate file
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'File must be an image' }
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return { url: null, error: 'File size must be less than 10MB' }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `chat-images/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        return { url: null, error: error.message }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      return { url: publicUrl, error: null }
    } catch (error) {
      console.error('Upload error:', error)
      return { url: null, error: 'Upload failed. Please check your connection and try again.' }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const uploadAudio = async (blob: Blob): Promise<{ url: string | null; error: any }> => {
    try {
      setUploading(true)
      setUploadProgress(0)
      
      // Get current user for file naming
      const { data: { user } } = await supabase.auth.getUser()

      // Generate unique filename for audio
      const fileName = `${user?.id || 'anonymous'}-${Date.now()}-${Math.random().toString(36).substring(2)}.webm`
      const filePath = `chat-audio/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Audio upload error:', error)
        return { url: null, error: error.message }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      return { url: publicUrl, error: null }
    } catch (error) {
      console.error('Audio upload error:', error)
      return { url: null, error: error instanceof Error ? error.message : 'Upload failed' }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteFile = async (filePath: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.storage
        .from('chat-files')
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Delete error:', error)
      return { error: error instanceof Error ? error.message : 'Delete failed' }
    }
  }

  return {
    uploading,
    uploadProgress,
    uploadImage,
    uploadAudio,
    deleteFile
  }
}