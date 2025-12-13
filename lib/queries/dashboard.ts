// lib/queries/dashboard.ts
import { createClient } from '@/utils/supabase/server'
import { convertDatabaseEventToFrontend, type Event } from '@/types/event'

/**
 * Get comprehensive dashboard statistics for a user
 */
export async function getDashboardStats(userId: string) {
  const supabase = await createClient()
  
  // Get all user's events
  const { data: events } = await supabase
    .from('events')
    .select('id, is_active, is_public')
    .eq('created_by', userId)
  
  const eventIds = events?.map(e => e.id) || []
  
  if (eventIds.length === 0) {
    return {
      totalEvents: 0,
      activeEvents: 0,
      publicEvents: 0,
      totalPhotos: 0,
      approvedPhotos: 0,
      pendingPhotos: 0,
      totalViews: 0,
      recentActivity: []
    }
  }
  
  // Get photo statistics
  const { data: uploads } = await supabase
    .from('uploads')
    .select('id, status, created_at')
    .in('event_id', eventIds)
  
  const approvedPhotos = uploads?.filter(u => u.status === 'approved').length || 0
  const pendingPhotos = uploads?.filter(u => u.status === 'pending').length || 0
  
  return {
    totalEvents: events?.length || 0,
    activeEvents: events?.filter(e => e.is_active).length || 0,
    publicEvents: events?.filter(e => e.is_public).length || 0,
    totalPhotos: uploads?.length || 0,
    approvedPhotos,
    pendingPhotos,
    totalViews: 0, // Can be implemented later with view tracking
    recentActivity: uploads
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || []
  }
}

/**
 * Get user's events with photo counts
 */
export async function getUserEventsWithStats(userId: string): Promise<Event[]> {
  const supabase = await createClient()
  
  // Keep selection minimal to avoid schema mismatches
  const { data: events, error } = await supabase
    .from('events')
    .select('id,title,description,event_date,event_time,location,cover_image_url,is_active,is_public,created_at,created_by,category_id,custom_category')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) {
    // Log a more helpful error payload
    console.error('Error fetching user events:', {
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
    })
    return []
  }
  
  // Convert database events to frontend shape expected by UI
  const frontendEvents: Event[] = (events || []).map(e => convertDatabaseEventToFrontend(e as any))
  return frontendEvents
}

/**
 * Get recent uploads across all user's events
 */
export async function getRecentUploads(userId: string, limit = 5) {
  const supabase = await createClient()
  
  // First get user's event IDs
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('created_by', userId)
  
  const eventIds = events?.map(e => e.id) || []
  
  if (eventIds.length === 0) return []
  
  // Get recent uploads
  const { data: uploads } = await supabase
    .from('uploads')
    .select(`
      id,
      image_url,
      caption,
      uploaded_by,
      status,
      created_at,
      event_id
    `)
    .in('event_id', eventIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  // Fetch event titles for each upload
  const uploadsWithEvents = await Promise.all(
    (uploads || []).map(async (upload) => {
      const { data: event } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', upload.event_id)
        .single()
      
      return {
        ...upload,
        event: event
      }
    })
  )
  
  return uploadsWithEvents || []
}
