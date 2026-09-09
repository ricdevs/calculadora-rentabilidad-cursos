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
  'h-7 w-full max-w-[13.5rem] min-w-0 rounded-md border border-input bg-card px-2 py-0.5 text-sm outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
)

const fieldClassName = 'flex w-[13.5rem] max-w-full flex-col gap-0.5'
const wideFieldClassName = 'flex w-[16.5rem] max-w-full flex-col gap-0.5'
const labelClassName = 'text-muted-foreground text-[10px] tracking-[0.08em] uppercase'

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
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      {CONFIG_FIELDS.map((field) => (
        <label key={field.key} className="flex max-w-[8.5rem] flex-col gap-0.5">
          <span className={labelClassName}>{field.label}</span>
          <NumberField
            min={0}
            step={field.step}
            value={group[field.key]}
            ariaLabel={`${group.name}: ${field.label}`}
            invalid={
              field.key === 'classSize' && group.classSize > PUBLIC_GROUP_SIZE_CAP
            }
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
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="font-heading text-base font-semibold">
            Configuraciones de curso
          </h2>
          <p className="text-muted-foreground mt-0.5 max-w-xl text-[13px] leading-snug">
            Cada fila es un grupo del acuerdo. FUNDAE (modalidad, plantilla,
            crédito) es de la empresa y se aplica a todo el contrato.
          </p>
        </div>
        <Button onClick={onAdd} size="sm" className="shrink-0">
          <Plus data-icon="inline-start" />
          Añadir grupo
        </Button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2.5 px-4 pb-3">
        <label className={wideFieldClassName}>
          <span className={labelClassName}>Nombre del acuerdo</span>
          <Input
            value={contract.name}
            aria-label="Nombre del acuerdo"
            className="bg-card"
            onChange={(event) =>
              onContractChange({ name: event.target.value })
            }
          />
        </label>
        <label className={wideFieldClassName}>
          <span className={labelClassName}>Empresa / cliente</span>
          <Input
            value={contract.company}
            aria-label="Empresa o cliente"
            className="bg-card"
            onChange={(event) =>
              onContractChange({ company: event.target.value })
            }
          />
        </label>
        <label className={fieldClassName}>
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
        <label className={fieldClassName}>
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
        <label className={fieldClassName}>
          <span className={labelClassName}>Crédito anual (€)</span>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={50}
            placeholder="Sin tope"
            aria-label="Crédito FUNDAE anual"
            className="bg-card text-right tabular-nums"
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
        <label className="flex min-h-7 items-end gap-2 pb-0.5">
          <Switch
            size="sm"
            checked={contract.trainingInWorkHours}
            onCheckedChange={(checked) =>
              onContractChange({ trainingInWorkHours: checked })
            }
          />
          <span className="text-[13px] leading-tight">
            Formación en jornada
            <span className="text-muted-foreground mt-0.5 block text-[11px]">
              El salario cubre la cofinanciación privada.
            </span>
          </span>
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
                    className="bg-card"
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

          <div className="hidden overflow-x-auto lg:block">
            <Table className="!w-auto">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Grupo / módulo</TableHead>
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
                          className="w-36 bg-card"
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
