import { Workbook, type CellValue } from 'exceljs'
import { computeMetrics, computePortfolio } from '@/lib/calculations'
import type { Contract, CourseConfig } from '@/lib/types'

type ColumnKind = 'text' | 'integer' | 'decimal' | 'euro' | 'percent'

type ColumnSpec = {
  header: string
  width: number
  kind: ColumnKind
}

const COLUMNS: ColumnSpec[] = [
  { header: 'Acuerdo', width: 34, kind: 'text' },
  { header: 'Empresa', width: 28, kind: 'text' },
  { header: 'Grupo', width: 32, kind: 'text' },
  { header: 'Precio €/alumno', width: 16, kind: 'euro' },
  { header: 'Horas/alumno', width: 14, kind: 'decimal' },
  { header: 'Tamaño clase', width: 14, kind: 'integer' },
  { header: 'Profesor €/h', width: 14, kind: 'euro' },
  { header: 'CAC €/alumno', width: 14, kind: 'euro' },
  { header: 'Horas profesor', width: 14, kind: 'decimal' },
  { header: 'Coste profesor/grupo', width: 20, kind: 'euro' },
  { header: 'Coste profesor/alumno', width: 20, kind: 'euro' },
  { header: 'CAC grupo', width: 14, kind: 'euro' },
  { header: 'Coste total/grupo', width: 18, kind: 'euro' },
  { header: 'Ingresos/grupo', width: 16, kind: 'euro' },
  { header: 'Beneficio/grupo', width: 16, kind: 'euro' },
  { header: 'Margen', width: 12, kind: 'percent' },
  { header: 'ROI', width: 12, kind: 'percent' },
  { header: 'Punto equilibrio (alumnos)', width: 22, kind: 'decimal' },
  { header: 'Precio/hora-alumno', width: 18, kind: 'euro' },
  { header: '% profesor / ingresos', width: 20, kind: 'percent' },
  { header: '% CAC / ingresos', width: 16, kind: 'percent' },
  { header: 'Precio mínimo', width: 14, kind: 'euro' },
  { header: 'Techo profesor €/h', width: 18, kind: 'euro' },
  { header: 'Contribución / hora-alumno', width: 24, kind: 'euro' },
]

const NUM_FMT: Record<ColumnKind, string | undefined> = {
  text: undefined,
  integer: '0',
  decimal: '#,##0.00',
  euro: '#,##0.00',
  percent: '0.0%',
}

function cell(value: string | number | null): CellValue {
  return value
}

function groupValues(contract: Contract, group: CourseConfig): CellValue[] {
  const m = computeMetrics(group)
  return [
    cell(contract.name),
    cell(contract.company),
    cell(group.name),
    cell(group.pricePerStudent),
    cell(group.hoursPerStudent),
    cell(group.classSize),
    cell(group.teacherHourlyCost),
    cell(group.customerAcquisitionCost),
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
  ]
}

function totalValues(contract: Contract, groups: CourseConfig[]): CellValue[] {
  const totals = computePortfolio(groups)
  return [
    cell(contract.name),
    cell(contract.company),
    cell('TOTAL CONTRATO'),
    cell(null),
    cell(null),
    cell(totals.studentCount),
    cell(null),
    cell(null),
    cell(totals.teacherHours),
    cell(totals.teacherCost),
    cell(null),
    cell(totals.cac),
    cell(totals.totalCost),
    cell(totals.revenue),
    cell(totals.profit),
    cell(totals.marginPct),
    cell(totals.roiPct),
    cell(null),
    cell(null),
    cell(totals.teacherShareOfRevenue),
    cell(totals.cacShareOfRevenue),
    cell(null),
    cell(null),
    cell(null),
  ]
}

export function workbookFileName(contract: Contract): string {
  const slug =
    contract.name
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'contrato'
  return `rentabilidad-${slug}.xlsx`
}

export function buildWorkbook(
  contract: Contract,
  groups: CourseConfig[],
): Workbook {
  const workbook = new Workbook()
  workbook.creator = 'Academia Georgetown'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Contrato', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  })

  sheet.columns = COLUMNS.map((column) => ({
    header: column.header,
    width: column.width,
  }))

  const header = sheet.getRow(1)
  header.height = 22
  header.eachCell((excelCell) => {
    excelCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    excelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0C1F3A' },
    }
    excelCell.alignment = { vertical: 'middle', wrapText: true }
  })

  for (const group of groups) {
    sheet.addRow(groupValues(contract, group))
  }
  sheet.addRow(totalValues(contract, groups))

  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex)
    const isTotal = rowIndex === sheet.rowCount
    row.eachCell({ includeEmpty: true }, (excelCell, colNumber) => {
      const spec = COLUMNS[colNumber - 1]
      if (!spec) return
      const format = NUM_FMT[spec.kind]
      if (format && typeof excelCell.value === 'number') {
        excelCell.numFmt = format
      }
      excelCell.alignment = { vertical: 'middle' }
      if (isTotal) {
        excelCell.font = { bold: true, color: { argb: 'FF0C1F3A' } }
        excelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8D5A3' },
        }
      }
    })
  }

  if (groups.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: COLUMNS.length },
    }
  }

  return workbook
}

export async function downloadXlsx(
  contract: Contract,
  groups: CourseConfig[],
): Promise<void> {
  const workbook = buildWorkbook(contract, groups)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([new Uint8Array(buffer as ArrayBuffer)], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = workbookFileName(contract)
  anchor.click()
  URL.revokeObjectURL(url)
}
