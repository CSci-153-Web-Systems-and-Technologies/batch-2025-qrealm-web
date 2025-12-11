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
          /* Custom scrollbar - Modern styling */
          scrollbar-thin 
          scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
          scrollbar-track-gray-100 dark:scrollbar-track-gray-800
          hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
          scrollbar-thumb-rounded-full scrollbar-track-rounded-full
          scrollbar-gutter-stable
          /* WebKit specific */
          [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5
          [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid
          [&::-webkit-scrollbar-thumb]:border-gray-100 dark:[&::-webkit-scrollbar-thumb]:border-gray-800
          [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
          /* Firefox */
          scrollbar-width: thin
          scrollbar-color: #d1d5db #f3f4f6
          dark:scrollbar-color: #4b5563 #1f2937">
          
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