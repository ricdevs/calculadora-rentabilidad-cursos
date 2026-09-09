import {
  defaultChartVisibility,
  defaultSectionFolds,
  exampleContract,
  exampleCourses,
} from '@/lib/defaults'
import {
  FOLDS_STORAGE_KEY,
  SECTION_IDS,
  STORAGE_KEY,
  STORAGE_VERSION,
  type ChartVisibility,
  type Contract,
  type CourseConfig,
  type FundaeModality,
  type SectionFolds,
  type WorkforceBand,
} from '@/lib/types'

type StoredV1 = {
  version: 1
  courses: CourseConfig[]
  charts?: ChartVisibility
}

type StoredV2 = {
  version: 2
  contract: Contract
  courses: CourseConfig[]
  charts?: ChartVisibility
}

function isCourse(value: unknown): value is CourseConfig {
  if (!value || typeof value !== 'object') return false
  const row = value as CourseConfig
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.color === 'string' &&
    typeof row.pricePerStudent === 'number' &&
    typeof row.hoursPerStudent === 'number' &&
    typeof row.classSize === 'number' &&
    typeof row.teacherHourlyCost === 'number' &&
    typeof row.customerAcquisitionCost === 'number'
  )
}

const WORKFORCE_BANDS: WorkforceBand[] = [
  '1-5',
  '6-9',
  '10-49',
  '50-249',
  '250+',
]

const FUNDAE_MODALITIES: FundaeModality[] = [
  'none',
  'presencial-basico',
  'presencial-superior',
  'teleformacion',
]

function isWorkforceBand(value: unknown): value is WorkforceBand {
  return (
    typeof value === 'string' &&
    (WORKFORCE_BANDS as string[]).includes(value)
  )
}

function isFundaeModality(value: unknown): value is FundaeModality {
  return (
    typeof value === 'string' &&
    (FUNDAE_MODALITIES as string[]).includes(value)
  )
}

function isContract(value: unknown): value is Contract {
  if (!value || typeof value !== 'object') return false
  const row = value as Contract
  return typeof row.name === 'string' && typeof row.company === 'string'
}

function migrateModality(
  contract: Contract,
  courses: unknown,
): FundaeModality {
  if (isFundaeModality(contract.fundaeModality)) return contract.fundaeModality
  if (!Array.isArray(courses)) return 'none'
  for (const item of courses) {
    if (!item || typeof item !== 'object') continue
    const modality = (item as { fundaeModality?: unknown }).fundaeModality
    if (isFundaeModality(modality) && modality !== 'none') return modality
  }
  return 'none'
}

function pickContract(row: Contract, courses: unknown): Contract {
  const credit = row.fundaeCredit
  return {
    name: row.name,
    company: row.company,
    workforceBand: isWorkforceBand(row.workforceBand)
      ? row.workforceBand
      : exampleContract.workforceBand,
    fundaeModality: migrateModality(row, courses),
    fundaeCredit:
      typeof credit === 'number' && Number.isFinite(credit) && credit >= 0
        ? credit
        : null,
    trainingInWorkHours:
      typeof row.trainingInWorkHours === 'boolean'
        ? row.trainingInWorkHours
        : true,
  }
}

function pickCourse(row: CourseConfig): CourseConfig {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    pricePerStudent: row.pricePerStudent,
    hoursPerStudent: row.hoursPerStudent,
    classSize: row.classSize,
    teacherHourlyCost: row.teacherHourlyCost,
    customerAcquisitionCost: row.customerAcquisitionCost,
  }
}

function sanitizeCourses(value: unknown): CourseConfig[] {
  if (!Array.isArray(value)) return exampleCourses
  const courses = value.filter(isCourse).map(pickCourse)
  return courses.length > 0 ? courses : exampleCourses
}

export function loadState(): {
  contract: Contract
  courses: CourseConfig[]
  charts: ChartVisibility
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        contract: exampleContract,
        courses: exampleCourses,
        charts: defaultChartVisibility,
      }
    }
    const parsed = JSON.parse(raw) as StoredV1 | StoredV2
    const charts = { ...defaultChartVisibility, ...parsed.charts }

    if (parsed.version === 1) {
      return {
        contract: { ...exampleContract },
        courses: sanitizeCourses(parsed.courses),
        charts,
      }
    }

    if (parsed.version === STORAGE_VERSION) {
      return {
        contract: isContract(parsed.contract)
          ? pickContract(parsed.contract, parsed.courses)
          : { ...exampleContract },
        courses: sanitizeCourses(parsed.courses),
        charts,
      }
    }

    return {
      contract: exampleContract,
      courses: exampleCourses,
      charts: defaultChartVisibility,
    }
  } catch {
    return {
      contract: exampleContract,
      courses: exampleCourses,
      charts: defaultChartVisibility,
    }
  }
}

export function saveState(
  contract: Contract,
  courses: CourseConfig[],
  charts: ChartVisibility,
): void {
  const payload: StoredV2 = {
    version: STORAGE_VERSION,
    contract,
    courses,
    charts,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadFolds(): SectionFolds {
  try {
    const raw = localStorage.getItem(FOLDS_STORAGE_KEY)
    if (!raw) return { ...defaultSectionFolds }
    const parsed = JSON.parse(raw) as Partial<SectionFolds>
    const folds = { ...defaultSectionFolds }
    for (const id of SECTION_IDS) {
      if (typeof parsed[id] === 'boolean') folds[id] = parsed[id]
    }
    return folds
  } catch {
    return { ...defaultSectionFolds }
  }
}

export function saveFolds(folds: SectionFolds): void {
  localStorage.setItem(FOLDS_STORAGE_KEY, JSON.stringify(folds))
}
