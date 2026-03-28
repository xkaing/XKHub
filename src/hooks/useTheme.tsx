'use client'

import { useState, useEffect } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')

  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null
    if (stored) {
      setThemeMode(stored)
    }
  }, [])

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode)
    localStorage.setItem('themeMode', mode)

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      document.documentElement.setAttribute('data-theme', mode)
    }
  }

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeMode
  }

  useEffect(() => {
    setTheme(themeMode)
  }, [themeMode])

  return {
    themeMode,
    setThemeMode: setTheme,
    getCurrentTheme,
  }
}
