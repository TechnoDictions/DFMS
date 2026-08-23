import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hasEmployeeSession = request.cookies.get('employee_session')?.value === 'true'

  // Protect portal routes
  if (
    !user && !hasEmployeeSession &&
    request.nextUrl.pathname.startsWith('/portal')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to portal if trying to access login while logged in
  if (
    (user || hasEmployeeSession) &&
    request.nextUrl.pathname === '/login'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/portal/admin/dashboard' : '/portal/employee'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
