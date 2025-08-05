import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getDbConfig, validateDbConfig } from '@/config/database'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  // Get Supabase configuration
  const fileConfig = getDbConfig()
  
  if (validateDbConfig(fileConfig)) {
    const supabase = createServerClient(
      fileConfig.url,
      fileConfig.anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Refresh user object, let Supabase handle session
    await supabase.auth.getUser()
  }
  
  // Add CORS headers for API routes (not needed in development)
  if (request.nextUrl.pathname.startsWith('/api/') && process.env.NODE_ENV !== 'development') {
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}