'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUploadStore } from '@/stores/upload-store'
import { AUPModal } from './modals/aup-modal'
import { UploaderNameInput } from './forms/uploader-name-input'
import { UploadDropzone } from './forms/upload-dropzone'
import { FilePreviewList } from './previews/file-preview-list'
import { UploadProgress } from './status/upload-progress'
import { UploadResults, UploadResult } from './status/upload-results'
import { Trash2 } from 'lucide-react'

export interface GuestUploadFormProps {
  eventId: string
  eventTitle: string
  maxUploads?: number
  maxFileSizeMB?: number
  onUploadComplete?: () => void
}

export function GuestUploadForm({ 
  eventId, 
  eventTitle,
  maxUploads = 10,
  maxFileSizeMB = 10,
  onUploadComplete
}: GuestUploadFormProps) {
  // State
  const [files, setFiles] = useState<File[]>([])
  const [uploaderName, setUploaderName] = useState('')
  const [fileErrors, setFileErrors] = useState<Record<number, string>>({})
  const [showAUP, setShowAUP] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null)

  // Store
  const { createBulkUploads } = useUploadStore()

  // Event handlers
  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(prev => {
      const newFiles = [...prev, ...selectedFiles]
      // Trim to max uploads if needed
      return newFiles.slice(0, maxUploads)
    })
    setFileErrors({})
  }, [maxUploads])

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setFileErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setFiles([])
    setFileErrors({})
    setUploadResults(null)
  }, [])

  const handleUpload = useCallback(async (acceptedUploaderName?: string) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadResults(null)
    setUploadProgress({ current: 0, total: files.length })

    const finalUploaderName = acceptedUploaderName || uploaderName.trim()

    const result = await createBulkUploads(files, eventId, finalUploaderName)
    
    // Update progress during upload
    for (let i = 0; i <= files.length; i++) {
      setTimeout(() => {
        setUploadProgress({ current: i, total: files.length })
      }, i * 100)
    }

    // Simulate processing delay for better UX
    setTimeout(() => {
      const results: UploadResult = {
        successful: files.length - result.errors.length,
        failed: result.errors.length,
        errors: result.errors
      }
      
      setUploadResults(results)
      setIsUploading(false)
      
      // Clear files if successful
      if (result.errors.length === 0) {
        handleClearAll()
        setUploaderName('')
        
        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete()
        }
      }
    }, files.length * 100 + 500)
  }, [files, uploaderName, eventId, createBulkUploads, onUploadComplete, handleClearAll])

  const handleStartUpload = useCallback(() => {
    setShowAUP(true)
  }, [])

  const handleAUPAccept = useCallback(() => {
    setShowAUP(false)
    handleUpload(undefined)
  }, [handleUpload])

  const handleDismissResults = useCallback(() => {
    setUploadResults(null)
  }, [])

  const canUpload = files.length > 0 && !isUploading

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📸 Upload Photos
          </CardTitle>
          <CardDescription>
            Share your photos from "{eventTitle}". Photos will be reviewed before appearing in the gallery.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Uploader Name */}
          <UploaderNameInput
            value={uploaderName}
            onChange={setUploaderName}
            disabled={isUploading}
          />

          {/* File Dropzone */}
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            maxFiles={maxUploads}
            maxFileSizeMB={maxFileSizeMB}
            disabled={isUploading}
          />

          {/* File Previews */}
          <FilePreviewList
            files={files}
            onRemoveFile={handleRemoveFile}
            errors={fileErrors}
          />

          {/* Upload Progress */}
          {isUploading && (
            <UploadProgress
              current={uploadProgress.current}
              total={uploadProgress.total}
            />
          )}

          {/* Upload Results */}
          {uploadResults && (
            <UploadResults
              results={uploadResults}
              onDismiss={handleDismissResults}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearAll}
              disabled={files.length === 0 || isUploading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            
            <Button
              type="button"
              onClick={handleStartUpload}
              disabled={!canUpload}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} Photo(s)`}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Photos will be reviewed by event organizers</p>
            <p>• You can upload multiple photos at once</p>
            <p>• Accepted formats: JPEG, PNG, WebP, GIF</p>
            <p>• Maximum {maxFileSizeMB}MB per photo</p>
          </div>
        </CardContent>
      </Card>

      {/* AUP Modal */}
      <AUPModal
        isOpen={showAUP}
        onClose={() => setShowAUP(false)}
        onAccept={handleAUPAccept}
      />
    </>
  )
}