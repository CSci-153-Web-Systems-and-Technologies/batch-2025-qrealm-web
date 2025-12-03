import { createClient } from '@/utils/supabase/client'
import { UPLOAD_LIMITS } from '@/types/upload'

/**
 * Result interface for file upload operations
 */
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  filePath?: string
}

/**
 * Bulk upload result interface
 */
export interface BulkUploadResult {
  success: boolean
  results: Array<{
    fileName: string
    result: UploadResult
  }>
  errors: string[]
}

/**
 * Enhanced file upload service for handling cover images and guest uploads
 */
export class FileUploadService {
  /**
   * Upload a cover image for an event
   */
  static async uploadCoverImage(file: File): Promise<UploadResult> {
    const folderPath = 'event-covers' // Just the folder name
    return this.uploadImage(file, 'events', 'folderPath')
  }

  /**
   * Upload a guest photo for an event
   * @param file - The image file to upload
   * @param eventId - The event ID for organizing files
   * @param uploaderId - Optional uploader identifier for file naming
   */
  static async uploadGuestImage(
    file: File, 
    eventId: string, 
    uploaderId?: string
  ): Promise<UploadResult> {
    const folderPath = `${eventId}`
    return this.uploadImage(file, 'guest-uploads', folderPath, uploaderId)
  }

  /**
   * Core image upload method with validation and error handling
   */
  private static async uploadImage(
    file: File,
    bucket: string,
    folderPath: string,
    identifier?: string
  ): Promise<UploadResult> {
    try {
      console.log(`[FileUpload] Starting upload to ${bucket}/${folderPath}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      // 1. Validate file type - FIXED CONSTANT NAME
      if (!this.isValidImageType(file)) {
        console.warn('[FileUpload] Invalid file type:', file.type)
        return {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed types: ${UPLOAD_LIMITS.ALLOWED_FILE_TYPES.join(', ')}`
        }
      }

      // 2. Validate file size
      const maxSize = bucket === 'guest-uploads' 
        ? UPLOAD_LIMITS.MAX_FILE_SIZE 
        : 5 * 1024 * 1024 // 5MB for cover images
      
      if (file.size > maxSize) {
        console.warn('[FileUpload] File too large:', file.size, 'max:', maxSize)
        const maxSizeMB = Math.floor(maxSize / 1024 / 1024)
        return {
          success: false,
          error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum size is ${maxSizeMB}MB.`
        }
      }

      // 3. Generate secure file name
      const fileName = this.generateFileName(file, identifier)
      const filePath = `${folderPath}/${fileName}`

      console.log('[FileUpload] Generated file path:', filePath)

      // 4. Upload to Supabase Storage
      const supabase = createClient()
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false, // Don't overwrite existing files
          contentType: file.type
        })

      if (error) {
        console.error('[FileUpload] Supabase upload error:', error)
        
        // Handle specific error cases
        if (error.message.includes('already exists')) {
          return {
            success: false,
            error: 'A file with this name already exists. Please rename your file.'
          }
        }
        
        if (error.message.includes('Payload too large')) {
          return {
            success: false,
            error: 'File size exceeds storage limits. Please use a smaller file.'
          }
        }
        
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        }
      }

      // 5. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      console.log('[FileUpload] Upload successful:', {
        bucket,
        filePath,
        publicUrl: publicUrl.substring(0, 100) + '...'
      })

      return {
        success: true,
        url: publicUrl,
        filePath: data.path
      }

    } catch (error) {
      console.error('[FileUpload] Unexpected error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during upload. Please try again.'
      }
    }
  }

  /**
   * Upload multiple files in sequence
   */
  static async uploadMultipleFiles(
    files: File[],
    eventId: string,
    uploaderId?: string
  ): Promise<BulkUploadResult> {
    console.log(`[FileUpload] Starting bulk upload of ${files.length} files`)
    
    const results: Array<{ fileName: string; result: UploadResult }> = []
    const errors: string[] = []
    let successfulCount = 0

    // Process files sequentially to avoid overwhelming the server
    for (const file of files) {
      const result = await this.uploadGuestImage(file, eventId, uploaderId)
      
      results.push({
        fileName: file.name,
        result
      })

      if (result.success) {
        successfulCount++
        console.log(`[FileUpload] Successfully uploaded: ${file.name}`)
      } else {
        errors.push(`${file.name}: ${result.error}`)
        console.warn(`[FileUpload] Failed to upload ${file.name}:`, result.error)
      }
    }

    const bulkResult = {
      success: successfulCount === files.length,
      results,
      errors
    }

    console.log(`[FileUpload] Bulk upload completed:`, {
      total: files.length,
      successful: successfulCount,
      failed: files.length - successfulCount
    })

    return bulkResult
  }

  /**
   * Delete an uploaded file from storage
   */
  static async deleteUploadedFile(
    fileUrl: string,
    bucket: string = 'guest-uploads'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FileUpload] Deleting file from ${bucket}:`, fileUrl)

      // Extract file path from URL
      const urlParts = fileUrl.split('/')
      const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/')

      if (!filePath) {
        console.error('[FileUpload] Could not extract file path from URL:', fileUrl)
        return { success: false, error: 'Invalid file URL' }
      }

      const supabase = createClient()
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) {
        console.error('[FileUpload] Delete error:', error)
        return { success: false, error: error.message }
      }

      console.log('[FileUpload] File deleted successfully:', filePath)
      return { success: true }

    } catch (error) {
      console.error('[FileUpload] Unexpected error during delete:', error)
      return { success: false, error: 'Failed to delete file' }
    }
  }

  /**
   * Validate if a file is an allowed image type - FIXED CONSTANT NAME
   */
  /**
 * Validate if a file is an allowed image type
 */
  private static isValidImageType(file: File): boolean {
    // Cast the readonly array to string[] for the includes check
    const allowedTypes = UPLOAD_LIMITS.ALLOWED_FILE_TYPES 
    return allowedTypes.includes(file.type as any)
  }

  /**
   * Generate a secure, unique filename
   */
  private static generateFileName(file: File, identifier?: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-') // Replace special chars with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .substring(0, 50) // Limit length
    
    const baseName = identifier 
      ? `${identifier}-${sanitizedName}`
      : sanitizedName
    
    return `${baseName}-${timestamp}-${randomString}`
  }

  /**
   * Check file dimensions (basic client-side check)
   * Note: For more accurate dimensions, use server-side processing
   */
  static async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(objectUrl)
      }
      
      img.onerror = () => {
        console.warn('[FileUpload] Could not load image for dimension check')
        URL.revokeObjectURL(objectUrl)
        resolve(null)
      }
      
      img.src = objectUrl
    })
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get storage usage for an event
   */
  static async getEventStorageUsage(eventId: string): Promise<{
    totalFiles: number
    totalSize: number
    formattedSize: string
  }> {
    try {
      const supabase = createClient()
      
      const { data: files, error } = await supabase.storage
        .from('guest-uploads')
        .list(`guest-uploads/${eventId}`)

      if (error) {
        console.error('[FileUpload] Error listing files:', error)
        return { totalFiles: 0, totalSize: 0, formattedSize: '0 Bytes' }
      }

      const totalSize = files?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0
      
      return {
        totalFiles: files?.length || 0,
        totalSize,
        formattedSize: this.formatFileSize(totalSize)
      }
    } catch (error) {
      console.error('[FileUpload] Error getting storage usage:', error)
      return { totalFiles: 0, totalSize: 0, formattedSize: '0 Bytes' }
    }
  }
}