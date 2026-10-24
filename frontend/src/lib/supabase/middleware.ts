import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-niyam.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Route Protection
    const pathname = request.nextUrl.pathname;
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');
    const isPublicRoute = pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.');

    // If user is not authenticated and trying to access protected regulatory routes, redirect to /login
    // Only enforce if Supabase is actively configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !user && !isAuthRoute && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(url);
    }
  } catch (error) {
    // Graceful fallback during setup
  }

  return supabaseResponse;
}
