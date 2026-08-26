export interface SectionDef { id: string; num: string; name: string }

export const SECTIONS: SectionDef[] = [
  { id: 'home', num: '00', name: 'Homepage' },
  { id: 'tracker', num: '21', name: 'Live Tracker (Start Here)' },
  { id: 'concerns', num: '01', name: 'Your Concerns' },
  { id: 'controls', num: '02', name: 'Controls In Place' },
  { id: 'planes', num: '03', name: 'Four Data Planes' },
  { id: 'paths', num: '04', name: 'Deployment Paths' },
  { id: 'zql', num: '05', name: 'ZQL Explained' },
  { id: 'sam', num: '06', name: 'SAM Findings & Plan' },
  { id: 'rss', num: '07', name: 'RSS Current State' },
  { id: 'guardrails', num: '08', name: 'Guardrails' },
  { id: 'dlp', num: '09', name: 'DLP Framework' },
  { id: 'aisec', num: '10', name: 'AI Security Framework' },
  { id: 'scale', num: '11', name: 'AI at Scale' },
  { id: 'trace', num: '12', name: 'Operational Traceability' },
  { id: 'failure', num: '13', name: 'Failure Simulation' },
  { id: 'acceptance', num: '14', name: 'Pilot Acceptance Criteria' },
  { id: 'human', num: '15', name: 'Human & Process Risk' },
  { id: 'lessons', num: '16', name: 'Lessons Learned' },
  { id: 'actions', num: '17', name: 'Open Actions' },
  { id: 'ask', num: '18', name: 'The Ask' },
  { id: 'reference', num: '19', name: 'Technical Reference' },
  { id: 'testplan', num: '20', name: 'Test Plan' },
  { id: 'governance', num: '23', name: 'Governance Console' },
  { id: 'other', num: '22', name: 'Other' },
]

// Sidebar navigation grouped into phases. Order within each phase preserves
// the intended reading flow; every section id above appears in exactly one phase.
export interface PhaseDef { name: string; sectionIds: string[] }

export const PHASES: PhaseDef[] = [
  { name: 'Start Here', sectionIds: ['home', 'tracker', 'concerns'] },
  { name: 'Controls & Data', sectionIds: ['controls', 'planes', 'paths', 'zql'] },
  { name: 'Findings & Remediation', sectionIds: ['sam', 'rss', 'guardrails', 'dlp'] },
  { name: 'AI Security at Scale', sectionIds: ['aisec', 'scale', 'trace', 'failure'] },
  { name: 'Pilot & Decision', sectionIds: ['acceptance', 'human', 'lessons', 'actions', 'ask'] },
  { name: 'Reference & Ops', sectionIds: ['reference', 'testplan', 'governance', 'other'] },
]

// The guided "first-time journey". Single source of truth — keep in sync with
// the recommended sequence described on the Home page.
export const GUIDED_SEQUENCE = ['home', 'tracker', 'controls', 'ask']
