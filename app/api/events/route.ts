import { NextResponse } from "next/server"
import { createEventSchema } from "@/types/event.schema"
import { createClient } from "@/utils/supabase/server"
import { convertFrontendEventToDatabase } from "@/types/event"
import { EventQRGenerator } from '@/lib/qr-generator'
import { FileUploadService } from '@/lib/file-upload'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // Extract all fields from FormData and convert null to empty strings
    const eventData = {
      title: formData.get('title') as string || '',
      category: formData.get('category') as string || '',
      description: formData.get('description') as string || '',
      event_date: formData.get('event_date') as string || '',
      event_time: formData.get('event_time') as string || '',
      custom_category: formData.get('custom_category') as string || '',
      organizer: formData.get('organizer') as string || '',
      location: formData.get('location') as string || '',
      cover_image_url: formData.get('cover_image_url') as string || 'https://placehold.co/default.png', // FALLBACK TO PLACEHOLDER
      max_photos: Number(formData.get('max_photos') || 100),
      expected_attendees: formData.get('expected_attendees') ? Number(formData.get('expected_attendees')) : undefined,
      allow_photo_upload: formData.get('allow_photo_upload') === 'true',
      is_public: formData.get('is_public') === 'true',
    }

    console.log('Received form data from API:', { 
      ...eventData,
      cover_image_url: eventData.cover_image_url ? `✓ Set (${eventData.cover_image_url.substring(0, 50)}...)` : '✗ Empty'
    })

    // Zod validation
    const parseResult = createEventSchema.safeParse(eventData)

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ')
      
      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      )
    }

    const validData = parseResult.data

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 }
      )
    }

    // Convert frontend data to database format
    const dbData = convertFrontendEventToDatabase(validData)
    
    // Prepare final data with user context
    const finalData = {
      ...dbData,
      created_by: user.id,
    }

    console.log('Creating event in database with data:', {
      ...finalData,
      cover_image_url: finalData.cover_image_url ? `✓ Set` : '✗ Empty'
    })

    // Insert into database
    const { data: event, error: dbError } = await supabase
      .from("events")
      .insert([finalData])
      .select(`
        *,
        event_codes (*)
      `)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      )
    }

    console.log('Event created in database, generating QR code...')

    // Generate QR code for the new event
    try {
      const { code, qrCodeUrl } = await EventQRGenerator.generateEventQRCode()
      
      const { error: qrError } = await supabase
        .from('event_codes')
        .insert({
          event_id: event.id,
          code: code,
          qr_code_url: qrCodeUrl
        })

      if (qrError) {
        console.error('Error saving QR code:', qrError)
      } else {
        console.log('QR code generated successfully:', code)
      }
    } catch (qrError) {
      console.error('Error generating QR code:', qrError)
    }

    // Fetch the complete event with QR code
    const { data: completeEvent, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        event_codes (*)
      `)
      .eq('id', event.id)
      .single()

    if (fetchError) {
      console.error('Error fetching event with QR code:', fetchError)
      return NextResponse.json({ 
        success: true,
        event: event 
      }, { status: 201 })
    }

    console.log('Event creation process completed successfully!')
    
    // Success response with complete event data including QR code
    return NextResponse.json({ 
      success: true,
      event: completeEvent 
    }, { status: 201 })

  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Make sure you have the uploadCoverImage function
async function uploadCoverImage(file: File): Promise<string> {
  const supabase = await createClient()
  
  try {
    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `event-covers/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('events')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading cover image:', error)
      return ''
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('events')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error in cover image upload:', error)
    return ''
  }
}


export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_codes (*)
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ events })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}