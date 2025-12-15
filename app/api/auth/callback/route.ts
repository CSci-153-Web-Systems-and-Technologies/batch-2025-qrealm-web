import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to verify-email page with error
      return NextResponse.redirect(`${requestUrl.origin}/verify-email?error=${encodeURIComponent(error.message)}`)
    }
    
    // Successfully verified, redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }
  
  // No code provided, redirect to home
  return NextResponse.redirect(requestUrl.origin)
}
