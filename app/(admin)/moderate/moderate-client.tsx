'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  X,
  Loader2,
  ShieldCheck,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ModerationStats, ModerationUpload } from '@/lib/queries/moderation'

interface ModerateClientProps {
  initialUploads: ModerationUpload[]
  stats: ModerationStats
}

export default function ModerateClient({
  initialUploads,
  stats,
}: ModerateClientProps) {
  const router = useRouter()
  const [uploads, setUploads] = useState<ModerationUpload[]>(initialUploads)
  const [statsState, setStatsState] = useState<ModerationStats>(stats)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | string>('all')
  const [isPending, startTransition] = useTransition()

  const events = useMemo(() => {
    const map = new Map<string, NonNullable<ModerationUpload['event']>>()
    uploads.forEach((u) => {
      if (u.event) {
        map.set(u.event.id, u.event)
      }
    })
    return Array.from(map.values())
  }, [uploads])

  const filteredUploads = filter === 'all'
    ? uploads
    : uploads.filter((u) => u.event?.id === filter)

  const getImageUrl = (url: string | undefined) => {
    // Validate URL is a proper Supabase storage URL
    if (!url) return '/images/placeholder-event.svg'
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return '/images/placeholder-event.svg'
    }
    // Don't load test domains
    if (url.includes('test.com') || url.includes('example.com')) {
      return '/images/placeholder-event.svg'
    }
    return url
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder-event.svg'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleApprove = async (uploadId: string) => {
    setProcessingId(uploadId)
    try {
      const res = await fetch('/api/moderation/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to approve upload')
      }

      setUploads((prev) => prev.filter((u) => u.id !== uploadId))
      setStatsState((prev) => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
        totalApproved: prev.totalApproved + 1,
      }))

      startTransition(() => router.refresh())
    } catch (error) {
      console.error('[Moderation] Approve failed:', error)
      alert(`Failed to approve upload: ${(error as Error)?.message || 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (uploadId: string) => {
    const confirmed = window.confirm('Reject and delete this photo?')
    if (!confirmed) return

    setProcessingId(uploadId)
    try {
      const res = await fetch('/api/moderation/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to reject upload')
      }

      setUploads((prev) => prev.filter((u) => u.id !== uploadId))
      setStatsState((prev) => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
      }))

      startTransition(() => router.refresh())
    } catch (error) {
      console.error('[Moderation] Reject failed:', error)
      alert(`Failed to reject upload: ${(error as Error)?.message || 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const renderSkeletonCards = (count = 3) => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-32 h-32 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-3 mt-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const getUploaderDisplay = (upload: ModerationUpload) => {
    if (upload.uploaded_by) {
      return upload.uploaded_by
    }
    return 'Anonymous'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Photo Moderation</h1>
              <p className="text-gray-600 mt-1">
                Review and approve photos uploaded to your events
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{statsState.totalPending}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{statsState.totalApproved}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Your Events</p>
                    <p className="text-2xl font-bold text-blue-600">{statsState.totalEvents}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {events.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Event
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Events ({uploads.length})</option>
              {events.map((event) => {
                const count = uploads.filter((u) => u.event?.id === event.id).length
                return (
                  <option key={event.id} value={event.id}>
                    {event.title} ({count})
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {filteredUploads.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {uploads.length === 0
                  ? 'No pending uploads yet. Photos will appear here when guests upload to your events.'
                  : 'No pending uploads for this event. Try selecting a different event or check back later.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Photos ({filteredUploads.length})
              </h2>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Needs Review
              </Badge>
            </div>

            {isPending ? (
              renderSkeletonCards()
            ) : (
              <div className="grid gap-4">
                {filteredUploads.map((upload) => (
                  <Card key={upload.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 flex-shrink-0">
                          <div className="w-full h-full overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={getImageUrl(upload.image_url)}
                              alt={upload.caption || 'Pending review'}
                              className="w-full h-full object-cover"
                              onError={handleImageError}
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {upload.event?.title || 'Unknown Event'}
                          </h3>

                          {upload.caption && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              "{upload.caption}"
                            </p>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className={getUploaderDisplay(upload) === 'Anonymous' ? 'italic' : ''}>
                                {getUploaderDisplay(upload)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(upload.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(upload.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(upload.id)}
                              disabled={processingId === upload.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingId === upload.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(upload.id)}
                              disabled={processingId === upload.id}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              {processingId === upload.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
