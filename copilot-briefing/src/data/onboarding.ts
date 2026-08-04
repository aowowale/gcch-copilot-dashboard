export type CloudTemplateId = 'gcch' | 'gcc' | 'commercial'

export type WorkItemType = 'control' | 'task'
export type WorkItemStatus = 'not-started' | 'in-progress' | 'done' | 'blocked'

export interface WorkItem {
  id: string
  type: WorkItemType
  domain: 'identity' | 'access' | 'governance' | 'compliance'
  title: string
  why: string
  how: string
  ownerRole: string
  evidence: string
  phase: 'readiness' | 'pilot' | 'rollout' | 'operate'
}

export interface RoleKit {
  id: string
  name: string
  outcomes: string
  checklist: string[]
}

export interface CadenceItem {
  id: string
  title: string
  rhythm: string
  owner: string
  output: string
}

export interface CloudTemplate {
  id: CloudTemplateId
  label: string
  guidance: string
  paths: Array<{ id: string; name: string; effort: 'Low' | 'Medium' | 'High'; risk: 'Low' | 'Medium' | 'High'; summary: string }>
  work: WorkItem[]
}

export const templates: CloudTemplate[] = [
  {
    id: 'gcch',
    label: 'GCC High',
    guidance: 'Sovereign-first onboarding with explicit boundary and validation gates.',
    paths: [
      { id: 'p1', name: 'Secure baseline rollout', effort: 'Medium', risk: 'Low', summary: 'Web grounding off, strict access gates, phased expansion.' },
      { id: 'p2', name: 'Pilot-first governance rollout', effort: 'High', risk: 'Low', summary: '20-50 user pilot with full evidence capture before scale.' },
      { id: 'p3', name: 'Advanced rollout with web grounding', effort: 'High', risk: 'Medium', summary: 'Requires formal risk acceptance and post-pilot controls.' }
    ],
    work: [
      {
        id: 'ctrl-ca',
        type: 'control',
        domain: 'identity',
        title: 'Conditional Access for Copilot app',
        why: 'Identity boundary for all Copilot entry points.',
        how: 'Scope CA to Enterprise Copilot Platform app, require compliant device + MFA, validate with sign-in logs.',
        ownerRole: 'Identity Admin',
        evidence: 'Policy screenshot + sign-in log export',
        phase: 'readiness'
      },
      {
        id: 'ctrl-integrated-apps',
        type: 'control',
        domain: 'access',
        title: 'Integrated Apps scoped for both Copilot entries',
        why: 'Avoid split-surface access gaps between licensed and unlicensed apps.',
        how: 'Set both Microsoft 365 Copilot and Copilot Chat entries to approved groups only.',
        ownerRole: 'M365 Admin',
        evidence: 'Scope screenshots for both app entries',
        phase: 'readiness'
      },
      {
        id: 'ctrl-purview-retention',
        type: 'control',
        domain: 'compliance',
        title: 'Retention policy for Copilot location',
        why: 'Ensure governed lifecycle for Copilot interaction data.',
        how: 'Create dedicated Purview retention policy for Copilot and AI apps location.',
        ownerRole: 'Compliance Admin',
        evidence: 'Policy summary export',
        phase: 'readiness'
      },
      {
        id: 'ctrl-dlp-copilot',
        type: 'control',
        domain: 'compliance',
        title: 'DLP policy for Copilot location',
        why: 'Apply content protection to Copilot interactions.',
        how: 'Create custom DLP policy with Copilot location, start in simulation mode, run test prompts.',
        ownerRole: 'CyberOps',
        evidence: 'DLP incident report + test log',
        phase: 'pilot'
      },
      {
        id: 'ctrl-rss-rcd',
        type: 'control',
        domain: 'governance',
        title: 'SharePoint aperture controls (RSS/RCD)',
        why: 'Constrain discoverability during early rollout phases.',
        how: 'Enable RSS by change process and apply RCD to high-risk sites pending remediation.',
        ownerRole: 'SharePoint Admin',
        evidence: 'PowerShell output + site-level validation',
        phase: 'pilot'
      },
      {
        id: 'task-user-briefing',
        type: 'task',
        domain: 'governance',
        title: 'Pilot user enablement briefing',
        why: 'Behavior and expectation alignment reduces operational risk.',
        how: 'Run 30-minute pilot briefing with do/dont usage examples and escalation path.',
        ownerRole: 'Program Lead',
        evidence: 'Attendee list + briefing deck',
        phase: 'pilot'
      },
      {
        id: 'task-helpdesk-playbook',
        type: 'task',
        domain: 'access',
        title: 'Helpdesk runbook publication',
        why: 'Support readiness shortens adoption friction and misrouting.',
        how: 'Publish known issues, routing criteria, and triage playbook for Copilot tickets.',
        ownerRole: 'Helpdesk Lead',
        evidence: 'Published runbook link',
        phase: 'rollout'
      },
      {
        id: 'task-kpi-review',
        type: 'task',
        domain: 'governance',
        title: 'Monthly KPI and risk review',
        why: 'Sustains onboarding quality after initial launch.',
        how: 'Review completion, incidents, adoption, and unresolved blockers with owners.',
        ownerRole: 'Program Lead',
        evidence: 'Monthly review notes',
        phase: 'operate'
      }
    ]
  },
  {
    id: 'gcc',
    label: 'GCC',
    guidance: 'Government cloud onboarding with compliance validation and phased expansion.',
    paths: [
      { id: 'p1', name: 'Secure baseline rollout', effort: 'Medium', risk: 'Low', summary: 'Identity and compliance controls first, then pilot.' },
      { id: 'p2', name: 'Pilot-first governance rollout', effort: 'High', risk: 'Low', summary: 'Pilot with role-based enablement and evidence.' },
      { id: 'p3', name: 'Advanced rollout with web grounding', effort: 'High', risk: 'Medium', summary: 'Explicit approval and ongoing monitoring required.' }
    ],
    work: []
  },
  {
    id: 'commercial',
    label: 'Commercial',
    guidance: 'Fast start with guardrails, role-based enablement, and evidence discipline.',
    paths: [
      { id: 'p1', name: 'Secure baseline rollout', effort: 'Low', risk: 'Low', summary: 'Start with identity and content controls.' },
      { id: 'p2', name: 'Pilot-first governance rollout', effort: 'Medium', risk: 'Low', summary: 'Pilot before broad release.' },
      { id: 'p3', name: 'Advanced rollout with web grounding', effort: 'High', risk: 'Medium', summary: 'Add web/agent controls and operational monitoring.' }
    ],
    work: []
  }
]

export const roleKits: RoleKit[] = [
  {
    id: 'exec',
    name: 'Leaders',
    outcomes: 'Authorize scope, unblock decisions, and monitor risk posture.',
    checklist: [
      'Approve onboarding path and timeline.',
      'Review readiness score and blockers weekly.',
      'Confirm risk acceptance decisions are documented.'
    ]
  },
  {
    id: 'security',
    name: 'Security and Compliance',
    outcomes: 'Ensure controls are enforceable, auditable, and evidence-backed.',
    checklist: [
      'Validate CA, DLP, retention, and audit controls.',
      'Run control tests and capture evidence artifacts.',
      'Track unresolved gaps and mitigation dates.'
    ]
  },
  {
    id: 'admin',
    name: 'IT and Platform Admins',
    outcomes: 'Deploy platform settings safely and maintain configuration hygiene.',
    checklist: [
      'Apply app scoping and policy assignments.',
      'Validate client prerequisites and service readiness.',
      'Publish admin runbook for repeatable rollout.'
    ]
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk and Support',
    outcomes: 'Reduce user friction and route incidents effectively.',
    checklist: [
      'Publish ticket triage flow and ownership map.',
      'Catalog top onboarding issues and resolutions.',
      'Escalate policy-related incidents to CyberOps.'
    ]
  },
  {
    id: 'users',
    name: 'Pilot and End Users',
    outcomes: 'Adopt Copilot safely using approved behaviors.',
    checklist: [
      'Attend onboarding briefing and review quick start.',
      'Use approved prompts and follow data handling rules.',
      'Report unexpected behavior through support path.'
    ]
  }
]

export const cadence: CadenceItem[] = [
  {
    id: 'cad-weekly',
    title: 'Weekly readiness review',
    rhythm: 'Weekly',
    owner: 'Program Lead',
    output: 'Updated blockers, owners, and next actions.'
  },
  {
    id: 'cad-monthly',
    title: 'Monthly control verification',
    rhythm: 'Monthly',
    owner: 'Security and Compliance',
    output: 'Control test results and evidence package refresh.'
  },
  {
    id: 'cad-quarterly',
    title: 'Quarterly posture recalibration',
    rhythm: 'Quarterly',
    owner: 'Leadership + Security',
    output: 'Scope update, risk decisions, and roadmap adjustments.'
  }
]

export const metricTargets = [
  { id: 'time-to-pilot', label: 'Time to pilot start', target: '<= 30 days' },
  { id: 'control-completion', label: 'Control completion rate', target: '>= 90%' },
  { id: 'policy-validation', label: 'Policy validation rate', target: '100% before rollout' },
  { id: 'pilot-activation', label: 'Pilot activation', target: '>= 80% of pilot users' },
  { id: 'open-blockers', label: 'Open blockers age', target: '<= 14 days' }
]

export function getTemplate(id: CloudTemplateId): CloudTemplate {
  return templates.find((t) => t.id === id) || templates[0]
}
