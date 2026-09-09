import { SliderField } from '@/components/SliderField'
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
import { CONFIG_FIELDS } from '@/lib/fields'
import { PUBLIC_GROUP_SIZE_CAP, type CourseConfig } from '@/lib/types'
import { Copy, Plus, Trash2 } from 'lucide-react'

type Props = {
  courses: CourseConfig[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<CourseConfig>) => void
  onAdd: () => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
}

function FieldGrid({
  course,
  onChange,
}: {
  course: CourseConfig
  onChange: Props['onChange']
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CONFIG_FIELDS.map((field) => (
        <label key={field.key} className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] leading-tight">
            {field.label}
          </span>
          <SliderField
            spec={field}
            value={course[field.key]}
            ariaLabel={`${course.name}: ${field.label}`}
            invalid={
              field.key === 'classSize' && course.classSize > PUBLIC_GROUP_SIZE_CAP
            }
            className="min-w-0"
            onChange={(value) => onChange(course.id, { [field.key]: value })}
          />
        </label>
      ))}
    </div>
  )
}

export function ConfigTable({
  courses,
  selectedId,
  onSelect,
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
            Cada fila es un escenario (un grupo). Usa los deslizadores para
            ajustar en tiempo real. Los grupos públicos de la academia son de 9
            alumnos como máximo.
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
          <div className="space-y-3 px-4 pb-4 lg:hidden">
            {courses.map((course) => (
              <article
                key={course.id}
                className={`rounded-lg border bg-background p-3 ${
                  course.id === selectedId ? 'ring-1 ring-primary' : ''
                }`}
                onClick={() => onSelect(course.id)}
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

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="min-w-[180px]">Curso</TableHead>
                  {CONFIG_FIELDS.map((field) => (
                    <TableHead key={field.key}>{field.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow
                    key={course.id}
                    className={course.id === selectedId ? 'bg-muted/40' : undefined}
                    onClick={() => onSelect(course.id)}
                  >
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
                    {CONFIG_FIELDS.map((field) => (
                      <TableCell key={field.key}>
                        <div className="flex flex-col gap-1">
                          <SliderField
                            spec={field}
                            value={course[field.key]}
                            ariaLabel={`${course.name}: ${field.label}`}
                            invalid={
                              field.key === 'classSize' &&
                              course.classSize > PUBLIC_GROUP_SIZE_CAP
                            }
                            onChange={(value) =>
                              onChange(course.id, { [field.key]: value })
                            }
                          />
                          {field.key === 'classSize' &&
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
