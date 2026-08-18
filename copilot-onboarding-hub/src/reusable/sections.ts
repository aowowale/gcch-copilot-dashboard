export type ReusablePhase = 'setup' | 'baseline' | 'pilot' | 'operate' | 'reference'

export interface ReusableSectionDef {
  id: string
  num: string
  name: string
  phase: ReusablePhase
}

export const REUSABLE_SECTIONS: ReusableSectionDef[] = [
  { id: 'journey', num: '00', name: 'Onboarding Dashboard', phase: 'setup' },
  { id: 'homev2', num: '01', name: 'Start Here', phase: 'setup' },
  { id: 'concerns', num: '02', name: 'Stakeholder Concerns', phase: 'setup' },
  { id: 'controls', num: '03', name: 'Controls Baseline', phase: 'baseline' },
  { id: 'dlp', num: '04', name: 'DLP Framework', phase: 'baseline' },
  { id: 'aisec', num: '05', name: 'AI Security Framework', phase: 'baseline' },
  { id: 'rss', num: '06', name: 'Data Aperture (RSS)', phase: 'baseline' },
  { id: 'guardrails', num: '07', name: 'Guardrails', phase: 'baseline' },
  { id: 'paths', num: '08', name: 'Deployment Paths', phase: 'pilot' },
  { id: 'acceptance', num: '09', name: 'Pilot Acceptance', phase: 'pilot' },
  { id: 'testplan', num: '10', name: 'Test Plan', phase: 'pilot' },
  { id: 'tracker', num: '11', name: 'Live Tracker', phase: 'operate' },
  { id: 'actions', num: '12', name: 'Open Actions', phase: 'operate' },
  { id: 'trace', num: '13', name: 'Operational Traceability', phase: 'operate' },
  { id: 'sam', num: '14', name: 'Get Copilot Ready', phase: 'operate' },
  { id: 'lessons', num: '15', name: 'Lessons Learned', phase: 'operate' },
  { id: 'ask', num: '16', name: 'Executive Ask', phase: 'operate' },
  { id: 'zql', num: '17', name: 'ZQL Explained', phase: 'reference' },
  { id: 'planes', num: '18', name: 'Four Data Planes', phase: 'reference' },
  { id: 'failure', num: '19', name: 'Failure Simulation', phase: 'reference' },
  { id: 'human', num: '20', name: 'Human & Process Risk', phase: 'reference' },
  { id: 'scale', num: '21', name: 'AI at Scale', phase: 'reference' },
  { id: 'reference', num: '22', name: 'Technical Reference', phase: 'reference' },
]

export const PHASE_LABELS: Record<ReusablePhase, string> = {
  setup: 'Discover and Setup',
  baseline: 'Secure Baseline',
  pilot: 'Pilot and Validate',
  operate: 'Operate and Govern',
  reference: 'Reference and Deep Dives',
}

/**
 * The linear guided path: phase-ordered content sections, excluding the dashboard
 * landing page and the reference deep-dives. This is the single source of truth for
 * "Step X of N" position labels and prev/next navigation.
 */
export const JOURNEY_STEPS: ReusableSectionDef[] = REUSABLE_SECTIONS.filter(
  (s) => s.phase !== 'reference' && s.id !== 'journey',
)

export const REFERENCE_STEPS: ReusableSectionDef[] = REUSABLE_SECTIONS.filter((s) => s.phase === 'reference')

export interface JourneyPosition {
  def: ReusableSectionDef
  inJourney: boolean
  /** 1-based step number within the guided path; 0 for reference / dashboard. */
  step: number
  total: number
  prev?: ReusableSectionDef
  next?: ReusableSectionDef
}

/** Resolve a section id to its logical position in the guided journey. */
export function journeyPosition(id: string | undefined): JourneyPosition | null {
  const def = REUSABLE_SECTIONS.find((s) => s.id === id)
  if (!def) return null
  const jIdx = JOURNEY_STEPS.findIndex((s) => s.id === id)
  if (jIdx !== -1) {
    return {
      def,
      inJourney: true,
      step: jIdx + 1,
      total: JOURNEY_STEPS.length,
      prev: JOURNEY_STEPS[jIdx - 1],
      next: JOURNEY_STEPS[jIdx + 1],
    }
  }
  const rIdx = REFERENCE_STEPS.findIndex((s) => s.id === id)
  return {
    def,
    inJourney: false,
    step: 0,
    total: JOURNEY_STEPS.length,
    prev: rIdx > 0 ? REFERENCE_STEPS[rIdx - 1] : undefined,
    next: rIdx >= 0 ? REFERENCE_STEPS[rIdx + 1] : undefined,
  }
}