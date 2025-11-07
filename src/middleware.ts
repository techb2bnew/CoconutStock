import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = ['/login', '/signup', '/forgot-password', '/otp'].includes(pathname);
  const isAdminPath = pathname.startsWith('/admin');

  // If the user is authenticated
  if (authToken) {
    if (isPublicPath) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  } 
  else {
    if (isAdminPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If the user is at the root, redirect to the dashboard. The logic above will handle auth checks.
  if(pathname === '/'){
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   // Temporarily allow all routes to be accessed publicly
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }

