import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EventGallery } from '@/components/events/event-gallery'

interface PageProps {
  params: Promise<{  // ← params is now a Promise
    code: string
  }>
}

export default async function EventPage({ params }: PageProps) {
  // AWAIT the params promise
  const { code } = await params
  
  const supabase = await createClient()
  
  console.log('Looking for event with code:', code)

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const userId = user?.id

  console.log('User data:', user)
  console.log('User ID:', userId)
  console.log('Is user logged in?', !!userId)
  
  // Try to find event by code first, then by event ID if code looks like a UUID
  let eventCode
  let error
  
  // Check if the code is a UUID format (try as event ID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (uuidRegex.test(code)) {
    // Try to get the event directly by event ID
    const { data, error: directError } = await supabase
      .from('event_codes')
      .select(`
        *,
        events (*)
      `)
      .eq('event_id', code)
      .single()
    
    eventCode = data
    error = directError
    
    if (error) {
      console.log('Not found by event ID, trying as code...')
      // Fall back to searching by code
      const { data: codeData, error: codeError } = await supabase
        .from('event_codes')
        .select(`
          *,
          events (*)
        `)
        .eq('code', code)
        .single()
      
      eventCode = codeData
      error = codeError
    }
  } else {
    // Standard code lookup
    const { data, error: codeError } = await supabase
      .from('event_codes')
      .select(`
        *,
        events (*)
      `)
      .eq('code', code)
      .single()
    
    eventCode = data
    error = codeError
  }

  console.log('Query result:', { eventCode, error })

  if (error) {
    console.log('Database error:', error)
    notFound()
  }

  if (!eventCode || !eventCode.events) {
    console.log('No event found or event is null')
    notFound()
  }

  const event = eventCode.events
  const qrCodeUrl = eventCode.qr_code_url 
  console.log('Found event:', event.title)
  console.log('Event created by:', event.created_by)
  
  // Check if user is logged in
  const isLoggedIn = !!userId

  // Check if current user is the event owner (admin)
  const isAdmin = userId && event.created_by === userId ? true : false
  
  console.log('User is logged in?', isLoggedIn, '(User:', userId, ')')
  console.log('User is admin/owner?', isAdmin, '(User:', userId, 'Creator:', event.created_by, ')')

  // Check if event is active and public
  if (!event.is_active || !event.is_public) {
    // If user is admin/owner, still show the event but with a warning
    if (isAdmin) {
      console.log('Owner viewing inactive/private event')
    } else {
      console.log('Event not available - active:', event.is_active, 'public:', event.is_public)
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚫</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Available</h1>
            <p className="text-gray-600">
              This event is not currently available to the public.
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded text-left">
              <p className="text-sm">Event: {event.title}</p>
              <p className="text-xs">Active: {event.is_active ? 'Yes' : 'No'}</p>
              <p className="text-xs">Public: {event.is_public ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )
    }
  }

  console.log('Rendering event gallery for:', event.title)
  return <EventGallery event={event} eventCode={code} isLoggedIn={isLoggedIn} isAdmin={isAdmin} qrCodeUrl={qrCodeUrl} />
}
