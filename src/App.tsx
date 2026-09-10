import { ConfigTable } from '@/components/ConfigTable'
import { Formulas } from '@/components/Formulas'
import { Header } from '@/components/Header'
import { RatiosTable } from '@/components/RatiosTable'
import { SectionCollapsible } from '@/components/SectionCollapsible'
import { SummaryCards } from '@/components/SummaryCards'
import { Button } from '@/components/ui/button'
import { computePortfolio, computeRows } from '@/lib/calculations'
import {
  createBlankCourse,
  duplicateCourse,
  exampleContract,
  exampleCourses,
} from '@/lib/defaults'
import { loadFolds, loadState, saveFolds, saveState } from '@/lib/storage'
import type {
  ChartId,
  ChartVisibility,
  Contract,
  CourseConfig,
  SectionFolds,
  SectionId,
} from '@/lib/types'
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
    <div className="text-muted-foreground rounded-md border border-border bg-card p-4 text-[13px]">
      Cargando gráficos…
    </div>
  )
}

export default function App() {
  const initial = useMemo(() => loadState(), [])
  const [contract, setContract] = useState<Contract>(initial.contract)
  const [courses, setCourses] = useState<CourseConfig[]>(initial.courses)
  const [charts, setCharts] = useState<ChartVisibility>(initial.charts)
  const [folds, setFolds] = useState<SectionFolds>(() => loadFolds())
  const [selectedId, setSelectedId] = useState<string | null>(
    initial.courses[0]?.id ?? null,
  )
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    saveState(contract, courses, charts)
  }, [contract, courses, charts])

  useEffect(() => {
    saveFolds(folds)
  }, [folds])

  const activeId =
    selectedId && courses.some((course) => course.id === selectedId)
      ? selectedId
      : (courses[0]?.id ?? null)

  const rows = useMemo(
    () => computeRows(courses, contract),
    [courses, contract],
  )
  const totals = useMemo(
    () => computePortfolio(courses, contract),
    [courses, contract],
  )

  function patchCourse(id: string, patch: Partial<CourseConfig>) {
    setCourses((current) =>
      current.map((course) =>
        course.id === id ? { ...course, ...patch } : course,
      ),
    )
  }

  function setFold(id: SectionId, open: boolean) {
    setFolds((current) => ({ ...current, [id]: open }))
  }

  function restoreExamples() {
    setContract({ ...exampleContract })
    setCourses(exampleCourses.map((course) => ({ ...course })))
  }

  async function exportWorkbook() {
    if (courses.length === 0 || exporting) return
    setExporting(true)
    try {
      const { downloadXlsx } = await import('@/lib/xlsx')
      await downloadXlsx(contract, courses)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-svh">
      <Header />
      <main className="mx-auto flex max-w-[1080px] flex-col gap-8 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-muted-foreground max-w-2xl text-[13px] leading-relaxed">
            Ejemplo ilustrativo con varios grupos y un cálculo FUNDAE. Sustituye
            empresa, plantilla, tarifas, €/h de profesor y CAC reales antes de
            cotizar.
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void exportWorkbook()}
              disabled={courses.length === 0 || exporting}
            >
              <Download data-icon="inline-start" />
              {exporting ? 'Exportando…' : 'Exportar Excel'}
            </Button>
            <Button variant="outline" size="sm" onClick={restoreExamples}>
              <RotateCcw data-icon="inline-start" />
              Restaurar ejemplo
            </Button>
          </div>
        </div>

        <SectionCollapsible
          id="summary"
          title="Totales del contrato"
          description={
            contract.company
              ? `${contract.name} · ${contract.company}. Contribución de la academia y neto FUNDAE de la empresa.`
              : `${contract.name}. Contribución de la academia y neto FUNDAE de la empresa.`
          }
          open={folds.summary}
          onOpenChange={(open) => setFold('summary', open)}
        >
          <SummaryCards totals={totals} />
        </SectionCollapsible>

        <ConfigTable
          contract={contract}
          groups={courses}
          selectedId={activeId}
          onContractChange={(patch) =>
            setContract((current) => ({ ...current, ...patch }))
          }
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

        <SectionCollapsible
          id="analysis"
          title="Análisis de configuración"
          description="Elige un grupo del contrato, mueve los deslizadores y mira dónde se cruzan ingresos y coste total (punto de equilibrio)."
          open={folds.analysis}
          onOpenChange={(open) => setFold('analysis', open)}
        >
          <Suspense fallback={<ChartFallback />}>
            <AnalysisChart
              courses={courses}
              selectedId={activeId}
              onSelect={setSelectedId}
              onChange={patchCourse}
            />
          </Suspense>
        </SectionCollapsible>

        <SectionCollapsible
          id="ratios"
          title="Rentabilidades y ratios clave"
          description="Métricas de cada grupo y, al pie, el contrato entero. Margen de contribución (profesor + CAC) de la academia, más bonificación y neto FUNDAE de la empresa. Verde ≥ 40 %, ámbar ≥ 20 %."
          open={folds.ratios}
          onOpenChange={(open) => setFold('ratios', open)}
        >
          <RatiosTable rows={rows} totals={totals} />
        </SectionCollapsible>

        <SectionCollapsible
          id="charts"
          title="Gráficos"
          description="Comparación entre los grupos de este acuerdo. Activa solo los que te ayuden a decidir: abrir un grupo, subir precio o bajar CAC."
          open={folds.charts}
          onOpenChange={(open) => setFold('charts', open)}
        >
          <Suspense fallback={<ChartFallback />}>
            <ChartsPanel
              rows={rows}
              visibility={charts}
              onToggle={(id: ChartId, visible: boolean) =>
                setCharts((current) => ({ ...current, [id]: visible }))
              }
            />
          </Suspense>
        </SectionCollapsible>

        <SectionCollapsible
          id="formulas"
          title="Cómo se calcula"
          description="El profesor imparte el grupo durante todas las horas del alumno. El tamaño de clase diluye ese coste. FUNDAE es el crédito de la empresa, no un ingreso extra de la academia."
          open={folds.formulas}
          onOpenChange={(open) => setFold('formulas', open)}
        >
          <Formulas />
        </SectionCollapsible>

        <p className="text-muted-foreground pb-6 text-center text-xs">
          Uso interno · Academia Georgetown · Pamplona · Los datos se guardan
          solo en este navegador
        </p>
      </main>
    </div>
  )
}
