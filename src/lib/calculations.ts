import {
  PUBLIC_GROUP_SIZE_CAP,
  type CourseConfig,
  type CourseMetrics,
  type CourseRow,
  type PortfolioTotals,
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
    courseCount: configs.length,
  }
}
