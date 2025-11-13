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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useEventStore } from '@/stores/event-store'
import { CategorySelector } from './category-selector'
import { DateTimePicker } from './date-time-picker'
import { CreateEventData, EventCategoryValue, validateEventCategory } from '@/types'
import { createEventSchema, CreateEventInput } from '@/types/event.schema'
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  MapPin,
  Users,
  Camera,
  Settings,
  ChevronRight
} from 'lucide-react'

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
      expected_attendees: undefined,
      allow_photo_upload: true,
      is_public: true,
    },
  })

  const selectedCategory = watch('category')
  const customCategory = watch('custom_category')
  const maxPhotos = watch('max_photos') || 100
  const allowPhotoUpload = watch('allow_photo_upload')
  const isPublic = watch('is_public')

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

  const handleNumberChange = (field: keyof CreateEventInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setValue(field, value === '' ? undefined : Number(value))
  }

  const onSubmit = async (data: CreateEventInput) => {
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
    <div className="!w-full !min-h-screen !max-w-6xl !mx-auto !px-6 !py-8">

        {/* Header with Breadcrumb */}
        <div className="space-y-4 !mb-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center gap-1 p-0 h-auto hover:bg-transparent hover:text-gray-700 font-normal"
                >
                <ArrowLeft className="h-3 w-3" />
                <span>Dashboard</span>
                </Button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">Create Event</span>
            </div>
            
            {/* Page Title and Description */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Create New Event</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Set up your event details and configuration
                </p>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 !gap-8">

        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 !space-y-6">
          {/* Basic Information Card */}
          <Card className='!p-4'>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
              <CardDescription className='sm:text-[8px] lg:text-sm'>
                Basic information about your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 !gap-4">
                <div className="!space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g., Annual Science Fair 2024"
                    {...register('title')}
                    className='!p-2 !text-sm !sm:text-base !lg:text-sm'
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="!space-y-2">
                  <Label htmlFor="organizer">Organizer/Host</Label>
                  <Input
                    id="organizer"
                    placeholder="e.g., Science Department, Student Council"
                    {...register('organizer')}
                    className='!p-2 !text-sm !sm:text-base !lg:text-sm'
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event for attendees..."
                  {...register('description')}
                  rows={3}
                  className='!p-2 !text-sm !sm:text-base !text-red-500'
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 !mt-4">
                <div className="space-y-3">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <CategorySelector
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                    />
                    {errors.category && (
                    <p className="text-sm text-red-600 !p-2">{errors.category.message}</p>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col space-y-2">
                    <DateTimePicker
                        date={selectedDate}
                        onDateChange={handleDateChange}
                        time={selectedTime}
                        onTimeChange={handleTimeChange}
                    />
                    </div>
                </div>

                    

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
                    <p className="text-sm text-red-600 !p-2">{errors.custom_category.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 !gap-4 !mt-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                  <Input
                    id="location"
                    placeholder="e.g., School Gym, Auditorium, Field"
                    {...register('location')}
                    className='!p-2 !text-sm !sm:text-base !lg:text-sm'
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image_url">Cover Image URL</Label>
                  <Input
                    id="cover_image_url"
                    placeholder="https://example.com/image.jpg"
                    {...register('cover_image_url')}
                    className='!p-2 !text-sm !sm:text-base !lg:text-sm'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

         {/* Photo Settings Card */}
            <Card className='!p-4'>
                <CardHeader>
                    <CardTitle className="flex items-center !gap-2">
                    <Camera className="h-5 w-5" />
                    Photo Settings
                    </CardTitle>
                    <CardDescription className='sm:text-[8px] lg:text-sm'>
                    Configure photo upload settings for your event
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 !p-2">
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
                        <p className="text-xs text-gray-500 !pt-2">
                        Maximum number of photos guests can upload
                        </p>
                    </div>

                    <div className="space-y-2 !p-2">
                        <Label htmlFor="expected_attendees">Expected Attendees</Label>
                        <Input
                        id="expected_attendees"
                        type="number"
                        placeholder="e.g., 150"
                        className='!p-2 !text-sm !sm:text-base !lg:text-sm'
                        onChange={handleNumberChange('expected_attendees')}
                        />
                        <p className="text-xs text-gray-500">
                        Estimated number of attendees
                        </p>
                    </div>
                    </div>

                    <Separator />

                    <div className="!space-y-4 !pt-4">
                    {/* Switch 1 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg bg-gray-50/50">
                        <div className="flex-1 min-w-0 space-y-1">
                        <Label className="text-base font-medium">Allow Photo Uploads</Label>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Allow attendees to upload photos via QR code
                        </p>
                        </div>
                        <div className="flex-shrink-0 sm:pl-4">
                        <Switch
                            checked={allowPhotoUpload}
                            onCheckedChange={(checked) => setValue('allow_photo_upload', checked)}
                        />
                        </div>
                    </div>

                    {/* Switch 2 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg  bg-gray-50/50">
                        <div className="flex-1 min-w-0 space-y-1">
                        <Label className="text-base font-medium">Public Event</Label>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Make this event visible in public galleries
                        </p>
                        </div>
                        <div className="flex-shrink-0 sm:pl-4">
                        <Switch
                            checked={isPublic}
                            onCheckedChange={(checked) => setValue('is_public', checked)}
                        />
                        </div>
                    </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="!space-y-6">
          {/* Event Status Card */}
          <Card
            className="
                !p-6 
                rounded-2xl 
                backdrop-blur-md 
                bg-white/10 
                border border-white/20 
                shadow-lg
                hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
            "
            >

            <CardHeader>
              <CardTitle className="flex items-center !gap-2 !p-2">
                <Settings className="h-5 w-5" />
                Event Status
              </CardTitle>
            </CardHeader>
            <CardContent className="!space-y-4">
              <div className="!space-y-3 !p-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 !p-1">
                    Draft
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">QR Code</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 !p-1">
                    Auto-generated
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Visibility</span>
                  <Badge variant="outline" className={isPublic ? "bg-green-100 text-green-800 !p-1" : "bg-gray-100 text-gray-800 !p-1"}>
                    {isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="!space-y-3 !p-4">
                <h4 className="font-medium text-sm">Quick Info</h4>
                <div className="!space-y-2 text-sm !p-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>Max Photos: {maxPhotos}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-gray-400" />
                    <span>Uploads: {allowPhotoUpload ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>Category: {selectedCategory}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className='!p-1 !gap-0'>
            <CardHeader className='!p-4'>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="!space-y-3 !p-4">
              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={isLoading}
                className="w-full !gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Creating...' : 'Create Event'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isLoading}
                className="w-full"
              >
                Cancel
              </Button>

              <div className="text-xs text-gray-500 space-y-1 pt-2">
                <p>• Event will be created as a draft</p>
                <p>• QR code will be generated automatically</p>
                <p>• You can edit settings after creation</p>
              </div>
            </CardContent>
          </Card>

          {/** Requirements Card 
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${watch('title') ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Event title</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedCategory ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Event category</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${watch('location') ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Event location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedDate ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Event date</span>
                </div>
              </div>
            </CardContent>
          </Card>
          */}
        </div>

      </div>


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