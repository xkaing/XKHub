'use client'

import { memo } from 'react'
import CountUp from 'react-countup'

import { cn } from '@/lib/utils'

type AnimatedNumberProps = {
  value: number
  className?: string
  duration?: number
  formatValue?: (value: number) => string
}

function AnimatedNumberBase({
  value,
  className,
  duration = 1.4,
  formatValue,
}: AnimatedNumberProps) {
  const formattedValue = formatValue ? formatValue(value) : formatNumber(value, getDecimalPlaces(value))

  return (
    <CountUp
      end={value}
      duration={duration}
      delay={0}
      preserveValue
      decimals={getDecimalPlaces(value)}
      formattingFn={(currentValue) => (formatValue ? formatValue(currentValue) : formatNumber(currentValue, getDecimalPlaces(value)))}
    >
      {({ countUpRef }) => (
        <span ref={countUpRef} className={className} aria-label={formattedValue}>
          {formattedValue}
        </span>
      )}
    </CountUp>
  )
}

export const AnimatedNumber = memo(AnimatedNumberBase)

function AnimatedNumberTextBase({
  value,
  className,
  duration,
}: {
  value: string | number
  className?: string
  duration?: number
}) {
  if (typeof value === 'number') {
    return <AnimatedNumber value={value} className={className} duration={duration} />
  }

  const parsed = parseNumberText(value)
  if (!parsed) return <span className={className}>{value}</span>

  return (
    <AnimatedNumber
      value={parsed.value}
      className={cn('tabular-nums', className)}
      duration={duration}
      formatValue={(currentValue) => `${parsed.prefix}${formatNumber(currentValue, parsed.decimals)}${parsed.suffix}`}
    />
  )
}

export const AnimatedNumberText = memo(AnimatedNumberTextBase)

function parseNumberText(value: string) {
  const match = value.match(/-?\d[\d,]*(?:\.\d+)?/)
  if (!match) return null

  const rawNumber = match[0]
  const numericValue = Number(rawNumber.replace(/,/g, ''))
  if (!Number.isFinite(numericValue)) return null

  return {
    value: numericValue,
    prefix: value.slice(0, match.index),
    suffix: value.slice((match.index ?? 0) + rawNumber.length),
    decimals: getDecimalPlaces(rawNumber),
  }
}

function getDecimalPlaces(value: number | string) {
  const [, decimals = ''] = String(value).split('.')
  return decimals.length
}

function formatNumber(value: number, decimals: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
