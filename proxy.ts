import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl;

  // Avoid loops on verify-email page itself
  if (pathname.startsWith('/verify-email')) {
    return NextResponse.next();
  }

  // If a code param exists, redirect to auth callback to exchange it for a session
  const code = searchParams.get('code');
  if (code) {
    const redirectUrl = new URL('/api/auth/callback', origin);
    redirectUrl.searchParams.set('code', code);
    return NextResponse.redirect(redirectUrl);
  }

  // Forward auth errors to verify-email page
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  if (error || errorCode || errorDescription) {
    const redirectUrl = new URL('/verify-email', origin);
    if (error) redirectUrl.searchParams.set('error', error);
    if (errorCode) redirectUrl.searchParams.set('error_code', errorCode);
    if (errorDescription) redirectUrl.searchParams.set('error_description', errorDescription);
    return NextResponse.redirect(redirectUrl);
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const supabase = await createClient();

    // Check if user has an active session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has admin role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      // Profile not found or error fetching profile
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has admin or super_admin role
    const validRoles = ['admin', 'super_admin'];
    if (!validRoles.includes(profile.role)) {
      // User doesn't have required admin role, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes trigger the middleware
export const config = {
  matcher: [
    '/',
    '/login',
    '/signUp',
    '/verify-email',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/moderation/:path*',
  ],
};
