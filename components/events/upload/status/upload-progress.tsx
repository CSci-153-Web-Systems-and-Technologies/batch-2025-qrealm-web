'use client'

import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

export interface UploadProgressProps {
  current: number
  total: number
  label?: string
  showPercentage?: boolean
}

export function UploadProgress({ 
  current, 
  total, 
  label = 'Uploading files...',
  showPercentage = true 
}: UploadProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{label}</span>
        </div>
        {showPercentage && (
          <span className="font-medium">{percentage}%</span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>File {current} of {total}</span>
        <span>{current} uploaded</span>
      </div>
    </div>
  )
}