'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useEventStore } from '@/stores/event-store'
import { CategorySelector } from './category-selector'
import { DateTimePicker } from './date-time-picker'
import { CreateEventData, EventCategoryValue, validateEventCategory } from '@/types'
import { createEventSchema, CreateEventInput } from '@/types/event.schema'

export default function CreateEventForm() {
  const router = useRouter()
  const { createEvent, isLoading } = useEventStore()
  
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: '',
      category: 'Sports',
      description: '',
      event_date: '',
      event_time: '',
      custom_category: '',
      organizer: '',
      location: '',
      cover_image_url: '',
      max_photos: 100,
      expected_attendees: undefined, // Use undefined instead of empty string
      allow_photo_upload: true,
      is_public: true,
    },
  })

  const selectedCategory = watch('category')
  const customCategory = watch('custom_category')
  const maxPhotos = watch('max_photos') || 100

  const handleCategoryChange = (category: EventCategoryValue) => {
    setValue('category', category)
    if (category !== 'Other') {
      setValue('custom_category', '')
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    setValue('event_date', date ? formatDateToYYYYMMDD(date) : '')
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    setValue('event_time', time)
  }

  // Handle number input changes properly
  const handleNumberChange = (field: keyof CreateEventInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue(field, value === '' ? undefined : Number(value))
  }

  const onSubmit = async (data: CreateEventInput) => {
    // Additional validation
    const validationErrors = validateEventCategory(data as CreateEventData)
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'))
      return
    }

    const result = await createEvent(data as CreateEventData)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      console.error('Failed to create event:', result.error)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Event</CardTitle>
          <CardDescription>
            Fill in the details for your school event. All fields with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Annual Science Fair 2024"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event for attendees..."
                  {...register('description')}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Date & Time</h3>
              
              <div className="space-y-2">
                <Label>Event Date & Time</Label>
                <DateTimePicker
                  date={selectedDate}
                  onDateChange={handleDateChange}
                  time={selectedTime}
                  onTimeChange={handleTimeChange}
                />
              </div>
            </div>

            {/* Event Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Details</h3>
              
              <div className="space-y-2">
                <Label>Category *</Label>
                <CategorySelector
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {selectedCategory === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="custom_category">Custom Category *</Label>
                  <Input
                    id="custom_category"
                    placeholder="Enter your custom category"
                    {...register('custom_category')}
                  />
                  {errors.custom_category && (
                    <p className="text-sm text-red-600">{errors.custom_category.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="organizer">Organizer/Host</Label>
                <Input
                  id="organizer"
                  placeholder="e.g., Science Department, Student Council"
                  {...register('organizer')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., School Gym, Auditorium, Field"
                  {...register('location')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  placeholder="https://example.com/image.jpg"
                  {...register('cover_image_url')}
                />
              </div>
            </div>

            {/* Event Configuration Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="max_photos">
                  Maximum Photos: {maxPhotos}
                </Label>
                <Slider
                  value={[maxPhotos]}
                  onValueChange={([value]) => setValue('max_photos', value)}
                  max={1000}
                  step={10}
                  className="py-4"
                />
                <p className="text-sm text-gray-500">
                  Maximum number of photos guests can upload for this event
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_attendees">Expected Attendees</Label>
                <Input
                  id="expected_attendees"
                  type="number"
                  placeholder="e.g., 150"
                  onChange={handleNumberChange('expected_attendees')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow_photo_upload">Allow Photo Uploads</Label>
                  <p className="text-sm text-gray-500">
                    Guests can upload photos to this event
                  </p>
                </div>
                <Switch
                  id="allow_photo_upload"
                  checked={watch('allow_photo_upload')}
                  onCheckedChange={(checked) => setValue('allow_photo_upload', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public">Public Event</Label>
                  <p className="text-sm text-gray-500">
                    Event will be visible in public galleries
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={watch('is_public')}
                  onCheckedChange={(checked) => setValue('is_public', checked)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to format date as YYYY-MM-DD
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}