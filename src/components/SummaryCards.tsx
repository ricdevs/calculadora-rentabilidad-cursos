import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEuro, formatNumber, formatPct } from '@/lib/format'
import type { PortfolioTotals } from '@/lib/types'

const moneyCards = [
  {
    key: 'revenue' as const,
    label: 'Ingresos del contrato',
    hint: 'Precio × alumnos, suma de todos los grupos',
  },
  {
    key: 'totalCost' as const,
    label: 'Costes (profesor + CAC)',
    hint: 'Sin alquiler, admin ni plataforma',
  },
  {
    key: 'profit' as const,
    label: 'Contribución',
    hint: 'Ingresos − profesor − CAC',
  },
  {
    key: 'marginPct' as const,
    label: 'Margen de contribución',
    hint: 'Sobre ingresos del acuerdo',
  },
]

export function SummaryCards({ totals }: { totals: PortfolioTotals }) {
  const values = {
    revenue: formatEuro(totals.revenue),
    totalCost: formatEuro(totals.totalCost),
    profit: formatEuro(totals.profit),
    marginPct: formatPct(totals.marginPct),
  }

  const counts = [
    {
      label: 'Grupos / módulos',
      value: String(totals.groupCount),
      hint: 'Componentes del acuerdo',
    },
    {
      label: 'Alumnos',
      value: formatNumber(totals.studentCount, 0),
      hint: 'Suma de tamaños de clase',
    },
    {
      label: 'Horas profesor',
      value: formatNumber(totals.teacherHours, 0),
      hint: 'Horas lectivas del contrato',
    },
  ]

  return (
    <div className="space-y-3">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {moneyCards.map((card) => {
          const isProfit = card.key === 'profit' || card.key === 'marginPct'
          const negative = isProfit && totals.profit < 0
          return (
            <Card key={card.key} size="sm" className="shadow-none">
              <CardHeader className="pb-0">
                <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`font-heading text-2xl font-semibold tabular-nums ${
                    negative ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {values[card.key]}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{card.hint}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {counts.map((card) => (
          <Card key={card.label} size="sm" className="shadow-none">
            <CardHeader className="pb-0">
              <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-semibold tabular-nums">
                {card.value}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
