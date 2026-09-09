import { exampleContract, exampleCourses } from '@/lib/defaults'
import {
  cofinanceRate,
  computeFundaeGroups,
  effectiveModule,
  moduleHeadroom,
} from '@/lib/fundae'
import type { Contract, CourseConfig } from '@/lib/types'
import { describe, expect, it } from 'vitest'

const grupoB2: CourseConfig = {
  id: 'b2',
  name: 'B2',
  color: '#000',
  pricePerStudent: 780,
  hoursPerStudent: 72,
  classSize: 8,
  teacherHourlyCost: 22,
  customerAcquisitionCost: 70,
  fundaeModality: 'presencial-superior',
}

const particular: CourseConfig = {
  id: 'part',
  name: 'Particular',
  color: '#111',
  pricePerStudent: 1260,
  hoursPerStudent: 36,
  classSize: 1,
  teacherHourlyCost: 28,
  customerAcquisitionCost: 50,
  fundaeModality: 'teleformacion',
}

function contract(patch: Partial<Contract> = {}): Contract {
  return {
    name: 'Acuerdo',
    company: 'Cliente',
    workforceBand: '10-49',
    fundaeCredit: null,
    trainingInWorkHours: true,
    ...patch,
  }
}

describe('FUNDAE modules and cofinancing', () => {
  it('uses TAS/2307/2007 modules and Ley 30/2015 cofinancing bands', () => {
    expect(effectiveModule('presencial-superior', '10-49')).toEqual({
      unlimited: false,
      euros: 13 * 1.1,
    })
    expect(effectiveModule('presencial-basico', '250+')).toEqual({
      unlimited: false,
      euros: 9,
    })
    expect(effectiveModule('teleformacion', '1-5')).toEqual({
      unlimited: true,
      euros: 7.5,
    })
    expect(moduleHeadroom('6-9')).toBeNull()
    expect(cofinanceRate('1-5')).toBe(0)
    expect(cofinanceRate('6-9')).toBe(0.05)
    expect(cofinanceRate('10-49')).toBe(0.1)
    expect(cofinanceRate('50-249')).toBe(0.2)
    expect(cofinanceRate('250+')).toBe(0.4)
  })
})

describe('computeFundaeGroups', () => {
  it('caps the 8-student superior group at the invoice when training is in work hours', () => {
    const [row] = computeFundaeGroups([grupoB2], contract())
    expect(row.effectiveModule).toBeCloseTo(14.3)
    expect(row.moduleCap).toBeCloseTo(72 * 8 * 14.3)
    expect(row.bonus).toBe(6240)
    expect(row.coveragePct).toBe(1)
    expect(row.companyNet).toBe(0)
  })

  it('applies cofinancing when training is outside work hours', () => {
    const [row] = computeFundaeGroups(
      [grupoB2],
      contract({ trainingInWorkHours: false }),
    )
    expect(row.bonus).toBeCloseTo(6240 * 0.9)
    expect(row.companyNet).toBeCloseTo(6240 * 0.1)
  })

  it('uses the teleformación module with 10 % headroom for 10–49 workers', () => {
    const [row] = computeFundaeGroups([particular], contract())
    expect(row.moduleCap).toBeCloseTo(36 * 1 * 7.5 * 1.1)
    expect(row.bonus).toBeCloseTo(297)
    expect(row.companyNet).toBeCloseTo(1260 - 297)
  })

  it('does not apply the economic module to 1–9 worker companies', () => {
    const [row] = computeFundaeGroups(
      [particular],
      contract({ workforceBand: '6-9' }),
    )
    expect(row.moduleUnlimited).toBe(true)
    expect(row.bonus).toBe(1260)
  })

  it('scales bonuses pro-rata when the annual credit is smaller than the sum', () => {
    const rows = computeFundaeGroups(
      [grupoB2, particular],
      contract({ fundaeCredit: 4000 }),
    )
    const unscaled = 6240 + 297
    expect(rows[0].bonus).toBeCloseTo(4000 * (6240 / unscaled))
    expect(rows[1].bonus).toBeCloseTo(4000 * (297 / unscaled))
    expect(rows[0].creditScaled).toBe(true)
    expect(rows[0].bonus + rows[1].bonus).toBeCloseTo(4000)
  })

  it('leaves unbonified groups at zero and warns above 30 presencial participants', () => {
    const crowded: CourseConfig = {
      ...grupoB2,
      id: 'crowd',
      classSize: 32,
      fundaeModality: 'presencial-basico',
    }
    const skipped: CourseConfig = { ...grupoB2, id: 'off', fundaeModality: 'none' }
    const [a, b] = computeFundaeGroups([crowded, skipped], contract())
    expect(a.presencialCapWarning).toBe(true)
    expect(b.enabled).toBe(false)
    expect(b.bonus).toBe(0)
    expect(b.companyNet).toBe(780 * 8)
  })

  it('bonifies the example contract under the 10–49 / in-hours rules', () => {
    const rows = computeFundaeGroups(exampleCourses, exampleContract)
    expect(rows.every((row) => row.enabled)).toBe(true)
    const bonus = rows.reduce((sum, row) => sum + row.bonus, 0)
    expect(bonus).toBeGreaterThan(0)
    expect(bonus).toBeLessThan(
      exampleCourses.reduce(
        (sum, course) => sum + course.pricePerStudent * course.classSize,
        0,
      ),
    )
  })
})
