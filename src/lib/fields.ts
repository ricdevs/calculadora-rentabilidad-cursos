export type NumericCourseKey =
  | 'pricePerStudent'
  | 'hoursPerStudent'
  | 'classSize'
  | 'classDurationHours'
  | 'teacherHourlyCost'
  | 'customerAcquisitionCost'

export type SweepAxis = Exclude<NumericCourseKey, 'classDurationHours'>

export type FieldSpec = {
  key: NumericCourseKey
  label: string
  shortLabel: string
  min: number
  max: number
  step: number
  sweepStep: number
  unit: string
}

export const CONFIG_FIELDS: FieldSpec[] = [
  {
    key: 'pricePerStudent',
    label: 'Precio €/alumno',
    shortLabel: 'Precio',
    min: 50,
    max: 2500,
    step: 10,
    sweepStep: 25,
    unit: '€',
  },
  {
    key: 'hoursPerStudent',
    label: 'Horas por alumno',
    shortLabel: 'Horas',
    min: 4,
    max: 160,
    step: 1,
    sweepStep: 2,
    unit: 'h',
  },
  {
    key: 'classSize',
    label: 'Tamaño de clase',
    shortLabel: 'Alumnos',
    min: 1,
    max: 16,
    step: 1,
    sweepStep: 1,
    unit: 'alum.',
  },
  {
    key: 'classDurationHours',
    label: 'Duración clase (h)',
    shortLabel: 'Duración',
    min: 0.5,
    max: 4,
    step: 0.5,
    sweepStep: 0.5,
    unit: 'h',
  },
  {
    key: 'teacherHourlyCost',
    label: 'Coste profesor €/h',
    shortLabel: 'Profesor',
    min: 8,
    max: 80,
    step: 1,
    sweepStep: 1,
    unit: '€/h',
  },
  {
    key: 'customerAcquisitionCost',
    label: 'CAC €/alumno',
    shortLabel: 'CAC',
    min: 0,
    max: 400,
    step: 5,
    sweepStep: 5,
    unit: '€',
  },
]

export const SWEEP_AXES: { key: SweepAxis; label: string }[] = [
  { key: 'classSize', label: 'Tamaño de clase' },
  { key: 'pricePerStudent', label: 'Precio del curso' },
  { key: 'teacherHourlyCost', label: 'Coste del profesor' },
  { key: 'customerAcquisitionCost', label: 'CAC' },
  { key: 'hoursPerStudent', label: 'Horas por alumno' },
]

export function fieldSpec(key: NumericCourseKey): FieldSpec {
  const spec = CONFIG_FIELDS.find((field) => field.key === key)
  if (!spec) throw new Error(`Unknown field ${key}`)
  return spec
}
