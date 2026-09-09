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
}

function contract(patch: Partial<Contract> = {}): Contract {
  return {
    name: 'Acuerdo',
    company: 'Cliente',
    workforceBand: '10-49',
    fundaeModality: 'presencial-superior',
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

  it('uses the company teleformación module with 10 % headroom for 10–49 workers', () => {
    const [row] = computeFundaeGroups(
      [particular],
      contract({ fundaeModality: 'teleformacion' }),
    )
    expect(row.moduleCap).toBeCloseTo(36 * 1 * 7.5 * 1.1)
    expect(row.bonus).toBeCloseTo(297)
    expect(row.companyNet).toBeCloseTo(1260 - 297)
  })

  it('does not apply the economic module to 1–9 worker companies', () => {
    const [row] = computeFundaeGroups(
      [particular],
      contract({ workforceBand: '6-9', fundaeModality: 'teleformacion' }),
    )
    expect(row.moduleUnlimited).toBe(true)
    expect(row.bonus).toBe(1260)
  })

  it('applies one company modality to every group and scales credit pro-rata', () => {
    const rows = computeFundaeGroups(
      [grupoB2, particular],
      contract({ fundaeCredit: 4000, fundaeModality: 'teleformacion' }),
    )
    const capA = 72 * 8 * 7.5 * 1.1
    const capB = 36 * 1 * 7.5 * 1.1
    const unscaled = Math.min(6240, capA) + Math.min(1260, capB)
    expect(rows[0].enabled).toBe(true)
    expect(rows[1].enabled).toBe(true)
    expect(rows[0].bonus + rows[1].bonus).toBeCloseTo(4000)
    expect(rows[0].bonus).toBeCloseTo(4000 * (Math.min(6240, capA) / unscaled))
    expect(rows[1].bonus).toBeCloseTo(4000 * (Math.min(1260, capB) / unscaled))
    expect(rows[0].creditScaled).toBe(true)
  })

  it('turns off the bonus for the whole company when modality is none', () => {
    const rows = computeFundaeGroups(
      [grupoB2, particular],
      contract({ fundaeModality: 'none' }),
    )
    expect(rows.every((row) => !row.enabled && row.bonus === 0)).toBe(true)
    expect(rows[0].companyNet).toBe(6240)
    expect(rows[1].companyNet).toBe(1260)
  })

  it('warns above 30 presencial participants using the company modality', () => {
    const crowded: CourseConfig = { ...grupoB2, id: 'crowd', classSize: 32 }
    const [row] = computeFundaeGroups(
      [crowded],
      contract({ fundaeModality: 'presencial-basico' }),
    )
    expect(row.presencialCapWarning).toBe(true)
    expect(row.enabled).toBe(true)
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
