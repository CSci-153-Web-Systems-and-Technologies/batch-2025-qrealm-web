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
      
      {/* Modal - Responsive sizing and positioning */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto
        /* Pull scrollbar inward with negative margin */
        -mr-1 sm:-mr-2 md:-mr-3
        /* Custom scrollbar styling */
        scrollbar-thin 
        scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
        scrollbar-track-transparent
        hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
        scrollbar-thumb-rounded-full
        /* WebKit */
        [&::-webkit-scrollbar]:w-2.5
        [&::-webkit-scrollbar-track]:my-3 sm:my-4
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:mx-1
        [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500">
                
          {/* Close button - Responsive sizing */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-3 md:right-4 top-2 sm:top-3 md:top-4 z-10 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
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