import { z } from "zod"

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional().or(z.literal('')),
  event_date: z.string().optional().or(z.literal('')), // Match your database field names
  event_time: z.string().optional().or(z.literal('')),
  category: z.enum([ // Use category (frontend) not category_id
    'Sports', 'Academics', 'Arts', 'Music', 'Theater', 
    'Community', 'Fundraiser', 'Field Trip', 'Assembly', 
    'Graduation', 'Holiday', 'Other'
  ]),
  custom_category: z.string().max(100, "Custom category too long").optional().or(z.literal('')),
  organizer: z.string().max(255, "Organizer name too long").optional().or(z.literal('')),
  location: z.string().max(255, "Location too long").optional().or(z.literal('')),
  cover_image_url: z.string().url("Invalid URL").optional().or(z.literal('')),
  max_photos: z.number().min(1, "Must allow at least 1 photo").max(1000, "Maximum photos too high").default(100),
  expected_attendees: z.number().min(0, "Cannot be negative").max(50000, "Too many attendees").optional().nullable(),
  allow_photo_upload: z.boolean().default(true),
  is_public: z.boolean().default(true),
}).refine((data) => {
  // Custom validation: if category is "Other", custom_category is required
  if (data.category === 'Other' && !data.custom_category?.trim()) {
    return false
  }
  return true
}, {
  message: "Custom category is required when selecting 'Other'",
  path: ["custom_category"]
})

export const updateEventSchema = createEventSchema.partial()

// Type inference
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>