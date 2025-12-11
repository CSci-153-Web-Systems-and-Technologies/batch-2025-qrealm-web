// lib/queries/events.ts
import { createClient } from '@/utils/supabase/server'
import type { DatabaseEvent } from '@/types/event'

/**
 * Fetch all public events for the discover page
 * Only returns events where is_public = true and is_active = true
 */
export async function getPublicEvents() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_categories!left(name),
      event_codes!left(code)
    `)
    .eq('is_public', true)
    .eq('is_active', true)
    .order('event_date', { ascending: false, nullsFirst: false })
  
  if (error) {
    console.error('Error fetching public events:', error)
    return []
  }
  
  // Transform the data to handle array responses from joins
  const transformedData = (data || []).map(event => ({
    ...event,
    event_categories: Array.isArray(event.event_categories) 
      ? event.event_categories[0] || null
      : event.event_categories,
    event_codes: Array.isArray(event.event_codes) 
      ? event.event_codes[0] || null
      : event.event_codes,
  }))
  
  // Debug logging (remove in production)
  console.log('Fetched events:', transformedData.length)
  console.log('Sample event codes:', transformedData.slice(0, 3).map(e => ({
    title: e.title,
    hasCode: !!e.event_codes?.code,
    code: e.event_codes?.code
  })))
  
  return transformedData as (DatabaseEvent & { 
    event_categories: { name: string } | null
    event_codes: { code: string } | null
  })[]
}

/**
 * Fetch events created by the current user
 * For "My Events" section (optional enhancement)
 */
export async function getUserEvents(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_categories!left(name),
      event_codes!left(code)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user events:', error)
    return []
  }
  
  // Transform the data
  const transformedData = (data || []).map(event => ({
    ...event,
    event_categories: Array.isArray(event.event_categories) 
      ? event.event_categories[0] || null
      : event.event_categories,
    event_codes: Array.isArray(event.event_codes) 
      ? event.event_codes[0] || null
      : event.event_codes,
  }))
  
  return transformedData as (DatabaseEvent & { 
    event_categories: { name: string } | null
    event_codes: { code: string } | null
  })[]
}

/**
 * Get photo count for a specific event
 * Counts only approved uploads
 */
export async function getEventPhotoCount(eventId: string) {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('uploads')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_approved', true)
  
  if (error) {
    console.error('Error counting photos:', error)
    return 0
  }
  
  return count || 0
}

/**
 * Search events by title, description, or location
 */
export async function searchPublicEvents(query: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_categories!left(name),
      event_codes!left(code)
    `)
    .eq('is_public', true)
    .eq('is_active', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
    .order('event_date', { ascending: false, nullsFirst: false })
  
  if (error) {
    console.error('Error searching events:', error)
    return []
  }
  
  // Transform the data
  const transformedData = (data || []).map(event => ({
    ...event,
    event_categories: Array.isArray(event.event_categories) 
      ? event.event_categories[0] || null
      : event.event_categories,
    event_codes: Array.isArray(event.event_codes) 
      ? event.event_codes[0] || null
      : event.event_codes,
  }))
  
  return transformedData as (DatabaseEvent & { 
    event_categories: { name: string } | null
    event_codes: { code: string } | null
  })[]
}

/**
 * Filter events by category
 */
export async function getEventsByCategory(categoryId: number | null) {
  const supabase = await createClient()
  
  let query = supabase
    .from('events')
    .select(`
      *,
      event_categories!left(name),
      event_codes!left(code)
    `)
    .eq('is_public', true)
    .eq('is_active', true)
  
  if (categoryId !== null) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error } = await query.order('event_date', { ascending: false, nullsFirst: false })
  
  if (error) {
    console.error('Error filtering events:', error)
    return []
  }
  
  // Transform the data
  const transformedData = (data || []).map(event => ({
    ...event,
    event_categories: Array.isArray(event.event_categories) 
      ? event.event_categories[0] || null
      : event.event_categories,
    event_codes: Array.isArray(event.event_codes) 
      ? event.event_codes[0] || null
      : event.event_codes,
  }))
  
  return transformedData as (DatabaseEvent & { 
    event_categories: { name: string } | null
    event_codes: { code: string } | null
  })[]
}