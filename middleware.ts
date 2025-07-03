// middleware.ts


// middleware.ts (in root or src/)
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware'; // Adjust path if needed
// Import the server client creator specifically for middleware/server context
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Call updateSession to handle cookie refreshing and get the base response.
  // This function modifies cookies on the 'response' object it returns.
  let response = await updateSession(request);

  // 2. Create a Supabase client *for this middleware scope* to check session status.
  // It needs access to the request cookies to determine the session.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  // 3. Get user session using the middleware's client instance
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected paths
  const protectedPaths = [
    '/dashboard', 
    '/profile', 
    '/student', 
    '/teacher', 
    '/booking', 
    '/find-teachers',
    '/join-class',
  ]; // Added /find-teachers

  // Check if the current path starts with any of the protected paths
  // const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  
const authPages = ['/login', '/sign-up'];
const isAuthPage = authPages.includes(request.nextUrl.pathname);
const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path)) && !isAuthPage;


  // 4. Redirect logic if accessing protected path without session
  if (!session && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    console.log(`Middleware: No session, redirecting to login from ${request.nextUrl.pathname}`);
    // Redirect using the *latest* response object (in case cookies were modified)
    return NextResponse.redirect(redirectUrl);
  }

  // 5. Redirect logic if logged in and accessing auth pages
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      // Use request.url to get the full base URL for the redirect
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. Allow the request to proceed using the potentially modified response
  return response;
}

export const config = {
  matcher: [
    /* Match all paths except static assets, images, etc. */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


// middleware.ts (in the root or src/ directory)

/*import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client that can read and write cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // The middleware is responsible for setting the cookie on the response
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // The middleware is responsible for removing the cookie from the response
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // This will refresh the session cookie if needed
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/student',
    '/teacher',
    '/booking',
    '/find-teachers',
    '/notifications',
  ]

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // If the user is not logged in and trying to access a protected path, redirect to login
  if (!session && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname) // Remember where they were going
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is logged in and trying to access login/signup pages, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/auth/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If none of the above, continue with the request
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     *
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}*/

