import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { EventGallery } from '@/components/events/event-gallery'

interface PageProps {
  params: Promise<{
    code: string
  }>
}

export default async function PublicEventPage({ params }: PageProps) {
  const { code } = await params
  const supabase = await createClient()

  // Find event by code (not ID)
  const { data: eventCode, error: codeError } = await supabase
    .from('event_codes')
    .select(`
      *,
      events (*)
    `)
    .eq('code', code)
    .single()

  if (codeError || !eventCode || !eventCode.events) {
    notFound()
  }

  const event = eventCode.events

  return (
    <EventGallery 
      event={event} 
      eventCode={code} 
    />
  )
}