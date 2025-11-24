import { NextResponse } from "next/server"
import { createEventSchema } from "@/types/event.schema"
import { createClient } from "@/utils/supabase/server"
import { convertFrontendEventToDatabase } from "@/types/event"
import { EventQRGenerator } from '@/lib/qr-generator'

export async function POST(req: Request) {
  try {
    // CHANGE: Use FormData instead of JSON
    const formData = await req.formData()
    
    // CHANGE: Extract all fields from FormData and convert null to empty strings
    const eventData = {
      title: formData.get('title') as string || '',
      category: formData.get('category') as string || '',
      description: formData.get('description') as string || '',
      event_date: formData.get('event_date') as string || '',
      event_time: formData.get('event_time') as string || '',
      custom_category: formData.get('custom_category') as string || '', // Convert null to empty string
      organizer: formData.get('organizer') as string || '',
      location: formData.get('location') as string || '',
      cover_image_url: formData.get('cover_image_url') as string || '',
      max_photos: Number(formData.get('max_photos') || 100),
      expected_attendees: formData.get('expected_attendees') ? Number(formData.get('expected_attendees')) : undefined,
      allow_photo_upload: formData.get('allow_photo_upload') === 'true',
      is_public: formData.get('is_public') === 'true',
    }

    // CHANGE: Handle file upload if you want to implement it later
    const coverImageFile = formData.get('cover_image_file') as File | null
    // For now, we'll keep using cover_image_url from form data
    // You can implement file upload logic here when ready

    console.log('Received form data:', eventData)

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

    if (userError) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      )
    }

    if (!user) {
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

    console.log('Creating event with data:', finalData)

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

    // Generate QR code for the new event
    console.log('Generating QR code for event:', event.id)
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

// GET method to fetch events
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