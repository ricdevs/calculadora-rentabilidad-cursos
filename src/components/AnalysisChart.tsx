import { SliderField } from '@/components/SliderField'
import { formatEuro, formatNumber, formatPct } from '@/lib/format'
import {
  breakEvenOnAxis,
  computeMetrics,
  sweepCourse,
} from '@/lib/calculations'
import { CONFIG_FIELDS, SWEEP_AXES, fieldSpec, type SweepAxis } from '@/lib/fields'
import type { CourseConfig } from '@/lib/types'
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SERIES = [
  { key: 'ingresos', label: 'Ingresos', color: '#9a7d4a' },
  { key: 'costeTotal', label: 'Coste total', color: '#8a5344' },
  { key: 'costeProfesor', label: 'Coste profesor', color: '#1c2836' },
  { key: 'cac', label: 'CAC grupo', color: '#6b3f69' },
  { key: 'beneficio', label: 'Beneficio', color: '#3d6b5c' },
] as const

type EuroSeriesKey = (typeof SERIES)[number]['key']

type TipProps = {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string | number
  kind?: 'euro' | 'pct'
}

function ChartTip({ active, payload, label, kind = 'euro' }: TipProps) {
  if (!active || !payload?.length) return null
  const format = kind === 'pct' ? formatPct : formatEuro
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="flex justify-between gap-4">
          <span style={{ color: item.color }}>{item.name}</span>
          <span className="tabular-nums">{format(item.value)}</span>
        </p>
      ))}
    </div>
  )
}

const axisTick = { fill: '#5c6573', fontSize: 11 }

export function AnalysisChart({
  courses,
  selectedId,
  onSelect,
  onChange,
}: {
  courses: CourseConfig[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<CourseConfig>) => void
}) {
  const [axis, setAxis] = useState<SweepAxis>('classSize')
  const [visible, setVisible] = useState<Record<EuroSeriesKey, boolean>>({
    ingresos: true,
    costeTotal: true,
    costeProfesor: true,
    cac: true,
    beneficio: true,
  })

  const selected = courses.find((course) => course.id === selectedId) ?? courses[0]
  const spec = fieldSpec(axis)
  const points = useMemo(
    () => (selected ? sweepCourse(selected, axis) : []),
    [selected, axis],
  )
  const intersection = selected ? breakEvenOnAxis(selected, axis) : null
  const metrics = selected ? computeMetrics(selected) : null
  const currentX = selected ? selected[axis] : 0

  if (!selected) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 text-[13px] text-muted-foreground">
        Añade un grupo para analizar la configuración.
      </section>
    )
  }

  const inRange =
    intersection !== null &&
    intersection.x >= spec.min &&
    intersection.x <= spec.max

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap gap-2">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => onSelect(course.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                course.id === selected.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: course.color }}
              />
              {course.name}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SWEEP_AXES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setAxis(item.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                axis === item.key
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Eje: {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 px-4 pb-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                Costes, ingresos y beneficio vs {spec.shortLabel.toLowerCase()}
              </h3>
              <p className="text-muted-foreground text-xs">
                Cruce ingresos / coste total = equilibrio
              </p>
            </div>
            <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
              {SERIES.map((series) => (
                <label
                  key={series.key}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={visible[series.key]}
                    onChange={() =>
                      setVisible((current) => ({
                        ...current,
                        [series.key]: !current[series.key],
                      }))
                    }
                  />
                  <span style={{ color: series.color }}>{series.label}</span>
                </label>
              ))}
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[spec.min, spec.max]}
                    tick={axisTick}
                    tickFormatter={(value) => formatNumber(Number(value), 0)}
                  />
                  <YAxis
                    tick={axisTick}
                    width={68}
                    tickFormatter={(value) => formatEuro(Number(value))}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Legend />
                  {SERIES.map((series) =>
                    visible[series.key] ? (
                      <Line
                        key={series.key}
                        type="monotone"
                        dataKey={series.key}
                        name={series.label}
                        stroke={series.color}
                        dot={false}
                        strokeWidth={series.key === 'ingresos' || series.key === 'costeTotal' ? 2.4 : 1.6}
                      />
                    ) : null,
                  )}
                  <ReferenceLine
                    x={currentX}
                    stroke="#9a7d4a"
                    strokeDasharray="4 4"
                    label={{ value: 'Actual', fill: '#5c6573', fontSize: 11, position: 'insideTopRight' }}
                  />
                  {inRange && intersection ? (
                    <ReferenceDot
                      x={intersection.x}
                      y={intersection.y}
                      r={5}
                      fill="#b42318"
                      stroke="#fff"
                      strokeWidth={1.5}
                      label={{
                        value: 'Equilibrio',
                        position: 'top',
                        fill: '#b42318',
                        fontSize: 11,
                      }}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3">
            <h3 className="mb-2 text-sm font-medium">
              Margen y ROI vs {spec.shortLabel.toLowerCase()}
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd6cb" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[spec.min, spec.max]}
                    tick={axisTick}
                    tickFormatter={(value) => formatNumber(Number(value), 0)}
                  />
                  <YAxis
                    tick={axisTick}
                    width={48}
                    tickFormatter={(value) => formatPct(Number(value))}
                  />
                  <Tooltip content={<ChartTip kind="pct" />} />
                  <Legend />
                  <Line type="monotone" dataKey="margenPct" name="Margen" stroke="#4A6FA5" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="roiPct" name="ROI" stroke="#2F6F5E" dot={false} strokeWidth={2} />
                  <ReferenceLine
                    x={currentX}
                    stroke="#9a7d4a"
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border bg-background p-3">
            <h3 className="mb-3 text-sm font-medium">Ajuste rápido · {selected.name}</h3>
            <div className="space-y-3">
              {CONFIG_FIELDS.map((field) => (
                <label key={field.key} className="block">
                  <span className="text-muted-foreground mb-1 flex items-center justify-between text-[11px]">
                    {field.label}
                    <span className="tabular-nums text-foreground">
                      {formatNumber(selected[field.key], field.step < 1 ? 1 : 0)}{' '}
                      {field.unit}
                    </span>
                  </span>
                  <SliderField
                    spec={field}
                    value={selected[field.key]}
                    ariaLabel={`${selected.name}: ${field.label}`}
                    className="min-w-0"
                    onChange={(value) => onChange(selected.id, { [field.key]: value })}
                  />
                </label>
              ))}
            </div>
          </div>

          {metrics ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Insight
                label="Equilibrio"
                value={
                  intersection
                    ? `${formatNumber(intersection.x, 1)} ${spec.unit}`
                    : 'No cubre'
                }
              />
              <Insight
                label="Precio mínimo"
                value={
                  metrics.breakEvenPrice === null
                    ? '—'
                    : formatEuro(metrics.breakEvenPrice)
                }
              />
              <Insight
                label="Techo profesor"
                value={
                  metrics.maxTeacherHourlyCost === null
                    ? '—'
                    : `${formatEuro(metrics.maxTeacherHourlyCost, true)}/h`
                }
              />
              <Insight
                label="CAC máximo"
                value={
                  metrics.maxCacPerStudent === null
                    ? '—'
                    : formatEuro(metrics.maxCacPerStudent)
                }
              />
              <Insight
                label="% profesor / ingresos"
                value={formatPct(metrics.teacherShareOfRevenue)}
              />
              <Insight
                label="% CAC / ingresos"
                value={formatPct(metrics.cacShareOfRevenue)}
              />
              <Insight
                label="Contribución / h-alumno"
                value={formatEuro(metrics.contributionPerStudentHour, true)}
              />
              <Insight
                label="Coste / h-alumno"
                value={formatEuro(metrics.costPerStudentHour, true)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background px-2.5 py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
    </div>
  )
}
