'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DeleteEventModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  eventTitle: string
  eventId: string
  photoCount?: number
}

export default function DeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  eventId,
  photoCount = 0
}: DeleteEventModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const CONFIRM_PHRASE = 'DELETE MY EVENT'
  const isConfirmValid = confirmText === CONFIRM_PHRASE

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText('')
      setError(null)
      setIsDeleting(false)
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (!isConfirmValid) return

    setIsDeleting(true)
    setError(null)

    try {
      await onConfirm()
      // Success - modal will close from parent
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete event. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isConfirmValid && !isDeleting) {
      handleDelete()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Delete Event</DialogTitle>
              <DialogDescription>
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Message */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-2">
              ⚠️ Warning: This will permanently delete:
            </p>
            <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
              <li>The event: <strong>"{eventTitle}"</strong></li>
              <li>All {photoCount} uploaded photos</li>
              <li>All event data and QR codes</li>
              <li>Upload history and statistics</li>
            </ul>
          </div>

          {/* Event Info Card */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Event Details</p>
                <p className="text-lg font-semibold text-gray-900 mb-1">{eventTitle}</p>
                <p className="text-xs text-gray-600">ID: {eventId.substring(0, 8)}...</p>
              </div>
              {photoCount > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">{photoCount}</p>
                  <p className="text-xs text-gray-600">photos</p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <code className="px-2 py-1 bg-gray-100 text-red-600 rounded font-mono text-xs">
                {CONFIRM_PHRASE}
              </code> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Type here to confirm..."
              disabled={isDeleting}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
              autoComplete="off"
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-gray-500 mt-2">
                Type exactly: <strong>{CONFIRM_PHRASE}</strong>
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
