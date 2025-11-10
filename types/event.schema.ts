import { z } from "zod"

export const createEventSchema = z.object({
  // Required fields
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title too long"),
  category: z.enum([
    'Sports', 'Academics', 'Arts', 'Music', 'Theater', 
    'Community', 'Fundraiser', 'Field Trip', 'Assembly', 
    'Graduation', 'Holiday', 'Other'
  ]),
  
  // Optional fields with proper defaults
  description: z.string().max(1000, "Description too long").default(''),
  event_date: z.string().default(''),
  event_time: z.string().default(''),
  custom_category: z.string().max(100, "Custom category too long").default(''),
  organizer: z.string().max(255, "Organizer name too long").default(''),
  location: z.string().max(255, "Location too long").default(''),
  cover_image_url: z.string().url("Invalid URL").default(''),
  max_photos: z.number().min(1, "Must allow at least 1 photo").max(1000, "Maximum photos too high").default(100),
  expected_attendees: z.number().min(0, "Cannot be negative").optional(), // Use optional() instead of nullable()
  allow_photo_upload: z.boolean().default(true),
  is_public: z.boolean().default(true),
}).refine((data) => {
  if (data.category === 'Other' && !data.custom_category?.trim()) {
    return false
  }
  return true
}, {
  message: "Custom category is required when selecting 'Other'",
  path: ["custom_category"]
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>