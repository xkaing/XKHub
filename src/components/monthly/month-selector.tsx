'use client'

import { CalendarDays } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { MonthPicker } from '@/components/ui/date-picker'

export function MonthSelector({ value, currentMonth }: { value: string; currentMonth: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedMonth, setSelectedMonth] = useState(value)

  useEffect(() => {
    setSelectedMonth(value)
  }, [value])

  function updateMonth(nextValue: string) {
    setSelectedMonth(nextValue)
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', nextValue)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CalendarDays className="size-4 text-primary" />
        月份
      </div>
      <MonthPicker value={selectedMonth} currentMonth={currentMonth} onChange={updateMonth} size="compact" />
    </div>
  )
}
