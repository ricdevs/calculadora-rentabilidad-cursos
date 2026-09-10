import type {
  Contract,
  CourseConfig,
  FundaeGroupResult,
  FundaeModality,
  WorkforceBand,
} from '@/lib/types'

/** Orden TAS/2307/2007 art. 12.2 — coste máximo € / participante / hora. */
export const FUNDAE_MODULE_EUR: Record<Exclude<FundaeModality, 'none'>, number> = {
  'presencial-basico': 9,
  'presencial-superior': 13,
  teleformacion: 7.5,
}

/** Presencial (incl. aula virtual 2026, BOE-A-2025-25790). */
export const FUNDAE_PRESENCIAL_CAP = 30

export const FUNDAE_MODALITY_OPTIONS: {
  value: FundaeModality
  label: string
}[] = [
  { value: 'none', label: 'Sin bonificar' },
  { value: 'presencial-basico', label: 'Presencial básico' },
  { value: 'presencial-superior', label: 'Presencial superior' },
  { value: 'teleformacion', label: 'Teleformación' },
]

export const WORKFORCE_OPTIONS: {
  value: WorkforceBand
  label: string
}[] = [
  { value: '1-5', label: '1–5 trabajadores' },
  { value: '6-9', label: '6–9 trabajadores' },
  { value: '10-49', label: '10–49 trabajadores' },
  { value: '50-249', label: '50–249 trabajadores' },
  { value: '250+', label: '250 o más' },
]

export const FUNDAE_MODALITY_SHORT: Record<FundaeModality, string> = {
  none: 'Sin bonificar',
  'presencial-basico': 'Presencial básico',
  'presencial-superior': 'Presencial superior',
  teleformacion: 'Teleformación',
}

export function isPresencial(modality: FundaeModality): boolean {
  return modality === 'presencial-basico' || modality === 'presencial-superior'
}

/** Ley 30/2015 art. 11.5 — cofinanciación privada mínima sobre el coste. */
export function cofinanceRate(band: WorkforceBand): number {
  switch (band) {
    case '1-5':
      return 0
    case '6-9':
      return 0.05
    case '10-49':
      return 0.1
    case '50-249':
      return 0.2
    case '250+':
      return 0.4
  }
}

/**
 * TAS/2307/2007 art. 12.3: 1–9 sin tope de módulo;
 * 10–49 pueden superar un 10 %; 50–249 un 5 %.
 */
export function moduleHeadroom(band: WorkforceBand): number | null {
  switch (band) {
    case '1-5':
    case '6-9':
      return null
    case '10-49':
      return 0.1
    case '50-249':
      return 0.05
    case '250+':
      return 0
  }
}

export function effectiveModule(
  modality: FundaeModality,
  band: WorkforceBand,
): { unlimited: boolean; euros: number | null } {
  if (modality === 'none') return { unlimited: false, euros: null }
  const base = FUNDAE_MODULE_EUR[modality]
  const headroom = moduleHeadroom(band)
  if (headroom === null) return { unlimited: true, euros: base }
  return { unlimited: false, euros: base * (1 + headroom) }
}

function groupBonusBeforeCredit(
  config: CourseConfig,
  contract: Contract,
): Omit<FundaeGroupResult, 'bonus' | 'coveragePct' | 'companyNet' | 'creditScaled'> {
  const invoice = Math.max(0, config.pricePerStudent) * Math.max(0, config.classSize)
  const hours = Math.max(0, config.hoursPerStudent)
  const size = Math.max(0, config.classSize)
  const modality = contract.fundaeModality
  const enabled = modality !== 'none'

  if (!enabled) {
    return {
      enabled: false,
      baseModule: null,
      effectiveModule: null,
      moduleUnlimited: false,
      moduleCap: null,
      cofinanceRate: cofinanceRate(contract.workforceBand),
      cofinanceCap: null,
      bonusBeforeCredit: 0,
      presencialCapWarning: false,
    }
  }

  const module = effectiveModule(modality, contract.workforceBand)
  const moduleCap = module.unlimited
    ? invoice
    : hours * size * (module.euros ?? 0)
  const rate = cofinanceRate(contract.workforceBand)
  const cofinanceCap = contract.trainingInWorkHours
    ? invoice
    : invoice * (1 - rate)

  const bonusBeforeCredit = Math.min(invoice, moduleCap, cofinanceCap)

  return {
    enabled: true,
    baseModule: FUNDAE_MODULE_EUR[modality],
    effectiveModule: module.unlimited ? null : module.euros,
    moduleUnlimited: module.unlimited,
    moduleCap,
    cofinanceRate: rate,
    cofinanceCap,
    bonusBeforeCredit,
    presencialCapWarning: isPresencial(modality) && size > FUNDAE_PRESENCIAL_CAP,
  }
}

export function computeFundaeGroups(
  groups: CourseConfig[],
  contract: Contract,
): FundaeGroupResult[] {
  const drafts = groups.map((group) => groupBonusBeforeCredit(group, contract))
  const sum = drafts.reduce((total, row) => total + row.bonusBeforeCredit, 0)
  const credit = contract.fundaeCredit
  const scale =
    credit !== null && Number.isFinite(credit) && credit >= 0 && sum > credit
      ? credit / sum
      : 1

  return drafts.map((draft, index) => {
    const invoice =
      Math.max(0, groups[index].pricePerStudent) *
      Math.max(0, groups[index].classSize)
    const bonus = draft.bonusBeforeCredit * scale
    return {
      ...draft,
      bonus,
      coveragePct: invoice > 0 ? bonus / invoice : 0,
      companyNet: invoice - bonus,
      creditScaled: scale < 1,
    }
  })
}

export function workforceLabel(band: WorkforceBand): string {
  return WORKFORCE_OPTIONS.find((option) => option.value === band)?.label ?? band
}
