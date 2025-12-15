import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl;

  // Avoid loops on verify-email page itself
  if (pathname.startsWith('/verify-email')) {
    return NextResponse.next();
  }

  // Handle email verification flow (token_hash + type parameters)
  // These come from Supabase email verification links
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  if (token_hash && type) {
    // Forward to verify-email page to handle the verification
    const redirectUrl = new URL('/verify-email', origin);
    redirectUrl.searchParams.set('token_hash', token_hash);
    redirectUrl.searchParams.set('type', type);
    console.log('[Proxy] Redirecting email verification to verify-email:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }

  // Handle OAuth code exchange flow
  // If a code param exists, redirect to auth callback to exchange it for a session
  const code = searchParams.get('code');
  if (code) {
    const redirectUrl = new URL('/api/auth/callback', origin);
    redirectUrl.searchParams.set('code', code);
    console.log('[Proxy] Redirecting code to callback:', redirectUrl.toString());
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
    console.log('[Proxy] Redirecting error to verify-email:', redirectUrl.toString());
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
