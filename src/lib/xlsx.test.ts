import { exampleContract, exampleCourses } from '@/lib/defaults'
import { buildWorkbook, workbookFileName } from '@/lib/xlsx'
import { describe, expect, it } from 'vitest'

describe('xlsx export', () => {
  it('names the file from the agreement', () => {
    expect(workbookFileName(exampleContract)).toBe(
      'rentabilidad-plan-fundae-2026-idiomas.xlsx',
    )
  })

  it('includes agreement identity, each group, and a contract total row', async () => {
    const workbook = buildWorkbook(exampleContract, exampleCourses)
    const sheet = workbook.getWorksheet('Contrato')
    expect(sheet).toBeDefined()

    const header = sheet!.getRow(1)
    expect(header.getCell(1).value).toBe('Acuerdo')
    expect(header.getCell(2).value).toBe('Empresa')
    expect(header.getCell(3).value).toBe('Grupo')

    expect(sheet!.rowCount).toBe(1 + exampleCourses.length + 1)

    const firstGroup = sheet!.getRow(2)
    expect(firstGroup.getCell(1).value).toBe(exampleContract.name)
    expect(firstGroup.getCell(2).value).toBe(exampleContract.company)
    expect(firstGroup.getCell(3).value).toBe('Grupo A · B2 anual')
    expect(firstGroup.getCell(4).value).toBe(780)
    expect(firstGroup.getCell(16).numFmt).toBe('0.0%')

    const total = sheet!.getRow(sheet!.rowCount)
    expect(total.getCell(3).value).toBe('TOTAL CONTRATO')
    expect(total.getCell(6).value).toBe(24)
    expect(total.getCell(14).value).toBe(
      780 * 8 + 1260 * 1 + 390 * 6 + 890 * 9,
    )

    const buffer = await workbook.xlsx.writeBuffer()
    expect(buffer.byteLength).toBeGreaterThan(1000)
  })
})
