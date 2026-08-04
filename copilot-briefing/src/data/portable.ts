export type CloudKind = 'gcch' | 'gcc' | 'commercial'
export type RolloutPath = 'secure-baseline' | 'pilot-first' | 'advanced-web'
export type ItemType = 'control' | 'task'
export type Priority = 'P0' | 'P1' | 'P2'
export type ItemStatus = 'not-started' | 'in-progress' | 'done' | 'blocked'

export interface PortableItem {
  id: string
  title: string
  type: ItemType
  domain: 'identity' | 'access' | 'governance' | 'compliance'
  priority: Priority
  dependsOn: string[]
  paths: RolloutPath[]
  ownerRole: string
  dueDays: number
  confidence: 'high' | 'medium'
  availability: 'verified' | 'validate-in-tenant'
  why: string
  how: string
  evidence: string
}

export interface PortableTemplate {
  cloud: CloudKind
  label: string
  subtitle: string
  paths: Array<{ id: RolloutPath; name: string; risk: 'Low' | 'Medium' | 'High'; effort: 'Low' | 'Medium' | 'High'; summary: string }>
  items: PortableItem[]
}

const sharedPaths: PortableTemplate['paths'] = [
  { id: 'secure-baseline', name: 'Secure Baseline Rollout', risk: 'Low', effort: 'Medium', summary: 'Identity and compliance controls first, web grounding off.' },
  { id: 'pilot-first', name: 'Pilot-First Governance Rollout', risk: 'Low', effort: 'High', summary: '20-50 user pilot with evidence before broad rollout.' },
  { id: 'advanced-web', name: 'Advanced Rollout with Web Grounding', risk: 'Medium', effort: 'High', summary: 'Formal risk acceptance and expanded monitoring required.' },
]

function baseItems(prefix: string): PortableItem[] {
  return [
    {
      id: `${prefix}-ca`,
      title: 'Conditional Access policy for Copilot app',
      type: 'control',
      domain: 'identity',
      priority: 'P0',
      dependsOn: [],
      paths: ['secure-baseline', 'pilot-first', 'advanced-web'],
      ownerRole: 'Identity Admin',
      dueDays: 7,
      confidence: 'high',
      availability: 'verified',
      why: 'Defines the hard identity boundary for all Copilot entry points.',
      how: 'Target Copilot enterprise app, require MFA + compliant device, validate in sign-in logs before enforcement.',
      evidence: 'Policy export + sign-in validation screenshots'
    },
    {
      id: `${prefix}-apps`,
      title: 'Integrated Apps scoped for licensed and chat entries',
      type: 'control',
      domain: 'access',
      priority: 'P0',
      dependsOn: [],
      paths: ['secure-baseline', 'pilot-first', 'advanced-web'],
      ownerRole: 'M365 Admin',
      dueDays: 7,
      confidence: 'high',
      availability: 'verified',
      why: 'Prevents split-surface access misconfiguration.',
      how: 'Scope both Copilot app entries to approved groups only and run unauthorized-user checks.',
      evidence: 'Both app scope screenshots + test result log'
    },
    {
      id: `${prefix}-retention`,
      title: 'Retention policy for Copilot location',
      type: 'control',
      domain: 'compliance',
      priority: 'P0',
      dependsOn: [],
      paths: ['secure-baseline', 'pilot-first', 'advanced-web'],
      ownerRole: 'Compliance Admin',
      dueDays: 10,
      confidence: 'high',
      availability: 'verified',
      why: 'Ensures interaction lifecycle is governed and discoverable.',
      how: 'Create a dedicated retention policy for Copilot and AI apps location.',
      evidence: 'Retention policy summary export'
    },
    {
      id: `${prefix}-dlp`,
      title: 'DLP policy for Copilot location (simulation first)',
      type: 'control',
      domain: 'compliance',
      priority: 'P1',
      dependsOn: [`${prefix}-retention`],
      paths: ['pilot-first', 'advanced-web'],
      ownerRole: 'CyberOps',
      dueDays: 14,
      confidence: 'medium',
      availability: 'validate-in-tenant',
      why: 'Adds content-level guardrails for prompts and outputs.',
      how: 'Create custom DLP policy including Copilot location; run in audit/simulation; execute two controlled tests.',
      evidence: 'DLP incident records + pilot test notes'
    },
    {
      id: `${prefix}-audit`,
      title: 'Audit and eDiscovery validation',
      type: 'control',
      domain: 'compliance',
      priority: 'P1',
      dependsOn: [],
      paths: ['secure-baseline', 'pilot-first', 'advanced-web'],
      ownerRole: 'Compliance Admin',
      dueDays: 14,
      confidence: 'high',
      availability: 'verified',
      why: 'Ensures incident investigation and legal response are operational.',
      how: 'Validate Copilot interaction events in audit and execute a test eDiscovery retrieval.',
      evidence: 'Audit query output + eDiscovery case screenshot'
    },
    {
      id: `${prefix}-sharepoint`,
      title: 'SharePoint aperture controls (RSS/RCD)',
      type: 'control',
      domain: 'governance',
      priority: 'P1',
      dependsOn: [],
      paths: ['pilot-first', 'advanced-web'],
      ownerRole: 'SharePoint Admin',
      dueDays: 21,
      confidence: 'medium',
      availability: 'validate-in-tenant',
      why: 'Constrains discoverability while remediation progresses.',
      how: 'Enable RSS via approved change process and apply RCD to high-risk sites until they clear governance gate.',
      evidence: 'PowerShell output + site test results'
    },
    {
      id: `${prefix}-helpdesk`,
      title: 'Helpdesk runbook and triage routing',
      type: 'task',
      domain: 'access',
      priority: 'P2',
      dependsOn: [`${prefix}-apps`],
      paths: ['secure-baseline', 'pilot-first', 'advanced-web'],
      ownerRole: 'Helpdesk Lead',
      dueDays: 21,
      confidence: 'high',
      availability: 'verified',
      why: 'Turns pilot friction into predictable support flow.',
      how: 'Publish known issues, policy-routing map, and escalation criteria for Copilot support tickets.',
      evidence: 'Published runbook URL'
    },
    {
      id: `${prefix}-briefing`,
      title: 'Pilot user onboarding briefing',
      type: 'task',
      domain: 'governance',
      priority: 'P2',
      dependsOn: [`${prefix}-apps`, `${prefix}-ca`],
      paths: ['pilot-first', 'advanced-web'],
      ownerRole: 'Program Lead',
      dueDays: 21,
      confidence: 'high',
      availability: 'verified',
      why: 'Sets expected behavior and reduces policy violations.',
      how: 'Run 30-minute briefing with approved usage patterns and escalation path.',
      evidence: 'Attendance + deck'
    },
    {
      id: `${prefix}-web`,
      title: 'Web grounding risk acceptance packet',
      type: 'task',
      domain: 'governance',
      priority: 'P1',
      dependsOn: [`${prefix}-dlp`, `${prefix}-audit`],
      paths: ['advanced-web'],
      ownerRole: 'AO/ISSO',
      dueDays: 30,
      confidence: 'high',
      availability: 'verified',
      why: 'Web grounding is a governance decision, not a feature toggle only.',
      how: 'Compile evidence package, residual-risk statement, and sign-off chain before enabling web grounding scope.',
      evidence: 'Signed risk acceptance record'
    }
  ]
}

export const portableTemplates: PortableTemplate[] = [
  {
    cloud: 'gcch',
    label: 'GCC High Reusable Onboarding',
    subtitle: 'Sovereign-first model with explicit validation and evidence gates.',
    paths: sharedPaths,
    items: baseItems('gcch')
  },
  {
    cloud: 'gcc',
    label: 'GCC Reusable Onboarding',
    subtitle: 'Government cloud model with role-based rollout and compliance evidence.',
    paths: sharedPaths,
    items: baseItems('gcc')
  },
  {
    cloud: 'commercial',
    label: 'Commercial Reusable Onboarding',
    subtitle: 'Fast-start model with guardrails, support readiness, and operational cadence.',
    paths: sharedPaths,
    items: baseItems('com')
  },
]

export function getPortableTemplate(cloud: CloudKind): PortableTemplate {
  return portableTemplates.find((t) => t.cloud === cloud) || portableTemplates[0]
}

export const portableRoleKits = [
  {
    id: 'leaders',
    name: 'Leaders',
    outcomes: 'Approve scope, unblock decisions, and monitor risk posture.',
    checklist: ['Approve path and timeline', 'Review blockers weekly', 'Sign risk acceptance decisions']
  },
  {
    id: 'security',
    name: 'Security and Compliance',
    outcomes: 'Validate policy enforcement and evidence completeness.',
    checklist: ['Run CA/DLP/audit validations', 'Track open control gaps', 'Refresh evidence package monthly']
  },
  {
    id: 'admins',
    name: 'IT and Platform Admins',
    outcomes: 'Deploy controls with repeatable and supportable operations.',
    checklist: ['Apply scoped policies', 'Validate client prerequisites', 'Maintain admin runbook']
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk',
    outcomes: 'Resolve onboarding issues quickly and consistently.',
    checklist: ['Use triage matrix', 'Escalate policy incidents', 'Close recurring issue patterns']
  },
]

export const portableCadence = [
  { id: 'weekly', title: 'Weekly readiness review', rhythm: 'Weekly', owner: 'Program Lead', output: 'Owner-assigned action list' },
  { id: 'monthly', title: 'Monthly control verification', rhythm: 'Monthly', owner: 'Security', output: 'Validation and evidence report' },
  { id: 'quarterly', title: 'Quarterly posture recalibration', rhythm: 'Quarterly', owner: 'Leadership', output: 'Scope/risk adjustments' },
]
