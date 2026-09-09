import { ConfigTable } from '@/components/ConfigTable'
import { Formulas } from '@/components/Formulas'
import { Header } from '@/components/Header'
import { RatiosTable } from '@/components/RatiosTable'
import { SummaryCards } from '@/components/SummaryCards'
import { Button } from '@/components/ui/button'
import { computePortfolio, withMetrics } from '@/lib/calculations'
import { downloadCsv } from '@/lib/csv'
import {
  createBlankCourse,
  duplicateCourse,
  exampleCourses,
} from '@/lib/defaults'
import { loadState, saveState } from '@/lib/storage'
import type { ChartId, ChartVisibility, CourseConfig } from '@/lib/types'
import { Download, RotateCcw } from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'

const ChartsPanel = lazy(() =>
  import('@/components/ChartsPanel').then((mod) => ({ default: mod.ChartsPanel })),
)

const AnalysisChart = lazy(() =>
  import('@/components/AnalysisChart').then((mod) => ({
    default: mod.AnalysisChart,
  })),
)

function ChartFallback() {
  return (
    <div className="text-muted-foreground rounded-xl bg-card p-5 text-sm ring-1 ring-foreground/10">
      Cargando gráficos…
    </div>
  )
}

export default function App() {
  const initial = useMemo(() => loadState(), [])
  const [courses, setCourses] = useState<CourseConfig[]>(initial.courses)
  const [charts, setCharts] = useState<ChartVisibility>(initial.charts)
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.courses[0]?.id ?? null,
  )

  useEffect(() => {
    saveState(courses, charts)
  }, [courses, charts])

  const activeId =
    selectedId && courses.some((course) => course.id === selectedId)
      ? selectedId
      : (courses[0]?.id ?? null)

  const rows = useMemo(() => courses.map(withMetrics), [courses])
  const totals = useMemo(() => computePortfolio(courses), [courses])

  function patchCourse(id: string, patch: Partial<CourseConfig>) {
    setCourses((current) =>
      current.map((course) =>
        course.id === id ? { ...course, ...patch } : course,
      ),
    )
  }

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Los cuatro escenarios de partida son <strong>ilustrativos</strong>.
            Sustitúyelos por tarifas, €/h de profesor y CAC reales antes de
            cotizar o de abrir un grupo.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => downloadCsv(courses)}
              disabled={courses.length === 0}
            >
              <Download data-icon="inline-start" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => setCourses(exampleCourses.map((c) => ({ ...c })))}
            >
              <RotateCcw data-icon="inline-start" />
              Restaurar ejemplos
            </Button>
          </div>
        </div>

        <SummaryCards totals={totals} />

        <ConfigTable
          courses={courses}
          selectedId={activeId}
          onSelect={setSelectedId}
          onChange={patchCourse}
          onAdd={() =>
            setCourses((current) => [...current, createBlankCourse(current)])
          }
          onDuplicate={(id) =>
            setCourses((current) => {
              const source = current.find((course) => course.id === id)
              return source ? [...current, duplicateCourse(source)] : current
            })
          }
          onRemove={(id) =>
            setCourses((current) => current.filter((course) => course.id !== id))
          }
        />

        <Suspense fallback={<ChartFallback />}>
          <AnalysisChart
            courses={courses}
            selectedId={activeId}
            onSelect={setSelectedId}
            onChange={patchCourse}
          />
        </Suspense>

        <RatiosTable rows={rows} totals={totals} />

        <Suspense fallback={<ChartFallback />}>
          <ChartsPanel
            rows={rows}
            visibility={charts}
            onToggle={(id: ChartId, visible: boolean) =>
              setCharts((current) => ({ ...current, [id]: visible }))
            }
          />
        </Suspense>

        <Formulas />

        <p className="text-muted-foreground pb-6 text-center text-xs">
          Uso interno · Academia Georgetown · Pamplona · Los datos se guardan
          solo en este navegador
        </p>
      </main>
    </div>
  )
}
