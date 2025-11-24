export interface DatabaseEventCategory {
  id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}



export const DATABASE_CATEGORIES: DatabaseEventCategory[] = [
  { id: 1, name: 'Sports', is_active: true, created_at: '', updated_at: '' },
  { id: 2, name: 'Academics', is_active: true, created_at: '', updated_at: '' },
  { id: 3, name: 'Arts', is_active: true, created_at: '', updated_at: '' },
  { id: 4, name: 'Music', is_active: true, created_at: '', updated_at: '' },
  { id: 5, name: 'Theater', is_active: true, created_at: '', updated_at: '' },
  { id: 6, name: 'Community', is_active: true, created_at: '', updated_at: '' },
  { id: 7, name: 'Fundraiser', is_active: true, created_at: '', updated_at: '' },
  { id: 8, name: 'Field Trip', is_active: true, created_at: '', updated_at: '' },
  { id: 9, name: 'Assembly', is_active: true, created_at: '', updated_at: '' },
  { id: 10, name: 'Graduation', is_active: true, created_at: '', updated_at: '' },
  { id: 11, name: 'Holiday', is_active: true, created_at: '', updated_at: '' },
  { id: 12, name: 'Other', is_active: true, created_at: '', updated_at: '' }
]


export const EVENT_CATEGORIES = [
  { 
    value: 'Sports', 
    label: '🏈 Sports', 
    description: 'Athletic events, games, tournaments' 
  },
  { 
    value: 'Academics', 
    label: '📚 Academics', 
    description: 'Science fairs, debates, competitions' 
  },
  { 
    value: 'Arts', 
    label: '🎨 Arts', 
    description: 'Art shows, exhibitions, creative workshops' 
  },
  { 
    value: 'Music', 
    label: '🎵 Music', 
    description: 'Concerts, recitals, musical performances' 
  },
  { 
    value: 'Theater', 
    label: '🎭 Theater', 
    description: 'Plays, drama productions, theater events' 
  },
  { 
    value: 'Community', 
    label: '🤝 Community', 
    description: 'Community service, outreach programs' 
  },
  { 
    value: 'Fundraiser', 
    label: '💰 Fundraiser', 
    description: 'Charity events, fundraising activities' 
  },
  { 
    value: 'Field Trip', 
    label: '🚌 Field Trip', 
    description: 'Educational trips, excursions' 
  },
  { 
    value: 'Assembly', 
    label: '👥 Assembly', 
    description: 'School assemblies, gatherings' 
  },
  { 
    value: 'Graduation', 
    label: '🎓 Graduation', 
    description: 'Graduation ceremonies, promotions' 
  },
  { 
    value: 'Holiday', 
    label: '🎄 Holiday', 
    description: 'Seasonal events, holiday celebrations' 
  },
  { 
    value: 'Other', 
    label: '📋 Other', 
    description: 'Custom event categories' 
  }
] as const

export type EventCategoryValue = typeof EVENT_CATEGORIES[number]['value']
export type EventCategoryLabel = typeof EVENT_CATEGORIES[number]['label']

export interface EventCategory {
  value: EventCategoryValue
  label: EventCategoryLabel
  description: string
}

// ============================================================================
// MAPPING FUNCTIONS (Bridge between database and frontend)
// ============================================================================

// Map database category ID to frontend category value
export const mapDatabaseCategoryToFrontend = (categoryId: number | null): EventCategoryValue => {
  const dbCategory = DATABASE_CATEGORIES.find(cat => cat.id === categoryId)
  return (dbCategory?.name as EventCategoryValue) || 'Other'
}

// Map frontend category value to database category ID
export const mapFrontendCategoryToDatabase = (categoryValue: EventCategoryValue): number => {
  const dbCategory = DATABASE_CATEGORIES.find(cat => cat.name === categoryValue)
  return dbCategory?.id || 12 // Default to "Other" if not found
}

// Get database category by ID
export const getDatabaseCategory = (id: number): DatabaseEventCategory | undefined => {
  return DATABASE_CATEGORIES.find(cat => cat.id === id)
}

// Get frontend category by value (with description)
export const getFrontendCategory = (value: EventCategoryValue): EventCategory => {
  return EVENT_CATEGORIES.find(cat => cat.value === value) || EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1]
}

// Get frontend category options for dropdowns (your existing function)
export const getCategoryOptions = () => {
  return EVENT_CATEGORIES.map(cat => ({
    value: cat.value,
    label: cat.label
  }))
}

// ============================================================================
// EVENT TYPES (Updated for database compatibility)
// ============================================================================

// Database Event (matches your ACTUAL table structure)
export interface DatabaseEvent {
  id: string
  title: string
  description: string | null
  event_date: string | null
  event_time: string | null
  category_id: number | null           // DATABASE FIELD - references event_categories.id
  custom_category: string | null
  organizer: string | null
  location: string | null
  cover_image_url: string | null
  max_photos: number
  expected_attendees: number | null
  allow_photo_upload: boolean
  is_public: boolean
  is_active: boolean
  ip_address: string | null
  created_by: string | null            // Matches your ON DELETE SET NULL
  created_at: string
  updated_at: string
}

// Frontend Event (your existing interface with computed category)
export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string | null
  event_time: string | null
  category: EventCategoryValue          // COMPUTED from category_id (for UI)
  custom_category: string | null
  organizer: string | null
  location: string | null
  cover_image_url: string | null
  max_photos: number
  expected_attendees: number | null
  allow_photo_upload: boolean
  is_public: boolean
  is_active: boolean
  ip_address: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// Convert database event to frontend event
export const convertDatabaseEventToFrontend = (dbEvent: DatabaseEvent): Event => {
  return {
    ...dbEvent,
    category: mapDatabaseCategoryToFrontend(dbEvent.category_id),
    created_by: dbEvent.created_by || '' // Handle null case from ON DELETE SET NULL
  }
}

// Convert frontend event data to database format
export const convertFrontendEventToDatabase = (eventData: CreateEventData | UpdateEventData): any => {
  const dbData: any = { ...eventData }
  
  // Convert category to category_id for database
  if ('category' in eventData && eventData.category) {
    dbData.category_id = mapFrontendCategoryToDatabase(eventData.category)
    delete dbData.category // Remove the frontend field
  }
  
  return dbData
}

// Enhanced event with both database and frontend category info
export interface EventWithCategoryDetails extends Event {
  category_details: EventCategory
  display_category: string
}

// ============================================================================
// EXISTING TYPES (Your current interfaces - keeping for compatibility)
// ============================================================================

export interface EventCode {
  id: string
  event_id: string | null  // Updated for your ON DELETE SET NULL
  code: string
  qr_code_url: string | null
  created_at: string
}

export interface EventWithCode extends Event {
  event_codes: EventCode[]
}

// Frontend data structures (your existing ones)
export interface CreateEventData {
  title: string
  description?: string
  event_date?: string
  event_time?: string
  category: EventCategoryValue          // Frontend uses string category
  custom_category?: string
  organizer?: string
  location?: string
  cover_image_url?: string
  max_photos?: number
  expected_attendees?: number
  allow_photo_upload?: boolean
  is_public?: boolean
  ip_address?: string
}

export interface UpdateEventData {
  title?: string
  description?: string
  event_date?: string
  event_time?: string
  category?: EventCategoryValue          
  custom_category?: string | null
  organizer?: string
  location?: string
  cover_image_url?: string
  max_photos?: number
  expected_attendees?: number | null
  allow_photo_upload?: boolean
  is_public?: boolean
  is_active?: boolean
}

// Extended interface for file uploads
export interface CreateEventFormData extends CreateEventData {
  coverImage?: File
}

export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
}



// Validation schema for forms (your existing one)
export const validateEventCategory = (data: CreateEventData | UpdateEventData): string[] => {
  const errors: string[] = []
  
  if (data.category === 'Other' && !data.custom_category) {
    errors.push('Custom category is required when selecting "Other"')
  }
  
  if (data.category !== 'Other' && data.custom_category) {
    errors.push('Custom category should only be provided when category is "Other"')
  }
  
  return errors
}