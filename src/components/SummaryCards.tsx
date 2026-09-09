import { formatEuro, formatNumber, formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PortfolioTotals } from '@/lib/types'

type Stat = {
  label: string
  value: string
  hint: string
  negative?: boolean
}

function StatCell({ label, value, hint, negative }: Stat) {
  return (
    <div className="min-w-[7.5rem] shrink-0 px-3 py-2">
      <p className="text-muted-foreground text-[10px] font-medium tracking-[0.16em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          'font-heading mt-0.5 text-[1.05rem] leading-none font-semibold tracking-tight tabular-nums',
          negative ? 'text-destructive' : 'text-foreground',
        )}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-1 text-[11px] leading-none">
        {hint}
      </p>
    </div>
  )
}

export function SummaryCards({ totals }: { totals: PortfolioTotals }) {
  const academy: Stat[] = [
    {
      label: 'Ingresos',
      value: formatEuro(totals.revenue),
      hint: 'Precio × alumnos',
    },
    {
      label: 'Costes',
      value: formatEuro(totals.totalCost),
      hint: 'Profesor + CAC',
    },
    {
      label: 'Contribución',
      value: formatEuro(totals.profit),
      hint: 'Ingresos − costes',
      negative: totals.profit < 0,
    },
    {
      label: 'Margen',
      value: formatPct(totals.marginPct),
      hint: 'Sobre ingresos',
      negative: totals.profit < 0,
    },
  ]

  const rest: Stat[] = [
    {
      label: 'Bonif. FUNDAE',
      value: formatEuro(totals.fundaeBonus),
      hint:
        totals.fundaeEnabledCount === 0
          ? 'Contrato sin bonificar'
          : totals.fundaeCreditScaled
            ? 'Tope de crédito anual'
            : 'Techo empresa',
    },
    {
      label: '% cubierto',
      value: formatPct(totals.fundaeCoveragePct),
      hint: 'Bonificación ÷ factura',
    },
    {
      label: 'Neto empresa',
      value: formatEuro(totals.companyNet),
      hint: 'Tras crédito SS',
    },
    {
      label: 'Grupos',
      value: String(totals.groupCount),
      hint: 'Del acuerdo',
    },
    {
      label: 'Alumnos',
      value: formatNumber(totals.studentCount, 0),
      hint: 'Suma de tamaños',
    },
    {
      label: 'Horas prof.',
      value: formatNumber(totals.teacherHours, 0),
      hint: 'Horas lectivas',
    },
  ]

  return (
    <div className="w-fit max-w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap divide-x divide-border">
        {academy.map((stat) => (
          <StatCell key={stat.label} {...stat} />
        ))}
      </div>
      <div className="flex flex-wrap divide-x divide-border border-t border-border">
        {rest.map((stat) => (
          <StatCell key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  )
}
