import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { DEFAULT_LOCALE, isValidLocale } from '@/i18n/config'

// ── helpers ───────────────────────────────────────────────────────────────────

const PUBLIC_FILE = /\.(.*)$/

function isInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  )
}

function detectLocale(req: NextRequest): string {
  // 1. Cookie written by LangSwitcher (user preference)
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

// ── middleware ────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Skip internal Next.js & API paths ──────────────────────────────────
  if (isInternalPath(pathname)) return NextResponse.next()

  // ── 2. Strip locale prefix to get the "real" path for auth checks ─────────
  const firstSegment = pathname.split('/')[1]
  const hasLocale = isValidLocale(firstSegment)
  const realPath = hasLocale
    ? (pathname.replace(`/${firstSegment}`, '') || '/')
    : pathname

  // ── 3. Auth guard for protected routes ────────────────────────────────────
  const isProtected =
    realPath.startsWith('/dashboard') ||
    realPath.startsWith('/profile') ||
    realPath.startsWith('/admin')

  if (isProtected) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(loginUrl)
    }

    if (realPath.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // ── 4. Locale-prefixed path → forward, set x-lng header ──────────────────
  if (hasLocale) {
    const res = NextResponse.next()
    res.headers.set('x-lng', firstSegment)
    return res
  }

  // ── 5. Root path → redirect to detected locale ───────────────────────────
  if (pathname === '/') {
    const locale = detectLocale(req)
    return NextResponse.redirect(new URL(`/${locale}`, req.url))
  }

  // ── 6. All other paths (/news, /explore, …) → pass through ───────────────
  const locale = detectLocale(req)
  const res = NextResponse.next()
  res.headers.set('x-lng', locale)
  return res
}

export const config = {
  matcher: [
    /*
     * Match every path EXCEPT:
     *   _next/static, _next/image, favicon.ico, and files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
