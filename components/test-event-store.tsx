'use client'

import { useEventStore } from '@/stores/event-store'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestEventStore() {
  const { events, isLoading, error, fetchEvents, createEvent, clearError } = useEventStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user, fetchEvents])

  const handleCreateTestEvent = async () => {
    const result = await createEvent({
      title: `Test Event ${Date.now()}`,
      description: 'This is a test event created from the frontend',
      category: 'Sports',
      organizer: 'Test Organizer',
      location: 'Test Location',
      max_photos: 50,
      expected_attendees: 100,
      allow_photo_upload: true,
      is_public: true
    })

    if (result.success) {
      console.log('✅ Event created successfully:', result.event)
    } else {
      console.error('❌ Failed to create event:', result.error)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Please log in to test the event store</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Store Test</CardTitle>
        <CardDescription>Test event creation and management</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button onClick={fetchEvents} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh Events'}
          </Button>
          <Button onClick={handleCreateTestEvent} disabled={isLoading}>
            Create Test Event
          </Button>
          {error && (
            <Button variant="outline" onClick={clearError}>
              Clear Error
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 text-red-600 bg-red-50 rounded-md">
            Error: {error}
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Events ({events.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="p-3 border rounded-md">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-600">
                  Category: {event.category} | Photos: {event.max_photos} | Public: {event.is_public ? 'Yes' : 'No'}
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(event.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {events.length === 0 && !isLoading && (
              <p className="text-gray-500">No events found. Create one!</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}