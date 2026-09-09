import { NumberField } from '@/components/NumberField'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { FieldSpec } from '@/lib/fields'

export function SliderField({
  spec,
  value,
  onChange,
  ariaLabel,
  invalid,
  className,
}: {
  spec: FieldSpec
  value: number
  onChange: (value: number) => void
  ariaLabel: string
  invalid?: boolean
  className?: string
}) {
  const min = Math.min(spec.min, value)
  const max = Math.max(spec.max, value)

  return (
    <div className={cn('flex min-w-[7.5rem] flex-col gap-1.5', className)}>
      <NumberField
        value={value}
        min={0}
        step={spec.step}
        ariaLabel={ariaLabel}
        invalid={invalid}
        className="w-full"
        onChange={onChange}
      />
      <Slider
        min={min}
        max={max}
        step={spec.step}
        value={[value]}
        aria-label={`${ariaLabel} (deslizador)`}
        onValueChange={(next) => {
          const raw = Array.isArray(next) ? next[0] : next
          if (typeof raw === 'number' && Number.isFinite(raw)) onChange(raw)
        }}
      />
    </div>
  )
}
