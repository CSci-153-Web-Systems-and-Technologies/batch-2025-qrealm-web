import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/utils/supabase/types'

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Create or return cached Supabase client
 * IMPORTANT: This ensures auth state is properly initialized and session is attached
 */
export const createClient = () => {
  // Return cached instance if available
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create new instance
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseInstance
}

// Helper function to get the current session
export const getSession = async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Helper function to get current user
export const getUser = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * ================================================
 * STORAGE HELPERS (NEW)
 * ================================================
 */

/**
 * Get a storage bucket instance for easy access
 * @param bucketName - Name of the storage bucket
 * @returns Storage bucket instance
 * 
 * @example
 * const bucket = getStorageBucket('guest-uploads')
 * const { data } = await bucket.upload('path/file.jpg', file)
 */
export const getStorageBucket = (bucketName: string) => {
  const supabase = createClient()
  return supabase.storage.from(bucketName)
}

/**
 * Check if a storage bucket exists and is accessible
 * @param bucketName - Name of the storage bucket to check
 * @returns Object with accessibility status and optional error
 * 
 * @example
 * const { accessible, error } = await checkStorageAccess('guest-uploads')
 * if (!accessible) console.error('Bucket not accessible:', error)
 */
export const checkStorageAccess = async (
  bucketName: string
): Promise<{ 
  accessible: boolean; 
  error?: string;
  exists?: boolean;
}> => {
  try {
    const supabase = createClient()
    
    // Try to list files in the bucket (empty list is fine)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 }) // Just check first item
    
    if (error) {
      // Check if error is "bucket not found" or permission issue
      if (error.message.includes('not found') || error.message.includes('bucket')) {
        return { 
          accessible: false, 
          exists: false, 
          error: `Bucket "${bucketName}" does not exist` 
        }
      }
      
      return { 
        accessible: false, 
        exists: true, 
        error: error.message 
      }
    }
    
    return { 
      accessible: true, 
      exists: true 
    }
  } catch (error) {
    console.error(`[Storage] Error checking access to ${bucketName}:`, error)
    return { 
      accessible: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get public URL for a file in storage
 * @param bucketName - Storage bucket name
 * @param filePath - Path to the file within the bucket
 * @returns Public URL string
 * 
 * @example
 * const url = getPublicUrl('guest-uploads', 'event-123/photo.jpg')
 */
export const getPublicUrl = (bucketName: string, filePath: string): string => {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)
  
  return publicUrl
}

/**
 * Get file information from storage
 * @param bucketName - Storage bucket name
 * @param filePath - Path to the file
 * @returns File metadata or null if not found
 */
export const getFileInfo = async (
  bucketName: string, 
  filePath: string
): Promise<{ 
  exists: boolean; 
  metadata?: any; 
  error?: string 
}> => {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: filePath.split('/').pop() // Search by filename
      })
    
    if (error) {
      return { exists: false, error: error.message }
    }
    
    const file = data?.find(item => item.name === filePath.split('/').pop())
    
    return { 
      exists: !!file, 
      metadata: file 
    }
  } catch (error) {
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * List files in a directory
 * @param bucketName - Storage bucket name
 * @param directoryPath - Directory path (empty for root)
 * @returns Array of file objects
 */
export const listFiles = async (
  bucketName: string,
  directoryPath: string = ''
): Promise<Array<{
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}>> => {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(directoryPath)
    
    if (error) {
      console.error(`[Storage] Error listing files in ${bucketName}/${directoryPath}:`, error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error(`[Storage] Unexpected error listing files:`, error)
    return []
  }
}

/**
 * Check if a file exists in storage
 * @param bucketName - Storage bucket name
 * @param filePath - Full path to the file
 * @returns Boolean indicating if file exists
 */
export const fileExists = async (
  bucketName: string, 
  filePath: string
): Promise<boolean> => {
  try {
    const supabase = createClient()
    
    // Try to get the file metadata
    const { error } = await supabase.storage
      .from(bucketName)
      .download(filePath)
    
    // If no error, file exists
    return !error
  } catch (error) {
    return false
  }
}

/**
 * Initialize storage buckets on app startup (development helper)
 * This should be called during app initialization
 */
export const initializeStorageBuckets = async (): Promise<{
  success: boolean;
  errors: string[];
  buckets: Array<{ name: string; accessible: boolean }>;
}> => {
  const requiredBuckets = ['guest-uploads', 'events']
  const results: Array<{ name: string; accessible: boolean }> = []
  const errors: string[] = []
  
  console.log('[Storage] Initializing storage buckets...')
  
  for (const bucketName of requiredBuckets) {
    const { accessible, error } = await checkStorageAccess(bucketName)
    
    results.push({ name: bucketName, accessible })
    
    if (!accessible) {
      const errorMsg = `Bucket "${bucketName}" not accessible: ${error}`
      errors.push(errorMsg)
      console.warn(`[Storage] ${errorMsg}`)
    } else {
      console.log(`[Storage] ✓ Bucket "${bucketName}" is accessible`)
    }
  }
  
  return {
    success: errors.length === 0,
    errors,
    buckets: results
  }
}