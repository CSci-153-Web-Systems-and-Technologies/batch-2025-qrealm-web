import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Redirect auth query params to the right handler
export function middleware(request: NextRequest) {
  const { nextUrl } = request

  // Avoid loops on verify-email page itself
  if (nextUrl.pathname.startsWith('/verify-email')) {
    return NextResponse.next()
  }

  // If a code param exists, redirect to auth callback to exchange it for a session
  const code = nextUrl.searchParams.get('code')
  if (code) {
    const redirectUrl = new URL('/api/auth/callback', nextUrl.origin)
    redirectUrl.searchParams.set('code', code)
    return NextResponse.redirect(redirectUrl)
  }

  // Forward auth errors to verify-email page
  const error = nextUrl.searchParams.get('error')
  const errorCode = nextUrl.searchParams.get('error_code')
  const errorDescription = nextUrl.searchParams.get('error_description')

  if (error || errorCode || errorDescription) {
    const redirectUrl = new URL('/verify-email', nextUrl.origin)
    if (error) redirectUrl.searchParams.set('error', error)
    if (errorCode) redirectUrl.searchParams.set('error_code', errorCode)
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signUp',
    '/verify-email',
  ],
}
