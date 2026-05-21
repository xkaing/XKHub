'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

type PickerSize = 'default' | 'compact'

export function DatePicker({
  value,
  onChange,
  placeholder = '选择日期',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = parseDateValue(value)
  const [viewDate, setViewDate] = useState(() => selected ?? new Date())
  const days = useMemo(() => getCalendarDays(viewDate), [viewDate])

  function selectDate(date: Date) {
    onChange(formatDateValue(date))
    setViewDate(date)
    setOpen(false)
  }

  return (
    <PickerShell open={open} setOpen={setOpen}>
      <PickerTrigger
        open={open}
        label={selected ? formatDisplayDate(selected) : placeholder}
        placeholder={!selected}
        onToggle={() => setOpen((value) => !value)}
      />

      {open ? (
        <PickerPanel className="w-[21rem]">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => setViewDate(addMonths(viewDate, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-semibold">{formatMonthTitle(viewDate)}</div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setViewDate(addMonths(viewDate, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {weekdays.map((weekday) => (
              <div key={weekday} className="py-1">
                {weekday}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const active = selected ? isSameDate(day.date, selected) : false
              const muted = day.date.getMonth() !== viewDate.getMonth()
              const today = isSameDate(day.date, new Date())

              return (
                <Button
                  key={day.key}
                  type="button"
                  variant={active ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-9 w-full rounded-md text-sm font-medium',
                    muted && 'text-muted-foreground/45',
                    today && !active && 'border border-primary/50 text-primary'
                  )}
                  onClick={() => selectDate(day.date)}
                >
                  {day.date.getDate()}
                </Button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              清除
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => selectDate(new Date())}>
              今天
            </Button>
          </div>
        </PickerPanel>
      ) : null}
    </PickerShell>
  )
}

export function MonthPicker({
  value,
  onChange,
  currentMonth,
  size = 'default',
}: {
  value: string
  onChange: (value: string) => void
  currentMonth: string
  size?: PickerSize
}) {
  const [open, setOpen] = useState(false)
  const selected = parseMonthValue(value)
  const current = parseMonthValue(currentMonth) ?? getCurrentMonth()
  const [viewYear, setViewYear] = useState(() => selected?.year ?? current.year)

  function selectMonth(monthIndex: number) {
    onChange(formatMonthValue(viewYear, monthIndex))
    setOpen(false)
  }

  return (
    <PickerShell open={open} setOpen={setOpen}>
      <PickerTrigger
        open={open}
        label={selected ? `${selected.year}年${String(selected.month + 1).padStart(2, '0')}月` : '选择月份'}
        placeholder={!selected}
        size={size}
        onToggle={() => setOpen((value) => !value)}
      />

      {open ? (
        <PickerPanel className="w-[20rem]">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => setViewYear((year) => year - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-semibold">{viewYear}年</div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setViewYear((year) => year + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {months.map((month, index) => {
              const active = selected?.year === viewYear && selected.month === index
              const isCurrent = current.year === viewYear && current.month === index

              return (
                <Button
                  key={month}
                  type="button"
                  variant={active ? 'default' : 'ghost'}
                  className={cn(
                    'h-10 rounded-md text-sm font-medium',
                    isCurrent && !active && 'border border-primary/50 text-primary'
                  )}
                  onClick={() => selectMonth(index)}
                >
                  {month}
                </Button>
              )
            })}
          </div>
        </PickerPanel>
      ) : null}
    </PickerShell>
  )
}

function PickerShell({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }

    if (open) document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, setOpen])

  return (
    <div ref={ref} className="relative">
      {children}
    </div>
  )
}

function PickerTrigger({
  open,
  label,
  placeholder,
  size = 'default',
  onToggle,
}: {
  open: boolean
  label: string
  placeholder: boolean
  size?: PickerSize
  onToggle: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-expanded={open}
      className={cn(
        'w-full justify-between border-input bg-background px-3 font-normal shadow-sm',
        size === 'compact' ? 'h-9 min-w-40 text-sm' : 'h-10 text-base',
        placeholder && 'text-muted-foreground'
      )}
      onClick={onToggle}
    >
      <span>{label}</span>
      <CalendarDays className="size-4 text-muted-foreground" />
    </Button>
  )
}

function PickerPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-picker-panel
      className={cn(
        'absolute left-0 top-[calc(100%+0.5rem)] z-[60] rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      date,
      key: formatDateValue(date),
    }
  })
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function parseMonthValue(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null

  return { year, month: month - 1 }
}

function getCurrentMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() }
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatMonthValue(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function formatDisplayDate(date: Date) {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

function formatMonthTitle(date: Date) {
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`
}
