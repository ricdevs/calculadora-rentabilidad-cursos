import { defaultChartVisibility, exampleCourses } from '@/lib/defaults'
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  type ChartVisibility,
  type CourseConfig,
} from '@/lib/types'

type StoredState = {
  version: number
  courses: CourseConfig[]
  charts: ChartVisibility
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
    typeof row.classDurationHours === 'number' &&
    typeof row.teacherHourlyCost === 'number' &&
    typeof row.customerAcquisitionCost === 'number'
  )
}

export function loadState(): { courses: CourseConfig[]; charts: ChartVisibility } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { courses: exampleCourses, charts: defaultChartVisibility }
    const parsed = JSON.parse(raw) as StoredState
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.courses)) {
      return { courses: exampleCourses, charts: defaultChartVisibility }
    }
    const courses = parsed.courses.filter(isCourse)
    return {
      courses: courses.length > 0 ? courses : exampleCourses,
      charts: { ...defaultChartVisibility, ...parsed.charts },
    }
  } catch {
    return { courses: exampleCourses, charts: defaultChartVisibility }
  }
}

export function saveState(courses: CourseConfig[], charts: ChartVisibility): void {
  const payload: StoredState = { version: STORAGE_VERSION, courses, charts }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}
