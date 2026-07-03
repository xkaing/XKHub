'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  Gamepad2,
  LayoutDashboard,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PackageSearch,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import logo from '@/logo.png'

const navItems = [
  { href: '/', label: '总览', icon: LayoutDashboard },
  { href: '/monthly', label: '本月动态', icon: CalendarDays },
  { href: '/models', label: '模型收藏', icon: PackageSearch },
  { href: '/games', label: '游戏与奖杯', icon: Gamepad2 },
  { href: '/buy-games', label: 'PS 游戏购买记录', icon: Gamepad2 },
  { href: '/insights', label: '统计分析', icon: ChartNoAxesCombined },
  { href: '/ai', label: 'AI 工作台', icon: Bot },
]

type ThemeMode = 'light' | 'dark' | 'system'

const themeOptions: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null
    setThemeMode(stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system')
  }, [])

  useEffect(() => {
    if (!themeMode) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      document.documentElement.classList.toggle(
        'dark',
        themeMode === 'dark' || (themeMode === 'system' && media.matches)
      )
    }

    localStorage.setItem('themeMode', themeMode)
    applyTheme()
    media.addEventListener('change', applyTheme)

    return () => media.removeEventListener('change', applyTheme)
  }, [themeMode])

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r bg-card/70 backdrop-blur transition-[width] duration-200 xl:block',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          <div className={cn('flex h-20 items-center gap-3 px-4', collapsed ? 'justify-center' : 'justify-between')}>
            <Link href="/" className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-background">
                <Image src={logo} alt="XKHub logo" fill className="object-cover" sizes="40px" priority />
              </div>
              {!collapsed ? (
                <div>
                  <div className="text-base font-semibold">XKHub</div>
                  <div className="text-xs text-muted-foreground">个人数据后台</div>
                </div>
              ) : null}
            </Link>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3">
            {navItems.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center px-0',
                    active && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed ? item.label : null}
                </Link>
              )
            })}
          </nav>

        </div>
      </aside>

      <div className={cn('transition-[padding] duration-200 xl:pl-64', collapsed && 'xl:pl-20')}>
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="flex min-h-16 items-center gap-3 overflow-x-auto px-4 xl:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="hidden xl:inline-flex"
              onClick={() => setCollapsed((value) => !value)}
              title={collapsed ? '展开菜单' : '收起菜单'}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
            {navItems.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-md px-3 py-2 text-sm text-muted-foreground xl:hidden',
                    active && 'bg-accent text-accent-foreground'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="ml-auto flex items-center gap-1 rounded-md border bg-card p-1">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const active = themeMode === option.value

                return (
                  <Button
                    key={option.value}
                    variant={active ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-8 gap-1.5 px-2"
                    onClick={() => setThemeMode(option.value)}
                    title={option.label}
                  >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                    {active ? <Check className="size-3" /> : null}
                  </Button>
                )
              })}
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 xl:px-8 xl:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
