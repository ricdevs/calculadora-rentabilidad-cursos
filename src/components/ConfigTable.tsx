import { NumberField } from '@/components/NumberField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PUBLIC_GROUP_SIZE_CAP, type CourseConfig } from '@/lib/types'
import { Copy, Plus, Trash2 } from 'lucide-react'

type Props = {
  courses: CourseConfig[]
  onChange: (id: string, patch: Partial<CourseConfig>) => void
  onAdd: () => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
}

const columns = [
  { key: 'pricePerStudent', label: 'Precio €/alumno', step: 10 },
  { key: 'hoursPerStudent', label: 'Horas por alumno', step: 1 },
  { key: 'classSize', label: 'Tamaño de clase', step: 1 },
  { key: 'classDurationHours', label: 'Duración clase (h)', step: 0.5 },
  { key: 'teacherHourlyCost', label: 'Coste profesor €/h', step: 1 },
  { key: 'customerAcquisitionCost', label: 'CAC €/alumno', step: 5 },
] as const

function FieldGrid({
  course,
  onChange,
}: {
  course: CourseConfig
  onChange: Props['onChange']
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {columns.map((col) => (
        <label key={col.key} className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] leading-tight">
            {col.label}
          </span>
          <NumberField
            value={course[col.key]}
            step={col.step}
            min={col.key === 'classSize' || col.key === 'hoursPerStudent' ? 0 : 0}
            ariaLabel={`${course.name}: ${col.label}`}
            invalid={col.key === 'classSize' && course.classSize > PUBLIC_GROUP_SIZE_CAP}
            className="w-full"
            onChange={(value) => onChange(course.id, { [col.key]: value })}
          />
        </label>
      ))}
    </div>
  )
}

export function ConfigTable({
  courses,
  onChange,
  onAdd,
  onDuplicate,
  onRemove,
}: Props) {
  return (
    <section className="rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Configuraciones de curso
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Cada fila es un escenario (un grupo). El profesor imparte todas las
            horas del alumno. Los grupos públicos de la academia son de 9 alumnos
            como máximo.
          </p>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <Plus data-icon="inline-start" />
          Añadir escenario
        </Button>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground px-5 pb-5 text-sm">
          No hay escenarios. Añade uno o restaura los ejemplos.
        </p>
      ) : (
        <>
          <div className="space-y-3 px-4 pb-4 md:hidden">
            {courses.map((course) => (
              <article
                key={course.id}
                className="rounded-lg border bg-background p-3"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: course.color }}
                  />
                  <Input
                    value={course.name}
                    aria-label="Nombre del escenario"
                    className="bg-white"
                    onChange={(event) =>
                      onChange(course.id, { name: event.target.value })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Duplicar ${course.name}`}
                    onClick={() => onDuplicate(course.id)}
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar ${course.name}`}
                    onClick={() => onRemove(course.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <FieldGrid course={course} onChange={onChange} />
                {course.classSize > PUBLIC_GROUP_SIZE_CAP ? (
                  <p className="mt-2 text-xs text-amber-800">
                    Por encima de {PUBLIC_GROUP_SIZE_CAP} alumnos (tope público de
                    grupo).
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[180px]">Curso</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: course.color }}
                        />
                        <Input
                          value={course.name}
                          aria-label="Nombre del escenario"
                          className="min-w-[10rem] bg-white"
                          onChange={(event) =>
                            onChange(course.id, { name: event.target.value })
                          }
                        />
                      </div>
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        <div className="flex flex-col gap-1">
                          <NumberField
                            value={course[col.key]}
                            step={col.step}
                            ariaLabel={`${course.name}: ${col.label}`}
                            invalid={
                              col.key === 'classSize' &&
                              course.classSize > PUBLIC_GROUP_SIZE_CAP
                            }
                            onChange={(value) =>
                              onChange(course.id, { [col.key]: value })
                            }
                          />
                          {col.key === 'classSize' &&
                          course.classSize > PUBLIC_GROUP_SIZE_CAP ? (
                            <Badge variant="outline" className="text-amber-800">
                              &gt; {PUBLIC_GROUP_SIZE_CAP}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Duplicar ${course.name}`}
                          onClick={() => onDuplicate(course.id)}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${course.name}`}
                          onClick={() => onRemove(course.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  )
}
