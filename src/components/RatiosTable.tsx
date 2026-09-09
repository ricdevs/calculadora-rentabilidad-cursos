import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatEuro,
  formatNumber,
  formatPct,
  formatRatio,
  formatStudents,
  marginTone,
} from '@/lib/format'
import type { CourseRow, PortfolioTotals } from '@/lib/types'

function MarginBadge({ value }: { value: number }) {
  const tone = marginTone(value)
  const className =
    tone === 'good'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'ok'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-red-200 bg-red-50 text-red-800'

  return (
    <Badge variant="outline" className={className}>
      {formatPct(value)}
    </Badge>
  )
}

export function RatiosTable({
  rows,
  totals,
}: {
  rows: CourseRow[]
  totals: PortfolioTotals
}) {
  return (
    <section className="rounded-xl bg-card ring-1 ring-foreground/10">
      {rows.length === 0 ? (
        <p className="text-muted-foreground px-5 py-4 text-sm">
          Añade un grupo para ver ratios.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="sticky left-0 z-10 min-w-[140px] bg-muted/40">
                Grupo
              </TableHead>
              <TableHead>Horas profesor</TableHead>
              <TableHead>Coste prof. / grupo</TableHead>
              <TableHead>Coste prof. / alumno</TableHead>
              <TableHead>CAC grupo</TableHead>
              <TableHead>Coste total</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Beneficio</TableHead>
              <TableHead>Margen</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead title="Precio del curso ÷ horas por alumno">
                € / hora-alumno
              </TableHead>
              <TableHead title="Coste profesor del grupo ÷ (precio − CAC)">
                Equilibrio
              </TableHead>
              <TableHead title="Beneficio del grupo ÷ horas de profesor">
                € / h profesor
              </TableHead>
              <TableHead>Ingresos / prof.</TableHead>
              <TableHead title="Coste profesor ÷ ingresos">
                % profesor
              </TableHead>
              <TableHead title="CAC ÷ ingresos">% CAC</TableHead>
              <TableHead title="Precio mínimo por alumno para cubrir profesor + CAC">
                Precio mín.
              </TableHead>
              <TableHead title="€/h máximo del profesor para no perder">
                Techo prof. €/h
              </TableHead>
              <TableHead title="Beneficio por alumno ÷ horas">
                Contrib. / h-alum.
              </TableHead>
              <TableHead title="Mínimo entre factura, módulo económico y cofinanciación, con tope de crédito">
                Bonif. FUNDAE
              </TableHead>
              <TableHead title="Bonificación ÷ factura del grupo">
                % cubierto
              </TableHead>
              <TableHead title="Factura − bonificación: lo que paga la empresa">
                Neto empresa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const profitClass =
                row.metrics.profitPerGroup < 0
                  ? 'text-destructive font-semibold'
                  : 'font-semibold text-emerald-800'
              return (
                <TableRow key={row.id}>
                  <TableCell className="sticky left-0 z-10 bg-card">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: row.color }}
                      />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatNumber(row.metrics.teacherHours, 1)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.teacherCostPerGroup)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.teacherCostPerStudent)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.cacPerGroup)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.totalCostPerGroup)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.revenuePerGroup)}
                  </TableCell>
                  <TableCell className={`tabular-nums ${profitClass}`}>
                    {formatEuro(row.metrics.profitPerGroup)}
                  </TableCell>
                  <TableCell>
                    <MarginBadge value={row.metrics.marginPct} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatPct(row.metrics.roiPct)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.revenuePerStudentHour, true)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="tabular-nums">
                        {formatStudents(row.metrics.breakEvenStudents)}
                      </span>
                      {row.metrics.breakEvenStudents === null ? (
                        <span className="text-destructive text-[11px]">
                          No cubre CAC
                        </span>
                      ) : row.metrics.coversTeacherAndCac ? (
                        <span className="text-[11px] text-emerald-800">
                          Cubre con {formatNumber(row.classSize, 0)}
                        </span>
                      ) : (
                        <span className="text-destructive text-[11px]">
                          Faltan alumnos
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.profitPerTeacherHour, true)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatRatio(row.metrics.revenueToTeacherCost)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatPct(row.metrics.teacherShareOfRevenue)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatPct(row.metrics.cacShareOfRevenue)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.metrics.breakEvenPrice === null
                      ? '—'
                      : formatEuro(row.metrics.breakEvenPrice)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.metrics.maxTeacherHourlyCost === null
                      ? '—'
                      : formatEuro(row.metrics.maxTeacherHourlyCost, true)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatEuro(row.metrics.contributionPerStudentHour, true)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.fundae.enabled
                      ? formatEuro(row.fundae.bonus)
                      : '—'}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.fundae.enabled
                      ? formatPct(row.fundae.coveragePct)
                      : '—'}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.fundae.enabled
                      ? formatEuro(row.fundae.companyNet)
                      : '—'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-muted/50 font-medium">
                Contrato ({totals.groupCount} grupos · {totals.studentCount} alum.)
              </TableCell>
              <TableCell className="tabular-nums">
                {formatNumber(totals.teacherHours, 1)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatEuro(totals.teacherCost)}
              </TableCell>
              <TableCell />
              <TableCell className="tabular-nums">
                {formatEuro(totals.cac)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatEuro(totals.totalCost)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatEuro(totals.revenue)}
              </TableCell>
              <TableCell className="tabular-nums font-semibold">
                {formatEuro(totals.profit)}
              </TableCell>
              <TableCell>
                <MarginBadge value={totals.marginPct} />
              </TableCell>
              <TableCell className="tabular-nums">
                {formatPct(totals.roiPct)}
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell className="tabular-nums">
                {formatPct(totals.teacherShareOfRevenue)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatPct(totals.cacShareOfRevenue)}
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell className="tabular-nums font-semibold">
                {formatEuro(totals.fundaeBonus)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatPct(totals.fundaeCoveragePct)}
              </TableCell>
              <TableCell className="tabular-nums font-semibold">
                {formatEuro(totals.companyNet)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </section>
  )
}
