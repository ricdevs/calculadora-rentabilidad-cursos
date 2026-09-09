import type { ChartVisibility, Contract, CourseConfig, SectionFolds } from '@/lib/types'

export const COURSE_COLORS = [
  '#0C1F3A',
  '#C9A227',
  '#2F6F5E',
  '#8C4A32',
  '#4A6FA5',
  '#6B3F69',
] as const

export const defaultChartVisibility: ChartVisibility = {
  costsRevenue: true,
  payoff: true,
  costMix: false,
  margin: false,
  breakEven: true,
}

export const defaultSectionFolds: SectionFolds = {
  summary: true,
  analysis: true,
  ratios: true,
  charts: true,
  formulas: false,
}

export const exampleContract: Contract = {
  name: 'Plan FUNDAE 2026 — idiomas',
  company: 'Industria Navarra S.A.',
}

export const exampleCourses: CourseConfig[] = [
  {
    id: 'grupo-anual-b2',
    name: 'Grupo A · B2 anual',
    color: COURSE_COLORS[0],
    pricePerStudent: 780,
    hoursPerStudent: 72,
    classSize: 8,
    teacherHourlyCost: 22,
    customerAcquisitionCost: 70,
  },
  {
    id: 'particular-c1',
    name: 'Grupo B · particular dirección',
    color: COURSE_COLORS[1],
    pricePerStudent: 1260,
    hoursPerStudent: 36,
    classSize: 1,
    teacherHourlyCost: 28,
    customerAcquisitionCost: 50,
  },
  {
    id: 'intensivo-verano',
    name: 'Grupo C · intensivo verano',
    color: COURSE_COLORS[2],
    pricePerStudent: 390,
    hoursPerStudent: 32,
    classSize: 6,
    teacherHourlyCost: 22,
    customerAcquisitionCost: 40,
  },
  {
    id: 'empresa-24-sem',
    name: 'Grupo D · in-company 24 sem.',
    color: COURSE_COLORS[3],
    pricePerStudent: 890,
    hoursPerStudent: 48,
    classSize: 9,
    teacherHourlyCost: 30,
    customerAcquisitionCost: 120,
  },
]

export function nextCourseColor(existing: CourseConfig[]): string {
  return COURSE_COLORS[existing.length % COURSE_COLORS.length]
}

export function createBlankCourse(existing: CourseConfig[]): CourseConfig {
  return {
    id: crypto.randomUUID(),
    name: `Nuevo grupo ${existing.length + 1}`,
    color: nextCourseColor(existing),
    pricePerStudent: 780,
    hoursPerStudent: 72,
    classSize: 8,
    teacherHourlyCost: 22,
    customerAcquisitionCost: 70,
  }
}

export function duplicateCourse(course: CourseConfig): CourseConfig {
  return {
    ...course,
    id: crypto.randomUUID(),
    name: `${course.name} (copia)`,
  }
}
