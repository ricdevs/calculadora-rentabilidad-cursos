export type CourseConfig = {
  id: string
  name: string
  color: string
  pricePerStudent: number
  hoursPerStudent: number
  classSize: number
  classDurationHours: number
  teacherHourlyCost: number
  customerAcquisitionCost: number
}

export type CourseMetrics = {
  sessions: number
  teacherHours: number
  teacherCostPerGroup: number
  teacherCostPerStudent: number
  teacherCostPerStudentHour: number
  cacPerGroup: number
  totalCostPerGroup: number
  totalCostPerStudent: number
  revenuePerGroup: number
  revenuePerStudentHour: number
  profitPerGroup: number
  profitPerStudent: number
  profitPerTeacherHour: number
  marginPct: number
  roiPct: number
  contributionAfterCac: number
  breakEvenStudents: number | null
  occupancyVsBreakEvenPct: number | null
  revenueToTeacherCost: number | null
  coversTeacherAndCac: boolean
  classSizeWarning: boolean
}

export type CourseRow = CourseConfig & { metrics: CourseMetrics }

export type PortfolioTotals = {
  revenue: number
  teacherCost: number
  cac: number
  totalCost: number
  profit: number
  marginPct: number
  roiPct: number
  courseCount: number
}

export const CHART_IDS = [
  'costsRevenue',
  'payoff',
  'costMix',
  'margin',
  'breakEven',
] as const

export type ChartId = (typeof CHART_IDS)[number]

export type ChartVisibility = Record<ChartId, boolean>

export const PUBLIC_GROUP_SIZE_CAP = 9
export const STORAGE_KEY = 'ag-course-profitability-v1'
export const STORAGE_VERSION = 1
