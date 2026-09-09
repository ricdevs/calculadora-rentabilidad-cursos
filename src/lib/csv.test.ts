import { coursesToCsv } from '@/lib/csv'
import { exampleContract, exampleCourses } from '@/lib/defaults'
import { describe, expect, it } from 'vitest'

describe('coursesToCsv', () => {
  it('includes agreement identity, each group, and a contract total row', () => {
    const csv = coursesToCsv(exampleContract, exampleCourses)
    expect(csv).toContain('Acuerdo')
    expect(csv).toContain('Empresa')
    expect(csv).toContain('Grupo')
    expect(csv).toContain(exampleContract.name)
    expect(csv).toContain(exampleContract.company)
    expect(csv).toContain('Grupo A · B2 anual')
    expect(csv).toContain('TOTAL CONTRATO')
    expect(csv.split('\n').filter((line) => line.length > 0)).toHaveLength(
      1 + exampleCourses.length + 1,
    )
  })
})
