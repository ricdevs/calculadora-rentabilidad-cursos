import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEuro, formatPct } from '@/lib/format'
import type { PortfolioTotals } from '@/lib/types'

const cards = [
  {
    key: 'revenue' as const,
    label: 'Ingresos (cartera)',
    hint: 'Precio × alumnos, suma de escenarios',
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
    hint: 'Sobre ingresos de la cartera',
  },
]

export function SummaryCards({ totals }: { totals: PortfolioTotals }) {
  const values = {
    revenue: formatEuro(totals.revenue),
    totalCost: formatEuro(totals.totalCost),
    profit: formatEuro(totals.profit),
    marginPct: formatPct(totals.marginPct),
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
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
  )
}
