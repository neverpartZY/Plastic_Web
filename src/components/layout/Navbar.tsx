'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import {
  Search, Menu, X, ChevronDown, Bell,
  LayoutDashboard, User, LogOut, Settings,
  Newspaper, LayoutGrid, Zap, BookOpen, Users, Calendar, Cpu, TrendingUp, Database,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { NavDictionary } from '@/i18n/types'

// ── Default Chinese strings (used when no dict prop provided) ─────────────────

const ZH: NavDictionary = {
  logo: '循环塑料产业平台',
  discover: '发现资源',
  services: '行业服务',
  database: '数据基石',
  subscribe: '订阅情报',
  login: '登录',
  register: '注册',
  searchPlaceholder: '搜索资讯、标签...',
  news: '行业媒体',
  newsDesc: '实时资讯聚合，多维标签检索',
  explore: '产业地图',
  exploreDesc: 'X-Y轴标签体系，精准浏览行业坐标',
  daily: '每日情报',
  dailyDesc: '精选推送，直达邮件与企业微信',
  dailyBadge: '热门',
  thinkTank: '智库研究',
  thinkTankDesc: '战略洞察与深度研究报告',
  association: '行业协会',
  associationDesc: '产业组织连接与资源对接',
  events: '会展活动',
  eventsDesc: '行业峰会与展览信息',
  technology: '技术攻关',
  technologyDesc: '关键技术研发与产业化落地',
  fund: '产业基金',
  fundDesc: '投融资赋能与产业加速',
  operations: '运营服务',
  support: '攻坚支撑',
  dashboard: '我的看板',
  profile: '个人中心',
  adminPanel: '后台管理',
  signOut: '退出登录',
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  desc: string
  iconBg: string
  iconColor: string
  badge?: string
}

function DropdownRow({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className="group flex items-start gap-3 px-3 py-2.5 rounded-2xl hover:bg-emerald-50 active:bg-emerald-100 transition-colors duration-150"
    >
      <div className={cn('mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white transition-all duration-200 group-hover:scale-105 group-hover:ring-emerald-50', item.iconBg)}>
        <Icon className={cn('h-4 w-4', item.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors duration-150 leading-none">
            {item.label}
          </span>
          {item.badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-lime-500 text-white leading-none tracking-wide">
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-[11.5px] text-slate-500 mt-1 leading-snug">{item.desc}</p>
      </div>
    </Link>
  )
}

function NavDropdown({
  label, children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  const show = () => { clearTimeout(closeTimer.current); setOpen(true) }
  const hide = () => { closeTimer.current = setTimeout(() => setOpen(false), 160) }

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className="flex items-center gap-1 px-3 py-2 text-[13.5px] font-medium rounded-xl transition-all duration-200 select-none text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 opacity-50 transition-transform duration-200',
            open && 'rotate-180 opacity-80',
          )}
        />
      </button>

      <div
        className={cn(
          'absolute top-full left-0 mt-2.5 w-[280px] z-50 rounded-3xl p-2',
          'bg-white border border-slate-200/80',
          'transition-all duration-[180ms] origin-top-left',
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.97] -translate-y-1.5 pointer-events-none',
        )}
        style={{
          boxShadow: '0 20px 56px -8px rgba(8,145,178,0.10), 0 4px 16px -4px rgba(0,0,0,0.06)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SubscribeCTA({ scrolled, label, className }: { scrolled: boolean; label: string; className?: string }) {
  return (
    <Link
      href="/subscribe"
      className={cn(
        'relative overflow-hidden group flex items-center gap-1.5 px-4 py-2 rounded-2xl',
        'text-[13px] font-semibold text-white select-none',
        'bg-cyan-700 hover:bg-cyan-600',
        'transition-all duration-200',
        scrolled
          ? 'shadow-[0_2px_10px_rgba(8,145,178,0.35)] hover:shadow-[0_4px_18px_rgba(8,145,178,0.45)]'
          : 'shadow-[0_2px_16px_rgba(8,145,178,0.50)] hover:shadow-[0_4px_24px_rgba(8,145,178,0.60)]',
        className,
      )}
    >
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent
          -translate-x-full skew-x-[-20deg]
          group-hover:translate-x-[300%] transition-transform duration-[650ms] ease-in-out pointer-events-none"
      />
      <span className="relative flex-shrink-0">
        <Bell className="h-3.5 w-3.5" />
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-lime-400 ring-[1.5px] ring-cyan-700" />
      </span>
      {label}
    </Link>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────

interface NavbarProps {
  dict?: NavDictionary
  lng?: string
}

export default function Navbar({ dict, lng }: NavbarProps) {
  const t = dict ?? ZH
  const { data: session } = useSession()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  // Resolve hrefs — prefix with /[lng]/ only when lng is explicitly provided
  const href = (path: string) => (lng ? `/${lng}${path}` : path)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/news?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  // ── Nav link data (built from dict) ────────────────────────────────────────

  const discoverLinks: NavItem[] = [
    { href: href('/news'),      label: t.news,      icon: Newspaper,  desc: t.newsDesc,    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { href: href('/explore'),   label: t.explore,   icon: LayoutGrid, desc: t.exploreDesc, iconBg: 'bg-cyan-100',    iconColor: 'text-cyan-700' },
    { href: href('/subscribe'), label: t.daily,     icon: Zap,        desc: t.dailyDesc,   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600', badge: t.dailyBadge },
  ]

  const serviceOperationLinks: NavItem[] = [
    { href: href('/think-tank'),  label: t.thinkTank,   icon: BookOpen, desc: t.thinkTankDesc,   iconBg: 'bg-cyan-100',  iconColor: 'text-cyan-700' },
    { href: href('/association'), label: t.association, icon: Users,    desc: t.associationDesc, iconBg: 'bg-teal-100',  iconColor: 'text-teal-600' },
    { href: href('/events'),      label: t.events,      icon: Calendar, desc: t.eventsDesc,      iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  ]

  const serviceSupportLinks: NavItem[] = [
    { href: href('/technology'), label: t.technology, icon: Cpu,        desc: t.technologyDesc, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { href: href('/fund'),       label: t.fund,       icon: TrendingUp, desc: t.fundDesc,       iconBg: 'bg-rose-100',    iconColor: 'text-rose-500' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 transition-[background,backdrop-filter,border-color,box-shadow] duration-500',
        scrolled
          ? 'bg-white/90 backdrop-blur-2xl border-b border-cyan-900/[0.07] shadow-[0_1px_20px_-4px_rgba(8,145,178,0.09)]'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="container h-full flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link href={href('/')} className="group flex items-center gap-2.5 flex-shrink-0">
          <div className="h-8 w-8 rounded-2xl bg-cyan-700 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-[-3deg]">
            <span className="text-white font-black text-[12px] leading-none select-none">循</span>
          </div>
          <span className="hidden sm:inline text-[14.5px] font-bold tracking-[-0.3px] text-slate-900">
            {t.logo}
          </span>
        </Link>

        {/* ── Desktop navigation ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center" aria-label="主导航">

          <NavDropdown label={t.discover}>
            {discoverLinks.map(item => (
              <DropdownRow key={item.href} item={item} />
            ))}
          </NavDropdown>

          <NavDropdown label={t.services}>
            <div className="px-3 pt-1.5 pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">
                {t.operations}
              </span>
            </div>
            {serviceOperationLinks.map(item => (
              <DropdownRow key={item.href} item={item} />
            ))}
            <div className="mx-2 my-1 border-t border-slate-100" />
            <div className="px-3 pb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">
                {t.support}
              </span>
            </div>
            {serviceSupportLinks.map(item => (
              <DropdownRow key={item.href} item={item} />
            ))}
          </NavDropdown>

          <Link
            href={href('/database')}
            className="flex items-center gap-1.5 px-3 py-2 text-[13.5px] font-medium rounded-xl transition-all duration-200 text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
          >
            <Database className="h-3.5 w-3.5 opacity-70" />
            {t.database}
          </Link>
        </nav>

        {/* ── Right action cluster ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="flex items-center rounded-2xl border border-cyan-200 bg-cyan-50/60 transition-all duration-200 focus-within:border-cyan-400">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-36 sm:w-44 h-8 bg-transparent pl-4 pr-1 text-[13px] focus:outline-none text-slate-900 placeholder:text-slate-400"
                />
                <button type="submit" className="h-8 w-8 flex items-center justify-center transition-colors text-slate-400 hover:text-cyan-700" aria-label="search">
                  <Search className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-r-2xl transition-colors text-slate-400 hover:text-slate-700" aria-label="close">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="h-8 w-8 flex items-center justify-center rounded-2xl transition-colors text-slate-500 hover:text-cyan-700 hover:bg-cyan-50"
              aria-label="search"
            >
              <Search className="h-[17px] w-[17px]" />
            </button>
          )}

          <SubscribeCTA scrolled={scrolled} label={t.subscribe} className="hidden sm:flex" />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 rounded-2xl pl-0.5 pr-1.5 py-0.5 transition-colors hover:bg-cyan-50"
                  aria-label="user menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[11px] bg-cyan-700 text-white font-bold">
                      {session.user.name?.slice(0, 2) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 hidden sm:block text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-3xl p-1.5 shadow-[0_8px_40px_-8px_rgba(8,145,178,0.15),0_2px_8px_-2px_rgba(0,0,0,0.08)] border-cyan-900/[0.07]"
              >
                <div className="px-3 py-2.5">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">{session.user.name}</p>
                  <p className="text-[11.5px] text-slate-400 mt-0.5 truncate">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem asChild>
                  <Link href={href('/dashboard')} className="rounded-2xl cursor-pointer text-[13px] text-slate-700">
                    <LayoutDashboard className="mr-2.5 h-4 w-4 text-slate-400" />{t.dashboard}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={href('/profile')} className="rounded-2xl cursor-pointer text-[13px] text-slate-700">
                    <User className="mr-2.5 h-4 w-4 text-slate-400" />{t.profile}
                  </Link>
                </DropdownMenuItem>
                {session.user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href={href('/admin')} className="rounded-2xl cursor-pointer text-[13px] text-slate-700">
                      <Settings className="mr-2.5 h-4 w-4 text-slate-400" />{t.adminPanel}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  className="rounded-2xl text-rose-500 focus:text-rose-500 focus:bg-rose-50 cursor-pointer text-[13px]"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2.5 h-4 w-4" />{t.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={href('/auth/login')}
              className="hidden sm:block px-3 py-2 text-[13px] font-medium rounded-xl transition-colors text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
            >
              {t.login}
            </Link>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden h-8 w-8 flex items-center justify-center rounded-2xl transition-colors text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                aria-label="open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px] p-0 flex flex-col gap-0 rounded-l-3xl">

              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-2xl bg-cyan-700 flex items-center justify-center">
                    <span className="text-white font-black text-[10px] select-none">循</span>
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">{t.logo}</span>
                </div>
              </div>

              <div className="px-4 pt-4 pb-1 flex-shrink-0">
                <Link
                  href={href('/subscribe')}
                  onClick={() => setMobileOpen(false)}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 w-full py-3 rounded-3xl bg-cyan-700 text-white text-[14px] font-semibold shadow-[0_2px_16px_rgba(8,145,178,0.40)] active:opacity-90 transition-opacity"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full skew-x-[-20deg] group-hover:translate-x-[300%] transition-transform duration-[600ms] ease-in-out pointer-events-none" />
                  <Bell className="h-4 w-4 flex-shrink-0" />
                  {t.subscribe}
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">

                <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  {t.discover}
                </p>
                {discoverLinks.map(({ href: h, label, icon: Icon, iconBg, iconColor }) => (
                  <Link
                    key={h}
                    href={h}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-cyan-50 active:bg-cyan-100 transition-colors"
                  >
                    <div className={cn('h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
                      <Icon className={cn('h-3.5 w-3.5', iconColor)} />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">{label}</span>
                  </Link>
                ))}

                <p className="px-3 pt-4 pb-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  {t.services}
                </p>
                {[...serviceOperationLinks, ...serviceSupportLinks].map(({ href: h, label, icon: Icon, iconBg, iconColor }) => (
                  <Link
                    key={h}
                    href={h}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-cyan-50 active:bg-cyan-100 transition-colors"
                  >
                    <div className={cn('h-7 w-7 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
                      <Icon className={cn('h-3.5 w-3.5', iconColor)} />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">{label}</span>
                  </Link>
                ))}

                <div className="pt-2">
                  <Link
                    href={href('/database')}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-cyan-50 active:bg-cyan-100 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-xl bg-cyan-700/10 flex items-center justify-center flex-shrink-0">
                      <Database className="h-3.5 w-3.5 text-cyan-700" />
                    </div>
                    <span className="text-[13px] font-semibold text-cyan-700">{t.database}</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 mt-2 pt-3">
                  {session ? (
                    <>
                      <div className="px-3 pb-2 flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-[11px] bg-cyan-700 text-white font-bold">
                            {session.user.name?.slice(0, 2) ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">{session.user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{session.user.email}</p>
                        </div>
                      </div>
                      <Link href={href('/dashboard')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-[13px] font-medium text-slate-700">{t.dashboard}</span>
                      </Link>
                      <Link href={href('/profile')} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                        <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-[13px] font-medium text-slate-700">{t.profile}</span>
                      </Link>
                      <button
                        onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-rose-50 active:bg-rose-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-rose-400 flex-shrink-0" />
                        <span className="text-[13px] font-medium text-rose-500">{t.signOut}</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2 px-1">
                      <Link
                        href={href('/auth/login')}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 py-2.5 text-center text-[13px] font-medium text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                      >
                        {t.login}
                      </Link>
                      <Link
                        href={href('/auth/register')}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 py-2.5 text-center text-[13px] font-semibold text-white bg-cyan-700 rounded-2xl hover:bg-cyan-600 active:bg-cyan-800 transition-colors"
                      >
                        {t.register}
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
