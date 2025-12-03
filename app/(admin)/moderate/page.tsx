
'use client'

import { useState, useEffect } from 'react'
import { useUploadStore } from '@/stores/upload-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react'

export default function ModeratePage() {
  const { 
    pendingUploads, 
    fetchPendingUploads, 
    updateUploadStatus,
    isLoading 
  } = useUploadStore()
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingUploads()
  }, [fetchPendingUploads])

  const handleApprove = async (uploadId: string) => {
    setProcessingId(uploadId)
    await updateUploadStatus(uploadId, 'approved')
    setProcessingId(null)
  }

  const handleReject = async (uploadId: string) => {
    setProcessingId(uploadId)
    await updateUploadStatus(uploadId, 'rejected')
    setProcessingId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Photo Moderation</h1>
        <p className="text-gray-600 mt-2">
          Review and approve photos uploaded by guests
        </p>
      </div>

      {isLoading && pendingUploads.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading pending uploads...</span>
        </div>
      ) : pendingUploads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending uploads
            </h3>
            <p className="text-gray-500">
              All photos have been moderated. Check back later for new uploads.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Photos ({pendingUploads.length})</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Needs Review
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pendingUploads.map((upload) => (
                  <div key={upload.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image Preview */}
                      <div className="md:w-48">
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={upload.image_url}
                            alt={upload.caption || 'Pending review'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Upload Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-medium">Event: {upload.event?.title || 'Unknown Event'}</h3>
                          {upload.caption && (
                            <p className="text-gray-600 mt-1">{upload.caption}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{upload.uploaded_by || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(upload.created_at)}</span>
                          </div>
                          {upload.event?.organizer && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Organizer: </span>
                              <span className="text-gray-600">{upload.event.organizer}</span>
                            </div>
                          )}
                          {upload.event?.location && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Location: </span>
                              <span className="text-gray-600">{upload.event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleApprove(upload.id)}
                            disabled={processingId === upload.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingId === upload.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(upload.id)}
                            disabled={processingId === upload.id}
                            variant="outline"
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            {processingId === upload.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}