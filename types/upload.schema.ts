import { z } from "zod"

// ==================== FILE VALIDATION SCHEMAS ====================

/**
 * Zod schema for single file validation
 */
export const fileSchema = z.instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, {
    message: "File size must be less than 10MB"
  })
  .refine((file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    return allowedTypes.includes(file.type)
  }, {
    message: "File must be an image (JPEG, PNG, WebP, or GIF)"
  })

/**
 * Zod schema for multiple files validation
 */
export const filesSchema = z.array(fileSchema)
  .max(10, "Maximum 10 files per upload session")
  .min(1, "At least one file is required")

// ==================== UPLOAD FORM SCHEMAS ====================

/**
 * Schema for guest upload form data
 */
export const guestUploadFormSchema = z.object({
  images: filesSchema,
  uploaded_by: z.string().max(100, "Name too long").optional(),
  captions: z.array(z.string().max(500, "Caption too long")).optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
})

/**
 * Schema for single upload creation
 */
export const createUploadSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  image: fileSchema,
  uploaded_by: z.string().max(100, "Name too long").optional(),
  caption: z.string().max(500, "Caption too long").optional()
})

/**
 * Schema for bulk upload creation
 */
export const createBulkUploadsSchema = z.object({
  event_id: z.string().uuid("Invalid event ID"),
  images: filesSchema,
  uploaded_by: z.string().max(100, "Name too long").optional(),
  captions: z.array(z.string().max(500, "Caption too long")).optional()
})

// ==================== UPLOAD UPDATE SCHEMAS ====================

/**
 * Schema for updating upload status (admin moderation)
 */
export const updateUploadStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().max(500, "Reason too long").optional()
})

/**
 * Schema for updating upload caption
 */
export const updateUploadCaptionSchema = z.object({
  caption: z.string().max(500, "Caption too long")
})

// ==================== UPLOAD QUERY SCHEMAS ====================

/**
 * Schema for querying uploads with filters
 */
export const uploadsQuerySchema = z.object({
  event_id: z.string().uuid("Invalid event ID").optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  uploaded_by: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'updated_at', 'uploaded_by']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

// ==================== TYPE INFERENCES ====================

export type GuestUploadFormInput = z.infer<typeof guestUploadFormSchema>
export type CreateUploadInput = z.infer<typeof createUploadSchema>
export type CreateBulkUploadsInput = z.infer<typeof createBulkUploadsSchema>
export type UpdateUploadStatusInput = z.infer<typeof updateUploadStatusSchema>
export type UpdateUploadCaptionInput = z.infer<typeof updateUploadCaptionSchema>
export type UploadsQueryInput = z.infer<typeof uploadsQuerySchema>

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate a single file
 */
export function validateFile(file: File): { isValid: boolean; errors: string[] } {
  const result = fileSchema.safeParse(file)
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues.map(e => e.message)
  }
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): { isValid: boolean; errors: string[] } {
  const result = filesSchema.safeParse(files)
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues.map(e => e.message)
  }
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  }
  return extensions[mimeType] || ''
}

/**
 * Check if MIME type is allowed
 */
export function isAllowedMimeType(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return allowedTypes.includes(mimeType)
}