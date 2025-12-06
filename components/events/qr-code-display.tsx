'use client'

import { useState, useEffect } from 'react'
import { Download, QrCode, Calendar, MapPin, Users, Copy, Share2, Printer, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEventCover } from '@/hooks/use-placeholder-image'
import { useUploadStore } from '@/stores/upload-store'


interface QRCodeDisplayProps {
  qrCodeUrl: string
  eventCode: string
  eventTitle: string
  eventData?: {
    id?: string
    description?: string
    date?: string  
    time?: string  
    location?: string
    organizer?: string
    cover_image_url?: string  
    allow_photo_upload?: boolean  
    max_photos?: number          
    is_public?: boolean          
    photosCount?: number
    expected_attendees?: number
    // status?: 'live' | 'scheduled' | 'ended' | 'draft' // Status feature soon
  }
}

export function QRCodeDisplay({ qrCodeUrl, eventCode, eventTitle, eventData = {} }: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

   const coverImage = useEventCover(eventData?.cover_image_url || '')

   const eventId = eventData?.id || ''

   const { eventUploads, fetchEventUploads } = useUploadStore()

   useEffect(() => {
    if (eventId) {
      console.log('QRDisplay: Fetching uploads for event ID:', eventId)
      fetchEventUploads(eventId)
    }
  }, [eventId, fetchEventUploads])

   const uploads = eventData?.id ? (eventUploads[eventData.id] || []) : []

   // Debug logging - fix placement
  console.log("QR Code Display rendered with:", {
  eventTitle,
  eventCode,
  hasCoverImage: !!eventData?.cover_image_url,
  coverImageUrl: eventData?.cover_image_url
})

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Format date function similar to event-gallery.tsx
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `qrealm-${eventCode}-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const copyQRLink = () => {
    const eventUrl = `${window.location.origin}/event/${eventCode}`;
    navigator.clipboard.writeText(eventUrl);
    // You can add a toast notification here if you have it set up
    alert('Event link copied to clipboard!');
  };

  const shareQRCode = () => {
    if (navigator.share) {
      navigator.share({
        title: `QR Code for ${eventTitle}`,
        text: `Scan this QR code to upload photos to ${eventTitle}`,
        url: `${window.location.origin}/event/${eventCode}`
      }).catch(() => {
        // Fallback to copy if share fails
        copyQRLink();
      });
    } else {
      copyQRLink();
    }
  };

  const printQRCode = () => {
    window.print();
  };

  //console.log("IMAGE URL RECEIVED:", eventData.cover_image_url);

  // Check if we have a cover image
  const hasCoverImage = !!eventData?.cover_image_url;
  
  console.log("Has cover image:", hasCoverImage, "URL:", eventData?.cover_image_url);



  
  

  // Status feature soon
  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'live': return 'bg-green-100 text-green-800';
  //     case 'scheduled': return 'bg-blue-100 text-blue-800';
  //     case 'ended': return 'bg-gray-100 text-gray-800';
  //     case 'draft': return 'bg-yellow-100 text-yellow-800';
  //     default: return 'bg-gray-100 text-gray-800';
  //   }
  // };

  return (
  <div className="max-w-6xl mx-auto p-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <img 
                  src={coverImage} 
                  alt="Preview Image"
                  className="w-50 h-50 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium">{eventTitle}</h3>
                    {/* <Badge className={getStatusColor(eventData.status)}>
                      {eventData.status}
                    </Badge> */}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {eventData.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{eventData.date} at {eventData.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{eventData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{eventData.expected_attendees || 0} expected attendees</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Upload Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Uploads Allowed</span>
                    <p className="font-medium">
                      {eventData.allow_photo_upload ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Photos</span>
                    <p className="font-medium">{eventData.max_photos || 500}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Public Event</span>
                    <p className="font-medium">
                      {eventData.is_public ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Photos</span>
                    <p className="font-medium">
                      {/* ✅ FIXED: Use uploads from store */}
                      {uploads.length}
                      {eventData.max_photos && ` of ${eventData.max_photos}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Event Code</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono font-bold">{eventCode}</code>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Event URL</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm break-all">/event/{eventCode}</code>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Instructions for Attendees</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Print and display this QR code at your event</p>
                  <p>• Guests can scan to access the photo gallery</p>
                  <p>• Scan the QR code with your phone camera</p>
                  <p>• Upload photos directly to the event gallery</p>
                  <p>• Photos are processed automatically</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Display and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Event QR Code
              </CardTitle>
              <CardDescription>
                Scan this code to access the event gallery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="inline-block p-8 bg-white rounded-xl shadow-inner border">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for ${eventTitle}`}
                    className="w-64 h-64 rounded-lg"
                  />
                </div>
              </div>

              {/* QR Code Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={copyQRLink} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" onClick={shareQRCode} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
                <Button variant="outline" onClick={printQRCode} className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">QR Code Formats</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    Download PNG (High Resolution)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    Download SVG (Vector)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    Download PDF (Print Ready)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Print Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create printable flyers with QR codes for your event
              </p>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  A4 Flyer Template
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Table Tent Template
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Business Card Template
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                <p>Templates include event details and QR code for easy printing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}

// removed accidental stubbed useEffect implementation
