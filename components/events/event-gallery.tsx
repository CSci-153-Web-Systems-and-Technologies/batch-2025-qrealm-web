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
  Clock,
  Image as ImageIcon,
  ChevronLeft,
  Share2,
  QrCode,
  EyeOff,
  Edit,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QRModal } from '@/components/events/qr-modal'
import { createClient } from '@/utils/supabase/client'

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
  qrCodeUrl?: string
}

export function EventGallery({ event, eventCode, isAdmin = false, qrCodeUrl }: EventGalleryProps) {
  const router = useRouter()
  const supabase = createClient()
  const coverImage = useEventCover(event.cover_image_url)
  const [activeTab, setActiveTab] = useState('gallery')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [storedQrCodeUrl, setStoredQrCodeUrl] = useState<string | undefined>(qrCodeUrl) 
  
  const { eventUploads, fetchEventUploads, isLoading: uploadsLoading } = useUploadStore()
  const { fetchEvent, isLoading: eventLoading } = useEventStore()
  
  const uploads = eventUploads[event.id] || []
  const isLoading = uploadsLoading || eventLoading

  // Fetch event and uploads
  useEffect(() => {
    fetchEventUploads(event.id)
  }, [event.id, fetchEventUploads])

  // Fetch QR code if not provided - FIXED TYPING
  useEffect(() => {
    const fetchQrCode = async () => {
      if (!storedQrCodeUrl) {
        const { data: eventCodeData, error } = await supabase
          .from('event_codes')
          .select('qr_code_url')
          .eq('code', eventCode)
          .single()
        
        if (error) {
          console.error('Error fetching QR code:', error)
          return
        }
        
        // Type assertion to tell TypeScript the structure
        const qrData = eventCodeData as { qr_code_url: string | null }
        
        if (qrData?.qr_code_url) {
          setStoredQrCodeUrl(qrData.qr_code_url)
        }
      }
    }
    
    fetchQrCode()
  }, [eventCode, storedQrCodeUrl, supabase])

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

  const handleEditEvent = () => {
    // Navigate to event edit page
    router.push(`/admin/events/${event.id}/edit`)
  }

  const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Add this function to format time to 12-hour format
const formatTimeTo12Hour = (timeString: string) => {
  if (!timeString) return 'Not specified'
  
  try {
    // Try to parse the time string
    const [hours, minutes] = timeString.split(':').map(Number)
    
    if (isNaN(hours) || isNaN(minutes)) {
      // If parsing fails, return the original string
      return timeString
    }
    
    const period = hours >= 12 ? 'PM' : 'AM'
    const twelveHour = hours % 12 || 12 // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes.toString().padStart(2, '0')
    
    return `${twelveHour}:${formattedMinutes} ${period}`
  } catch (error) {
    // If any error occurs, return the original string
    console.error('Error formatting time:', error)
    return timeString
  }
}

// Alternative: More robust version that handles various time formats
const formatTimeTo12HourAdvanced = (timeString: string) => {
  if (!timeString) return 'Not specified'
  
  // Remove any whitespace and convert to uppercase for consistency
  const cleanTime = timeString.trim().toUpperCase()
  
  // Check if already in 12-hour format with AM/PM
  if (cleanTime.includes('AM') || cleanTime.includes('PM')) {
    return cleanTime
  }
  
  // Try to parse as HH:MM or HH:MM:SS
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  const match = cleanTime.match(timeRegex)
  
  if (!match) {
    // Return as-is if doesn't match expected format
    return timeString
  }
  
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  // const seconds = match[3] // Ignore seconds for display
  
  const period = hours >= 12 ? 'PM' : 'AM'
  
  // Convert to 12-hour format
  hours = hours % 12 || 12 // 0 becomes 12
  
  return `${hours}:${minutes} ${period}`
}

// Choose which version to use
const formatTime = formatTimeTo12HourAdvanced
  

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, string> = {
      Academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Academics: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Sports: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Arts: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
      Music: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Theater: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
      Cultural: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Community: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Fundraiser: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Field Trip': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      Assembly: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Graduation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      Holiday: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      Other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      General: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Add QR Modal */}
        <QRModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          eventCode={eventCode}
          eventTitle={event.title}
          qrCodeUrl={storedQrCodeUrl}
        />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Navigation */}
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
                  onClick={() => setShowQRModal(true)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR
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

          {/* Hero Section - Ideal Layout Style */}
          <Card className="mb-8 overflow-hidden border-0 shadow-lg">
            <CardContent className="p-0 ">
              <div className="relative bg-white">
                {/* 16:9 Optimized Cover Image */}
                <img
                  src={coverImage}
                  alt={event.title}
                  className="w-full h-48 md:h-80 object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Event Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex gap-2 mb-3">
                    <Badge className={getCategoryColor(event.category)} variant="secondary">
                      {event.category}
                    </Badge>
                    {!event.is_public && (
                      <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {event.title}
                  </h1>
                  
                  {event.description && (
                    <p className="text-lg opacity-90 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Details Grid - Ideal Layout Structure */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Main Event Details (2/3 width) */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {event.event_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                    )}
                    
                    {event.event_time && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{formatTime(event.event_time)}</span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                    
                    {event.organizer && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{event.organizer}</span>
                      </div>
                    )}
                  </div>
                  
                  {uploads.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <Camera className="h-4 w-4 inline mr-1" />
                        {uploads.length} photo{uploads.length !== 1 ? 's' : ''} uploaded
                        {event.max_photos && ` of ${event.max_photos} maximum`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar (1/3 width) */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.allow_photo_upload && (
                    <Button 
                      className="w-full gap-2"
                      onClick={() => setActiveTab('upload')}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photos
                    </Button>
                  )}
                  
                  {uploads.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setActiveTab('gallery')}
                    >
                      <Camera className="h-4 w-4" />
                      View Gallery ({uploads.length})
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode className="h-4 w-4" />
                    Show QR Code
                  </Button>
                  
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={handleEditEvent}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Event
                    </Button>
                  )}
                  
                  {/* Status Indicator */}
                  {event.allow_photo_upload ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Uploads Open</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Photos can be uploaded and viewed
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <EyeOff className="h-4 w-4" />
                        <span className="text-sm font-medium">Uploads Closed</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gallery is view-only
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs Section - Keep Your Existing Structure */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Details
              </TabsTrigger>
            </TabsList>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-6">
              {uploads.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Event Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotoGallery 
                      uploads={uploads}
                      isLoading={isLoading}
                      emptyMessage="No photos yet. Be the first to share!"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
                    <p className="text-gray-600 mb-6">
                      {event.allow_photo_upload 
                        ? "Be the first to share your memories from this event!"
                        : "Photo uploads are not enabled for this event."}
                    </p>
                    {event.allow_photo_upload && (
                      <Button onClick={() => setActiveTab('upload')}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photos
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

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
                          Share your favorite moments from {event.title}
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
                            Drag & drop or select files
                          </p>
                        </div>
                        
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-lg">👤</span>
                          </div>
                          <h4 className="font-medium mb-1">Anonymous Option</h4>
                          <p className="text-sm text-gray-500">
                            Upload without sharing name
                          </p>
                        </div>
                        
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-lg">🛡️</span>
                          </div>
                          <h4 className="font-medium mb-1">Safe & Secure</h4>
                          <p className="text-sm text-gray-500">
                            All photos are reviewed
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
                  <CardTitle>Complete Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Category</h4>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Organizer</h4>
                        <p className="text-lg">{event.organizer || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Location</h4>
                        <p className="text-lg">{event.location || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Expected Attendees</h4>
                        <p className="text-lg">{event.expected_attendees || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Date</h4>
                        <p className="text-lg">
                          {event.event_date ? formatDate(event.event_date) : 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Time</h4>
                        <p className="text-lg">{event.event_time ? formatTime(event.event_time) : 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Event Code</h4>
                        <p className="text-lg font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                          {eventCode}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Visibility</h4>
                        <Badge variant={event.is_public ? "default" : "secondary"}>
                          {event.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Upload Settings</h4>
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
                        <p className="text-sm text-gray-500">Photos Uploaded</p>
                        <p className="font-medium">{uploads.length}</p>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-sm">
                          {event.created_at 
                            ? new Date(event.created_at).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
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
            <p>Powered by QRealm • Share memories, no account needed</p>
          </div>
        </div>
      </div>
    </div>
  )
}