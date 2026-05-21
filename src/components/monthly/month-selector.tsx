'use client'

import { CalendarDays, RotateCcw, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type React from 'react'

import { Button } from '@/components/ui/button'
import { MonthPicker } from '@/components/ui/date-picker'

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
      <div className="flex items-center gap-2 text-sm font-medium">
        <CalendarDays className="size-4 text-primary" />
        月份
      </div>
      <input type="hidden" name="month" value={value} />
      <MonthPicker value={value} currentMonth={currentMonth} onChange={updateMonth} size="compact" />
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
