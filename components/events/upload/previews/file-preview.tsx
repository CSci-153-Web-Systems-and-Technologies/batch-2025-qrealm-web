'use client'

import { File, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface FilePreviewProps {
  file: File
  index: number
  onRemove: (index: number) => void
  error?: string
}

export function FilePreview({ file, index, onRemove, error }: FilePreviewProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE'
  }

  return (
    <div className={`
      relative p-3 border rounded-lg transition-all duration-200
      ${error 
        ? 'bg-red-50 border-red-200' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }
    `}>
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <div className={`
          w-10 h-10 rounded flex items-center justify-center flex-shrink-0
          ${error 
            ? 'bg-red-100 text-red-600' 
            : 'bg-gray-200 text-gray-600'
          }
        `}>
          {error ? (
            <AlertCircle className="h-5 w-5" />
          ) : file.type.startsWith('image/') ? (
            <ImageIcon className="h-5 w-5" />
          ) : (
            <File className="h-5 w-5" />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium truncate pr-2">
              {file.name}
            </p>
            <span className="text-xs font-mono bg-gray-200 px-1.5 py-0.5 rounded">
              {getFileExtension(file.name)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(file.lastModified).toLocaleDateString()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="h-8 w-8 p-0 flex-shrink-0"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}