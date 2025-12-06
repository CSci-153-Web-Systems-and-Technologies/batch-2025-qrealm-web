import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
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

  const QRDisplay = QRCodeDisplay as any

  return (
    <div className="container mx-auto py-8">
      {/* Simple header only */}
      <div className="flex items-center !gap-4 !mb-6 !p-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* QR Code Display handles everything */}
      {qrCode ? (
        <QRDisplay
          qrCodeUrl={qrCode.qr_code_url!}
          eventCode={qrCode.code}
          eventTitle={event.title}
          eventData={{
            description: event.description,
            date: event.event_date ? new Date(event.event_date).toLocaleDateString() : '',
            time: event.event_time || '',
            location: event.location || '',
            organizer: event.organizer || '',
            cover_image_url: event.cover_image_url || '',
            allow_photo_upload: event.allow_photo_upload,
            max_photos: event.max_photos,
            is_public: event.is_public,
            expected_attendees: event.expected_attendees,
            id: event.id,
            photosCount: event.photos_count,
            // Add other fields as needed
          }}
        />
      ) : (
        <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
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
  )
}