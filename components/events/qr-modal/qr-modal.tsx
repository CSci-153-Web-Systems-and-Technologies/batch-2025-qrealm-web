'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QRModalContent } from './qr-modal-content'

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  eventCode: string
  eventTitle: string
  qrCodeUrl?: string 
}

export function QRModal({ isOpen, onClose, eventCode, eventTitle, qrCodeUrl }: QRModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-3 md:right-4 top-2 sm:top-3 md:top-4 z-10 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full"
            onClick={onClose}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          {/* Content */}
          <QRModalContent
            eventCode={eventCode}
            eventTitle={eventTitle}
            qrCodeUrl={qrCodeUrl}
          />
        </div>
      </div>
    </>
  )
}