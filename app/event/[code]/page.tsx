import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EventGallery } from '@/components/events/event-gallery'

interface PageProps {
  params: Promise<{  // ← params is now a Promise
    code: string
  }>
}

export default async function EventPage({ params }: PageProps) {
  // ✅ AWAIT the params promise
  const { code } = await params
  
  const supabase = await createClient()
  
  console.log('🔍 Looking for event with code:', code)
  
  // Find event by code
  const { data: eventCode, error } = await supabase
    .from('event_codes')
    .select(`
      *,
      events (*)
    `)
    .eq('code', code)
    .single()

  console.log('🔍 Query result:', { eventCode, error })

  if (error) {
    console.log('🔍 Database error:', error)
    notFound()
  }

  if (!eventCode || !eventCode.events) {
    console.log('🔍 No event found or event is null')
    notFound()
  }

  const event = eventCode.events
  console.log('🔍 Found event:', event.title)

  // Check if event is active and public
  if (!event.is_active || !event.is_public) {
    console.log('🔍 Event not available - active:', event.is_active, 'public:', event.is_public)
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

  console.log('🎉 Rendering event gallery for:', event.title)
  return <EventGallery event={event} eventCode={code} />
}

// ✅ Optional: Generate static params for testing (this also needs await)
export async function generateStaticParams() {
  return [
    { code: 'test123' },
    { code: 'abc456' }
  ]
}