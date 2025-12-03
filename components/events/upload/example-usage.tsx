'use client'

import { useState } from 'react'
import { GuestUploadForm } from './guest-upload-form'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface ExampleUsageProps {
  eventId: string
  eventTitle: string
}

export function ExampleUsage({ eventId, eventTitle }: ExampleUsageProps) {
  const [showUploadForm, setShowUploadForm] = useState(false)

  const handleUploadComplete = () => {
    console.log('Upload completed successfully!')
    // You could trigger a refresh of the gallery here
  }

  return (
    <div className="space-y-6">
      {showUploadForm ? (
        <GuestUploadForm
          eventId={eventId}
          eventTitle={eventTitle}
          onUploadComplete={handleUploadComplete}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Share Your Photos</h2>
              <p className="text-gray-600">
                Upload your photos from "{eventTitle}". They will be reviewed before appearing in the gallery.
              </p>
              <div className="mt-3 text-sm text-gray-500 space-y-1">
                <p>• Upload up to 10 photos at once</p>
                <p>• Maximum 10MB per photo</p>
                <p>• Accepted formats: JPEG, PNG, WebP, GIF</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowUploadForm(true)}
              className="w-full md:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </div>
        </div>
      )}

      {showUploadForm && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowUploadForm(false)}
          >
            Cancel Upload
          </Button>
        </div>
      )}
    </div>
  )
}