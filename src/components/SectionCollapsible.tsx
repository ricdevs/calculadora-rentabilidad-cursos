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
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'text-muted-foreground mt-1 size-5 shrink-0 transition-transform duration-200',
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
