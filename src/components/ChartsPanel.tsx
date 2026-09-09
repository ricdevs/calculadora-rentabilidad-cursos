import { Switch } from '@/components/ui/switch'
import type { ReactElement } from 'react'
import { formatEuro, formatNumber, formatPct } from '@/lib/format'
import type { ChartId, ChartVisibility, CourseRow } from '@/lib/types'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const chartMeta: { id: ChartId; label: string; hint: string }[] = [
  {
    id: 'costsRevenue',
    label: 'Costes e ingresos',
    hint: 'Profesor y CAC apilados frente al precio cobrado',
  },
  {
    id: 'payoff',
    label: 'Beneficio (payoff)',
    hint: 'Contribución de cada grupo después de profesor y CAC',
  },
  {
    id: 'costMix',
    label: 'Composición de costes',
    hint: 'Qué parte se va en profesor y cuál en captación',
  },
  {
    id: 'margin',
    label: 'Margen %',
    hint: 'Rentabilidad relativa, útil para comparar formatos',
  },
  {
    id: 'breakEven',
    label: 'Equilibrio vs tamaño',
    hint: 'Alumnos actuales frente al mínimo que cubre costes',
  },
]

type TipProps = {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  kind?: 'euro' | 'pct' | 'students'
}

function ChartTip({ active, payload, label, kind = 'euro' }: TipProps) {
  if (!active || !payload?.length) return null
  const format =
    kind === 'pct' ? formatPct : kind === 'students' ? formatNumber : formatEuro
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex justify-between gap-4">
          <span style={{ color: item.color }}>{item.name}</span>
          <span className="tabular-nums">
            {kind === 'students'
              ? `${formatNumber(item.value, 1)} alum.`
              : format(item.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

const axisTick = { fill: '#6a6560', fontSize: 11 }

export function ChartsPanel({
  rows,
  visibility,
  onToggle,
}: {
  rows: CourseRow[]
  visibility: ChartVisibility
  onToggle: (id: ChartId, visible: boolean) => void
}) {
  const data = rows.map((row) => ({
    name: row.name,
    color: row.color,
    Profesor: row.metrics.teacherCostPerGroup,
    CAC: row.metrics.cacPerGroup,
    Ingresos: row.metrics.revenuePerGroup,
    Beneficio: row.metrics.profitPerGroup,
    Margen: row.metrics.marginPct,
    Equilibrio: row.metrics.breakEvenStudents ?? 0,
    Tamaño: row.classSize,
  }))

  const active = chartMeta.filter((chart) => visibility[chart.id])

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {chartMeta.map((chart) => (
            <label
              key={chart.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Switch
                checked={visibility[chart.id]}
                onCheckedChange={(checked) =>
                  onToggle(chart.id, Boolean(checked))
                }
                size="sm"
              />
              <span>
                <span className="font-medium">{chart.label}</span>
                <span className="text-muted-foreground hidden sm:inline">
                  {' '}
                  — {chart.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {rows.length === 0 || active.length === 0 ? (
        <p className="text-muted-foreground px-5 pb-5 text-sm">
          {rows.length === 0
            ? 'Añade un grupo para ver gráficos.'
            : 'Activa al menos un gráfico. Las tablas siguen siendo la fuente de verdad.'}
        </p>
      ) : (
        <div className="grid gap-4 px-4 pb-5 lg:grid-cols-2">
          {visibility.costsRevenue ? (
            <ChartCard title="Costes e ingresos">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                <XAxis dataKey="name" tick={axisTick} interval={0} />
                <YAxis tick={axisTick} tickFormatter={(v) => formatEuro(v)} width={72} />
                <Tooltip content={<ChartTip />} />
                <Legend />
                <Bar dataKey="Profesor" stackId="cost" fill="#1c2836" radius={[0, 0, 0, 0]} />
                <Bar dataKey="CAC" stackId="cost" fill="#8a5344" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ingresos" fill="#9a7d4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          ) : null}

          {visibility.payoff ? (
            <ChartCard title="Beneficio por grupo">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                <XAxis dataKey="name" tick={axisTick} interval={0} />
                <YAxis tick={axisTick} tickFormatter={(v) => formatEuro(v)} width={72} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="Beneficio" radius={[4, 4, 0, 0]}>
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.Beneficio >= 0 ? '#3d6b5c' : '#9f3a32'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>
          ) : null}

          {visibility.costMix ? (
            <ChartCard title="Profesor vs captación">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                <XAxis dataKey="name" tick={axisTick} interval={0} />
                <YAxis tick={axisTick} tickFormatter={(v) => formatEuro(v)} width={72} />
                <Tooltip content={<ChartTip />} />
                <Legend />
                <Bar dataKey="Profesor" fill="#1c2836" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CAC" fill="#8a5344" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          ) : null}

          {visibility.margin ? (
            <ChartCard title="Margen de contribución">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                <XAxis dataKey="name" tick={axisTick} interval={0} />
                <YAxis
                  tick={axisTick}
                  tickFormatter={(v) => formatPct(v)}
                  width={56}
                />
                <Tooltip content={<ChartTip kind="pct" />} />
                <Bar dataKey="Margen" fill="#4d6488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          ) : null}

          {visibility.breakEven ? (
            <ChartCard title="Alumnos actuales vs equilibrio">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                <XAxis dataKey="name" tick={axisTick} interval={0} />
                <YAxis tick={axisTick} width={40} />
                <Tooltip content={<ChartTip kind="students" />} />
                <Legend />
                <Bar dataKey="Equilibrio" fill="#9a7d4a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tamaño" fill="#1c2836" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          ) : null}
        </div>
      )}
    </section>
  )
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: ReactElement
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
