import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test database connection
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    // Test auth connection
    const { data: { session } } = await supabase.auth.getSession()

    return NextResponse.json({
      success: true,
      message: 'Supabase configuration is working!',
      database: 'Connected successfully',
      auth: session ? 'User authenticated' : 'No active session',
      profiles_count: profiles?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: `Configuration error: ${error.message}` },
      { status: 500 }
    )
  }
}