'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export interface AUPModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

export function AUPModal({ 
  isOpen, 
  onClose, 
  onAccept,
}: AUPModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!agreedToTerms) return
    
    setIsSubmitting(true)
    
    // Small delay for better UX
    setTimeout(() => {
      onAccept()
      setIsSubmitting(false)
      resetForm()
    }, 300)
  }

  const resetForm = () => {
    setAgreedToTerms(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] p-0 flex flex-col">
        {/* Hidden title for accessibility */}
        <VisuallyHidden>
          <DialogTitle>QRealm Photo Upload Agreement</DialogTitle>
          <DialogDescription>
            Please read and accept the terms before uploading your photos
          </DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-bold">QRealm Photo Upload Agreement</h2>
          <p className="text-xs text-gray-600 mt-0.5">Please read and accept the terms before uploading your photos</p>
        </div>

        {/* Content - scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {/* Prohibited Activities */}
          <div className="space-y-2">
            <p className="text-sm text-gray-800">
              You are responsible for the security and appropriate use of all photos you upload to QRealm. Using QRealm's platform for the following is strictly prohibited:
            </p>
            
            <ul className="space-y-1.5 ml-3">
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Any activities that violate the Cybercrime Prevention Act of 2012, including content-related offenses such as cybersex, child pornography, libel, and unsolicited commercial communications.</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Uploading photos without proper consent, including pictures of identifiable individuals without permission, minors without parental approval, or any content that invades personal privacy.</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Violating copyright law, including illegally duplicating or transmitting copyrighted pictures, professional photographs, or other protected content without authorization.</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Intentionally introducing malicious code, including viruses, worms, spyware, or any software that may compromise platform security.</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Causing security breaches, including accessing events, data, or accounts you are not authorized to access, or circumventing any platform security measures.</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Causing service disruption, including any attacks, floods, or activities that degrade QRealm's performance for other users.</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Uploading content that violates local laws, including defamatory material, hate speech, or illegal activities.</span>
              </li>
            </ul>
          </div>

          {/* QRealm Rights */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-800">QRealm reserves the right to:</p>
            
            <ul className="space-y-1 ml-3">
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Review, moderate, and approve/reject all uploaded photos</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Remove any content violating these terms without notice</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Block users who repeatedly violate these terms</span>
              </li>
              
              <li className="text-xs text-gray-700 flex gap-2">
                <span className="text-blue-500 flex-shrink-0 mt-0.5">•</span>
                <span>Cooperate with legal authorities regarding illegal content</span>
              </li>
            </ul>
          </div>

          {/* Warning */}
          <p className="text-xs text-red-500 font-medium">
            Violations may result in content removal, platform banning, and potential legal action.
          </p>

          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded border border-gray-200">
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-0.5"
            />
            <Label htmlFor="agree-terms" className="text-xs text-gray-700 cursor-pointer leading-relaxed">
              I have read and agree to the terms above
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white flex gap-2 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="flex-1 text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!agreedToTerms || isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            {isSubmitting ? 'Processing...' : 'Upload Photos'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}