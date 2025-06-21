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
  const protectedPaths = ['/dashboard', '/profile', '/student', '/teacher', '/booking', '/find-teachers']; // Added /find-teachers

  // Check if the current path starts with any of the protected paths
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

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
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/auth/sign-up')) {
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
