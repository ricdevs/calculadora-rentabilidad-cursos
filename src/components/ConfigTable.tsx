import { NumberField } from '@/components/NumberField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
  FUNDAE_MODALITY_OPTIONS,
  FUNDAE_PRESENCIAL_CAP,
  WORKFORCE_OPTIONS,
  isPresencial,
} from '@/lib/fundae'
import { cn } from '@/lib/utils'
import {
  PUBLIC_GROUP_SIZE_CAP,
  type Contract,
  type CourseConfig,
  type FundaeModality,
} from '@/lib/types'
import { Copy, Plus, Trash2 } from 'lucide-react'

const selectClassName = cn(
  'h-8 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
)

const labelClassName = 'text-muted-foreground mb-1 block text-[11px]'

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
    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
      {CONFIG_FIELDS.map((field) => (
        <label key={field.key} className="min-w-0">
          <span className={labelClassName}>{field.label}</span>
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

function PresencialCapNote({
  contract,
  size,
}: {
  contract: Contract
  size: number
}) {
  if (!isPresencial(contract.fundaeModality) || size <= FUNDAE_PRESENCIAL_CAP) {
    return null
  }
  return (
    <p className="mt-2 text-xs text-amber-800">
      FUNDAE limita la presencial / aula virtual a {FUNDAE_PRESENCIAL_CAP}{' '}
      participantes.
    </p>
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
    <section className="rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-medium">
            Configuraciones de curso
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-[13px] leading-relaxed">
            Cada fila es un grupo. Modalidad, plantilla y crédito FUNDAE son de
            la empresa y se aplican a todo el acuerdo.
          </p>
        </div>
        <Button onClick={onAdd} size="sm" className="shrink-0">
          <Plus data-icon="inline-start" />
          Añadir grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="min-w-0">
          <span className={labelClassName}>Nombre del acuerdo</span>
          <Input
            value={contract.name}
            aria-label="Nombre del acuerdo"
            onChange={(event) =>
              onContractChange({ name: event.target.value })
            }
          />
        </label>
        <label className="min-w-0">
          <span className={labelClassName}>Empresa / cliente</span>
          <Input
            value={contract.company}
            aria-label="Empresa o cliente"
            onChange={(event) =>
              onContractChange({ company: event.target.value })
            }
          />
        </label>
        <label className="min-w-0">
          <span className={labelClassName}>Plantilla</span>
          <select
            aria-label="Plantilla de la empresa"
            className={selectClassName}
            value={contract.workforceBand}
            onChange={(event) =>
              onContractChange({
                workforceBand: event.target.value as Contract['workforceBand'],
              })
            }
          >
            {WORKFORCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className={labelClassName}>Modalidad FUNDAE</span>
          <select
            aria-label="Modalidad FUNDAE de la empresa"
            className={selectClassName}
            value={contract.fundaeModality}
            onChange={(event) =>
              onContractChange({
                fundaeModality: event.target.value as FundaeModality,
              })
            }
          >
            {FUNDAE_MODALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className={labelClassName}>Crédito anual (€)</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={50}
            placeholder="Sin tope"
            aria-label="Crédito FUNDAE anual"
            className="text-right tabular-nums"
            value={contract.fundaeCredit ?? ''}
            onChange={(event) => {
              const next = event.target.value
              if (next === '') {
                onContractChange({ fundaeCredit: null })
                return
              }
              const parsed = Number(next)
              if (Number.isFinite(parsed)) {
                onContractChange({ fundaeCredit: Math.max(0, parsed) })
              }
            }}
          />
        </label>
        <label className="flex min-w-0 items-end gap-2.5 pb-0.5 sm:col-span-2">
          <Switch
            checked={contract.trainingInWorkHours}
            onCheckedChange={(checked) =>
              onContractChange({ trainingInWorkHours: checked })
            }
          />
          <span className="text-sm leading-snug">
            Formación en jornada
            <span className="text-muted-foreground mt-0.5 block text-[12px]">
              El salario cubre la cofinanciación privada.
            </span>
          </span>
        </label>
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground border-t border-border px-5 py-4 text-sm">
          No hay grupos en este acuerdo. Añade uno o restaura los ejemplos.
        </p>
      ) : (
        <>
          <div className="space-y-3 border-t border-border px-5 py-4 lg:hidden">
            {groups.map((group) => (
              <article
                key={group.id}
                className={`rounded-md border bg-background p-3 ${
                  group.id === selectedId ? 'ring-1 ring-primary' : ''
                }`}
                onClick={() => onSelect(group.id)}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: group.color }}
                  />
                  <Input
                    value={group.name}
                    aria-label="Nombre del grupo"
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
                <PresencialCapNote
                  contract={contract}
                  size={group.classSize}
                />
              </article>
            ))}
          </div>

          <div className="hidden border-t border-border lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[28%] px-5">Grupo / módulo</TableHead>
                  {CONFIG_FIELDS.map((field) => (
                    <TableHead key={field.key} className="text-right">
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-20 px-5 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow
                    key={group.id}
                    className={group.id === selectedId ? 'bg-muted/40' : undefined}
                    onClick={() => onSelect(group.id)}
                  >
                    <TableCell className="px-5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: group.color }}
                        />
                        <Input
                          value={group.name}
                          aria-label="Nombre del grupo"
                          className="bg-background"
                          onChange={(event) =>
                            onChange(group.id, { name: event.target.value })
                          }
                        />
                      </div>
                    </TableCell>
                    {CONFIG_FIELDS.map((field) => (
                      <TableCell key={field.key}>
                        <div className="flex flex-col items-end gap-1">
                          <NumberField
                            min={0}
                            step={field.step}
                            value={group[field.key]}
                            ariaLabel={`${group.name}: ${field.label}`}
                            invalid={
                              field.key === 'classSize' &&
                              group.classSize > PUBLIC_GROUP_SIZE_CAP
                            }
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
                          {field.key === 'classSize' &&
                          isPresencial(contract.fundaeModality) &&
                          group.classSize > FUNDAE_PRESENCIAL_CAP ? (
                            <Badge variant="outline" className="text-amber-800">
                              &gt; {FUNDAE_PRESENCIAL_CAP} presencial
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="px-5">
                      <div className="flex justify-end gap-0.5">
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
