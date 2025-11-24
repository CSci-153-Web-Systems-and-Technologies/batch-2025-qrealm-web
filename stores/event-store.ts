import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'
import type { Event, DatabaseEvent, CreateEventData, UpdateEventData, EventWithCode } from '@/types'
import { convertDatabaseEventToFrontend, convertFrontendEventToDatabase } from '@/types'
import { createEventSchema, updateEventSchema } from '@/types/event.schema'
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

  // Create new event
  // In stores/event-store.ts, update the createEvent method signature:
  createEvent: async (data: CreateEventData) => {
    set({ isLoading: true, error: null })
    
    try {
      const formData = new FormData()
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString())
          } else if (typeof value === 'number') {
            formData.append(key, value.toString())
          } else if (typeof value === 'string') {
            // Always append strings, even empty ones
            formData.append(key, value)
          }
        }
      })

      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData, // Send as FormData, not JSON
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }

      // Convert database event to frontend format
      const frontendEvent = convertDatabaseEventToFrontend(result.event)
      
      // Update local state
      set(state => ({ 
        events: [frontendEvent, ...state.events],
        currentEvent: frontendEvent,
        isLoading: false 
      }))

      // Redirect to event detail page with QR code
      if (result.event?.id) {
        window.location.href = `/admin/events/${result.event.id}`
      }

      return { success: true, event: frontendEvent }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event'
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