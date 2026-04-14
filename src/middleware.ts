import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALES, DEFAULT_LOCALE, isValidLocale } from '@/i18n/config'

// ── i18n helpers ──────────────────────────────────────────────────────────────

const PUBLIC_FILE = /\.(.*)$/

/** Paths that should never be locale-prefixed */
function isInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  )
}

/** Detect preferred locale — cookie wins, then Accept-Language, then default */
function detectLocale(req: NextRequest): string {
  // 1. User-set preference cookie (written by LangSwitcher)
  const cookieLng = req.cookies.get('NEXT_LOCALE')?.value
  if (cookieLng && isValidLocale(cookieLng)) return cookieLng

  // 2. Browser Accept-Language header
  const acceptLang = req.headers.get('accept-language') ?? ''
  for (const part of acceptLang.split(',')) {
    const lang = part.split(';')[0].trim().toLowerCase()
    if (lang.startsWith('zh')) return 'zh'
    if (lang.startsWith('en')) return 'en'
  }
  return DEFAULT_LOCALE
}

// ── Merged middleware ─────────────────────────────────────────────────────────

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 1. Auth guard: admin role check
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 2. Skip internal paths
    if (isInternalPath(pathname)) return NextResponse.next()

    // 3. Skip paths that already have a valid locale prefix
    const firstSegment = pathname.split('/')[1]
    if (isValidLocale(firstSegment)) {
      // Set x-lng header so root layout can read it for <html lang>
      const res = NextResponse.next()
      res.headers.set('x-lng', firstSegment)
      return res
    }

    // 4. Redirect bare root path to locale-prefixed version
    if (pathname === '/') {
      const locale = detectLocale(req)
      return NextResponse.redirect(new URL(`/${locale}`, req.url))
    }

    // 5. All other paths (e.g. /news, /explore): pass through
    //    They are served by (main) route group — no locale prefix needed
    const res = NextResponse.next()
    res.headers.set('x-lng', DEFAULT_LOCALE)
    return res
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (
          pathname.startsWith('/dashboard') ||
          pathname.startsWith('/profile') ||
          pathname.startsWith('/admin')
        ) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image
     * - favicon.ico
     * - Files with extensions (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
