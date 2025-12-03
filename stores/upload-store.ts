import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { 
  Upload, 
  UploadWithEvent, 
  UploadStats, 
  CreateUploadData, 
  UploadCreateResponse,
  BulkUploadResponse,
  UploadStatusResponse,
  UploadDeleteResponse
} from '@/types/upload'
import { FileUploadService } from '@/utils/file-upload-service'

interface UploadState {
  // ========================
  // STATE
  // ========================
  
  // Uploads by event ID for caching
  eventUploads: Record<string, Upload[]>
  
  // Pending uploads for admin moderation
  pendingUploads: UploadWithEvent[]
  
  // Upload statistics by event
  uploadStats: Record<string, UploadStats>
  
  // Loading states
  isLoading: boolean
  isUploading: boolean
  isModerating: boolean
  
  // Error handling
  error: string | null
  uploadErrors: string[]
  
  // Pagination
  currentPage: number
  hasMore: boolean
  pageSize: number
  
  // ========================
  // ACTIONS
  // ========================
  
  // Fetch operations
  fetchEventUploads: (eventId: string, forceRefresh?: boolean) => Promise<void>
  fetchPendingUploads: (page?: number) => Promise<void>
  fetchUploadStats: (eventId: string) => Promise<void>
  
  // Upload operations
  createUpload: (data: CreateUploadData) => Promise<UploadCreateResponse>
  createBulkUploads: (files: File[], eventId: string, uploadedBy?: string) => Promise<BulkUploadResponse>
  
  // Moderation operations
  updateUploadStatus: (uploadId: string, status: 'pending' | 'approved' | 'rejected', eventId?: string) => Promise<UploadStatusResponse>
  updateBulkUploadStatus: (uploadIds: string[], status: 'pending' | 'approved' | 'rejected') => Promise<{ success: boolean; processed: number; errors: string[] }>
  deleteUpload: (uploadId: string, deleteFile?: boolean) => Promise<UploadDeleteResponse>
  
  // Cache management
  clearEventUploads: (eventId?: string) => void
  clearPendingUploads: () => void
  clearUploadStats: (eventId?: string) => void
  
  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
  clearUploadErrors: () => void
  
  // Pagination
  setPage: (page: number) => void
  setHasMore: (hasMore: boolean) => void
  
  // ========================
  // SELECTORS (GETTERS)
  // ========================
  getEventUploads: (eventId: string) => Upload[]
  getPendingUploads: () => UploadWithEvent[]
  getUploadStats: (eventId: string) => UploadStats | undefined
  getUploadsCount: (eventId: string) => number
  getPendingCount: () => number
}

export const useUploadStore = create<UploadState>((set, get) => ({
  // ========================
  // INITIAL STATE
  // ========================
  eventUploads: {},
  pendingUploads: [],
  uploadStats: {},
  isLoading: false,
  isUploading: false,
  isModerating: false,
  error: null,
  uploadErrors: [],
  currentPage: 1,
  hasMore: true,
  pageSize: 20,

  // ========================
  // SELECTORS (GETTERS)
  // ========================
  
  getEventUploads: (eventId: string) => {
    return get().eventUploads[eventId] || []
  },
  
  getPendingUploads: () => {
    return get().pendingUploads
  },
  
  getUploadStats: (eventId: string) => {
    return get().uploadStats[eventId]
  },
  
  getUploadsCount: (eventId: string) => {
    return get().eventUploads[eventId]?.length || 0
  },
  
  getPendingCount: () => {
    return get().pendingUploads.length
  },

  // ========================
  // FETCH OPERATIONS
  // ========================
  
  fetchEventUploads: async (eventId: string, forceRefresh: boolean = false) => {
    // Skip if already cached and not forcing refresh
    if (!forceRefresh && get().eventUploads[eventId]) {
      console.log(`[UploadStore] Using cached uploads for event ${eventId}`)
      return
    }
    
    set({ isLoading: true, error: null })
    
    try {
      const supabase = createClient()
      
      console.log(`[UploadStore] Fetching uploads for event ${eventId}`)
      
      const { data: uploads, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'approved') // Only show approved uploads to public
        .order('created_at', { ascending: false })
        .limit(1000) // Limit for safety

      if (error) {
        console.error('[UploadStore] Error fetching event uploads:', error)
        set({ 
          error: `Failed to load photos: ${error.message}`,
          isLoading: false 
        })
        return
      }

      console.log(`[UploadStore] Loaded ${uploads?.length || 0} uploads for event ${eventId}`)
      
      set(state => ({
        eventUploads: {
          ...state.eventUploads,
          [eventId]: uploads || []
        },
        isLoading: false
      }))
      
    } catch (error) {
      console.error('[UploadStore] Unexpected error:', error)
      set({ 
        error: 'An unexpected error occurred while loading photos',
        isLoading: false 
      })
    }
  },

  fetchPendingUploads: async (page: number = 1) => {
    set({ isModerating: true, error: null })
    
    try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
        set({ 
            error: 'Authentication required for moderation',
            isModerating: false 
        })
        return
        }

        console.log(`[UploadStore] Fetching pending uploads for user ${user.id}, page ${page}`)
        
        // Calculate offset for pagination
        const offset = (page - 1) * get().pageSize
        
        // FIX 1: First get the event IDs owned by the user
        const { data: userEvents, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('created_by', user.id)

        if (eventsError) {
        console.error('[UploadStore] Error fetching user events:', eventsError)
        set({ 
            error: `Failed to load your events: ${eventsError.message}`,
            isModerating: false 
        })
        return
        }

        // Ensure TypeScript knows the shape of the returned rows so .map can access .id
        const eventIds = (userEvents as { id: string }[] | undefined)?.map(ev => ev.id) || []
        
        // If user has no events, return empty array
        if (eventIds.length === 0) {
        console.log('[UploadStore] User has no events, returning empty pending uploads')
        set({
            pendingUploads: [],
            currentPage: page,
            hasMore: false,
            isModerating: false
        })
        return
        }

        // FIX 2: Now fetch pending uploads for those event IDs
        const { data: uploads, error, count } = await supabase
        .from('uploads')
        .select(`
            *,
            event:events (
            id,
            title,
            cover_image_url,
            organizer,
            location,
            created_by
            )
        `, { count: 'exact' })
        .eq('status', 'pending')
        .in('event_id', eventIds) // Use the array of event IDs
        .order('created_at', { ascending: true })
        .range(offset, offset + get().pageSize - 1)

        if (error) {
        console.error('[UploadStore] Error fetching pending uploads:', error)
        set({ 
            error: `Failed to load pending uploads: ${error.message}`,
            isModerating: false 
        })
        return
        }

        console.log(`[UploadStore] Loaded ${uploads?.length || 0} pending uploads`)
        
        set({
        pendingUploads: uploads || [],
        currentPage: page,
        hasMore: (count || 0) > offset + (uploads?.length || 0),
        isModerating: false
        })
        
    } catch (error) {
        console.error('[UploadStore] Unexpected error fetching pending uploads:', error)
        set({ 
        error: 'An unexpected error occurred while loading pending uploads',
        isModerating: false 
        })
    }
 },

  fetchUploadStats: async (eventId: string) => {
    try {
      const supabase = createClient()
      
      console.log(`[UploadStore] Fetching stats for event ${eventId}`)
      
      // Get counts by status
      const { data: stats, error } = await (supabase as any).rpc('get_event_upload_stats', {
        p_event_id: eventId
      })

      if (error) {
        console.error('[UploadStore] Error fetching upload stats:', error)
        // Don't throw error, just don't update stats
        return
      }

      // Default stats if none returned
      const uploadStats: UploadStats = stats?.[0] || {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        remaining: 100 // Default value
      }
      
      set(state => ({
        uploadStats: {
          ...state.uploadStats,
          [eventId]: uploadStats
        }
      }))
      
    } catch (error) {
      console.error('[UploadStore] Unexpected error fetching stats:', error)
      // Silently fail - stats are not critical
    }
  },

  // ========================
  // UPLOAD OPERATIONS
  // ========================
  
  createUpload: async (data: CreateUploadData): Promise<UploadCreateResponse> => {
    set({ isUploading: true, error: null })
    
    try {
      console.log(`[UploadStore] Creating upload for event ${data.event_id}`)
      
      // 1. Upload image to storage
      const uploadResult = await FileUploadService.uploadGuestImage(data.image, data.event_id)
      
      if (!uploadResult.success || !uploadResult.url) {
        const errorMsg = uploadResult.error || 'Image upload failed'
        console.error('[UploadStore] File upload failed:', errorMsg)
        
        set({ isUploading: false })
        return { 
          success: false, 
          error: errorMsg
        }
      }

      const supabase = createClient()
      
      // 2. Create upload record in database
      const { data: upload, error } = await supabase
        .from('uploads')
        .insert([{
            event_id: data.event_id,
            image_url: uploadResult.url,
            uploaded_by: data.uploaded_by?.trim() || null,
            caption: data.caption?.trim() || null,
            status: 'pending',
            ip_address: null
        }] as any)
        .select()
        .single() as any

      if (error || !upload) {
        // Clean up uploaded file if database insert fails
        console.error('[UploadStore] Database insert failed, cleaning up file:', error)
        await FileUploadService.deleteUploadedFile(uploadResult.url)
        
        set({ isUploading: false })
        return { 
          success: false, 
          error: `Failed to save upload: ${error?.message || 'No upload returned'}`
        }
      }

      const createdUpload = upload as Upload

      console.log(`[UploadStore] Upload created successfully: ${createdUpload.id}`)
      
      // 3. Update local state (add to pending and update stats)
      set(state => {
        const eventUploads = state.eventUploads[data.event_id] || []
        
        return {
          eventUploads: {
            ...state.eventUploads,
            [data.event_id]: [createdUpload, ...eventUploads]
          },
          isUploading: false
        }
      })

      // 4. Refresh stats
      await get().fetchUploadStats(data.event_id)
      
      return { 
        success: true, 
        upload: createdUpload,
        error: undefined
      }
      
    } catch (error) {
      console.error('[UploadStore] Unexpected error creating upload:', error)
      set({ 
        isUploading: false,
        error: 'An unexpected error occurred during upload'
      })
      return { 
        success: false, 
        error: 'An unexpected error occurred'
      }
    }
  },

  createBulkUploads: async (files: File[], eventId: string, uploadedBy?: string): Promise<BulkUploadResponse> => {
    set({ isUploading: true, uploadErrors: [] })
    
    const errors: string[] = []
    const successfulUploads: Upload[] = []
    const totalFiles = files.length
    
    console.log(`[UploadStore] Starting bulk upload of ${totalFiles} files to event ${eventId}`)
    
    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileNumber = i + 1
        
        console.log(`[UploadStore] Processing file ${fileNumber}/${totalFiles}: ${file.name}`)
        
        try {
          const result = await get().createUpload({
            event_id: eventId,
            image: file,
            uploaded_by: uploadedBy
          })
          
          if (result.success && result.upload) {
            successfulUploads.push(result.upload)
            console.log(`[UploadStore] File ${fileNumber} uploaded successfully`)
          } else {
            const errorMsg = `${file.name}: ${result.error || 'Upload failed'}`
            errors.push(errorMsg)
            console.error(`[UploadStore] File ${fileNumber} failed:`, errorMsg)
          }
        } catch (fileError) {
          const errorMsg = `${file.name}: Unexpected error`
          errors.push(errorMsg)
          console.error(`[UploadStore] File ${fileNumber} threw error:`, fileError)
        }
      }

      set({ isUploading: false, uploadErrors: errors })
      
      const result: BulkUploadResponse = {
        success: errors.length === 0,
        uploads: successfulUploads,
        errors: errors,
        totalProcessed: totalFiles,
        successfulCount: successfulUploads.length,
        failedCount: errors.length
      }
      
      console.log(`[UploadStore] Bulk upload completed:`, result)
      return result
      
    } catch (error) {
      console.error('[UploadStore] Bulk upload process failed:', error)
      set({ 
        isUploading: false,
        error: 'Bulk upload process failed'
      })
      return {
        success: false,
        uploads: successfulUploads,
        errors: ['Bulk upload process failed'],
        totalProcessed: totalFiles,
        successfulCount: successfulUploads.length,
        failedCount: errors.length
      }
    }
  },

  // ========================
  // MODERATION OPERATIONS
  // ========================
  
  updateUploadStatus: async (uploadId: string, status: 'pending' | 'approved' | 'rejected', eventId?: string): Promise<UploadStatusResponse> => {
  set({ isModerating: true, error: null })
  
  try {
    const supabase = createClient()
    
    // Get current user for approval tracking
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      set({ isModerating: false })
      return { 
        success: false, 
        error: 'Authentication required for moderation'
      }
    }

    console.log(`[UploadStore] Updating upload ${uploadId} to status: ${status}`)
    
    // Create the update object with proper typing
    const updateData = {
      status,
      approved_by: status === 'approved' ? user.id : null,
      updated_at: new Date().toISOString()
    }
    
    const { data: upload, error } = await (supabase as any)
      .from('uploads')
      .update(updateData)
      .eq('id', uploadId)
      .select()
      .single()

    if (error) {
      console.error('[UploadStore] Error updating upload status:', error)
      set({ isModerating: false })
      return { 
        success: false, 
        error: `Failed to update status: ${error.message}`
      }
    }

    console.log(`[UploadStore] Upload ${uploadId} updated successfully to ${status}`)
    
    // Update local state
    // Normalize upload typing for TypeScript
    const uploadRecord = upload as any

    set(state => {
      // Update in pending uploads
      const updatedPendingUploads = state.pendingUploads.filter(u => u.id !== uploadId)
      
      // Update in event uploads cache
      const updatedEventUploads = { ...state.eventUploads }
      if (uploadRecord && uploadRecord.event_id) {
        updatedEventUploads[uploadRecord.event_id] = updatedEventUploads[uploadRecord.event_id]?.map(u =>
          u.id === uploadId ? { ...u, status } : u
        ) || []
      }
      
      // If approved, add to event uploads
      if (status === 'approved' && uploadRecord && uploadRecord.event_id) {
        updatedEventUploads[uploadRecord.event_id] = [
          uploadRecord,
          ...(updatedEventUploads[uploadRecord.event_id] || [])
        ]
      }
      
      return {
        pendingUploads: updatedPendingUploads,
        eventUploads: updatedEventUploads,
        isModerating: false
      }
    })

    // Refresh stats for the affected event
    if (uploadRecord && uploadRecord.event_id) {
      await get().fetchUploadStats(uploadRecord.event_id)
    }
    
    return { 
      success: true,
      upload: uploadRecord || undefined,
      error: undefined
    }
    
  } catch (error) {
    console.error('[UploadStore] Unexpected error updating upload:', error)
    set({ isModerating: false })
    return { 
      success: false, 
      error: 'An unexpected error occurred'
    }
  }
},

  updateBulkUploadStatus: async (uploadIds: string[], status: 'pending' | 'approved' | 'rejected') => {
    set({ isModerating: true, error: null })
    
    const errors: string[] = []
    let processed = 0
    
    console.log(`[UploadStore] Bulk updating ${uploadIds.length} uploads to ${status}`)
    
    try {
      for (const uploadId of uploadIds) {
        try {
          const result = await get().updateUploadStatus(uploadId, status)
          
          if (result.success) {
            processed++
          } else {
            errors.push(`${uploadId}: ${result.error}`)
          }
        } catch (error) {
          errors.push(`${uploadId}: Unexpected error`)
          console.error(`[UploadStore] Error processing ${uploadId}:`, error)
        }
      }

      set({ isModerating: false })
      
      return {
        success: errors.length === 0,
        processed,
        errors
      }
      
    } catch (error) {
      console.error('[UploadStore] Bulk update process failed:', error)
      set({ isModerating: false })
      return {
        success: false,
        processed,
        errors: ['Bulk update process failed']
      }
    }
  },

  deleteUpload: async (uploadId: string, deleteFile: boolean = true): Promise<UploadDeleteResponse> => {
    set({ isModerating: true, error: null })
    
    try {
      const supabase = createClient()
      
      // First get the upload to get image URL for cleanup
      const { data: upload, error: fetchError } = await supabase
        .from('uploads')
        .select('image_url, event_id, status')
        .eq('id', uploadId)
        .single()

      if (fetchError || !upload) {
        set({ isModerating: false })
        return { 
          success: false, 
          error: `Upload not found: ${fetchError?.message || 'No upload returned'}` 
        }
      }

      // Normalize the fetched row for TypeScript usage
      const uploadRecord: { image_url: string | null; event_id?: string | null; status?: string } = upload as any

      console.log(`[UploadStore] Deleting upload ${uploadId} (deleteFile: ${deleteFile})`)
      
      // Delete from database
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', uploadId)

      if (error) {
        console.error('[UploadStore] Error deleting upload:', error)
        set({ isModerating: false })
        return { 
          success: false, 
          error: `Database deletion failed: ${error.message}` 
        }
      }

      // Delete image file from storage if requested
      if (deleteFile && uploadRecord.image_url) {
        await FileUploadService.deleteUploadedFile(uploadRecord.image_url)
      }

      // Update local state
      set(state => {
        // Remove from pending uploads
        const updatedPendingUploads = state.pendingUploads.filter(u => u.id !== uploadId)
        
        // Remove from event uploads cache
        const updatedEventUploads = { ...state.eventUploads }
        if (uploadRecord.event_id) {
          updatedEventUploads[uploadRecord.event_id] = updatedEventUploads[uploadRecord.event_id]?.filter(
            u => u.id !== uploadId
          ) || []
        }
        
        return {
          pendingUploads: updatedPendingUploads,
          eventUploads: updatedEventUploads,
          isModerating: false
        }
      })

      // Refresh stats for the affected event
      if (uploadRecord.event_id) {
        await get().fetchUploadStats(uploadRecord.event_id)
      }
      
      console.log(`[UploadStore] Upload ${uploadId} deleted successfully`)
      return { success: true, error: undefined }
      
    } catch (error) {
      console.error('[UploadStore] Unexpected error deleting upload:', error)
      set({ isModerating: false })
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      }
    }
  },

  // ========================
  // CACHE MANAGEMENT
  // ========================
  
  clearEventUploads: (eventId?: string) => {
    if (eventId) {
      set(state => ({
        eventUploads: {
          ...state.eventUploads,
          [eventId]: []
        }
      }))
    } else {
      set({ eventUploads: {} })
    }
  },

  clearPendingUploads: () => {
    set({ pendingUploads: [] })
  },

  clearUploadStats: (eventId?: string) => {
    if (eventId) {
        set(state => {
        const newUploadStats = { ...state.uploadStats }
        delete newUploadStats[eventId]
        
        return { uploadStats: newUploadStats }
        })
    } else {
        set({ uploadStats: {} })
    }
    },

  // ========================
  // ERROR HANDLING
  // ========================
  
  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  clearUploadErrors: () => {
    set({ uploadErrors: [] })
  },

  // ========================
  // PAGINATION
  // ========================
  
  setPage: (page: number) => {
    set({ currentPage: page })
  },

  setHasMore: (hasMore: boolean) => {
    set({ hasMore })
  }
}))