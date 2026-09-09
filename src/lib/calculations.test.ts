import {
  breakEvenOnAxis,
  computeMetrics,
  computePortfolio,
  sweepCourse,
} from '@/lib/calculations'
import type { Contract, CourseConfig } from '@/lib/types'
import { describe, expect, it } from 'vitest'

const acceptance: CourseConfig = {
  id: 'test-grupo',
  name: 'Grupo anual B2',
  color: '#0C1F3A',
  pricePerStudent: 780,
  hoursPerStudent: 72,
  classSize: 8,
    teacherHourlyCost: 22,
    customerAcquisitionCost: 70,
    fundaeModality: 'none',
  }

  const testContract: Contract = {
  name: 'Test',
  company: 'Test',
  workforceBand: '10-49',
  fundaeCredit: null,
  trainingInWorkHours: true,
}

describe('computeMetrics', () => {
  it('matches the Academia Georgetown acceptance scenario', () => {
    const m = computeMetrics(acceptance)

    expect(m.teacherHours).toBe(72)
    expect(m.teacherCostPerGroup).toBe(1584)
    expect(m.teacherCostPerStudent).toBe(198)
    expect(m.cacPerGroup).toBe(560)
    expect(m.totalCostPerGroup).toBe(2144)
    expect(m.revenuePerGroup).toBe(6240)
    expect(m.profitPerGroup).toBe(4096)
    expect(m.profitPerStudent).toBe(512)
    expect(m.marginPct).toBeCloseTo(4096 / 6240)
    expect(m.roiPct).toBeCloseTo(4096 / 2144)
    expect(m.breakEvenStudents).toBeCloseTo(1584 / 710)
    expect(m.coversTeacherAndCac).toBe(true)
    expect(m.revenuePerStudentHour).toBeCloseTo(10.833, 3)
    expect(m.classSizeWarning).toBe(false)
    expect(m.teacherShareOfRevenue).toBeCloseTo(1584 / 6240)
    expect(m.cacShareOfRevenue).toBeCloseTo(560 / 6240)
    expect(m.breakEvenPrice).toBe(268)
    expect(m.maxTeacherHourlyCost).toBeCloseTo(5680 / 72)
    expect(m.maxCacPerStudent).toBe(582)
    expect(m.contributionPerStudentHour).toBeCloseTo(512 / 72)
  })

  it('flags groups above the public size cap', () => {
    const m = computeMetrics({ ...acceptance, classSize: 12 })
    expect(m.classSizeWarning).toBe(true)
  })

  it('returns no break-even when price does not cover CAC', () => {
    const m = computeMetrics({
      ...acceptance,
      pricePerStudent: 50,
      customerAcquisitionCost: 70,
    })
    expect(m.breakEvenStudents).toBeNull()
    expect(m.coversTeacherAndCac).toBe(false)
    expect(m.profitPerGroup).toBeLessThan(0)
  })

  it('handles zero hours without throwing', () => {
    const m = computeMetrics({ ...acceptance, hoursPerStudent: 0 })
    expect(m.teacherHours).toBe(0)
    expect(m.teacherCostPerGroup).toBe(0)
  })
})

describe('computePortfolio', () => {
  it('sums contribution across scenarios', () => {
    const particular: CourseConfig = {
      id: 'part',
      name: 'Particular',
      color: '#C9A227',
      pricePerStudent: 1260,
      hoursPerStudent: 36,
      classSize: 1,
      teacherHourlyCost: 28,
      customerAcquisitionCost: 50,
      fundaeModality: 'none',
    }
    const totals = computePortfolio([acceptance, particular], testContract)
    expect(totals.groupCount).toBe(2)
    expect(totals.studentCount).toBe(9)
    expect(totals.teacherHours).toBe(72 + 36)
    expect(totals.revenue).toBe(6240 + 1260)
    expect(totals.teacherCost).toBe(1584 + 1008)
    expect(totals.cac).toBe(560 + 50)
    expect(totals.profit).toBe(totals.revenue - totals.totalCost)
    expect(totals.fundaeBonus).toBe(0)
    expect(totals.companyNet).toBe(totals.revenue)
  })
})

describe('breakEvenOnAxis and sweepCourse', () => {
  it('finds the class-size intersection of revenue and total cost', () => {
    const point = breakEvenOnAxis(acceptance, 'classSize')
    expect(point).not.toBeNull()
    expect(point?.x).toBeCloseTo(1584 / 710)
    expect(point?.y).toBeCloseTo((1584 / 710) * 780)
  })

  it('finds the break-even price at the current group size', () => {
    const point = breakEvenOnAxis(acceptance, 'pricePerStudent')
    expect(point?.x).toBe(268)
    expect(point?.y).toBe(268 * 8)
  })

  it('sweeps class size with matching metrics at n = 8', () => {
    const points = sweepCourse(acceptance, 'classSize')
    const atEight = points.find((point) => point.x === 8)
    expect(atEight?.ingresos).toBe(6240)
    expect(atEight?.costeTotal).toBe(2144)
    expect(atEight?.beneficio).toBe(4096)
  })
})
