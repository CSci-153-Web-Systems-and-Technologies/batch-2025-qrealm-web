import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { QRCodeDisplay } from "@/components/events/qr-code-display"
import { Button } from "@/components/ui/button"
import { EventDetailRefreshButton } from "@/components/events/event-detail-refresh-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import EventDeleteButton from "./event-delete-button"

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get event with QR code
  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      event_codes (*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const qrCode = event.event_codes?.[0];

  // Get photo count
  const { count: photoCount } = await supabase
    .from('uploads')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  const QRDisplay = QRCodeDisplay as any;

  return (
    <div className="!container !mx-auto !py-8 relative">
      {/* QR Code Display handles everything */}
      {qrCode ? (
        <QRDisplay
          qrCodeUrl={qrCode.qr_code_url!}
          eventCode={qrCode.code}
          eventTitle={event.title}
          eventData={{
            description: event.description,
            date: event.event_date
              ? new Date(event.event_date).toLocaleDateString()
              : "",
            time: event.event_time || "",
            location: event.location || "",
            organizer: event.organizer || "",
            cover_image_url: event.cover_image_url || "",
            allow_photo_upload: event.allow_photo_upload,
            max_photos: event.max_photos,
            is_public: event.is_public,
            expected_attendees: event.expected_attendees,
            id: event.id,
            photosCount: event.photos_count,
            // Add other fields as needed
          }}
          deleteButton={
            <EventDeleteButton 
              eventId={event.id}
              eventTitle={event.title}
              photoCount={photoCount || 0}
            />
          }
        />
      ) : (
        <div className="max-w-md mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">QR code is being generated...</p>
          <EventDetailRefreshButton />
        </div>
      )}
    </div>
  );
}
