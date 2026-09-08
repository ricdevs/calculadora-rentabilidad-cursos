const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const euroPrecise = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})

const number = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 2,
})

const percent = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function formatEuro(value: number, precise = false): string {
  if (!Number.isFinite(value)) return '—'
  return (precise ? euroPrecise : euro).format(value)
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(
    value,
  )
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return percent.format(value)
}

export function formatRatio(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${number.format(value)}×`
}

export function formatStudents(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${formatNumber(value, 1)} alum.`
}

export function marginTone(marginPct: number): 'good' | 'ok' | 'bad' {
  if (marginPct >= 0.4) return 'good'
  if (marginPct >= 0.2) return 'ok'
  return 'bad'
}
