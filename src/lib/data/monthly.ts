import type { GameListItem } from '@/lib/data/games.server'
import type { ModelItem } from '@/types'

const shanghaiOffsetMs = 8 * 60 * 60 * 1000

export interface MonthlyActivity {
  monthValue: string
  monthLabel: string
  rangeLabel: string
  modelItems: ModelItem[]
  playedGames: GameListItem[]
  modelCount: number
  totalPaidByCurrency: Partial<Record<ModelItem['currency'], number>>
}

export function getMonthlyActivity(
  modelItems: ModelItem[],
  games: GameListItem[],
  monthValue = getCurrentMonthValue()
): MonthlyActivity {
  const month = parseMonthValue(monthValue) ?? parseMonthValue(getCurrentMonthValue())
  if (!month) throw new Error('Unable to resolve monthly activity range.')

  const range = getShanghaiMonthRange(month.year, month.monthIndex)
  const monthlyModels = modelItems
    .filter((item) => isWithinRange(item.purchaseDate, range.start, range.end))
    .sort((a, b) => Date.parse(b.purchaseDate ?? '') - Date.parse(a.purchaseDate ?? ''))
  const playedGames = games
    .filter((game) => isWithinRange(game.lastPlayedAt, range.start, range.end))
    .sort((a, b) => Date.parse(b.lastPlayedAt ?? '') - Date.parse(a.lastPlayedAt ?? ''))

  return {
    monthValue: formatMonthValue(month.year, month.monthIndex),
    monthLabel: formatMonth(month.year, month.monthIndex),
    rangeLabel: `${formatDate(range.start)} - ${formatDate(new Date(range.end.getTime() - 1))}`,
    modelItems: monthlyModels,
    playedGames,
    modelCount: monthlyModels.length,
    totalPaidByCurrency: monthlyModels.reduce<MonthlyActivity['totalPaidByCurrency']>((totals, item) => {
      const price = item.purchasePrice ?? 0
      totals[item.currency] = (totals[item.currency] ?? 0) + price
      return totals
    }, {}),
  }
}

export function getCurrentMonthValue(now = new Date()) {
  const shifted = new Date(now.getTime() + shanghaiOffsetMs)
  return formatMonthValue(shifted.getUTCFullYear(), shifted.getUTCMonth())
}

export function normalizeMonthValue(value: string | string[] | undefined) {
  const monthValue = Array.isArray(value) ? value[0] : value
  return parseMonthValue(monthValue)?.value ?? getCurrentMonthValue()
}

export function formatCurrency(value: number, currency: ModelItem['currency']) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(value)
}

export function formatCurrencyTotals(totals: MonthlyActivity['totalPaidByCurrency']) {
  const entries = Object.entries(totals).filter(([, value]) => value > 0) as Array<[ModelItem['currency'], number]>
  if (entries.length === 0) return formatCurrency(0, 'CNY')

  return entries.map(([currency, value]) => formatCurrency(value, currency)).join(' / ')
}

export function formatMonthDate(value: string | null) {
  if (!value) return '未记录'

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function getShanghaiMonthRange(year: number, monthIndex: number) {
  return {
    start: fromShanghaiDate(year, monthIndex, 1),
    end: fromShanghaiDate(year, monthIndex + 1, 1),
  }
}

function parseMonthValue(value: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? '')
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null

  return {
    year,
    monthIndex: month - 1,
    value: formatMonthValue(year, month - 1),
  }
}

function formatMonthValue(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

function fromShanghaiDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day) - shanghaiOffsetMs)
}

function isWithinRange(value: string | null | undefined, start: Date, end: Date) {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) && time >= start.getTime() && time < end.getTime()
}

function formatMonth(year: number, monthIndex: number) {
  return `${year}年${monthIndex + 1}月`
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}
