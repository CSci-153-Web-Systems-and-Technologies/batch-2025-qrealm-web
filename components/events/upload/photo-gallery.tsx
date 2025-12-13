// components/events/upload/photo-gallery.tsx
'use client'

import { useState, useEffect } from 'react'
import { Upload } from '@/types/upload'
import { Maximize2, User, Calendar, Download, Heart, MessageCircle, Sparkles } from 'lucide-react'
import { togglePhotoReaction, getReactionCounts, getUserReactions } from '@/lib/queries/reactions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useEventCover } from '@/hooks/use-placeholder-image'

interface PhotoGalleryProps {
  uploads: Upload[]
  isLoading?: boolean
  emptyMessage?: string
  onPhotoClick?: (upload: Upload) => void
}

export function PhotoGallery({ 
  uploads, 
  isLoading = false,
  emptyMessage = 'No photos have been shared yet. Be the first!',
  onPhotoClick 
}: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Upload | null>(null)
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({})
  const [userReactions, setUserReactions] = useState<Record<string, Record<string, boolean>>>({})
  const [loadingReactions, setLoadingReactions] = useState(false)

  // Fetch reactions when uploads change
  useEffect(() => {
    const fetchReactions = async () => {
      if (uploads.length === 0) return
      
      setLoadingReactions(true)
      const uploadIds = uploads.map(u => u.id)
      
      const [counts, userReacts] = await Promise.all([
        getReactionCounts(uploadIds),
        getUserReactions(uploadIds)
      ])
      
      setReactionCounts(counts)
      setUserReactions(userReacts)
      setLoadingReactions(false)
    }
    
    fetchReactions()
  }, [uploads])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleImageClick = (upload: Upload) => {
    setSelectedImage(upload)
    if (onPhotoClick) {
      onPhotoClick(upload)
    }
  }

  const handleDownload = (upload: Upload) => {
    const link = document.createElement('a')
    link.href = upload.image_url
    link.download = `${upload.caption || 'event-photo'}-${upload.id.slice(0, 8)}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReaction = async (uploadId: string, reactionType: 'heart' | 'sparkle') => {
    const result = await togglePhotoReaction(uploadId, reactionType)
    
    if (result) {
      // Update local state
      setReactionCounts(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          [reactionType]: result.count
        }
      }))
      
      setUserReactions(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          [reactionType]: result.has_reacted
        }
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📷</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Share your favorite moments from this event by uploading photos above!
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Stats Bar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {uploads.length} Photo{uploads.length !== 1 ? 's' : ''} Shared
            </h3>
            <p className="text-sm text-gray-500">
              Photos uploaded by event attendees
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Latest: {formatDate(uploads[0].created_at)}
          </Badge>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {uploads.map((upload) => (
          <Card 
            key={upload.id} 
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image Container */}
            <div 
              className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => handleImageClick(upload)}
            >
              <img
                src={upload.image_url}
                alt={upload.caption || 'Event photo'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  >
                    <Maximize2 className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(upload)
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <CardContent className="p-4">
              {upload.caption && (
                <p className="text-sm font-medium mb-2 line-clamp-2">
                  {upload.caption}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span className="font-medium">
                    {upload.uploaded_by || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(upload.created_at)}</span>
                </div>
              </div>
            </CardContent>

            {/* Footer Actions */}
            <CardFooter className="p-4 pt-0 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 transition-colors ${
                      userReactions[upload.id]?.heart 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReaction(upload.id, 'heart')
                    }}
                    disabled={loadingReactions}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-1 ${
                        userReactions[upload.id]?.heart ? 'fill-current' : ''
                      }`} 
                    />
                    <span className="text-xs">
                      {reactionCounts[upload.id]?.heart || 0}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2 transition-colors ${
                      userReactions[upload.id]?.sparkle 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-500 hover:text-yellow-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReaction(upload.id, 'sparkle')
                    }}
                    disabled={loadingReactions}
                  >
                    <Sparkles 
                      className={`h-4 w-4 mr-1 ${
                        userReactions[upload.id]?.sparkle ? 'fill-current' : ''
                      }`} 
                    />
                    <span className="text-xs">
                      {reactionCounts[upload.id]?.sparkle || 0}
                    </span>
                  </Button>
                </div>
                
                {/* <Badge variant="outline" className="text-xs">
                  {upload.status === 'approved' ? 'Approved' : 'Pending'}
                </Badge> */}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Image */}
              <div className="flex-1">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption || 'Event photo'}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              
              {/* Sidebar Info */}
              <div className="w-full lg:w-80 bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 text-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Photo Details</h3>
                    {selectedImage.caption && (
                      <p className="text-sm text-gray-200 mb-3">
                        {selectedImage.caption}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedImage.uploaded_by || 'Anonymous'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDate(selectedImage.created_at)}
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <Badge variant="secondary" className="mb-2">
                        {selectedImage.status === 'approved' ? '✓ Approved' : '⏳ Pending Review'}
                      </Badge>
                      <p className="text-xs text-gray-400">
                        Photo ID: {selectedImage.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(selectedImage)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(null)
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  )
}