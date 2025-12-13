'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxFileSizeMB?: number
  acceptedFileTypes?: string[]
  disabled?: boolean
}

export function UploadDropzone({
  onFilesSelected,
  maxFiles = 10,
  maxFileSizeMB = 10,
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  disabled = false
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Please upload images only.`)
        return
      }
      
      // Check file size
      const maxSize = maxFileSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large. Maximum size is ${maxFileSizeMB}MB.`)
        return
      }
      
      validFiles.push(file)
    })

    // Check total file count
    if (validFiles.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} photos allowed per upload session`)
      return { valid: [], errors }
    }

    return { valid: validFiles, errors }
  }, [maxFiles, maxFileSizeMB, acceptedFileTypes])

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return
    
    const filesArray = Array.from(selectedFiles)
    const { valid, errors } = validateFiles(filesArray)
    
    if (errors.length > 0) {
      setError(errors[0]) // Show first error
    } else {
      setError(null)
      onFilesSelected(valid)
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [validateFiles, onFilesSelected])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [disabled, handleFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  const fileTypesText = acceptedFileTypes
    .map(type => type.replace('image/', '').toUpperCase())
    .join(', ')

  return (
    <div className="space-y-4">
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
            : isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files by clicking or dragging and dropping"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            {disabled ? (
              <AlertCircle className="h-8 w-8 text-gray-400" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium">
              {disabled ? (
                <span className="text-gray-500">Uploads disabled</span>
              ) : (
                <span className="text-blue-600">Click to upload</span>
              )}
              {!disabled && <span className="text-gray-600"> or drag and drop</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileTypesText} up to {maxFileSizeMB}MB each • Max {maxFiles} files
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            multiple
            disabled={disabled}
            className="hidden"
            aria-label="File upload input"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!disabled && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>
      )}
    </div>
  )
}