import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

export function SectionCollapsible({
  id,
  title,
  description,
  open,
  onOpenChange,
  children,
}: {
  id: string
  title: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  const panelId = `${id}-panel`

  return (
    <section id={id} className="scroll-mt-20">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 rounded-lg py-1 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-0.5 max-w-2xl text-[13px] leading-snug">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      <div id={panelId} hidden={!open} className={cn('mt-3', !open && 'hidden')}>
        {children}
      </div>
    </section>
  )
}
