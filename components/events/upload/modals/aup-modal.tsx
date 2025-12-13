'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

export interface AUPAgreement {
  id: string
  text: string
  required: boolean
}

export interface AUPModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (uploaderName?: string) => void
  eventTitle: string
  maxFiles?: number
  maxFileSizeMB?: number
  acceptedFileTypes?: string[]
}

const DEFAULT_AUP_ITEMS: AUPAgreement[] = [
  {
    id: 'appropriate',
    text: 'I confirm that all photos are appropriate for a school event and contain no inappropriate content',
    required: true
  },
  {
    id: 'rights',
    text: 'I have the right to share these photos and they do not violate anyone\'s privacy',
    required: true
  },
  {
    id: 'moderation',
    text: 'I understand that all photos will be reviewed by event organizers before appearing in the gallery',
    required: true
  },
  {
    id: 'storage',
    text: 'I agree that photos may be stored and displayed as part of the event gallery',
    required: true
  },
  {
    id: 'anonymous',
    text: 'I would like to remain anonymous (leave name blank)',
    required: false
  }
]

export function AUPModal({ 
  isOpen, 
  onClose, 
  onAccept, 
  eventTitle,
  maxFiles = 10,
  maxFileSizeMB = 10,
  acceptedFileTypes = ['JPEG', 'PNG', 'WebP', 'GIF']
}: AUPModalProps) {
  const [uploaderName, setUploaderName] = useState('')
  const [agreements, setAgreements] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allRequiredAccepted = DEFAULT_AUP_ITEMS
    .filter(item => item.required)
    .every(item => agreements[item.id])

  const handleAgreementToggle = (id: string, checked: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  const handleSubmit = () => {
    if (!allRequiredAccepted) return
    
    setIsSubmitting(true)
    
    // If anonymous agreement is checked, clear the name
    const finalName = agreements['anonymous'] ? '' : uploaderName.trim()
    
    // Small delay for better UX
    setTimeout(() => {
      onAccept(finalName)
      setIsSubmitting(false)
      resetForm()
    }, 300)
  }

  const resetForm = () => {
    setUploaderName('')
    setAgreements({})
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos to "{eventTitle}"</DialogTitle>
          <DialogDescription>
            Please read and accept the following terms before uploading photos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Uploader Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="uploader-name">Your Name (Optional)</Label>
            <Input
              id="uploader-name"
              type="text"
              placeholder="Enter your name to be credited"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              disabled={agreements['anonymous']}
            />
            <p className="text-sm text-gray-500">
              Leave blank if you prefer to remain anonymous
            </p>
          </div>

          {/* AUP Agreements */}
          <div className="space-y-3">
            <h4 className="font-medium">Acceptable Use Policy</h4>
            {DEFAULT_AUP_ITEMS.map((item) => (
              <div key={item.id} className="flex items-start space-x-2">
                <Checkbox
                  id={item.id}
                  checked={!!agreements[item.id]}
                  onCheckedChange={(checked) => 
                    handleAgreementToggle(item.id, checked as boolean)
                  }
                  className="mt-1"
                />
                <Label htmlFor={item.id} className="text-sm leading-tight cursor-pointer">
                  {item.text}
                  {item.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
            ))}
          </div>

          {/* Upload Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-1">Upload Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Maximum {maxFiles} photos per upload session</li>
              <li>• Maximum file size: {maxFileSizeMB}MB per photo</li>
              <li>• Accepted formats: {acceptedFileTypes.join(', ')}</li>
              <li>• Photos will be reviewed before appearing in the gallery</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!allRequiredAccepted || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Processing...' : 'Accept & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}