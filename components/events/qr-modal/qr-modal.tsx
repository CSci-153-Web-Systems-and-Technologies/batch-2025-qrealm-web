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
}

export function QRModal({ isOpen, onClose, eventCode, eventTitle }: QRModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Content */}
          <QRModalContent
            eventCode={eventCode}
            eventTitle={eventTitle}
          />
        </div>
      </div>
    </>
  )
}