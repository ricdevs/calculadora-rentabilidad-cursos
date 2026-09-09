import { fieldSpec, type SweepAxis } from '@/lib/fields'
import {
  PUBLIC_GROUP_SIZE_CAP,
  type BreakEvenPoint,
  type CourseConfig,
  type CourseMetrics,
  type CourseRow,
  type PortfolioTotals,
  type SweepPoint,
} from '@/lib/types'

function safeDivide(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null
  if (denominator === 0) return null
  return numerator / denominator
}

export function computeMetrics(config: CourseConfig): CourseMetrics {
  const hours = Math.max(0, config.hoursPerStudent)
  const size = Math.max(0, config.classSize)
  const duration = Math.max(0, config.classDurationHours)
  const teacherRate = Math.max(0, config.teacherHourlyCost)
  const cac = Math.max(0, config.customerAcquisitionCost)
  const price = Math.max(0, config.pricePerStudent)

  const sessions = safeDivide(hours, duration) ?? 0
  const teacherHours = hours
  const teacherCostPerGroup = teacherHours * teacherRate
  const teacherCostPerStudent = safeDivide(teacherCostPerGroup, size) ?? 0
  const cacPerGroup = cac * size
  const totalCostPerGroup = teacherCostPerGroup + cacPerGroup
  const totalCostPerStudent = teacherCostPerStudent + cac
  const revenuePerGroup = price * size
  const profitPerGroup = revenuePerGroup - totalCostPerGroup
  const profitPerStudent = safeDivide(profitPerGroup, size) ?? 0
  const contributionAfterCac = price - cac
  const breakEvenStudents =
    contributionAfterCac > 0
      ? teacherCostPerGroup / contributionAfterCac
      : null

  return {
    sessions,
    teacherHours,
    teacherCostPerGroup,
    teacherCostPerStudent,
    teacherCostPerStudentHour: safeDivide(teacherCostPerStudent, hours) ?? 0,
    cacPerGroup,
    totalCostPerGroup,
    totalCostPerStudent,
    revenuePerGroup,
    revenuePerStudentHour: safeDivide(price, hours) ?? 0,
    profitPerGroup,
    profitPerStudent,
    profitPerTeacherHour: safeDivide(profitPerGroup, teacherHours) ?? 0,
    marginPct: safeDivide(profitPerGroup, revenuePerGroup) ?? 0,
    roiPct: safeDivide(profitPerGroup, totalCostPerGroup) ?? 0,
    contributionAfterCac,
    breakEvenStudents,
    occupancyVsBreakEvenPct:
      breakEvenStudents === null
        ? null
        : safeDivide(size, breakEvenStudents),
    revenueToTeacherCost: safeDivide(revenuePerGroup, teacherCostPerGroup),
    coversTeacherAndCac:
      breakEvenStudents !== null && size + 1e-9 >= breakEvenStudents,
    classSizeWarning: size > PUBLIC_GROUP_SIZE_CAP,
    teacherShareOfRevenue: safeDivide(teacherCostPerGroup, revenuePerGroup) ?? 0,
    cacShareOfRevenue: safeDivide(cacPerGroup, revenuePerGroup) ?? 0,
    costPerStudentHour: safeDivide(totalCostPerStudent, hours) ?? 0,
    contributionPerStudentHour: safeDivide(profitPerStudent, hours) ?? 0,
    breakEvenPrice: size > 0 ? teacherCostPerStudent + cac : null,
    maxTeacherHourlyCost: safeDivide(
      revenuePerGroup - cacPerGroup,
      teacherHours,
    ),
    maxCacPerStudent:
      size > 0 ? price - teacherCostPerStudent : null,
  }
}

export function withMetrics(config: CourseConfig): CourseRow {
  return { ...config, metrics: computeMetrics(config) }
}

export function computePortfolio(configs: CourseConfig[]): PortfolioTotals {
  const rows = configs.map(withMetrics)
  const revenue = rows.reduce((sum, row) => sum + row.metrics.revenuePerGroup, 0)
  const teacherCost = rows.reduce(
    (sum, row) => sum + row.metrics.teacherCostPerGroup,
    0,
  )
  const cac = rows.reduce((sum, row) => sum + row.metrics.cacPerGroup, 0)
  const totalCost = teacherCost + cac
  const profit = revenue - totalCost

  return {
    revenue,
    teacherCost,
    cac,
    totalCost,
    profit,
    marginPct: safeDivide(profit, revenue) ?? 0,
    roiPct: safeDivide(profit, totalCost) ?? 0,
    teacherShareOfRevenue: safeDivide(teacherCost, revenue) ?? 0,
    cacShareOfRevenue: safeDivide(cac, revenue) ?? 0,
    courseCount: configs.length,
  }
}

export function sweepCourse(
  config: CourseConfig,
  axis: SweepAxis,
): SweepPoint[] {
  const spec = fieldSpec(axis)
  const points: SweepPoint[] = []
  for (let x = spec.min; x <= spec.max + spec.sweepStep / 2; x += spec.sweepStep) {
    const value = Number(x.toFixed(4))
    const metrics = computeMetrics({ ...config, [axis]: value })
    points.push({
      x: value,
      ingresos: metrics.revenuePerGroup,
      costeProfesor: metrics.teacherCostPerGroup,
      cac: metrics.cacPerGroup,
      costeTotal: metrics.totalCostPerGroup,
      beneficio: metrics.profitPerGroup,
      margenPct: metrics.marginPct,
      roiPct: metrics.roiPct,
    })
  }
  return points
}

export function breakEvenOnAxis(
  config: CourseConfig,
  axis: SweepAxis,
): BreakEvenPoint | null {
  const metrics = computeMetrics(config)
  switch (axis) {
    case 'classSize': {
      if (metrics.breakEvenStudents === null) return null
      return {
        x: metrics.breakEvenStudents,
        y: config.pricePerStudent * metrics.breakEvenStudents,
        axis,
      }
    }
    case 'pricePerStudent': {
      if (metrics.breakEvenPrice === null) return null
      return {
        x: metrics.breakEvenPrice,
        y: metrics.breakEvenPrice * config.classSize,
        axis,
      }
    }
    case 'teacherHourlyCost': {
      if (metrics.maxTeacherHourlyCost === null) return null
      return {
        x: metrics.maxTeacherHourlyCost,
        y: metrics.revenuePerGroup,
        axis,
      }
    }
    case 'customerAcquisitionCost': {
      if (metrics.maxCacPerStudent === null) return null
      return {
        x: metrics.maxCacPerStudent,
        y: metrics.revenuePerGroup,
        axis,
      }
    }
    case 'hoursPerStudent': {
      if (config.teacherHourlyCost <= 0) return null
      const contribution = config.pricePerStudent - config.customerAcquisitionCost
      if (contribution <= 0) return null
      const hours =
        (contribution * config.classSize) / config.teacherHourlyCost
      return {
        x: hours,
        y: config.pricePerStudent * config.classSize,
        axis,
      }
    }
  }
}
