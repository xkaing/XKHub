'use client'

import { useState, useEffect, useCallback } from 'react'
import { ConfigProvider, App as AntdApp } from 'antd'
import { theme } from 'antd'

type ThemeMode = 'light' | 'dark' | 'auto'

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')

  const getCurrentTheme = useCallback((): 'light' | 'dark' => {
    if (themeMode === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return themeMode
  }, [themeMode])

  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null
    if (stored) {
      setThemeMode(stored)
    }
  }, [])

  useEffect(() => {
    const currentTheme = getCurrentTheme()
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [themeMode, getCurrentTheme])

  const handleSetTheme = (mode: ThemeMode) => {
    setThemeMode(mode)
    localStorage.setItem('themeMode', mode)
  }

  const currentTheme = getCurrentTheme()

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}

export default ThemeProvider