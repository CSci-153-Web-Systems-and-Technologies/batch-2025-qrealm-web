'use client'

import { Event } from '@/types'

interface EventGalleryProps {
  event: Event
  eventCode: string
}

export function EventGallery({ event, eventCode }: EventGalleryProps) {
  // Use the default PNG placeholder if no cover image is provided
  const coverImageUrl = event.cover_image_url 
    ? event.cover_image_url 
    : 'https://placehold.net/default.png';

  console.log('Event Gallery Debug:', {
    eventId: event.id,
    hasCoverImage: !!event.cover_image_url,
    coverImageUrl: coverImageUrl,
    coverImageType: typeof event.cover_image_url
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Cover Image Section */}
          <div className="mb-6 -mx-6 -mt-6">
            <img 
              src={coverImageUrl} 
              alt={`Cover image for ${event.title}`}
              className="w-full h-64 object-cover rounded-t-lg"
              onError={(e) => {
                console.error('Image failed to load:', coverImageUrl);
                // Fallback to a different placeholder if needed
                e.currentTarget.src = 'https://placehold.co/800x400?text=Event+Cover6';
              }}
              onLoad={() => console.log('Image loaded successfully:', coverImageUrl)}
            />
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              
              {event.description && (
                <p className="text-gray-600 mb-4">{event.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {event.organizer && (
                  <div>
                    <span className="font-semibold">Organized by:</span>
                    <p className="text-gray-600">{event.organizer}</p>
                  </div>
                )}
                
                {event.location && (
                  <div>
                    <span className="font-semibold">Location:</span>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                )}
                
                {event.event_date && (
                  <div>
                    <span className="font-semibold">Date:</span>
                    <p className="text-gray-600">
                      {new Date(event.event_date).toLocaleDateString()}
                      {event.event_time && ` at ${event.event_time}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        {event.allow_photo_upload && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Share Your Photos</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Event Photos
                </h3>
                <p className="text-gray-500 mb-4">
                  Share your memories from this event. Photos will be reviewed before appearing in the gallery.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Upload Photos
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  Maximum {event.max_photos} photos per event
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Photo Gallery Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Event Gallery</h2>
          
          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🖼️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No photos yet
            </h3>
            <p className="text-gray-500">
              {event.allow_photo_upload 
                ? "Be the first to share photos from this event!"
                : "Photo uploads are not enabled for this event."
              }
            </p>
          </div>

          {/* Future: Photo grid will go here */}
          {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map(photo => (
              <img key={photo.id} src={photo.url} alt="" className="rounded-lg" />
            ))}
          </div> */}
        </div>

        {/* Event Info Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Event Code: {eventCode}</p>
          <p className="mt-1">
            Scanned this QR code? Welcome to {event.title}!
          </p>
        </div>
      </div>
    </div>
  )
}