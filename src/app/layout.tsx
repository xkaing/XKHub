import type { Metadata } from 'next'
import { Oxanium } from 'next/font/google'

import { cn } from '@/lib/utils'
import './globals.css'

const oxanium = Oxanium({ subsets: ['latin'], variable: '--font-oxanium' })

export const metadata: Metadata = {
  title: 'XKHub',
  description: '个人数据后台，用于整理模型、游戏、奖杯和消费记录。',
}

const themeScript = `
(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const applyTheme = () => {
    const mode = localStorage.getItem('themeMode') || 'system'
    document.documentElement.classList.toggle('dark', mode === 'dark' || (mode === 'system' && media.matches))
  }
  applyTheme()
  media.addEventListener('change', applyTheme)
})()
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={cn('font-sans', oxanium.variable)}>
      <body>
        {/* 在 React 水合前写入主题类，避免深色模式首屏闪烁。 */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  )
}
