'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Search, Filter, Grid, List, Clock, Image, 
  MapPin, Users, QrCode, X, Sparkles, 
  User
} from 'lucide-react'
import type { DatabaseEvent } from '@/types/event'

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
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'recent'>('upcoming')

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

  // Helper: Get category color
  const getCategoryColor = (categoryName: string | null) => {
    if (!categoryName) return 'bg-gray-100 text-gray-800'
    
    const colors: Record<string, string> = {
      Academic: 'bg-blue-100 text-blue-800',
      Cultural: 'bg-purple-100 text-purple-800',
      Sports: 'bg-green-100 text-green-800',
      General: 'bg-gray-100 text-gray-800',
    }
    return colors[categoryName] || 'bg-gray-100 text-gray-800'
  }

  // Helper: Check if event is upcoming or past
  const isUpcoming = (eventDate: string | null) => {
    if (!eventDate) return true // If no date, show in upcoming
    return new Date(eventDate) >= new Date()
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
  
  // Separate upcoming and recent events
  const upcomingEvents = filteredAndSortedEvents.filter(e => isUpcoming(e.event_date))
  const recentEvents = filteredAndSortedEvents.filter(e => !isUpcoming(e.event_date))
  const myEventsCount = initialEvents.filter(e => e.created_by === userId).length

  // Navigate to event details
  const handleViewEvent = (eventCode: string | null) => {
    if (eventCode) {
      router.push(`/event/${eventCode}`)
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
              isUpcomingSection ? 'bg-blue-300' : 'bg-gray-300'
            }`} />
          )}
          
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${
                isUpcomingSection 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'bg-gray-100 border-gray-400'
              } border-4 rounded-full flex items-center justify-center`}>
                {isUpcomingSection ? (
                  <Calendar className="h-5 w-5 text-blue-600" />
                ) : (
                  <Image className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </div>
            
            <div className={`flex-1 border-2 ${
              isUpcomingSection 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 bg-white'
            } rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => handleViewEvent(event.event_codes?.code || null)}
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
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description || 'No description available'}
                      </p>
                    </div>
                    {event.event_categories && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getCategoryColor(event.event_categories.name)
                      }`}>
                        {event.event_categories.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.event_date)}
                    </div>
                    {event.event_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.event_time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    {event.expected_attendees && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.expected_attendees} expected
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewEvent(event.event_codes?.code || null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-blue-700 transition-colors"
                    >
                      <Image className="h-4 w-4" />
                      View Gallery
                    </button>
                    {event.created_by === userId && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/events/${event.id}`)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Manage
                      </button>
                    )}
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
      {events.map(event => (

        //  {/*  THIS IS THE EVENT CARD  */}
        <div 
          key={event.id} 
          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
          onClick={() => handleViewEvent(event.event_codes?.code || null)}
        >
              {/*  EVENT IMAGE  */}
          <div className="aspect-video bg-gray-100 overflow-hidden">
            <img 
              src={event.cover_image_url || '/images/placeholder-event.svg'}
              alt={event.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
            {/* Card Content */}
          <div className="p-4 space-y-3">
            {/* Title + Category Badge */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium line-clamp-2">{event.title}</h4>
              {event.event_categories && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getCategoryColor(event.event_categories.name)
                } whitespace-nowrap`}>
                  {event.event_categories.name}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description || 'No description available'}
            </p>


             {/* Date + Time */}

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(event.event_date)}
              </span>
              {event.event_time && <span>{event.event_time}</span>}
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={() => handleViewEvent(event.event_codes?.code || null)}
              >
                View Gallery
              </button>

              {/* Manage Button for Creator */}

              {event.created_by === userId && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()  // Don't trigger card click
                    router.push(`/events/${event.id}`)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Manage
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const currentEvents = selectedTab === 'upcoming' ? upcomingEvents : recentEvents

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Discover Events</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore all public events. Browse upcoming celebrations and recent highlights.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-lg">Filters & Search</h3>
          </div>

          <button
              onClick={() => setShowMyEventsOnly(!showMyEventsOnly)}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                showMyEventsOnly
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4" />
              My Events Only
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                showMyEventsOnly ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
                {myEventsCount}
              </span>
            </button>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                  viewMode === 'timeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Found {filteredAndSortedEvents.length} events</span>
            {searchQuery && <span>matching "{searchQuery}"</span>}
            {categoryFilter !== 'all' && (
              <span>in {categories.find(c => c.id === categoryFilter)?.name}</span>
            )}
            {showMyEventsOnly && (
              <span className="flex items-center gap-1 text-blue-600 font-medium">
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
                  <Clock className="h-5 w-5 text-blue-600" />
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
              <button
                onClick={() => setSelectedTab('upcoming')}
                className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  selectedTab === 'upcoming'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="h-4 w-4" />
                Upcoming ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setSelectedTab('recent')}
                className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  selectedTab === 'recent'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Image className="h-4 w-4" />
                Recent ({recentEvents.length})
              </button>
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