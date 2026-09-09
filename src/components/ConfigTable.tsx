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
import { CONFIG_FIELDS } from '@/lib/fields'
import {
  PUBLIC_GROUP_SIZE_CAP,
  type Contract,
  type CourseConfig,
} from '@/lib/types'
import { Copy, Plus, Trash2 } from 'lucide-react'

type Props = {
  contract: Contract
  groups: CourseConfig[]
  selectedId: string | null
  onContractChange: (patch: Partial<Contract>) => void
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<CourseConfig>) => void
  onAdd: () => void
  onDuplicate: (id: string) => void
  onRemove: (id: string) => void
}

function FieldGrid({
  group,
  onChange,
}: {
  group: CourseConfig
  onChange: Props['onChange']
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {CONFIG_FIELDS.map((field) => (
        <label key={field.key} className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] leading-tight">
            {field.label}
          </span>
          <NumberField
            min={0}
            step={field.step}
            value={group[field.key]}
            ariaLabel={`${group.name}: ${field.label}`}
            invalid={
              field.key === 'classSize' && group.classSize > PUBLIC_GROUP_SIZE_CAP
            }
            className="w-full"
            onChange={(value) => onChange(group.id, { [field.key]: value })}
          />
        </label>
      ))}
    </div>
  )
}

export function ConfigTable({
  contract,
  groups,
  selectedId,
  onContractChange,
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
            Un acuerdo comercial puede incluir varios grupos de distinto tamaño
            y horas. Cada fila es un componente de este contrato. Los grupos
            públicos de la academia son de {PUBLIC_GROUP_SIZE_CAP} alumnos como
            máximo. Para explorar un grupo con deslizadores, usa el análisis de
            configuración.
          </p>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <Plus data-icon="inline-start" />
          Añadir grupo
        </Button>
      </div>

      <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-5">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px]">
            Nombre del acuerdo
          </span>
          <Input
            value={contract.name}
            aria-label="Nombre del acuerdo"
            className="bg-white"
            onChange={(event) =>
              onContractChange({ name: event.target.value })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px]">
            Empresa / cliente
          </span>
          <Input
            value={contract.company}
            aria-label="Empresa o cliente"
            className="bg-white"
            onChange={(event) =>
              onContractChange({ company: event.target.value })
            }
          />
        </label>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground px-5 pb-5 text-sm">
          No hay grupos en este acuerdo. Añade uno o restaura los ejemplos.
        </p>
      ) : (
        <>
          <div className="space-y-3 px-4 pb-4 lg:hidden">
            {groups.map((group) => (
              <article
                key={group.id}
                className={`rounded-lg border bg-background p-3 ${
                  group.id === selectedId ? 'ring-1 ring-primary' : ''
                }`}
                onClick={() => onSelect(group.id)}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: group.color }}
                  />
                  <Input
                    value={group.name}
                    aria-label="Nombre del grupo"
                    className="bg-white"
                    onChange={(event) =>
                      onChange(group.id, { name: event.target.value })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Duplicar ${group.name}`}
                    onClick={() => onDuplicate(group.id)}
                  >
                    <Copy />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar ${group.name}`}
                    onClick={() => onRemove(group.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <FieldGrid group={group} onChange={onChange} />
                {group.classSize > PUBLIC_GROUP_SIZE_CAP ? (
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
                  <TableHead className="min-w-[180px]">Grupo / módulo</TableHead>
                  {CONFIG_FIELDS.map((field) => (
                    <TableHead key={field.key}>{field.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow
                    key={group.id}
                    className={group.id === selectedId ? 'bg-muted/40' : undefined}
                    onClick={() => onSelect(group.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: group.color }}
                        />
                        <Input
                          value={group.name}
                          aria-label="Nombre del grupo"
                          className="min-w-[10rem] bg-white"
                          onChange={(event) =>
                            onChange(group.id, { name: event.target.value })
                          }
                        />
                      </div>
                    </TableCell>
                    {CONFIG_FIELDS.map((field) => (
                      <TableCell key={field.key}>
                        <div className="flex flex-col gap-1">
                          <NumberField
                            min={0}
                            step={field.step}
                            value={group[field.key]}
                            ariaLabel={`${group.name}: ${field.label}`}
                            invalid={
                              field.key === 'classSize' &&
                              group.classSize > PUBLIC_GROUP_SIZE_CAP
                            }
                            className="w-full"
                            onChange={(value) =>
                              onChange(group.id, { [field.key]: value })
                            }
                          />
                          {field.key === 'classSize' &&
                          group.classSize > PUBLIC_GROUP_SIZE_CAP ? (
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
                          aria-label={`Duplicar ${group.name}`}
                          onClick={() => onDuplicate(group.id)}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Eliminar ${group.name}`}
                          onClick={() => onRemove(group.id)}
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
