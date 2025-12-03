'use client'

import { Check, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface UploadResult {
  successful: number
  failed: number
  errors: string[]
}

export interface UploadResultsProps {
  results: UploadResult
  onDismiss?: () => void
  showDetails?: boolean
}

export function UploadResults({ 
  results, 
  onDismiss, 
  showDetails = true 
}: UploadResultsProps) {
  const isCompleteSuccess = results.failed === 0
  const hasErrors = results.errors.length > 0

  return (
    <div className={`
      p-4 rounded-lg border
      ${isCompleteSuccess 
        ? 'bg-green-50 border-green-200' 
        : 'bg-yellow-50 border-yellow-200'
      }
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isCompleteSuccess ? (
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">
            {isCompleteSuccess 
              ? 'Upload Complete!' 
              : 'Upload Partially Complete'
            }
          </h4>
          
          <p className="text-sm mt-1">
            <span className="font-medium">{results.successful}</span> photo(s) uploaded successfully.
            {results.failed > 0 && (
              <span className="ml-1">
                <span className="font-medium">{results.failed}</span> failed.
              </span>
            )}
          </p>
          
          {showDetails && hasErrors && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Upload Errors:</p>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {results.errors.map((error, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-1 text-gray-600"
                  >
                    <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                    <span className="flex-1">{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label="Dismiss upload results"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}