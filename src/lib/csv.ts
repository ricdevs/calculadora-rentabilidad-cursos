import { computeMetrics, computePortfolio } from '@/lib/calculations'
import type { Contract, CourseConfig } from '@/lib/types'

const headers = [
  'Acuerdo',
  'Empresa',
  'Grupo',
  'Precio €/alumno',
  'Horas/alumno',
  'Tamaño clase',
  'Duración clase (h)',
  'Profesor €/h',
  'CAC €/alumno',
  'Sesiones',
  'Horas profesor',
  'Coste profesor/grupo',
  'Coste profesor/alumno',
  'CAC grupo',
  'Coste total/grupo',
  'Ingresos/grupo',
  'Beneficio/grupo',
  'Margen',
  'ROI',
  'Punto equilibrio (alumnos)',
  'Precio/hora-alumno',
  '% profesor / ingresos',
  '% CAC / ingresos',
  'Precio mínimo',
  'Techo profesor €/h',
  'Contribución / hora-alumno',
]

function cell(value: string | number | null): string {
  const text =
    value === null
      ? ''
      : typeof value === 'number'
        ? String(value)
        : value.replaceAll('"', '""')
  return `"${text}"`
}

export function coursesToCsv(
  contract: Contract,
  groups: CourseConfig[],
): string {
  const lines = [headers.map((h) => `"${h}"`).join(';')]
  for (const group of groups) {
    const m = computeMetrics(group)
    lines.push(
      [
        cell(contract.name),
        cell(contract.company),
        cell(group.name),
        cell(group.pricePerStudent),
        cell(group.hoursPerStudent),
        cell(group.classSize),
        cell(group.classDurationHours),
        cell(group.teacherHourlyCost),
        cell(group.customerAcquisitionCost),
        cell(m.sessions),
        cell(m.teacherHours),
        cell(m.teacherCostPerGroup),
        cell(m.teacherCostPerStudent),
        cell(m.cacPerGroup),
        cell(m.totalCostPerGroup),
        cell(m.revenuePerGroup),
        cell(m.profitPerGroup),
        cell(m.marginPct),
        cell(m.roiPct),
        cell(m.breakEvenStudents),
        cell(m.revenuePerStudentHour),
        cell(m.teacherShareOfRevenue),
        cell(m.cacShareOfRevenue),
        cell(m.breakEvenPrice),
        cell(m.maxTeacherHourlyCost),
        cell(m.contributionPerStudentHour),
      ].join(';'),
    )
  }

  const totals = computePortfolio(groups)
  lines.push(
    [
      cell(contract.name),
      cell(contract.company),
      cell('TOTAL CONTRATO'),
      cell(''),
      cell(''),
      cell(totals.studentCount),
      cell(''),
      cell(''),
      cell(''),
      cell(''),
      cell(totals.teacherHours),
      cell(totals.teacherCost),
      cell(''),
      cell(totals.cac),
      cell(totals.totalCost),
      cell(totals.revenue),
      cell(totals.profit),
      cell(totals.marginPct),
      cell(totals.roiPct),
      cell(''),
      cell(''),
      cell(totals.teacherShareOfRevenue),
      cell(totals.cacShareOfRevenue),
      cell(''),
      cell(''),
      cell(''),
    ].join(';'),
  )

  return `\uFEFF${lines.join('\n')}\n`
}

export function downloadCsv(contract: Contract, groups: CourseConfig[]): void {
  const blob = new Blob([coursesToCsv(contract, groups)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'rentabilidad-contrato-georgetown.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
