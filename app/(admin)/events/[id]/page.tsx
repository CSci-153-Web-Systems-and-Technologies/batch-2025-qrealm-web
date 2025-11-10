import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { QRCodeDisplay } from '@/components/events/qr-code-display'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get event with QR code
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      event_codes (*)
    `)
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  const qrCode = event.event_codes?.[0]

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-gray-600">Event created successfully!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Title:</span>
                <p className="text-gray-600">{event.title}</p>
              </div>
              {event.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              )}
              {event.organizer && (
                <div>
                  <span className="font-medium">Organizer:</span>
                  <p className="text-gray-600">{event.organizer}</p>
                </div>
              )}
              {event.location && (
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              )}
              {event.event_date && (
                <div>
                  <span className="font-medium">Date:</span>
                  <p className="text-gray-600">
                    {new Date(event.event_date).toLocaleDateString()}
                    {event.event_time && ` at ${event.event_time}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div>
          {qrCode ? (
            <QRCodeDisplay
              qrCodeUrl={qrCode.qr_code_url!}
              eventCode={qrCode.code}
              eventTitle={event.title}
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">QR code is being generated...</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-2"
              >
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}