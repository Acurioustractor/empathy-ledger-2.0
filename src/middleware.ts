import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => 
              response.cookies.set({ name, value, ...options })
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // Handle auth routes
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (session) {
        // If already logged in, redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
      return response;
    }

    // Handle protected routes
    const protectedPaths = ['/submit', '/stories/edit'];
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtectedPath && !session) {
      const redirectUrl = new URL('/auth/sign-in', request.url);
      redirectUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (e) {
    console.error('Auth middleware error:', e);
    return response;
  }
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/submit/:path*',
    '/stories/edit/:path*'
  ],
};
