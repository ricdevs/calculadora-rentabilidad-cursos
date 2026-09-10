import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type NumberFieldProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number
  ariaLabel: string
  className?: string
  invalid?: boolean
}

export function NumberField({
  value,
  onChange,
  min = 0,
  step = 1,
  ariaLabel,
  className,
  invalid,
}: NumberFieldProps) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-8 w-[5.25rem] bg-background text-right text-sm tabular-nums',
        className,
      )}
      value={Number.isFinite(value) ? value : ''}
      onChange={(event) => {
        const next = event.target.value
        if (next === '') {
          onChange(0)
          return
        }
        const parsed = Number(next)
        if (Number.isFinite(parsed)) onChange(parsed)
      }}
    />
  )
}
