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
    <div className="min-w-0 bg-card px-4 py-3.5">
      <p className="text-muted-foreground text-[11px] leading-none">{label}</p>
      <p
        className={cn(
          'font-heading mt-1.5 text-[1.35rem] leading-none font-medium tracking-tight tabular-nums',
          negative ? 'text-destructive' : 'text-foreground',
        )}
      >
        {value}
      </p>
      <p className="text-muted-foreground mt-1.5 text-[11px] leading-none">
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
      label: 'Bonificación FUNDAE',
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
      label: 'Horas profesor',
      value: formatNumber(totals.teacherHours, 0),
      hint: 'Horas lectivas',
    },
  ]

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {academy.map((stat) => (
          <StatCell key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {rest.map((stat) => (
          <StatCell key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  )
}
