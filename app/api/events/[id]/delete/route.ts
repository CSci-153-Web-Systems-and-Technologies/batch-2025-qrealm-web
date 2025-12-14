import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: eventId } = await params

    // 1. Verify ownership
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, created_by, cover_image_url')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this event' },
        { status: 403 }
      )
    }

    // 2. Get all uploads for this event (to delete from storage)
    const { data: uploads } = await supabase
      .from('uploads')
      .select('image_url')
      .eq('event_id', eventId)

    // 3. Delete photos from storage
    if (uploads && uploads.length > 0) {
      const filePaths = uploads
        .map(upload => {
          if (upload.image_url) {
            // Extract path from URL
            // Format: https://...supabase.co/storage/v1/object/public/event-photos/EVENT_ID/FILENAME
            const url = new URL(upload.image_url)
            const pathParts = url.pathname.split('/')
            const bucketIndex = pathParts.findIndex(p => p === 'event-photos')
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              // Get everything after 'event-photos/'
              return pathParts.slice(bucketIndex + 1).join('/')
            }
          }
          return null
        })
        .filter(Boolean) as string[]

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('event-photos')
          .remove(filePaths)

        if (storageError) {
          console.error('Error deleting photos from storage:', storageError)
          // Continue anyway - we'll delete the records
        }
      }
    }

    // 4. Delete cover image if exists
    if (event.cover_image_url) {
      try {
        const url = new URL(event.cover_image_url)
        const pathParts = url.pathname.split('/')
        const bucketIndex = pathParts.findIndex(p => p === 'event-photos')
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const coverPath = pathParts.slice(bucketIndex + 1).join('/')
          await supabase.storage
            .from('event-photos')
            .remove([coverPath])
        }
      } catch (err) {
        console.error('Error deleting cover image:', err)
      }
    }

    // 5. Delete the event (CASCADE will delete uploads, event_codes, etc.)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (deleteError) {
      console.error('Error deleting event:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
