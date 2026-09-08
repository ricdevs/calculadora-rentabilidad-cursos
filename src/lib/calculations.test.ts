import { computeMetrics, computePortfolio } from '@/lib/calculations'
import type { CourseConfig } from '@/lib/types'
import { describe, expect, it } from 'vitest'

const acceptance: CourseConfig = {
  id: 'test-grupo',
  name: 'Grupo anual B2',
  color: '#0C1F3A',
  pricePerStudent: 780,
  hoursPerStudent: 72,
  classSize: 8,
  classDurationHours: 1.5,
  teacherHourlyCost: 22,
  customerAcquisitionCost: 70,
}

describe('computeMetrics', () => {
  it('matches the Academia Georgetown acceptance scenario', () => {
    const m = computeMetrics(acceptance)

    expect(m.sessions).toBe(48)
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

  it('handles zero duration without throwing', () => {
    const m = computeMetrics({ ...acceptance, classDurationHours: 0 })
    expect(m.sessions).toBe(0)
    expect(m.teacherCostPerGroup).toBe(1584)
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
      classDurationHours: 1,
      teacherHourlyCost: 28,
      customerAcquisitionCost: 50,
    }
    const totals = computePortfolio([acceptance, particular])
    expect(totals.courseCount).toBe(2)
    expect(totals.revenue).toBe(6240 + 1260)
    expect(totals.teacherCost).toBe(1584 + 1008)
    expect(totals.cac).toBe(560 + 50)
    expect(totals.profit).toBe(totals.revenue - totals.totalCost)
  })
})
