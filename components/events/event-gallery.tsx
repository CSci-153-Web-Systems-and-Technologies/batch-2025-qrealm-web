'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Event } from '@/types'
import { useEventCover } from '@/hooks/use-placeholder-image'
import { useUploadStore } from '@/stores/upload-store'
import { useEventStore } from '@/stores/event-store'
import { 
  GuestUploadForm,
  PhotoGallery 
} from '@/components/events/upload'

import { 
  Camera, 
  Upload, 
  Users, 
  Calendar, 
  MapPin, 
  Image as ImageIcon,
  ChevronLeft,
  Share2,
  QrCode,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { QRCodeDisplay } from './qr-code-display'
import { TabsProps } from '@radix-ui/react-tabs'

// Dynamically import Tabs to avoid hydration mismatch
const Tabs = dynamic(
  () => import('@/components/ui/tabs').then(mod => mod.Tabs),
  { ssr: false }
)
const TabsList = dynamic(
  () => import('@/components/ui/tabs').then(mod => mod.TabsList),
  { ssr: false }
)
const TabsTrigger = dynamic(
  () => import('@/components/ui/tabs').then(mod => mod.TabsTrigger),
  { ssr: false }
)
const TabsContent = dynamic(
  () => import('@/components/ui/tabs').then(mod => mod.TabsContent),
  { ssr: false }
)


interface EventGalleryProps {
  event: Event
  eventCode: string
  isAdmin?: boolean
}

export function EventGallery({ event, eventCode, isAdmin = false }: EventGalleryProps) {
  const router = useRouter()
  const coverImage = useEventCover(event.cover_image_url)
  const [activeTab, setActiveTab] = useState('gallery')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  
  const { eventUploads, fetchEventUploads, isLoading: uploadsLoading } = useUploadStore()
  const { fetchEvent, isLoading: eventLoading } = useEventStore()
  
  const uploads = eventUploads[event.id] || []
  const isLoading = uploadsLoading || eventLoading

  // Fetch event and uploads
  useEffect(() => {
    fetchEventUploads(event.id)
  }, [event.id, fetchEventUploads])

  const handleUploadComplete = () => {
    fetchEventUploads(event.id)
    setShowUploadForm(false)
  }

  const handleRefresh = () => {
    fetchEventUploads(event.id)
    fetchEvent(event.id)
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `Photos from ${event.title}`,
        text: `Check out photos from ${event.title}!`,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Event link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setShowQRCode(!showQRCode)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQRCode ? 'Hide QR' : 'Show QR'}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="mb-6">
            <QRCodeDisplay
              qrCodeUrl={`${process.env.NEXT_PUBLIC_APP_URL}/event/${eventCode}`}
              eventCode={eventCode}
              eventTitle={event.title}
            />
          </div>
        )}

        {/* Event Header Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <img
              src={coverImage}
              alt={`Cover for ${event.title}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Event Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm">
                    {event.category}
                  </Badge>
                  {!event.is_public && (
                    <Badge variant="outline" className="bg-black/50">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {event.title}
                </h1>
                
                {event.description && (
                  <p className="text-lg text-gray-200 mb-6 max-w-3xl">
                    {event.description}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {event.organizer && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-300">Organized by</p>
                        <p className="font-medium">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-300">Location</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.event_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-gray-300">Date & Time</p>
                        <p className="font-medium">
                          {formatDate(event.event_date)}
                          {event.event_time && ` at ${event.event_time}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{uploads.length}</div>
                <p className="text-sm text-gray-600">Photos Shared</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{event.max_photos}</div>
                <p className="text-sm text-gray-600">Max Allowed</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {event.expected_attendees || 'N/A'}
                </div>
                <p className="text-sm text-gray-600">Expected Guests</p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {event.allow_photo_upload ? 'Open' : 'Closed'}
                </div>
                <p className="text-sm text-gray-600">Upload Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photo Gallery
            </TabsTrigger>
            
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Photos
            </TabsTrigger>
            
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Info
            </TabsTrigger>
            
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Event
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Event Photos</h2>
                <p className="text-gray-600">
                  Browse photos shared by event attendees
                </p>
              </div>
              
              {event.allow_photo_upload && !showUploadForm && (
                <Button onClick={() => setActiveTab('upload')}>
                  <Camera className="h-4 w-4 mr-2" />
                  Add Your Photos
                </Button>
              )}
            </div>
            
            <PhotoGallery 
              uploads={uploads}
              isLoading={isLoading}
              emptyMessage={event.allow_photo_upload 
                ? "No photos yet. Be the first to share your memories!" 
                : "Photo uploads are not enabled for this event."
              }
            />
          </TabsContent>

          {/* Upload Tab */}
          {/* Upload Tab */}
          <TabsContent value="upload">
            {event.allow_photo_upload ? (
              showUploadForm ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Upload Photos</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowUploadForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <GuestUploadForm
                      eventId={event.id}
                      eventTitle={event.title}
                      onUploadComplete={handleUploadComplete}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Share Your Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Upload Your Photos
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Share your favorite moments from {event.title}. 
                        Photos will be reviewed before appearing in the gallery.
                      </p>
                      <Button 
                        size="lg" 
                        onClick={() => setShowUploadForm(true)}
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Start Uploading
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lg">✅</span>
                        </div>
                        <h4 className="font-medium mb-1">Easy Upload</h4>
                        <p className="text-sm text-gray-500">
                          Drag & drop or select from your device
                        </p>
                      </div>
                      
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lg">👤</span>
                        </div>
                        <h4 className="font-medium mb-1">Anonymous Option</h4>
                        <p className="text-sm text-gray-500">
                          Upload without sharing your name
                        </p>
                      </div>
                      
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-lg">🛡️</span>
                        </div>
                        <h4 className="font-medium mb-1">Safe & Secure</h4>
                        <p className="text-sm text-gray-500">
                          All photos are reviewed before publishing
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeOff className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Photo Uploads Disabled
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    The event organizer has disabled photo uploads for this event.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Category</h4>
                      <p className="text-lg">{event.category}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Organizer</h4>
                      <p className="text-lg">{event.organizer || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Location</h4>
                      <p className="text-lg">{event.location || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Date</h4>
                      <p className="text-lg">
                        {event.event_date 
                          ? formatDate(event.event_date)
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Time</h4>
                      <p className="text-lg">{event.event_time || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-1">Event Code</h4>
                      <p className="text-lg font-mono">{eventCode}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">Upload Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">
                        {event.allow_photo_upload ? 'Open' : 'Closed'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Max Photos</p>
                      <p className="font-medium">{event.max_photos}</p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Visibility</p>
                      <p className="font-medium">
                        {event.is_public ? 'Public' : 'Private'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">
                        {event.created_at 
                          ? new Date(event.created_at).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Share Tab */}
          <TabsContent value="share">
            <Card>
              <CardHeader>
                <CardTitle>Share This Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Share2 className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Invite Others to Share
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Share this event with friends and family so they can 
                    upload their photos too!
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button size="lg" onClick={handleShare}>
                      <Share2 className="h-5 w-5 mr-2" />
                      Copy Event Link
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setShowQRCode(true)}
                      >
                        <QrCode className="h-5 w-5 mr-2" />
                        Show QR Code
                      </Button>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Share via...</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-16">
                      <span className="text-2xl mr-2">📱</span>
                      Text
                    </Button>
                    
                    <Button variant="outline" className="h-16">
                      <span className="text-2xl mr-2">📧</span>
                      Email
                    </Button>
                    
                    <Button variant="outline" className="h-16">
                      <span className="text-2xl mr-2">💬</span>
                      WhatsApp
                    </Button>
                    
                    <Button variant="outline" className="h-16">
                      <span className="text-2xl mr-2">📘</span>
                      Facebook
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
          <p className="mb-2">
            Event Code: <span className="font-mono font-medium">{eventCode}</span>
          </p>
          <p>
            Powered by QRealm • Share memories, no account needed
          </p>
        </div>
      </div>
    </div>
  )
}

