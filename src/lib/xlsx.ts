import { Workbook, type Worksheet } from 'exceljs'
import { computePortfolio, computeRows } from '@/lib/calculations'
import {
  FUNDAE_MODALITY_SHORT,
  cofinanceRate,
  workforceLabel,
} from '@/lib/fundae'
import type { Contract, CourseConfig, CourseRow, PortfolioTotals } from '@/lib/types'
import { embedNativeCharts, type NativeChart } from '@/lib/xlsx-charts'

const FONT = { name: 'Calibri', size: 11, color: { argb: 'FF000000' } }
const FONT_TITLE = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF000000' } }
const FONT_MUTED = { name: 'Calibri', size: 10, color: { argb: 'FF666666' } }
const FONT_SECTION = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } }
const FONT_HEADER = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } }
const FONT_TOTAL = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } }

const FILL_HEADER = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFF2F2F2' },
}
const FILL_TOTAL = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FFF7F7F7' },
}

const BORDER_THIN = { style: 'thin' as const, color: { argb: 'FFB7B7B7' } }
const BORDER_GRID = {
  top: BORDER_THIN,
  left: BORDER_THIN,
  bottom: BORDER_THIN,
  right: BORDER_THIN,
}
const BORDER_TOTAL = {
  top: { style: 'thin' as const, color: { argb: 'FF000000' } },
  left: BORDER_THIN,
  right: BORDER_THIN,
  bottom: { style: 'double' as const, color: { argb: 'FF000000' } },
}

const FMT = {
  euro: '#,##0.00;[Red]\\(#,##0.00\\);"—"',
  percent: '0.0%;[Red]\\(0.0%\\);"—"',
  integer: '#,##0;[Red]\\(#,##0\\);"—"',
  decimal: '#,##0.00;[Red]\\(#,##0.00\\);"—"',
} as const

type Kind = 'text' | 'integer' | 'decimal' | 'euro' | 'percent'

type Column = {
  header: string
  width: number
  kind: Kind
  value: (row: CourseRow, contract: Contract, totals: PortfolioTotals) => string | number | null
  total?: (totals: PortfolioTotals, contract: Contract) => string | number | null
}

const CHARTS_SHEET = 'Gráficos'
const PALETTE = {
  professor: '5B5B5B',
  cac: '8A8A8A',
  revenue: '2F5496',
  profit: '548235',
  size: '7F7F7F',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(date)
}

function quoteSheet(name: string): string {
  return /[^A-Za-z0-9]/.test(name) ? `'${name.replaceAll("'", "''")}'` : name
}

function colLetter(index: number): string {
  let n = index
  let out = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    out = String.fromCharCode(65 + rem) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

function rangeRef(sheet: string, col: number, startRow: number, endRow: number): string {
  const letter = colLetter(col)
  return `${quoteSheet(sheet)}!$${letter}$${startRow}:$${letter}$${endRow}`
}

function applyPage(sheet: Worksheet, frozenRows: number) {
  sheet.properties.defaultRowHeight = 16
  sheet.views = [{ state: 'frozen', ySplit: frozenRows, showGridLines: false }]
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
  }
  sheet.headerFooter = {
    oddFooter: '&L&D&C&F&RPág. &P de &N',
  }
}

function writeIdentity(
  sheet: Worksheet,
  contract: Contract,
  totals: PortfolioTotals,
  exportedAt: Date,
) {
  sheet.getCell('A1').value = contract.name || 'Contrato'
  sheet.getCell('A1').font = FONT_TITLE
  sheet.getCell('A2').value = contract.company || '—'
  sheet.getCell('A2').font = FONT_MUTED
  const credit =
    contract.fundaeCredit === null
      ? 'crédito sin tope'
      : `crédito ${contract.fundaeCredit} €`
  const jornada = contract.trainingInWorkHours
    ? 'formación en jornada'
    : 'formación fuera de jornada'
  sheet.getCell('A3').value =
    `${formatDate(exportedAt)}  ·  ${totals.groupCount} grupos  ·  ${totals.studentCount} alumnos  ·  ${totals.teacherHours} h profesor  ·  FUNDAE ${workforceLabel(contract.workforceBand)}  ·  ${FUNDAE_MODALITY_SHORT[contract.fundaeModality]}  ·  ${credit}  ·  ${jornada}`
  sheet.getCell('A3').font = FONT_MUTED
}

function numFmt(kind: Kind): string | undefined {
  if (kind === 'euro') return FMT.euro
  if (kind === 'percent') return FMT.percent
  if (kind === 'integer') return FMT.integer
  if (kind === 'decimal') return FMT.decimal
  return undefined
}

function styleHeaderRow(sheet: Worksheet, rowIndex: number, cols: number) {
  const row = sheet.getRow(rowIndex)
  row.height = 20
  for (let col = 1; col <= cols; col += 1) {
    const cell = row.getCell(col)
    cell.font = FONT_HEADER
    cell.fill = FILL_HEADER
    cell.border = BORDER_GRID
    cell.alignment = { vertical: 'middle', wrapText: true, horizontal: col === 1 ? 'left' : 'right' }
  }
}

function styleDataCell(
  sheet: Worksheet,
  rowIndex: number,
  col: number,
  kind: Kind,
  isTotal: boolean,
) {
  const cell = sheet.getRow(rowIndex).getCell(col)
  cell.font = isTotal ? FONT_TOTAL : FONT
  cell.border = isTotal ? BORDER_TOTAL : BORDER_GRID
  if (isTotal) cell.fill = FILL_TOTAL
  const format = numFmt(kind)
  if (format && typeof cell.value === 'number') cell.numFmt = format
  cell.alignment = {
    vertical: 'middle',
    horizontal: kind === 'text' ? 'left' : 'right',
  }
}

function writeTable(
  sheet: Worksheet,
  startRow: number,
  columns: Column[],
  rows: CourseRow[],
  contract: Contract,
  totals: PortfolioTotals,
  includeTotal: boolean,
) {
  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width
    sheet.getRow(startRow).getCell(index + 1).value = column.header
  })
  styleHeaderRow(sheet, startRow, columns.length)

  rows.forEach((row, rowOffset) => {
    const excelRow = startRow + 1 + rowOffset
    columns.forEach((column, colOffset) => {
      sheet.getRow(excelRow).getCell(colOffset + 1).value = column.value(row, contract, totals)
      styleDataCell(sheet, excelRow, colOffset + 1, column.kind, false)
    })
  })

  if (!includeTotal) return startRow + rows.length

  const totalRow = startRow + rows.length + 1
  columns.forEach((column, colOffset) => {
    const value = column.total ? column.total(totals, contract) : null
    sheet.getRow(totalRow).getCell(colOffset + 1).value = value
    styleDataCell(sheet, totalRow, colOffset + 1, column.kind, true)
  })
  return totalRow
}

const contratoColumns: Column[] = [
  {
    header: 'Grupo',
    width: 32,
    kind: 'text',
    value: (row) => row.name,
    total: () => 'Total contrato',
  },
  {
    header: 'Precio €/alumno',
    width: 16,
    kind: 'euro',
    value: (row) => row.pricePerStudent,
  },
  {
    header: 'Horas / alumno',
    width: 14,
    kind: 'decimal',
    value: (row) => row.hoursPerStudent,
  },
  {
    header: 'Alumnos',
    width: 12,
    kind: 'integer',
    value: (row) => row.classSize,
    total: (totals) => totals.studentCount,
  },
  {
    header: 'Profesor €/h',
    width: 14,
    kind: 'euro',
    value: (row) => row.teacherHourlyCost,
  },
  {
    header: 'CAC €/alumno',
    width: 14,
    kind: 'euro',
    value: (row) => row.customerAcquisitionCost,
  },
  {
    header: 'Horas profesor',
    width: 14,
    kind: 'decimal',
    value: (row) => row.metrics.teacherHours,
    total: (totals) => totals.teacherHours,
  },
  {
    header: 'Coste profesor',
    width: 16,
    kind: 'euro',
    value: (row) => row.metrics.teacherCostPerGroup,
    total: (totals) => totals.teacherCost,
  },
  {
    header: 'CAC grupo',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.cacPerGroup,
    total: (totals) => totals.cac,
  },
  {
    header: 'Coste total',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.totalCostPerGroup,
    total: (totals) => totals.totalCost,
  },
  {
    header: 'Ingresos',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.revenuePerGroup,
    total: (totals) => totals.revenue,
  },
  {
    header: 'Beneficio',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.profitPerGroup,
    total: (totals) => totals.profit,
  },
  {
    header: 'Margen',
    width: 12,
    kind: 'percent',
    value: (row) => row.metrics.marginPct,
    total: (totals) => totals.marginPct,
  },
  {
    header: 'ROI',
    width: 12,
    kind: 'percent',
    value: (row) => row.metrics.roiPct,
    total: (totals) => totals.roiPct,
  },
  {
    header: 'Techo módulo €',
    width: 16,
    kind: 'euro',
    value: (row) => (row.fundae.enabled ? row.fundae.moduleCap : null),
  },
  {
    header: 'Bonif. FUNDAE',
    width: 16,
    kind: 'euro',
    value: (row) => (row.fundae.enabled ? row.fundae.bonus : null),
    total: (totals) => totals.fundaeBonus,
  },
  {
    header: '% cubierto',
    width: 12,
    kind: 'percent',
    value: (row) => (row.fundae.enabled ? row.fundae.coveragePct : null),
    total: (totals) => totals.fundaeCoveragePct,
  },
  {
    header: 'Neto empresa',
    width: 16,
    kind: 'euro',
    value: (row) => (row.fundae.enabled ? row.fundae.companyNet : null),
    total: (totals) => totals.companyNet,
  },
]

const ratioColumns: Column[] = [
  {
    header: 'Grupo',
    width: 32,
    kind: 'text',
    value: (row) => row.name,
    total: () => 'Total contrato',
  },
  {
    header: 'Horas profesor',
    width: 14,
    kind: 'decimal',
    value: (row) => row.metrics.teacherHours,
    total: (totals) => totals.teacherHours,
  },
  {
    header: 'Coste prof. / grupo',
    width: 18,
    kind: 'euro',
    value: (row) => row.metrics.teacherCostPerGroup,
    total: (totals) => totals.teacherCost,
  },
  {
    header: 'Coste prof. / alumno',
    width: 18,
    kind: 'euro',
    value: (row) => row.metrics.teacherCostPerStudent,
  },
  {
    header: 'CAC grupo',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.cacPerGroup,
    total: (totals) => totals.cac,
  },
  {
    header: 'Coste total',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.totalCostPerGroup,
    total: (totals) => totals.totalCost,
  },
  {
    header: 'Ingresos',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.revenuePerGroup,
    total: (totals) => totals.revenue,
  },
  {
    header: 'Beneficio',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.profitPerGroup,
    total: (totals) => totals.profit,
  },
  {
    header: 'Margen',
    width: 12,
    kind: 'percent',
    value: (row) => row.metrics.marginPct,
    total: (totals) => totals.marginPct,
  },
  {
    header: 'ROI',
    width: 12,
    kind: 'percent',
    value: (row) => row.metrics.roiPct,
    total: (totals) => totals.roiPct,
  },
  {
    header: '€ / hora-alumno',
    width: 16,
    kind: 'euro',
    value: (row) => row.metrics.revenuePerStudentHour,
  },
  {
    header: 'Equilibrio (alum.)',
    width: 16,
    kind: 'decimal',
    value: (row) => row.metrics.breakEvenStudents,
  },
  {
    header: '€ / h profesor',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.profitPerTeacherHour,
  },
  {
    header: 'Ingresos / prof.',
    width: 14,
    kind: 'decimal',
    value: (row) => row.metrics.revenueToTeacherCost,
  },
  {
    header: '% profesor',
    width: 12,
    kind: 'percent',
    value: (row) => row.metrics.teacherShareOfRevenue,
    total: (totals) => totals.teacherShareOfRevenue,
  },
  {
    header: '% CAC',
    width: 12,
    kind: 'percent',
    value: (row) => row.metrics.cacShareOfRevenue,
    total: (totals) => totals.cacShareOfRevenue,
  },
  {
    header: 'Precio mín.',
    width: 14,
    kind: 'euro',
    value: (row) => row.metrics.breakEvenPrice,
  },
  {
    header: 'Techo prof. €/h',
    width: 16,
    kind: 'euro',
    value: (row) => row.metrics.maxTeacherHourlyCost,
  },
  {
    header: 'Contrib. / h-alum.',
    width: 16,
    kind: 'euro',
    value: (row) => row.metrics.contributionPerStudentHour,
  },
  {
    header: 'Bonif. FUNDAE',
    width: 16,
    kind: 'euro',
    value: (row) => (row.fundae.enabled ? row.fundae.bonus : null),
    total: (totals) => totals.fundaeBonus,
  },
  {
    header: '% cubierto',
    width: 12,
    kind: 'percent',
    value: (row) => (row.fundae.enabled ? row.fundae.coveragePct : null),
    total: (totals) => totals.fundaeCoveragePct,
  },
  {
    header: 'Neto empresa',
    width: 16,
    kind: 'euro',
    value: (row) => (row.fundae.enabled ? row.fundae.companyNet : null),
    total: (totals) => totals.companyNet,
  },
]

function buildContratoSheet(
  workbook: Workbook,
  contract: Contract,
  rows: CourseRow[],
  totals: PortfolioTotals,
  exportedAt: Date,
) {
  const sheet = workbook.addWorksheet('Contrato', {
    properties: { tabColor: { argb: 'FF7F7F7F' } },
  })
  writeIdentity(sheet, contract, totals, exportedAt)
  sheet.getCell('A5').value = 'Cuenta de resultados por grupo'
  sheet.getCell('A5').font = FONT_SECTION
  const lastRow = writeTable(sheet, 6, contratoColumns, rows, contract, totals, true)

  const noteRow = lastRow + 2
  sheet.getCell(`A${noteRow}`).value = 'Parámetros FUNDAE (formación programada)'
  sheet.getCell(`A${noteRow}`).font = FONT_SECTION
  const fundaeLines: [string, string | number][] = [
    ['Modalidad', FUNDAE_MODALITY_SHORT[contract.fundaeModality]],
    ['Plantilla', workforceLabel(contract.workforceBand)],
    [
      'Crédito anual',
      contract.fundaeCredit === null ? 'Sin tope' : contract.fundaeCredit,
    ],
    [
      'Formación en jornada',
      contract.trainingInWorkHours ? 'Sí (salario cubre cofinanciación)' : 'No',
    ],
    [
      'Cofinanciación privada mínima',
      cofinanceRate(contract.workforceBand),
    ],
    ['Bonificación del contrato', totals.fundaeBonus],
    ['Neto empresa', totals.companyNet],
  ]
  fundaeLines.forEach((line, index) => {
    const excelRow = noteRow + 1 + index
    sheet.getRow(excelRow).getCell(1).value = line[0]
    sheet.getRow(excelRow).getCell(1).font = FONT_MUTED
    sheet.getRow(excelRow).getCell(2).value = line[1]
    sheet.getRow(excelRow).getCell(2).font = FONT
    if (typeof line[1] === 'number') {
      const isRate = line[0].includes('Cofinanciación')
      sheet.getRow(excelRow).getCell(2).numFmt = isRate ? FMT.percent : FMT.euro
    }
  })

  applyPage(sheet, 6)
}

function buildRatiosSheet(
  workbook: Workbook,
  contract: Contract,
  rows: CourseRow[],
  totals: PortfolioTotals,
  exportedAt: Date,
) {
  const sheet = workbook.addWorksheet('Ratios', {
    properties: { tabColor: { argb: 'FF7F7F7F' } },
  })
  writeIdentity(sheet, contract, totals, exportedAt)
  sheet.getCell('A5').value = 'Ratios por grupo'
  sheet.getCell('A5').font = FONT_SECTION
  writeTable(sheet, 6, ratioColumns, rows, contract, totals, true)
  applyPage(sheet, 6)
}

function writeMiniTable(
  sheet: Worksheet,
  startRow: number,
  headers: string[],
  body: (string | number | null)[][],
  kinds: Kind[],
) {
  headers.forEach((header, index) => {
    sheet.getColumn(index + 1).width = Math.max(sheet.getColumn(index + 1).width ?? 12, index === 0 ? 32 : 14)
    sheet.getRow(startRow).getCell(index + 1).value = header
  })
  styleHeaderRow(sheet, startRow, headers.length)
  body.forEach((line, rowOffset) => {
    const excelRow = startRow + 1 + rowOffset
    line.forEach((value, colOffset) => {
      sheet.getRow(excelRow).getCell(colOffset + 1).value = value
      styleDataCell(sheet, excelRow, colOffset + 1, kinds[colOffset] ?? 'decimal', false)
    })
  })
}

function buildGraficosSheet(
  workbook: Workbook,
  contract: Contract,
  rows: CourseRow[],
  totals: PortfolioTotals,
  exportedAt: Date,
): NativeChart[] {
  const sheet = workbook.addWorksheet(CHARTS_SHEET, {
    properties: { tabColor: { argb: 'FF7F7F7F' } },
  })
  writeIdentity(sheet, contract, totals, exportedAt)
  applyPage(sheet, 3)

  if (rows.length === 0) {
    sheet.getCell('A5').value = 'No hay grupos que graficar.'
    sheet.getCell('A5').font = FONT_MUTED
    return []
  }

  const names = rows.map((row) => row.name)
  const n = rows.length
  const charts: NativeChart[] = []
  let cursor = 5

  const blocks: {
    title: string
    headers: string[]
    kinds: Kind[]
    body: (string | number | null)[][]
    yFormat: NativeChart['yFormat']
    series: { name: string; color: string; col: number }[]
  }[] = [
    {
      title: 'Costes e ingresos',
      headers: ['Grupo', 'Profesor', 'CAC', 'Ingresos'],
      kinds: ['text', 'euro', 'euro', 'euro'],
      body: rows.map((row) => [
        row.name,
        row.metrics.teacherCostPerGroup,
        row.metrics.cacPerGroup,
        row.metrics.revenuePerGroup,
      ]),
      yFormat: 'euro',
      series: [
        { name: 'Profesor', color: PALETTE.professor, col: 2 },
        { name: 'CAC', color: PALETTE.cac, col: 3 },
        { name: 'Ingresos', color: PALETTE.revenue, col: 4 },
      ],
    },
    {
      title: 'Beneficio',
      headers: ['Grupo', 'Beneficio'],
      kinds: ['text', 'euro'],
      body: rows.map((row) => [row.name, row.metrics.profitPerGroup]),
      yFormat: 'euro',
      series: [{ name: 'Beneficio', color: PALETTE.profit, col: 2 }],
    },
    {
      title: 'Margen de contribución',
      headers: ['Grupo', 'Margen'],
      kinds: ['text', 'percent'],
      body: rows.map((row) => [row.name, row.metrics.marginPct]),
      yFormat: 'percent',
      series: [{ name: 'Margen', color: PALETTE.revenue, col: 2 }],
    },
    {
      title: 'Equilibrio vs tamaño',
      headers: ['Grupo', 'Equilibrio', 'Tamaño'],
      kinds: ['text', 'decimal', 'integer'],
      body: rows.map((row) => [
        row.name,
        row.metrics.breakEvenStudents,
        row.classSize,
      ]),
      yFormat: 'number',
      series: [
        { name: 'Equilibrio', color: PALETTE.size, col: 2 },
        { name: 'Tamaño', color: PALETTE.revenue, col: 3 },
      ],
    },
  ]

  for (const block of blocks) {
    sheet.getRow(cursor).getCell(1).value = block.title
    sheet.getRow(cursor).getCell(1).font = FONT_SECTION
    const headerRow = cursor + 1
    const firstData = headerRow + 1
    const lastData = firstData + n - 1
    writeMiniTable(sheet, headerRow, block.headers, block.body, block.kinds)

    const chartHeight = Math.max(14, n + 6)
    charts.push({
      title: block.title,
      yFormat: block.yFormat,
      categories: names,
      categoriesFormula: rangeRef(CHARTS_SHEET, 1, firstData, lastData),
      series: block.series.map((item) => ({
        name: item.name,
        color: item.color,
        values: block.body.map((line) => {
          const raw = line[item.col - 1]
          return typeof raw === 'number' ? raw : 0
        }),
        formula: rangeRef(CHARTS_SHEET, item.col, firstData, lastData),
      })),
      from: { col: 6, row: cursor - 1 },
      to: { col: 16, row: cursor - 1 + chartHeight },
    })

    cursor = lastData + 3
  }

  sheet.getColumn(1).width = 32
  return charts
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
  exportedAt = new Date(),
): Workbook {
  const rows = computeRows(groups, contract)
  const totals = computePortfolio(groups, contract)
  const workbook = new Workbook()
  workbook.creator = 'Academia Georgetown'
  workbook.created = exportedAt
  workbook.calcProperties.fullCalcOnLoad = true

  buildContratoSheet(workbook, contract, rows, totals, exportedAt)
  buildRatiosSheet(workbook, contract, rows, totals, exportedAt)
  buildGraficosSheet(workbook, contract, rows, totals, exportedAt)
  return workbook
}

export async function workbookToBuffer(
  contract: Contract,
  groups: CourseConfig[],
  exportedAt = new Date(),
): Promise<ArrayBuffer> {
  const rows = computeRows(groups, contract)
  const totals = computePortfolio(groups, contract)
  const workbook = new Workbook()
  workbook.creator = 'Academia Georgetown'
  workbook.created = exportedAt
  workbook.calcProperties.fullCalcOnLoad = true

  buildContratoSheet(workbook, contract, rows, totals, exportedAt)
  buildRatiosSheet(workbook, contract, rows, totals, exportedAt)
  const charts = buildGraficosSheet(workbook, contract, rows, totals, exportedAt)

  const raw = await workbook.xlsx.writeBuffer()
  return embedNativeCharts(raw as unknown as ArrayBuffer, CHARTS_SHEET, charts)
}

export async function downloadXlsx(
  contract: Contract,
  groups: CourseConfig[],
): Promise<void> {
  const buffer = await workbookToBuffer(contract, groups)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = workbookFileName(contract)
  anchor.click()
  URL.revokeObjectURL(url)
}
