'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Image, CheckCircle2, Clock, AlertCircle,
  TrendingUp, Plus, Eye, QrCode, Settings, ExternalLink,
  BarChart3, Users, MapPin, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Event as AppEvent } from '@/types/event'

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  publicEvents: number
  totalPhotos: number
  approvedPhotos: number
  pendingPhotos: number
  totalViews: number
}

// Use shared AppEvent type from types/event

interface RecentUpload {
  id: string
  image_url: string
  caption: string | null
  uploaded_by: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  event: { id: string; title: string } | null
}

interface DashboardClientProps {
  user: any
  stats: DashboardStats
  events: AppEvent[]
  recentUploads: RecentUpload[]
}

export default function DashboardClient({ 
  user, 
  stats, 
  events,
  recentUploads 
}: DashboardClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredEvents = events.filter((event: AppEvent) => {
    if (filter === 'active') return event.is_active
    if (filter === 'inactive') return !event.is_active
    return true
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date TBA'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getEventStatus = (event: AppEvent) => {
    if (!event.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    return { label: 'Active', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 brand-gradient bg-clip-text text-transparent">
            Welcome back, {user.email?.split('@')[0] || 'there'}! 
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your events today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Events */}
          <Card className="hover:shadow-xl transition-all duration-300 brand-card border border-brand-600/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-brand/15 ring-1 ring-brand-600/20">
                  <Calendar className="h-6 w-6 text-brand-600" />
                </div>
                <TrendingUp className="h-5 w-5 text-brand-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeEvents} active, {stats.publicEvents} public
              </p>
            </CardContent>
          </Card>

          {/* Total Photos */}
          <Card className="hover:shadow-xl transition-all duration-300 brand-card border border-brand-600/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-brand/15 ring-1 ring-brand-600/20">
                  <Image className="h-6 w-6 text-brand-600" />
                </div>
                <BarChart3 className="h-5 w-5 text-brand-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPhotos}</p>
              <p className="text-sm font-medium text-gray-600">Total Photos</p>
              <p className="text-xs text-gray-500 mt-1">
                Across all events
              </p>
            </CardContent>
          </Card>

          {/* Approved Photos */}
          <Card className="hover:shadow-xl transition-all duration-300 brand-card border border-brand-600/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-brand/15 ring-1 ring-brand-600/20">
                  <CheckCircle2 className="h-6 w-6 text-brand-600" />
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-600/10 px-2 py-1 rounded-full">
                  {stats.totalPhotos > 0 
                    ? `${Math.round((stats.approvedPhotos / stats.totalPhotos) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.approvedPhotos}</p>
              <p className="text-sm font-medium text-gray-600">Approved Photos</p>
              <p className="text-xs text-gray-500 mt-1">
                Ready to view
              </p>
            </CardContent>
          </Card>

          {/* Pending Review */}
          <Card className="hover:shadow-xl transition-all duration-300 brand-card border border-brand-600/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-brand/15 ring-1 ring-brand-600/20">
                  <Clock className="h-6 w-6 text-brand-600" />
                </div>
                {stats.pendingPhotos > 0 && (
                  <AlertCircle className="h-5 w-5 text-brand-600 animate-pulse" />
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingPhotos}</p>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              {stats.pendingPhotos > 0 && (
                <Link href="/moderate">
                  <Button size="sm" variant="link" className="text-xs p-0 h-auto mt-1 text-brand">
                    Review now →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-brand-600/20 bg-brand/10 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-600 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Create Event</h3>
                  <p className="text-xs text-gray-600">Start a new gallery</p>
                </div>
              </div>
              <Button asChild className="w-full bg-brand-600 hover:bg-brand">
                <Link href="/events/new">
                  Create New Event
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-brand-600/20 bg-brand/10 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Discover</h3>
                  <p className="text-xs text-gray-600">Browse all events</p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full border-brand-600/30 hover:bg-brand/10">
                <Link href="/discover">
                  Explore Events
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-brand-600/20 bg-brand/10 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-brand-600 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Moderate</h3>
                  <p className="text-xs text-gray-600">{stats.pendingPhotos} pending</p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full border-brand-600/30 hover:bg-brand/10">
                <Link href="/moderate">
                  Review Photos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {recentUploads.length > 0 && (
          <Card className="mb-8 hover:shadow-lg transition-shadow brand-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-brand/5 rounded-lg hover:bg-brand/10 transition-colors">
                    <img 
                      src={upload.image_url} 
                      alt={upload.caption || 'Upload'}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0 ring-1 ring-brand/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.event?.title || 'Unknown Event'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Uploaded by {upload.uploaded_by || 'Anonymous'} • 
                        {' '}{new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`flex-shrink-0 ${upload.status === 'approved' ? 'bg-brand/10 text-brand' : upload.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {upload.status === 'approved' ? 'Approved' : upload.status === 'pending' ? 'Pending' : 'Rejected'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Events */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 brand-gradient bg-clip-text text-transparent">My Events</h2>
              <p className="text-gray-600 text-sm sm:text-base">Manage and monitor your event galleries</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-brand/5'
                }`}
              >
                All ({events.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-brand/5'
                }`}
              >
                Active ({events.filter(e => e.is_active).length})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'inactive'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-brand/5'
                }`}
              >
                Inactive ({events.filter(e => !e.is_active).length})
              </button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <Card className="brand-card">
              <CardContent className="py-12 sm:py-16 px-4 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-brand" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {filter === 'all' ? 'No events yet' : `No ${filter} events`}
                </h3>
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  {filter === 'all' 
                    ? 'Create your first event to get started!'
                    : 'Try a different filter or create a new event.'
                  }
                </p>
                <Button asChild className="bg-brand-600 hover:bg-brand">
                  <Link href="/events/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event)
                
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Event Image */}
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      <img 
                        src={event.cover_image_url || '/placeholder-event.svg'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-3 right-3 ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      {/* Title & Category */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 line-clamp-1">
                          {event.title}
                        </h3>
                        {event.category && (
                          <span className="text-xs text-gray-600">
                            {event.category}
                          </span>
                        )}
                      </div>

                      {/* Stats (per-event counts optional; hidden if unavailable) */}
                      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-brand/5 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">—</p>
                          <p className="text-[10px] sm:text-xs text-gray-600">Approved</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-brand">—</p>
                          <p className="text-[10px] sm:text-xs text-gray-600">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">—</p>
                          <p className="text-[10px] sm:text-xs text-gray-600">Total</p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1 mb-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{formatDate(event.event_date)}</span>
                          {event.event_time && <span>• {event.event_time}</span>}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          asChild 
                          size="sm" 
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Link href={`/events/${event.id}`}>
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Link href={`/event/${event.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
