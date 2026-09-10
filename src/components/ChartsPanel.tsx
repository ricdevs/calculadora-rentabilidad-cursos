import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { formatEuro, formatNumber, formatPct } from '@/lib/format'
import type { ChartId, ChartVisibility, CourseRow } from '@/lib/types'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactElement } from 'react'
import { createPortal } from 'react-dom'
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

const chartTitles: Record<ChartId, string> = {
  costsRevenue: 'Costes e ingresos',
  payoff: 'Beneficio por grupo',
  costMix: 'Profesor vs captación',
  margin: 'Margen de contribución',
  breakEven: 'Alumnos actuales vs equilibrio',
}

type Datum = {
  name: string
  color: string
  Profesor: number
  CAC: number
  Ingresos: number
  Beneficio: number
  Margen: number
  Equilibrio: number
  Tamaño: number
}

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

function GroupChart({
  id,
  data,
  focused,
  ...chartSize
}: {
  id: ChartId
  data: Datum[]
  focused: boolean
  width?: number
  height?: number
}) {
  const tick = { fill: '#6a6560', fontSize: focused ? 13 : 11 }
  const euroWidth = focused ? 92 : 72
  const pctWidth = focused ? 72 : 56
  const studentsWidth = focused ? 48 : 40

  switch (id) {
    case 'costsRevenue':
      return (
        <BarChart data={data} {...chartSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
          <XAxis dataKey="name" tick={tick} interval={0} />
          <YAxis
            tick={tick}
            tickFormatter={(v) => formatEuro(v)}
            width={euroWidth}
          />
          <Tooltip content={<ChartTip />} />
          <Legend />
          <Bar dataKey="Profesor" stackId="cost" fill="#1c2836" />
          <Bar
            dataKey="CAC"
            stackId="cost"
            fill="#8a5344"
            radius={[4, 4, 0, 0]}
          />
          <Bar dataKey="Ingresos" fill="#9a7d4a" radius={[4, 4, 0, 0]} />
        </BarChart>
      )
    case 'payoff':
      return (
        <BarChart data={data} {...chartSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
          <XAxis dataKey="name" tick={tick} interval={0} />
          <YAxis
            tick={tick}
            tickFormatter={(v) => formatEuro(v)}
            width={euroWidth}
          />
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
      )
    case 'costMix':
      return (
        <BarChart data={data} {...chartSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
          <XAxis dataKey="name" tick={tick} interval={0} />
          <YAxis
            tick={tick}
            tickFormatter={(v) => formatEuro(v)}
            width={euroWidth}
          />
          <Tooltip content={<ChartTip />} />
          <Legend />
          <Bar dataKey="Profesor" fill="#1c2836" radius={[4, 4, 0, 0]} />
          <Bar dataKey="CAC" fill="#8a5344" radius={[4, 4, 0, 0]} />
        </BarChart>
      )
    case 'margin':
      return (
        <BarChart data={data} {...chartSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
          <XAxis dataKey="name" tick={tick} interval={0} />
          <YAxis tick={tick} tickFormatter={(v) => formatPct(v)} width={pctWidth} />
          <Tooltip content={<ChartTip kind="pct" />} />
          <Bar dataKey="Margen" fill="#4d6488" radius={[4, 4, 0, 0]} />
        </BarChart>
      )
    case 'breakEven':
      return (
        <BarChart data={data} {...chartSize}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
          <XAxis dataKey="name" tick={tick} interval={0} />
          <YAxis tick={tick} width={studentsWidth} />
          <Tooltip content={<ChartTip kind="students" />} />
          <Legend />
          <Bar dataKey="Equilibrio" fill="#9a7d4a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Tamaño" fill="#1c2836" radius={[4, 4, 0, 0]} />
        </BarChart>
      )
  }
}

export function ChartsPanel({
  rows,
  visibility,
  onToggle,
}: {
  rows: CourseRow[]
  visibility: ChartVisibility
  onToggle: (id: ChartId, visible: boolean) => void
}) {
  const [focusedId, setFocusedId] = useState<ChartId | null>(null)

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
  const focused = focusedId && visibility[focusedId] ? focusedId : null

  return (
    <section className="rounded-md border border-border bg-card">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
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
        <p className="text-muted-foreground shrink-0 text-[12px] sm:pt-0.5">
          Ampliar para ver un gráfico a pantalla.
        </p>
      </div>

      {rows.length === 0 || active.length === 0 ? (
        <p className="text-muted-foreground px-5 pb-5 text-sm">
          {rows.length === 0
            ? 'Añade un grupo para ver gráficos.'
            : 'Activa al menos un gráfico. Las tablas siguen siendo la fuente de verdad.'}
        </p>
      ) : (
        <div className="grid gap-4 px-4 pb-5 lg:grid-cols-2">
          {active.map((chart) => (
            <ChartCard
              key={chart.id}
              title={chartTitles[chart.id]}
              onFocus={() => setFocusedId(chart.id)}
            >
              <GroupChart id={chart.id} data={data} focused={false} />
            </ChartCard>
          ))}
        </div>
      )}

      {focused ? (
        <ChartFocus
          id={focused}
          data={data}
          visibleIds={active.map((chart) => chart.id)}
          onClose={() => setFocusedId(null)}
          onSelect={setFocusedId}
        />
      ) : null}
    </section>
  )
}

function ChartCard({
  title,
  onFocus,
  children,
}: {
  title: string
  onFocus: () => void
  children: ReactElement
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -mt-1 h-7 shrink-0 px-2"
          onClick={onFocus}
          aria-label={`Ampliar ${title}`}
        >
          <Maximize2 />
          Ampliar
        </Button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ChartFocus({
  id,
  data,
  visibleIds,
  onClose,
  onSelect,
}: {
  id: ChartId
  data: Datum[]
  visibleIds: ChartId[]
  onClose: () => void
  onSelect: (id: ChartId) => void
}) {
  const titleId = useId()
  const index = visibleIds.indexOf(id)
  const meta = chartMeta.find((chart) => chart.id === id)
  const canCycle = visibleIds.length > 1
  const onCloseRef = useRef(onClose)
  const onSelectRef = useRef(onSelect)
  const visibleIdsRef = useRef(visibleIds)
  onCloseRef.current = onClose
  onSelectRef.current = onSelect
  visibleIdsRef.current = visibleIds

  function go(delta: number) {
    if (!canCycle) return
    const next =
      visibleIds[(index + delta + visibleIds.length) % visibleIds.length]
    onSelect(next)
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      const ids = visibleIdsRef.current
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (ids.length < 2) return
      const current = ids.indexOf(id)
      const delta = event.key === 'ArrowLeft' ? -1 : 1
      const next = ids[(current + delta + ids.length) % ids.length]
      onSelectRef.current(next)
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [id])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#16181c]/55"
        aria-label="Cerrar gráfico ampliado"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(100%,920px)] w-full max-w-[1080px] flex-col overflow-hidden rounded-md border border-border bg-card shadow-[0_24px_80px_rgba(22,24,28,0.28)]">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
              Gráfico {index + 1} de {visibleIds.length}
            </p>
            <h3
              id={titleId}
              className="font-heading text-[1.15rem] leading-tight font-medium"
            >
              {chartTitles[id]}
            </h3>
            {meta ? (
              <p className="text-muted-foreground mt-0.5 text-sm">{meta.hint}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {canCycle ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Gráfico anterior"
                  onClick={() => go(-1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Gráfico siguiente"
                  onClick={() => go(1)}
                >
                  <ChevronRight />
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Cerrar"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </div>
        <div className="bg-background h-[min(72vh,560px)] p-3 sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <GroupChart id={id} data={data} focused />
          </ResponsiveContainer>
        </div>
        <p className="text-muted-foreground border-t border-border px-4 py-2.5 text-[12px] sm:px-5">
          Esc para cerrar
          {canCycle ? ' · Flechas para cambiar de gráfico' : ''}
        </p>
      </div>
    </div>,
    document.body,
  )
}
