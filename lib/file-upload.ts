import { createClient } from '@/utils/supabase/client'
import { FileUploadResult } from '@/types/event'

export class FileUploadService {
  /**
   * Upload cover image to Supabase Storage
   */
  static async uploadCoverImage(file: File): Promise<FileUploadResult> {
    const supabase = createClient()
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'
        }
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size must be less than 5MB.'
        }
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const randomString = Math.random().toString(36).substring(2, 10);
      const timestamp = Date.now();
      const fileName = `${randomString}_${timestamp}.${fileExt}`;

      // Direct upload path (root of bucket)
      const filePath = fileName;

      console.log('Uploading cover image to event-covers bucket:', {
        originalName: file.name,
        newName: fileName,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        type: file.type,
        bucket: 'event-covers'
      });

      // Upload to event-covers bucket
      const { data, error } = await supabase.storage
        .from('event-covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('event-covers')
        .getPublicUrl(filePath);

      console.log('Cover image uploaded successfully:', publicUrl);
      
      return {
        success: true,
        url: publicUrl
      }

    } catch (error) {
      console.error('Unexpected error in cover image upload:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload.'
      }
    }
  }

  /**
   * Delete cover image from Supabase Storage
   */
  static async deleteCoverImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    
    try {
      // Extract file name from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Direct file path in event-covers bucket
      const filePath = fileName;

      console.log('Deleting cover image:', { fileName, bucket: 'event-covers' });

      // Delete from event-covers bucket
      const { error } = await supabase.storage
        .from('event-covers')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting cover image:', error);
        return { success: false, error: error.message }
      }

      console.log('Cover image deleted successfully from event-covers bucket:', filePath);
      return { success: true }

    } catch (error) {
      console.error('Error in cover image deletion:', error);
      return { success: false, error: 'Failed to delete image' }
    }
  }

  /**
   * Get all cover images from the bucket (for debugging)
   */
  static async listCoverImages(): Promise<{ data: any[] | null; error: any }> {
    const supabase = createClient()
    
    try {
      // List files from event-covers bucket
      const { data, error } = await supabase.storage
        .from('event-covers')
        .list();

      return { data, error }
    } catch (error) {
      console.error('Error listing cover images:', error);
      return { data: null, error }
    }
  }
}
