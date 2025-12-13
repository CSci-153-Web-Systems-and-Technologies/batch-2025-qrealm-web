'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
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
  Share2,
  QrCode,
  EyeOff,
  Edit,
  Shield,
  UserCircle,
  CheckCircle,
  Zap,
  Lock,
  Sparkles,
  ChevronLeft,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QRModal } from '@/components/events/qr-modal'
import { createClient } from '@/utils/supabase/client'
import TopNavbar from '@/components/layout/top-navbar'
import GuestNavbar from '@/components/layout/guest-navbar'

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
  isLoggedIn?: boolean
  isAdmin?: boolean
  qrCodeUrl?: string
}

export function EventGallery({ event, eventCode, isLoggedIn = false, isAdmin = false, qrCodeUrl }: EventGalleryProps) {
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
      {isLoggedIn ? <TopNavbar /> : <GuestNavbar />}
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
          {/* Header Navigation - Show for all logged-in users */}
          {isLoggedIn && (
            <div className="space-y-4 !mb-8">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/discover')}
                  className="flex items-center gap-1 p-0 h-auto hover:bg-transparent hover:text-gray-700 font-normal"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Discover</span>
                </Button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">{event.title}</span>
              </div>

              {/* Page Title and Description */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Event Gallery</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {isAdmin ? 'Manage and moderate event photos' : 'View and share event photos'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-end">
                {isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => setShowQRModal(true)}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR
                  </Button>
                )}

              
              </div>
            </div>
          )}

          {/* {!isLoggedIn && (
            <div className="flex items-center justify-end mb-6">
              
            </div>
          )} */}

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 gap-1 sm:gap-2">
              <TabsTrigger value="gallery" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
                <ImageIcon className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Gallery</span>
                <span className="sm:hidden text-xs">Gallery</span>
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
                <Upload className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Upload</span>
                <span className="sm:hidden text-xs">Upload</span>
              </TabsTrigger>
              
              <TabsTrigger value="info" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
                <Calendar className="h-4 w-4 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Details</span>
                <span className="sm:hidden text-xs">Info</span>
              </TabsTrigger>
            </TabsList>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="space-y-4 sm:space-y-6">
              {uploads.length > 0 ? (
                <Card>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl">Event Photos</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6">
                    <PhotoGallery 
                      uploads={uploads}
                      isLoading={isLoading}
                      emptyMessage="No photos yet. Be the first to share!"
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 sm:py-12 px-4 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">No Photos Yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
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
                    <CardHeader className="px-4 sm:px-6">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Share Your Photos</span>
                        <span className="sm:hidden">Upload Photos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                      <div className="text-center py-6 sm:py-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">
                          Upload Your Photos
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
                          Share your favorite moments from {event.title}
                        </p>
                        <Button 
                          size="lg" 
                          onClick={() => setShowUploadForm(true)}
                          className="w-full sm:w-auto"
                        >
                          <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Start Uploading
                        </Button>
                      </div>
                      
                      <Separator className="my-4 sm:my-6" />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-4">
                        {/* Easy Upload */}
                        <div className="text-center p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 p-3">
                            <Zap className="h-7 w-7 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Lightning Fast</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Drag & drop or select files instantly
                          </p>
                        </div>

                        {/* Anonymous Option */}
                        <div className="text-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 p-3">
                            <UserCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Stay Anonymous</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload without sharing your name
                          </p>
                        </div>

                        {/* Safe & Secure */}
                        <div className="text-center p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4 p-3">
                            <Shield className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Safe & Secure</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            All photos are reviewed for safety
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardContent className="py-8 sm:py-12 px-4 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <EyeOff className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">
                      Photo Uploads Disabled
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto px-4">
                      The event organizer has disabled photo uploads for this event.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info">
              <Card className="border-1 shadow-lg">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      Event Details
                    </CardTitle>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete information about this event
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
                  {/* Main Event Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">CATEGORY</span>
                          </div>
                        </div>
                        <Badge className={`${getCategoryColor(event.category)} text-sm font-medium px-3 py-1.5 rounded-full`}>
                          {event.category}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Users className="h-4 w-4 text-gray-400" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Organizer</h4>
                          </div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 pl-6">
                            {event.organizer || <span className="text-gray-400 italic">Not specified</span>}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</h4>
                          </div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 pl-6">
                            {event.location || <span className="text-gray-400 italic">Not specified</span>}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Users className="h-4 w-4 text-gray-400" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Expected Attendees</h4>
                          </div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 pl-6">
                            {event.expected_attendees || <span className="text-gray-400 italic">Not specified</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">DATE & TIME</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Event Date</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {event.event_date ? formatDate(event.event_date) : <span className="text-gray-400 italic">Not specified</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Event Time</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {event.event_time ? formatTime(event.event_time) : <span className="text-gray-400 italic">Not specified</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Code</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                            <div className="font-mono text-base sm:text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 text-white dark:text-gray-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg tracking-wider shadow-sm break-all">
                              {eventCode}
                            </div>
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              Unique Identifier
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <EyeOff className="h-4 w-4 text-gray-400" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Visibility</h4>
                          </div>
                          <Badge 
                            variant={event.is_public ? "default" : "secondary"}
                            className="text-sm font-medium px-3 py-1.5 rounded-full"
                          >
                            {event.is_public ? (
                              <>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Public Event
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 mr-2" />
                                Private Event
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4 sm:my-6" />

                  {/* Upload Settings */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 rounded-lg">
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Upload Settings</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${event.allow_photo_upload ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {event.allow_photo_upload ? 'Open' : 'Closed'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Max Photos</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {event.max_photos || <span className="text-gray-400 text-lg">∞</span>}
                        </p>
                      </div>
                      
                      <div className="p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Photos Uploaded</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{uploads.length}</p>
                          {event.max_photos && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              / {event.max_photos}
                            </p>
                          )}
                        </div>
                        {event.max_photos && uploads.length > 0 && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                style={{ width: `${Math.min((uploads.length / event.max_photos) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Created</p>
                        <div className="space-y-1">
                          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {event.created_at 
                              ? new Date(event.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })
                              : 'N/A'}
                          </p>
                          {event.created_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(event.created_at).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                        </div>
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