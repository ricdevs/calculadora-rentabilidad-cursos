import { computeMetrics } from '@/lib/calculations'
import type { CourseConfig } from '@/lib/types'

const headers = [
  'Curso',
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

export function coursesToCsv(courses: CourseConfig[]): string {
  const lines = [headers.map((h) => `"${h}"`).join(';')]
  for (const course of courses) {
    const m = computeMetrics(course)
    lines.push(
      [
        cell(course.name),
        cell(course.pricePerStudent),
        cell(course.hoursPerStudent),
        cell(course.classSize),
        cell(course.classDurationHours),
        cell(course.teacherHourlyCost),
        cell(course.customerAcquisitionCost),
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
      ].join(';'),
    )
  }
  return `\uFEFF${lines.join('\n')}\n`
}

export function downloadCsv(courses: CourseConfig[]): void {
  const blob = new Blob([coursesToCsv(courses)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'rentabilidad-cursos-georgetown.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
