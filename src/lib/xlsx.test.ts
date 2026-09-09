import { exampleContract, exampleCourses } from '@/lib/defaults'
import {
  buildWorkbook,
  workbookFileName,
  workbookToBuffer,
} from '@/lib/xlsx'
import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'

describe('xlsx export', () => {
  it('names the file from the agreement', () => {
    expect(workbookFileName(exampleContract)).toBe(
      'rentabilidad-plan-fundae-2026-idiomas.xlsx',
    )
  })

  it('builds sober contract, ratios and chart sheets', async () => {
    const workbook = buildWorkbook(exampleContract, exampleCourses)
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Contrato',
      'Ratios',
      'Gráficos',
    ])

    const contrato = workbook.getWorksheet('Contrato')!
    expect(contrato.getCell('A1').value).toBe(exampleContract.name)
    expect(contrato.getCell('A2').value).toBe(exampleContract.company)
    expect(contrato.getRow(6).getCell(1).value).toBe('Grupo')
    expect(contrato.getRow(6).getCell(1).fill).toMatchObject({
      fgColor: { argb: 'FFF2F2F2' },
    })
    expect(contrato.getRow(7).getCell(1).value).toBe('Grupo A · B2 anual')
    expect(contrato.getRow(7).getCell(2).value).toBe(780)

    const totalRow = 6 + exampleCourses.length + 1
    expect(contrato.getRow(totalRow).getCell(1).value).toBe('Total contrato')
    expect(contrato.getRow(totalRow).getCell(4).value).toBe(24)
    expect(contrato.getRow(totalRow).getCell(11).value).toBe(
      780 * 8 + 1260 * 1 + 390 * 6 + 890 * 9,
    )
    expect(contrato.getRow(totalRow).getCell(11).numFmt).toContain('#,##0.00')
    expect(contrato.getRow(totalRow).getCell(1).border?.bottom?.style).toBe(
      'double',
    )

    const fundaeRow = totalRow + 2
    expect(contrato.getRow(fundaeRow).getCell(1).value).toBe(
      'Parámetros FUNDAE (formación programada)',
    )
    expect(contrato.getRow(fundaeRow + 1).getCell(1).value).toBe('Modalidad')
    expect(contrato.getRow(fundaeRow + 1).getCell(2).value).toBe(
      'Presencial superior',
    )

    const ratios = workbook.getWorksheet('Ratios')!
    expect(ratios.getRow(6).getCell(1).value).toBe('Grupo')
    expect(ratios.getRow(6).getCell(9).value).toBe('Margen')
    expect(ratios.getRow(7).getCell(9).numFmt).toContain('0.0%')

    const buffer = await workbookToBuffer(exampleContract, exampleCourses)
    const zip = await JSZip.loadAsync(buffer)
    expect(zip.file('xl/charts/chart1.xml')).not.toBeNull()
    expect(zip.file('xl/charts/chart4.xml')).not.toBeNull()
    expect(zip.file('xl/drawings/drawing1.xml')).not.toBeNull()
    const chartXml = await zip.file('xl/charts/chart1.xml')!.async('string')
    expect(chartXml).toContain('Costes e ingresos')
    expect(chartXml).not.toContain('C9A227')
    expect(chartXml).not.toContain('0C1F3A')
  })
})
