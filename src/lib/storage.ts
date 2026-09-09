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
  type SectionFolds,
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

function isContract(value: unknown): value is Contract {
  if (!value || typeof value !== 'object') return false
  const row = value as Contract
  return typeof row.name === 'string' && typeof row.company === 'string'
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
          ? parsed.contract
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
