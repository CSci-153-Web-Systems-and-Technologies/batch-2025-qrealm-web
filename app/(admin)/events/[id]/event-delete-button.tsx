'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteEventModal from '@/components/events/delete-event-modal'

interface EventDeleteButtonProps {
  eventId: string
  eventTitle: string
  photoCount?: number
}

export default function EventDeleteButton({ 
  eventId, 
  eventTitle, 
  photoCount = 0 
}: EventDeleteButtonProps) {
  const router = useRouter()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleDeleteConfirm = async () => {
    const res = await fetch(`/api/events/${eventId}/delete`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to delete event')
    }

    // Success - redirect to dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDeleteModalOpen(true)}
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Event
      </Button>

      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        eventTitle={eventTitle}
        eventId={eventId}
        photoCount={photoCount}
      />
    </>
  )
}
