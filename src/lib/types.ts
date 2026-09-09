export type WorkforceBand = '1-5' | '6-9' | '10-49' | '50-249' | '250+'

export type FundaeModality =
  | 'none'
  | 'presencial-basico'
  | 'presencial-superior'
  | 'teleformacion'

export type FundaeGroupResult = {
  enabled: boolean
  baseModule: number | null
  effectiveModule: number | null
  moduleUnlimited: boolean
  moduleCap: number | null
  cofinanceRate: number
  cofinanceCap: number | null
  bonusBeforeCredit: number
  bonus: number
  coveragePct: number
  companyNet: number
  creditScaled: boolean
  presencialCapWarning: boolean
}

export type CourseConfig = {
  id: string
  name: string
  color: string
  pricePerStudent: number
  hoursPerStudent: number
  classSize: number
  teacherHourlyCost: number
  customerAcquisitionCost: number
}

export type CourseMetrics = {
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
  teacherShareOfRevenue: number
  cacShareOfRevenue: number
  costPerStudentHour: number
  contributionPerStudentHour: number
  breakEvenPrice: number | null
  maxTeacherHourlyCost: number | null
  maxCacPerStudent: number | null
}

export type CourseRow = CourseConfig & {
  metrics: CourseMetrics
  fundae: FundaeGroupResult
}

export type Contract = {
  name: string
  company: string
  workforceBand: WorkforceBand
  /** Modalidad de la acción formativa de la empresa, no de cada grupo. */
  fundaeModality: FundaeModality
  /** Crédito anual FUNDAE. `null` = no aplicar tope de crédito. */
  fundaeCredit: number | null
  /** Si la formación es en jornada, el salario cuenta como cofinanciación. */
  trainingInWorkHours: boolean
}

export type PortfolioTotals = {
  revenue: number
  teacherCost: number
  cac: number
  totalCost: number
  profit: number
  marginPct: number
  roiPct: number
  teacherShareOfRevenue: number
  cacShareOfRevenue: number
  groupCount: number
  studentCount: number
  teacherHours: number
  fundaeBonus: number
  companyNet: number
  fundaeCoveragePct: number
  fundaeEnabledCount: number
  fundaeCreditScaled: boolean
}

export type SweepPoint = {
  x: number
  ingresos: number
  costeProfesor: number
  cac: number
  costeTotal: number
  beneficio: number
  margenPct: number
  roiPct: number
}

export type BreakEvenPoint = {
  x: number
  y: number
  axis: string
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

export const SECTION_IDS = [
  'summary',
  'analysis',
  'ratios',
  'charts',
  'formulas',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export type SectionFolds = Record<SectionId, boolean>

export const PUBLIC_GROUP_SIZE_CAP = 9
export const STORAGE_KEY = 'ag-course-profitability-v1'
export const FOLDS_STORAGE_KEY = 'ag-section-folds-v1'
export const STORAGE_VERSION = 2
