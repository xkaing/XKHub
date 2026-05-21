'use client'

import { CalendarDays, RotateCcw, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'

import { Button } from '@/components/ui/button'

export function MonthSelector({ value, currentMonth }: { value: string; currentMonth: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateMonth(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', nextValue)
    router.push(`${pathname}?${params.toString()}`)
  }

  function submitMonth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextValue = String(formData.get('month') ?? '')
    if (nextValue) updateMonth(nextValue)
  }

  function resetMonth() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('month')
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <form onSubmit={submitMonth} className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
      <label htmlFor="monthly-month" className="flex items-center gap-2 text-sm font-medium">
        <CalendarDays className="size-4 text-primary" />
        月份
      </label>
      <input
        id="monthly-month"
        name="month"
        type="month"
        value={value}
        onChange={(event) => updateMonth(event.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm"
      />
      <Button type="submit" variant="secondary" size="sm" className="gap-1.5">
        <Search className="size-4" />
        查看
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={resetMonth}
        disabled={value === currentMonth && !searchParams.has('month')}
      >
        <RotateCcw className="size-4" />
        本月
      </Button>
    </form>
  )
}
