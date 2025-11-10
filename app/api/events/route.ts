import { NextResponse } from "next/server"
import { createEventSchema } from "@/types/event.schema"
import { createClient } from "@/utils/supabase/server"
import { convertFrontendEventToDatabase } from "@/types/event"
import { EventQRGenerator } from '@/lib/qr-generator'


export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ✅ Zod validation
    const parseResult = createEventSchema.safeParse(body)
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

    // ✅ Get authenticated user
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

    // ✅ Convert frontend data to database format
    const dbData = convertFrontendEventToDatabase(validData)
    
    // ✅ Prepare final data with user context
    const finalData = {
      ...dbData,
      created_by: user.id,
      // Add IP address if you want server-side IP tracking
      // ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    }

    console.log('Creating event with data:', finalData)

    // ✅ Insert into database
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
// 🎯 CRITICAL: GENERATE QR CODE FOR THE NEW EVENT
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
        // Don't fail the entire request if QR code fails
        // We can regenerate QR codes later if needed
      } else {
        console.log('✅ QR code generated successfully:', code)
      }
    } catch (qrError) {
      console.error('❌ Error generating QR code:', qrError)
      // Continue even if QR generation fails - event is still created
    }

    // ✅ Fetch the complete event with QR code
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
      // Return the original event even if fetch fails
      return NextResponse.json({ 
        success: true,
        event: event 
      }, { status: 201 })
    }

    // ✅ Success response with complete event data including QR code
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

// ✅ Add GET method to fetch events
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