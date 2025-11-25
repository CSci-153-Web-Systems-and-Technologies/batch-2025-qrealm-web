import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { Event, DatabaseEvent, CreateEventData, UpdateEventData, EventWithCode, CreateEventFormData } from '@/types'
import { convertDatabaseEventToFrontend, convertFrontendEventToDatabase } from '@/types'
import { createEventSchema, updateEventSchema } from '@/types/event.schema'
import { FileUploadService } from '@/lib/file-upload'
//import { getClientIP as getClientIPUtil } from '@/lib/ip-utils'


interface EventState {
  // State
  events: Event[]
  currentEvent: Event | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchEvents: () => Promise<void>
  fetchEvent: (id: string) => Promise<void>
  createEvent: (data: CreateEventData) => Promise<{ success: boolean; error?: string; event?: Event }>
  updateEvent: (id: string, data: UpdateEventData) => Promise<{ success: boolean; error?: string }>
  deleteEvent: (id: string) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  clearCurrentEvent: () => void
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  // Fetch all events for the current user
  fetchEvents: async () => {
    const supabase = createClient()
    
    set({ isLoading: true, error: null })
    
    try {
        // Get current user to ensure we're authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
        set({ error: 'Not authenticated', isLoading: false })
        return
        }

        const { data: events, error } = await supabase
        .from('events')
        .select(`
            *,
            event_codes (*)
        `)
        .order('created_at', { ascending: false })

        if (error) {
        console.error('Error fetching events:', error)
        set({ error: error.message, isLoading: false })
        return
        }

        // Convert database events to frontend format
        const frontendEvents = events.map(convertDatabaseEventToFrontend)
        
        set({ events: frontendEvents, isLoading: false })
    } catch (error) {
        console.error('Unexpected error fetching events:', error)
        set({ error: 'Failed to fetch events', isLoading: false })
    }
 },

  // Fetch single event by ID
  fetchEvent: async (id: string) => {
    const supabase = createClient()
    
    set({ isLoading: true, error: null })
    
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          *,
          event_codes (*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching event:', error)
        set({ error: error.message, isLoading: false })
        return
      }

      const frontendEvent = convertDatabaseEventToFrontend(event)
      set({ currentEvent: frontendEvent, isLoading: false })
    } catch (error) {
      console.error('Unexpected error fetching event:', error)
      set({ error: 'Failed to fetch event', isLoading: false })
    }
  },

  createEvent: async (data: CreateEventFormData) => {
    set({ isLoading: true, error: null })
    
    try {
      // Upload cover image if provided
      let coverImageUrl = 'https://placehold.co/default.png' // SET DEFAULT PLACEHOLDER
      
      if (data.coverImage) {
        console.log('Starting cover image upload...', {
          fileName: data.coverImage.name,
          fileSize: data.coverImage.size,
          fileType: data.coverImage.type
        })
        
        const uploadResult = await FileUploadService.uploadCoverImage(data.coverImage)
        
        if (!uploadResult.success) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: uploadResult.error || 'Cover image upload failed' 
          }
        }
        
        // Only override the placeholder if upload was successful
        if (uploadResult.url) {
          coverImageUrl = uploadResult.url
        }
        console.log('Cover image uploaded, URL:', coverImageUrl)
      } else {
        console.log('No cover image provided, using default placeholder')
      }

      // Prepare form data for API
      const formData = new FormData()
      
      // Append all form fields with proper null handling
      const formFields = {
        title: data.title,
        category: data.category,
        description: data.description || '',
        event_date: data.event_date || '',
        event_time: data.event_time || '',
        custom_category: data.custom_category || '',
        organizer: data.organizer || '',
        location: data.location || '',
        cover_image_url: coverImageUrl, // Use uploaded URL OR default placeholder
        max_photos: data.max_photos?.toString() || '100',
        expected_attendees: data.expected_attendees?.toString() || '',
        allow_photo_upload: data.allow_photo_upload?.toString() || 'true',
        is_public: data.is_public?.toString() || 'true',
      }

      // Append each field to FormData
      Object.entries(formFields).forEach(([key, value]) => {
        // Only append if value is defined, convert everything to string
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      console.log('Sending form data to API...', {
        ...formFields,
        cover_image_url: coverImageUrl ? `✓ Set (${coverImageUrl.substring(0, 50)}...)` : '✗ Empty',
        custom_category: formFields.custom_category || 'Empty string'
      })

      // Send to API with FormData
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }

      // Convert and update state
      const frontendEvent = convertDatabaseEventToFrontend(result.event)
      
      set(state => ({ 
        events: [frontendEvent, ...state.events],
        currentEvent: frontendEvent,
        isLoading: false 
      }))

      // REDIRECT TO EVENT DETAIL PAGE WITH QR CODE
      if (result.event?.id) {
        console.log('Event created successfully, redirecting...')
        window.location.href = `/events/${result.event.id}`
      }

      return { success: true, event: frontendEvent }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
      console.error('Event creation error:', error)
      set({ error: errorMessage, isLoading: false })
      return { success: false, error: errorMessage }
    }
  },


  // Update existing event
  updateEvent: async (id: string, data: UpdateEventData) => {
    const supabase = createClient()
    
    set({ isLoading: true, error: null })
    
    try {
      const parsed = updateEventSchema.safeParse(data)
        if (!parsed.success) {
            const message = parsed.error.issues.map(e => e.message).join(", ")
            set({ error: message, isLoading: false })
            return { success: false, error: message }
        }
        // Convert frontend data to database format
      const dbData = convertFrontendEventToDatabase(parsed.data)

      const { error } = await supabase
        .from('events')
        .update(dbData)
        .eq('id', id)

      if (error) {
        console.error('Error updating event:', error)
        set({ error: error.message, isLoading: false })
        return { success: false, error: error.message }
      }

      // Refresh the events list and current event
      await get().fetchEvents()
      if (get().currentEvent?.id === id) {
        await get().fetchEvent(id)
      }

      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      console.error('Unexpected error updating event:', error)
      set({ error: 'Failed to update event', isLoading: false })
      return { success: false, error: 'Failed to update event' }
    }
  },

  // Delete event
  deleteEvent: async (id: string) => {
    const supabase = createClient()
    
    set({ isLoading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting event:', error)
        set({ error: error.message, isLoading: false })
        return { success: false, error: error.message }
      }

      // Remove from local state
      set(state => ({
        events: state.events.filter(event => event.id !== id),
        currentEvent: state.currentEvent?.id === id ? null : state.currentEvent,
        isLoading: false
      }))

      return { success: true }
    } catch (error) {
      console.error('Unexpected error deleting event:', error)
      set({ error: 'Failed to delete event', isLoading: false })
      return { success: false, error: 'Failed to delete event' }
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  clearCurrentEvent: () => set({ currentEvent: null })
}))

// Helper function to get client IP (simplified version)
async function getClientIP(): Promise<string> {
  // In a real app, you'd get this from your API or use a service
  // For now, we'll return a placeholder
  return '127.0.0.1'
}

// Helper to get current user with error handling
async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  
  return user
}