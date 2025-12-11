//app/(admin)/discover/discovery-client.tsx:

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Search, Filter, Grid, List, Clock, Image, 
  MapPin, Users, QrCode, X, Sparkles, User, Settings, Eye
} from 'lucide-react'
import type { DatabaseEvent } from '@/types/event'
import { Button } from "@/components/ui/button"

interface DiscoverEventsClientProps {
  initialEvents: (DatabaseEvent & { 
    event_categories: { name: string } | null
    event_codes: { code: string } | null
  })[]
  categories: { id: number; name: string }[]
  userId: string
}

export default function DiscoverEventsClient({ 
  initialEvents, 
  categories,
  userId 
}: DiscoverEventsClientProps) {
  const router = useRouter()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date')
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('grid')
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'live' | 'recent'>('upcoming')
  const [showMyEventsOnly, setShowMyEventsOnly] = useState(false)

  // Helper: Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBA'
    
    const date = new Date(dateString)
    const now = new Date()
    
    const isToday = date.toDateString() === now.toDateString()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    
    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Helper: Convert military time to US format (12-hour with AM/PM)
  const formatTimeToUS = (timeString: string | null): string => {
    if (!timeString) return 'Time TBA'
    
    // Remove any whitespace
    const time = timeString.trim()
    
    // If already in AM/PM format, return as is
    if (time.includes('AM') || time.includes('PM')) {
      return time
    }
    
    // Handle military time format (HH:MM or HH:MM:SS)
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (!timeMatch) {
      return time // Return as is if format is unexpected
    }
    
    let [_, hoursStr, minutes] = timeMatch
    let hours = parseInt(hoursStr, 10)
    
    // Determine AM/PM
    const period = hours >= 12 ? 'PM' : 'AM'
    
    // Convert to 12-hour format
    if (hours === 0) {
      hours = 12 // 00:00 becomes 12:00 AM
    } else if (hours > 12) {
      hours = hours - 12
    }
    
    // Return formatted time (e.g., "7:30 PM")
    return `${hours}:${minutes} ${period}`
  }

  // Helper: Get category color
  const getCategoryColor = (categoryName: string | null) => {
    if (!categoryName) return 'bg-gray-100 text-gray-800'
    
    const colors: Record<string, string> = {
      Academic: 'bg-brand-100 text-brand-800',
      Academics: 'bg-brand-100 text-brand-800',
      Sports: 'bg-green-100 text-green-800',
      Arts: 'bg-rose-100 text-rose-800',
      Music: 'bg-pink-100 text-pink-800',
      Theater: 'bg-fuchsia-100 text-fuchsia-800',
      Cultural: 'bg-purple-100 text-purple-800',
      Community: 'bg-orange-100 text-orange-800',
      Fundraiser: 'bg-red-100 text-red-800',
      'Field Trip': 'bg-amber-100 text-amber-800',
      Assembly: 'bg-yellow-100 text-yellow-800',
      Graduation: 'bg-indigo-100 text-indigo-800',
      Holiday: 'bg-cyan-100 text-cyan-800',
      Other: 'bg-gray-100 text-gray-800',
      General: 'bg-gray-100 text-gray-800',
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800'
  }

  // Helper: Check if event is upcoming or past
  const isUpcoming = (eventDate: string | null) => {
    if (!eventDate) return true
    return new Date(eventDate) >= new Date()
  }

  // Helper: Check if event is live
  const isEventLive = (eventDate: string | null, eventTime: string | null) => {
    if (!eventDate) return false
    
    const now = new Date()
    const eventDateTime = new Date(eventDate)
    
    if (eventTime) {
      const formattedTime = formatTimeToUS(eventTime)
      const [time, period] = formattedTime.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      
      let hour24 = hours
      if (period === 'PM' && hours !== 12) hour24 += 12
      if (period === 'AM' && hours === 12) hour24 = 0
      
      eventDateTime.setHours(hour24, minutes, 0, 0)
    }
    
    const isToday = eventDateTime.toDateString() === now.toDateString()
    const timeDiff = Math.abs(now.getTime() - eventDateTime.getTime())
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    return isToday && hoursDiff <= 4
  }

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = initialEvents.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = 
        categoryFilter === 'all' || event.category_id === categoryFilter

      const matchesOwnership = 
        !showMyEventsOnly || event.created_by === userId
      
      return matchesSearch && matchesCategory && matchesOwnership
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = a.event_date ? new Date(a.event_date).getTime() : 0
          const dateB = b.event_date ? new Date(b.event_date).getTime() : 0
          return dateB - dateA
        case 'title':
          return a.title.localeCompare(b.title)
        case 'category':
          const catA = a.event_categories?.name || ''
          const catB = b.event_categories?.name || ''
          return catA.localeCompare(catB)
        default:
          return 0
      }
    })

    return filtered
  }, [initialEvents, searchQuery, categoryFilter, sortBy, showMyEventsOnly, userId])
  
  // Separate events by status
  const upcomingEvents = filteredAndSortedEvents.filter(e => isUpcoming(e.event_date))
  const recentEvents = filteredAndSortedEvents.filter(e => !isUpcoming(e.event_date))
  const liveEvents = useMemo(() => {
    return filteredAndSortedEvents.filter(e => isEventLive(e.event_date, e.event_time))
  }, [filteredAndSortedEvents])
  
  const myEventsCount = initialEvents.filter(e => e.created_by === userId).length

  // Navigate to event gallery
  const handleViewGallery = (eventCode: string | null | undefined) => {
    if (eventCode) {
      router.push(`/event/${eventCode}`)
    }
  }

  // Navigate to event details (for getting QR code)
  const handleGetCode = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  // Navigate to manage event
  const handleManageEvent = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  // 🎯 RENDER BUTTONS BASED ON OWNERSHIP & EVENT STATUS
  const renderEventButtons = (
    event: typeof filteredAndSortedEvents[0], 
    isUpcomingEvent: boolean
  ) => {
    const isOwner = event.created_by === userId
    const eventCode = event.event_codes?.code || null

    // 👤 OWNER BUTTONS
    if (isOwner) {
      if (isUpcomingEvent) {
        // Owner + Upcoming = Only "Manage"
        return (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleManageEvent(event.id)
            }}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-1" />
            Manage
          </Button>
        )
      } else {
        // Owner + Recent = "View Gallery" + "Manage"
        return (
          <>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (eventCode) {
                  handleViewGallery(eventCode)
                }
              }}
              disabled={!eventCode}
              className="flex-1"
            >
              <Image className="h-4 w-4 mr-1" />
              View Gallery
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleManageEvent(event.id)
              }}
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          </>
        )
      }
    }

    // 👥 NON-OWNER BUTTONS
    if (isUpcomingEvent) {
      // Non-owner + Upcoming = Only "Get Code"
      return (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleGetCode(event.id)
          }}
          className="flex-1"
        >
          <QrCode className="h-4 w-4 mr-1" />
          Get Code
        </Button>
      )
    } else {
      // Non-owner + Recent = "View Gallery" + "Get Code"
      return (
        <>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (eventCode) {
                handleViewGallery(eventCode)
              }
            }}
            disabled={!eventCode}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-1" />
            View Gallery
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleGetCode(event.id)
            }}
            className="flex-1"
          >
            <QrCode className="h-4 w-4 mr-1" />
            Get Code
          </Button>
        </>
      )
    }
  }

  // Timeline View Component
  const TimelineView = ({ events, isUpcomingSection }: { 
    events: typeof filteredAndSortedEvents
    isUpcomingSection: boolean 
  }) => (
    <div className="space-y-6">
      {events.map((event, index) => (
        <div key={event.id} className="relative">
          {index < events.length - 1 && (
            <div className={`absolute left-6 top-20 w-0.5 h-16 ${
              isUpcomingSection ? 'bg-brand-300' : 'bg-gray-300'
            }`} />
          )}
          
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${
                isUpcomingSection 
                  ? 'bg-brand-100 border-brand-500' 
                  : 'bg-gray-100 border-gray-400'
              } border-4 rounded-full flex items-center justify-center`}>
                {isUpcomingSection ? (
                  <Calendar className="h-5 w-5 text-brand-600" />
                ) : (
                  <Image className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </div>
            
            <div 
              className={`flex-1 border-2 ${
              isUpcomingSection 
                ? 'border-brand-200 bg-brand-50' 
                : 'border-gray-200 bg-white'
            } rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <img
                    src={event.cover_image_url || '/images/placeholder-event.svg'}
                    alt={event.title}
                    className="w-full h-24 md:h-full object-cover rounded-lg"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg mb-1 line-clamp-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description || 'No description available'}
                      </p>
                    </div>
                    {event.event_categories && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        getCategoryColor(event.event_categories.name)
                      }`}>
                        {event.event_categories.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Compact event details */}
                  <div className="flex flex-wrap items-center !gap-2 sm:gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{formatDate(event.event_date)}</span>
                    </div>
                    
                    {event.event_time && (
                      <div className="!flex !items-center !gap-1">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{formatTimeToUS(event.event_time)}</span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="!flex !items-center !gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="max-w-[30vw] sm:max-w-[150px] truncate text-xs sm:text-sm" title={event.location}>
                          {event.location}
                        </span>
                      </div>
                    )}
                    
                    {event.expected_attendees && (
                      <div className="!flex !items-center !gap-1">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{event.expected_attendees}</span>
                      </div>
                    )}
                    
                    {!event.is_public && (
                      <div className="!flex !items-center !gap-1 text-amber-600">
                        <Eye className="h-4 w-4 flex-shrink-0" />
                        <span className="text-xs">Private</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {renderEventButtons(event, isUpcomingSection)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Grid View Component
  const GridView = ({ events }: { events: typeof filteredAndSortedEvents }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => {
        const isUpcomingEvent = isUpcoming(event.event_date)
        
        return (
          <div 
            key={event.id} 
            className="relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full"
          >
            {/* Live Badge */}
            {isEventLive(event.event_date, event.event_time) && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                <span className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                  LIVE NOW
                </span>
              </div>
            )}

            {/* Event Image */}
            <div className="aspect-video bg-gray-100 overflow-hidden flex-shrink-0">
              <img 
                src={event.cover_image_url || '/images/placeholder-event.svg'}
                alt={event.title}
                className="w-full h-32 sm:h-24 md:h-full object-cover rounded-lg"
              />
            </div>
            
            {/* Card Content */}
            <div className="p-4 flex flex-col flex-1">
              {/* Title + Category + Live Indicator */}
              <div className="!flex !items-start !justify-between !gap-2 !mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2 mb-1">{event.title}</h4>
                  {isEventLive(event.event_date, event.event_time) && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                
                {event.event_categories && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    getCategoryColor(event.event_categories.name)
                  }`}>
                    {event.event_categories.name}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                {event.description || 'No description available'}
              </p>

              {/* Compact event details - Reduced spacing */}
              <div className="!mb-3 !space-y-1">
                {/* Date + Time on same line */}
                <div className="flex items-center gap-2 text-xs sm:text-xs text-gray-500">
                  <span className="!flex !items-center !gap-1 !flex-1 min-w-0">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(event.event_date)}</span>
                  </span>
                  
                  {event.event_time && (
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>{formatTimeToUS(event.event_time)}</span>
                    </span>
                  )}
                </div>
                
                {/* Location + Other details */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500">
                  {event.location && (
                    <div className="flex items-center gap-1 min-w-0" title={event.location}>
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[30vw] sm:max-w-[120px]">{event.location}</span>
                    </div>
                  )}
                  
                  {event.expected_attendees && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 flex-shrink-0" />
                      <span>{event.expected_attendees}</span>
                    </div>
                  )}
                  
                  {!event.is_public && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Eye className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs">Private</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                {renderEventButtons(event, isUpcomingEvent)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const currentEvents =
    selectedTab === "live"
      ? liveEvents
      : selectedTab === "upcoming"
      ? upcomingEvents
      : recentEvents

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-brand-100 p-2 sm:p-3 rounded-lg">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-brand-700" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Discover Events
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base max-w-md sm:max-w-lg md:max-w-2xl mx-auto px-2 sm:px-0">
            Browse all school events, from upcoming celebrations to recent highlights. Use filters to find exactly what you're looking for.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-lg">Filters & Search</h3>
            </div>
            
            {/* My Events Toggle */}
            <Button
              variant={showMyEventsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMyEventsOnly(!showMyEventsOnly)}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              My Events Only
              <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                showMyEventsOnly ? 'bg-brand-500' : 'bg-gray-200'
              }`}>
                {myEventsCount}
              </span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'category')}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <Button
                variant={viewMode === 'timeline' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('timeline')}
                className="flex-1 text-xs sm:text-sm"
              >
                <List className="h-4 w-4 mr-1" />
                Timeline
              </Button>
              <Button
                variant={viewMode === 'grid' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                <Grid className="h-4 w-4 mr-1" />
                Grid
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Found {filteredAndSortedEvents.length} events</span>
            {searchQuery && <span>matching "{searchQuery}"</span>}
            {categoryFilter !== 'all' && (
              <span>in {categories.find(c => c.id === categoryFilter)?.name}</span>
            )}
            {showMyEventsOnly && (
              <span className="flex items-center gap-1 text-brand-600 font-medium">
                <User className="h-3 w-3" />
                Showing only your events
              </span>
            )}
          </div>
        </div>

        {/* Events Display */}
        {viewMode === 'timeline' ? (
          <div className="space-y-12">
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-brand-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {upcomingEvents.length}
                  </span>
                </div>
                <TimelineView events={upcomingEvents} isUpcomingSection={true} />
              </div>
            )}
            
            {recentEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Image className="h-5 w-5 text-gray-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Recent Events</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {recentEvents.length}
                  </span>
                </div>
                <TimelineView events={recentEvents} isUpcomingSection={false} />
              </div>
            )}
            
            {upcomingEvents.length === 0 && recentEvents.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-500">No events found matching your criteria.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Tabs for Grid View */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <Button
                variant="ghost"
                onClick={() => setSelectedTab('upcoming')}
                className={`rounded-none border-b-2 whitespace-nowrap text-xs sm:text-sm ${
                  selectedTab === 'upcoming'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent'
                }`}
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Upcoming ({upcomingEvents.length})
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setSelectedTab('live')}
                className={`rounded-none border-b-2 whitespace-nowrap text-xs sm:text-sm ${
                  selectedTab === 'live'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent'
                }`}
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                Live Now ({liveEvents.length})
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setSelectedTab('recent')}
                className={`rounded-none border-b-2 whitespace-nowrap text-xs sm:text-sm  ${
                  selectedTab === 'recent'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent'
                }`}
              >
                <Image className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Recent ({recentEvents.length})
              </Button>
            </div>
            
            {currentEvents.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-500">No events found in this category.</p>
              </div>
            ) : (
              <GridView events={currentEvents} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}