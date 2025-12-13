export * from '../utils/supabase/types'

// Database types (auto-generated from Supabase)
export * from '@/utils/supabase/types'

// Custom event types and utilities
export * from './event'

// Event validation schemas
export * from './event.schema' 

// Export all upload-related types
export * from './upload'
export * from './upload.schema'

// Export upload-related event types
export type {
  EventWithUploadStats,
  EventWithUploads,
  EventWithFullUploads,
  DatabaseEventWithUploads,
  EventUploadConfig,
  EventUploadSettings,
  CreateEventDataWithUploadSettings,
  UpdateEventDataWithUploadSettings
} from './event'

// Export type guards from event.ts
export {
  hasUploadStats,
  hasUploads,
  getEventUploadLimit
} from './event'

// Export validation utilities from upload.schema.ts
export {
  validateFile,
  validateFiles,
  getFileExtension,
  isAllowedMimeType
} from './upload.schema'

// Export upload constants
export {
  UPLOAD_LIMITS,
  UPLOAD_STATUS_CONFIG
} from './upload'