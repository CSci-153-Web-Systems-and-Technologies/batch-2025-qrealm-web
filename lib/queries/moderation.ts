import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import type { Upload } from '@/types/upload'

export interface ModerationUpload extends Upload {
  event?: {
    id: string
    title: string
    organizer: string | null
    location: string | null
    event_date?: string | null
    created_by: string
  }
}

export interface ModerationStats {
  totalPending: number
  totalApproved: number
  totalEvents: number
}

const GUEST_BUCKET = 'guest-uploads'

export async function getUserEventPendingUploads(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('uploads')
    .select(
      `
        id,
        event_id,
        image_url,
        uploaded_by,
        caption,
        status,
        approved_by,
        ip_address,
        created_at,
        updated_at,
        event:events!inner (
          id,
          title,
          organizer,
          location,
          event_date,
          created_by
        )
      `
    )
    .eq('status', 'pending')
    .eq('events.created_by', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Moderation] Error fetching pending uploads:', error)
    return [] as ModerationUpload[]
  }

  // Normalize joined relation: Supabase may return `event` as an array
  const normalized = (data || []).map((row: any) => ({
    ...row,
    event: Array.isArray(row.event) ? row.event[0] : row.event,
  })) as ModerationUpload[]

  // Filter out uploads with invalid/test URLs
  return normalized.filter((upload) => {
    if (!upload.image_url) return false
    // Only allow valid URLs (Supabase storage or https)
    return upload.image_url.startsWith('http://') || upload.image_url.startsWith('https://')
  })
}

export async function approveUpload(uploadId: string, userId: string) {
  const supabase = await createClient()
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Service role key missing on server')
  }

  const { data: upload, error: fetchError } = await supabase
    .from('uploads')
    .select(
      `
        id,
        event_id,
        status,
        event:events!inner (created_by)
      `
    )
    .eq('id', uploadId)
    .single()

  if (fetchError || !upload) {
    console.error('[Moderation] Upload not found or fetch error:', fetchError)
    throw new Error('Upload not found')
  }

  // In some Supabase typings, joined relation may appear as an array. Normalize it.
  const eventOwnerId = Array.isArray((upload as any).event)
    ? (upload as any).event[0]?.created_by
    : (upload as any).event?.created_by

  if (eventOwnerId !== userId) {
    throw new Error('Unauthorized: You do not own this event')
  }

  if ((upload as any).status && (upload as any).status !== 'pending') {
    throw new Error(`Upload already moderated (status=${(upload as any).status})`)
  }

  const { data: updatedRows, error: updateError } = await admin
    .from('uploads')
    .update({
      status: 'approved',
      approved_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', uploadId)
    .select('id, status')

  if (updateError) {
    console.error('[Moderation] Error approving upload:', updateError)
    throw updateError
  }

  if (!updatedRows || updatedRows.length === 0) {
    throw new Error(
      `Approve failed: RLS blocked or no rows updated (user=${userId}, owner=${eventOwnerId}, status=${(upload as any).status || 'unknown'})`
    )
  }

  return { success: true }
}

export async function rejectUpload(uploadId: string, userId: string) {
  const supabase = await createClient()
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Service role key missing on server')
  }

  const { data: upload, error: fetchError } = await supabase
    .from('uploads')
    .select(
      `
        id,
        image_url,
        event:events!inner (created_by)
      `
    )
    .eq('id', uploadId)
    .single()

  if (fetchError || !upload) {
    console.error('[Moderation] Upload not found or fetch error:', fetchError)
    throw new Error('Upload not found')
  }

  const eventOwnerId = Array.isArray((upload as any).event)
    ? (upload as any).event[0]?.created_by
    : (upload as any).event?.created_by

  if (eventOwnerId !== userId) {
    throw new Error('Unauthorized: You do not own this event')
  }

  if (upload.image_url) {
    const urlParts = upload.image_url.split('/')
    const bucketIndex = urlParts.indexOf(GUEST_BUCKET)
    if (bucketIndex !== -1) {
      const path = urlParts.slice(bucketIndex + 1).join('/')
      if (path) {
        const { error: removeError } = await supabase.storage
          .from(GUEST_BUCKET)
          .remove([path])

        if (removeError) {
          console.error('[Moderation] Error deleting storage object:', removeError)
        }
      }
    }
  }

  const { data: deletedRows, error: deleteError } = await admin
    .from('uploads')
    .delete()
    .eq('id', uploadId)
    .select('id')

  if (deleteError) {
    console.error('[Moderation] Error deleting upload row:', deleteError)
    throw deleteError
  }

  if (!deletedRows || deletedRows.length === 0) {
    throw new Error(
      `Reject failed: RLS blocked or no rows deleted (user=${userId}, owner=${eventOwnerId}, status=${(upload as any).status || 'unknown'})`
    )
  }

  return { success: true }
}

export async function getModerationStats(userId: string): Promise<ModerationStats> {
  const supabase = await createClient()

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .eq('created_by', userId)

  if (eventsError) {
    console.error('[Moderation] Error fetching user events for stats:', eventsError)
    return { totalPending: 0, totalApproved: 0, totalEvents: 0 }
  }

  if (!events || events.length === 0) {
    return { totalPending: 0, totalApproved: 0, totalEvents: 0 }
  }

  const eventIds = events.map((event) => event.id)

  const { count: pendingCount, error: pendingError } = await supabase
    .from('uploads')
    .select('*', { count: 'exact', head: true })
    .in('event_id', eventIds)
    .eq('status', 'pending')

  if (pendingError) {
    console.error('[Moderation] Error counting pending uploads:', pendingError)
  }

  const { count: approvedCount, error: approvedError } = await supabase
    .from('uploads')
    .select('*', { count: 'exact', head: true })
    .in('event_id', eventIds)
    .eq('status', 'approved')

  if (approvedError) {
    console.error('[Moderation] Error counting approved uploads:', approvedError)
  }

  return {
    totalPending: pendingCount || 0,
    totalApproved: approvedCount || 0,
    totalEvents: events.length,
  }
}
