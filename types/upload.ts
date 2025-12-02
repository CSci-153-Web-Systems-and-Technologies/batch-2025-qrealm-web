
// ==================== DATABASE TYPES ====================

/**
 * Database representation of an upload
 * Matches the SQL table structure exactly
 */
export interface DatabaseUpload {
  id: string
  event_id: string
  image_url: string
  uploaded_by: string | null
  caption: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
}

/**
 * Database upload with event join for admin views
 */
export interface DatabaseUploadWithEvent extends DatabaseUpload {
  event?: {
    id: string
    title: string
    organizer: string | null
    location: string | null
    created_by: string
  }
}

// ==================== FRONTEND TYPES ====================

/**
 * Frontend representation of an upload
 * Used in components and stores
 */
export interface Upload {
  id: string
  event_id: string
  image_url: string
  uploaded_by: string | null
  caption: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
}

/**
 * Upload with event details for display
 */
export interface UploadWithEvent extends Upload {
  event?: {
    title: string
    organizer: string | null
    location: string | null
  }
}

/**
 * Upload statistics for an event
 */
export interface UploadStats {
  total: number
  approved: number
  pending: number
  rejected: number
  remaining: number // Remaining uploads allowed
}

// ==================== FORM DATA TYPES ====================

/**
 * Data required to create a new upload
 */
export interface CreateUploadData {
  event_id: string
  image: File
  uploaded_by?: string
  caption?: string
}

/**
 * Data for updating an upload (admin moderation)
 */
export interface UpdateUploadData {
  status?: 'pending' | 'approved' | 'rejected'
  caption?: string
  approved_by?: string | null
}

/**
 * Data for guest upload form
 */
export interface GuestUploadFormData {
  images: File[]
  uploaded_by?: string
  captions?: string[]
  acceptTerms: boolean
}

// ==================== API RESPONSE TYPES ====================

/**
 * Response from single upload creation
 */
export interface UploadCreateResponse {
  success: boolean
  upload?: Upload
  error?: string
}

/**
 * Response from bulk upload creation
 */
export interface BulkUploadResponse {
  success: boolean
  uploads?: Upload[]
  errors: string[]
  totalProcessed: number
  successfulCount: number
  failedCount: number
}

/**
 * Response from upload status update
 */
export interface UploadStatusResponse {
  success: boolean
  upload?: Upload
  error?: string
}

/**
 * Response for upload deletion
 */
export interface UploadDeleteResponse {
  success: boolean
  error?: string
}

// ==================== HELPER TYPES ====================

/**
 * Upload status type guard
 */
export type UploadStatus = 'pending' | 'approved' | 'rejected'

/**
 * Upload moderation action
 */
export type ModerationAction = 'approve' | 'reject' | 'delete'

/**
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean
  error?: string
  file?: File
}

/**
 * Upload progress tracking
 */
export interface UploadProgress {
  totalFiles: number
  processedFiles: number
  currentFile: string
  progressPercentage: number
}

// ==================== CONSTANTS ====================

/**
 * Maximum upload limits
 */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_SESSION: 10,
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ] as const,
  ALLOWED_FILE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const
} as const

/**
 * Upload status display configurations
 */
export const UPLOAD_STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳'
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: '✅'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: '❌'
  }
} as const