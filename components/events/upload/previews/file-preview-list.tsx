'use client'

import { FilePreview, FilePreviewProps } from './file-preview'

export interface FilePreviewListProps {
  files: File[]
  onRemoveFile: (index: number) => void
  errors?: Record<number, string>
  maxHeight?: string
}

export function FilePreviewList({ 
  files, 
  onRemoveFile, 
  errors = {}, 
  maxHeight = '240px' 
}: FilePreviewListProps) {
  if (files.length === 0) {
    return null
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">
            Selected Files ({files.length})
          </h4>
          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-600">
              {Object.keys(errors).length} file(s) have errors
            </p>
          )}
        </div>
        <span className="text-sm text-gray-500">
          Total: {formatFileSize(totalSize)}
        </span>
      </div>
      
      <div 
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight }}
      >
        {files.map((file, index) => (
          <FilePreview
            key={`${file.name}-${file.lastModified}-${index}`}
            file={file}
            index={index}
            onRemove={onRemoveFile}
            error={errors[index]}
          />
        ))}
      </div>
    </div>
  )
}