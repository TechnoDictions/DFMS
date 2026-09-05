import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/portal/admin/dashboard'
  const origin = requestUrl.origin

  if (code) {
    // Prepare redirect response
    const redirectUrl = new URL(next, origin)
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, {
                ...options,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (!isLocalEnv && forwardedHost) {
        const proto = request.headers.get('x-forwarded-proto') || 'https'
        return NextResponse.redirect(`${proto}://${forwardedHost}${next}`, {
          headers: response.headers,
        })
      }
      return response
    }
    
    console.error('Google Auth callback exchange error:', error)
  }

  // If code is missing or exchange failed, redirect back to login with error
  return NextResponse.redirect(new URL('/login?error=Could%20not%20authenticate%20user', origin))
}
