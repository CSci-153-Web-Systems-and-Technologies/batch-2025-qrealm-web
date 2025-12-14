import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/moderation/:path*',
  ],
};
