// Quick test for upload types
import type { Upload, CreateUploadData } from '@/types'

// Test 1: Basic type instantiation
const testUpload: Upload = {
  id: 'test-id',
  event_id: 'event-123',
  image_url: 'https://example.com/photo.jpg',
  uploaded_by: 'Test User',
  caption: 'Test caption',
  status: 'pending',
  approved_by: null,
  ip_address: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

console.log('✅ Upload type works')

// Test 2: File-based type
const testCreateData: CreateUploadData = {
  event_id: 'event-123',
  image: new File([''], 'test.jpg', { type: 'image/jpeg' }),
  uploaded_by: 'Test User'
}

console.log('✅ CreateUploadData type works')

// Test 3: Import from specific files
import { UPLOAD_LIMITS } from '@/types/upload'
import { validateFile } from '@/types/upload.schema'

console.log('✅ Constants work:', UPLOAD_LIMITS.MAX_FILE_SIZE)

// Test 4: Validation function
const file = new File([''], 'test.jpg', { type: 'image/jpeg' })
const validation = validateFile(file)
console.log('✅ Validation works:', validation.isValid)

console.log('🎉 All type imports successful!')