export type V2Cloud = 'gcch' | 'gcc' | 'commercial'
export type V2Path = 'baseline' | 'pilot' | 'advanced'
export type V2Type = 'control' | 'task'
export type V2Status = 'not-started' | 'in-progress' | 'done' | 'blocked'
export type V2Priority = 'critical' | 'high' | 'medium' | 'low'

export interface V2DocLink {
  label: string
  url: string
}

export interface V2WorkItem {
  id: string
  type: V2Type
  domain: 'identity' | 'access' | 'governance' | 'compliance'
  title: string
  why: string
  how: string
  evidence: string
  ownerRole: string
  priority: V2Priority
  dueByDays: number
  dependsOn?: string[]
  paths: V2Path[]
  /** Where in the admin tooling this is done, e.g. portal navigation breadcrumb. */
  portalPath?: string
  /** Practical, ordered how-to steps the owner can follow to complete this item. */
  steps?: string[]
  /** Official documentation references for deeper guidance. */
  docLinks?: V2DocLink[]
  /** How to confirm the control/task actually worked. */
  verify?: string
}

export interface V2Template {
  id: V2Cloud
  label: string
  shellSubtitle: string
  guidance: string
  paths: Array<{ id: V2Path; label: string; effort: 'Low' | 'Medium' | 'High'; risk: 'Low' | 'Medium' | 'High'; summary: string }>
  work: V2WorkItem[]
}

const baseWork: V2WorkItem[] = [
  {
    id: 'ctrl-ca',
    type: 'control',
    domain: 'identity',
    title: 'Conditional Access for Copilot app scope',
    why: 'Identity boundary for all Copilot entry points.',
    how: 'Scope CA to Copilot app, require MFA and compliant device, validate sign-in outcomes for authorized and unauthorized users.',
    evidence: 'CA policy export + sign-in log screenshots',
    ownerRole: 'Identity Admin',
    priority: 'critical',
    dueByDays: 7,
    paths: ['baseline', 'pilot', 'advanced'],
    portalPath: 'Microsoft Entra admin center → Protection → Conditional Access → Policies',
    steps: [
      'Sign in to the Microsoft Entra admin center as a Conditional Access Administrator or Security Administrator.',
      'Go to Protection → Conditional Access → Policies, then select + New policy and name it (e.g. "Copilot – require MFA + compliant device").',
      'Under Assignments → Users, include your approved Copilot pilot group and exclude your break-glass/emergency-access accounts.',
      'Under Target resources → Cloud apps, select the Microsoft 365 Copilot app(s) in scope (use Office 365 as the umbrella resource where the discrete Copilot app is not listed).',
      'Under Grant, choose Grant access and require both "Require multifactor authentication" and "Require device to be marked as compliant"; set "Require all the selected controls".',
      'Set Enable policy to Report-only, save, and review impact in Sign-in logs before switching it to On.'
    ],
    docLinks: [
      { label: 'Conditional Access overview', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview' },
      { label: 'Common Conditional Access policies', url: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policy-common' }
    ],
    verify: 'In Sign-in logs → Conditional Access tab, confirm the policy is evaluated: authorized users on compliant devices get an MFA prompt and succeed, while out-of-scope or non-compliant sign-ins are blocked.'
  },
  {
    id: 'ctrl-integrated',
    type: 'control',
    domain: 'access',
    title: 'Integrated Apps scoping for both Copilot entries',
    why: 'Prevents split-surface access gaps.',
    how: 'Scope both Copilot and Copilot Chat app entries to approved groups only and validate direct URL behavior.',
    evidence: 'App scope screenshots + validation notes',
    ownerRole: 'M365 Admin',
    priority: 'critical',
    dueByDays: 7,
    dependsOn: ['ctrl-ca'],
    paths: ['baseline', 'pilot', 'advanced'],
    portalPath: 'Microsoft 365 admin center → Settings → Integrated apps',
    steps: [
      'Sign in to the Microsoft 365 admin center as a Global Administrator.',
      'Go to Settings → Integrated apps and locate both Copilot surfaces (Microsoft 365 Copilot and Microsoft 365 Copilot Chat).',
      'Open the first entry, set availability to "Specific users/groups", and assign only your approved pilot group.',
      'Repeat for the second Copilot entry so there is no split-surface gap where one entry stays open to everyone.',
      'Save changes and allow a short propagation window before testing.',
      'As an out-of-scope user, open the Copilot URL directly to confirm access is denied; as an in-scope user, confirm Copilot loads.'
    ],
    docLinks: [
      { label: 'Set up Microsoft 365 Copilot', url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup' },
      { label: 'Manage integrated apps', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/manage/manage-deployment-of-add-ins' }
    ],
    verify: 'Sign in as a user outside the approved group and browse directly to the Copilot URL – access should be blocked on both surfaces; an in-scope user should see Copilot normally.'
  },
  {
    id: 'ctrl-retention',
    type: 'control',
    domain: 'compliance',
    title: 'Retention coverage for Copilot location',
    why: 'Ensures lifecycle governance and discovery coverage.',
    how: 'Create/validate retention policy targeting Copilot and AI apps location and verify effective scope.',
    evidence: 'Retention policy summary export',
    ownerRole: 'Compliance Admin',
    priority: 'high',
    dueByDays: 10,
    paths: ['baseline', 'pilot', 'advanced'],
    portalPath: 'Microsoft Purview portal → Data Lifecycle Management → Policies → Retention policies',
    steps: [
      'Sign in to the Microsoft Purview portal as a Compliance Administrator or Records Management role holder.',
      'Go to Solutions → Data Lifecycle Management → Policies → Retention policies, then select + New retention policy.',
      'Name the policy (e.g. "Copilot interactions retention") and add a description.',
      'On the Locations page, turn ON "Microsoft 365 Copilot" under Microsoft Copilot experiences and turn the other locations off.',
      'Choose the retain and/or delete duration that matches your records schedule.',
      'Review and submit the policy, then allow time for it to reach "On (Success)" status.'
    ],
    docLinks: [
      { label: 'Retention for Copilot & AI apps', url: 'https://learn.microsoft.com/en-us/purview/retention-policies-copilot' },
      { label: 'Create & configure retention policies', url: 'https://learn.microsoft.com/en-us/purview/create-retention-policies' }
    ],
    verify: 'Confirm the policy status is "On (Success)", then use Content Search / eDiscovery to verify a test user’s Copilot prompts and responses are retained for the configured period.'
  },
  {
    id: 'ctrl-dlp',
    type: 'control',
    domain: 'compliance',
    title: 'DLP policy validation for Copilot location',
    why: 'Provides content controls for Copilot interaction paths.',
    how: 'Run Copilot-specific DLP policy in audit/simulation mode, execute controlled tests, and capture incident behavior.',
    evidence: 'DLP test matrix + incident report',
    ownerRole: 'CyberOps',
    priority: 'high',
    dueByDays: 14,
    dependsOn: ['ctrl-retention'],
    paths: ['pilot', 'advanced'],
    portalPath: 'Microsoft Purview portal → Data Loss Prevention → Policies',
    steps: [
      'Sign in to the Microsoft Purview portal with a Compliance Administrator or Data Security AI Admin role.',
      'Go to Data Loss Prevention → Policies and select + Create policy.',
      'Choose the Custom template, then Custom policy, and name it.',
      'On the Locations page, turn ON "Microsoft 365 Copilot and Copilot Chat" (selecting this location disables all other locations).',
      'Add a rule with the condition Content contains → Sensitive information types and choose the SITs to detect.',
      'Set the action (e.g. Prevent Copilot from processing content → Performing Web Searches, or Processing prompts).',
      'Turn the policy on in simulation/test mode first, run controlled prompts, review alerts, then enforce.'
    ],
    docLinks: [
      { label: 'Purview DLP for Microsoft 365 Copilot', url: 'https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about' }
    ],
    verify: 'In simulation mode, submit a test prompt containing a configured sensitive information type and confirm Copilot blocks the action per the rule and a DLP alert is generated.'
  },
  {
    id: 'ctrl-rss-rcd',
    type: 'control',
    domain: 'governance',
    title: 'Data aperture controls for SharePoint',
    why: 'Constrains discoverability while remediating oversharing.',
    how: 'Enable RSS via change process and apply RCD on high-risk sites pending remediation readiness.',
    evidence: 'PowerShell output + site validation artifacts',
    ownerRole: 'SharePoint Admin',
    priority: 'high',
    dueByDays: 14,
    paths: ['pilot', 'advanced'],
    portalPath: 'SharePoint Online Management Shell (PowerShell) + SharePoint Advanced Management (Restricted Content Discovery)',
    steps: [
      'Raise a change request – Restricted SharePoint Search (RSS) affects the whole organization search surface, not just Copilot.',
      'Connect to SharePoint Online Management Shell as a SharePoint Administrator.',
      'Enable RSS with: Set-SPOTenantRestrictedSearchMode -Mode Enabled.',
      'Curate the allowed list (up to 100 reviewed, governed sites) using Add-SPOTenantRestrictedSearchAllowedList for each site URL.',
      'For high-risk sites still pending remediation, apply Restricted Content Discovery (RCD) in SharePoint Advanced Management.',
      'Treat RSS as a temporary measure: remediate oversharing with SAM + Purview, then plan to disable RSS once permissions are validated.'
    ],
    docLinks: [
      { label: 'Restricted SharePoint Search', url: 'https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search' },
      { label: 'RSS admin PowerShell scripts', url: 'https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search-admin-scripts' },
      { label: 'Restricted Content Discovery', url: 'https://learn.microsoft.com/en-us/sharepoint/restricted-content-discovery' }
    ],
    verify: 'Run Get-SPOTenantRestrictedSearchMode and confirm it returns Enabled, then have a test user ask Copilot about content on an excluded site and confirm it no longer surfaces.'
  },
  {
    id: 'ctrl-web-approval',
    type: 'control',
    domain: 'governance',
    title: 'Formal approval for web-grounding path',
    why: 'Boundary-impacting behavior requires explicit authorization.',
    how: 'Compile risk pack, pilot evidence, residual risk statement, and obtain AO/ISSO approval before enablement.',
    evidence: 'Signed risk acceptance artifact',
    ownerRole: 'Security Officer',
    priority: 'critical',
    dueByDays: 21,
    dependsOn: ['ctrl-dlp', 'ctrl-rss-rcd'],
    paths: ['advanced'],
    portalPath: 'Authorization workflow (AO / ISSO sign-off) – governance, not a single admin portal',
    steps: [
      'Assemble the risk pack describing web-grounding behavior, the data flow, and a residual-risk statement.',
      'Attach pilot evidence: DLP test results, RSS/RCD posture, and retention coverage proof.',
      'Document compensating controls (e.g. DLP blocking web search when prompts contain sensitive information types).',
      'Route the package to your Authorizing Official (AO) / ISSO for explicit written authorization.',
      'Only after sign-off, enable the web-grounding setting for the approved scope – never broadly by default.'
    ],
    docLinks: [
      { label: 'Security for Microsoft 365 Copilot', url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-ai-security' },
      { label: 'DLP: block web search on sensitive prompts', url: 'https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about' }
    ],
    verify: 'A signed risk-acceptance artifact is on file, web grounding is enabled only for the approved group, and the DLP sensitive-info web-search block is validated against a test prompt.'
  },
  {
    id: 'task-briefing',
    type: 'task',
    domain: 'governance',
    title: 'Pilot user onboarding briefing',
    why: 'Behavioral controls reduce misuse and support load.',
    how: 'Deliver onboarding session with approved usage examples, escalation paths, and quick-start guides.',
    evidence: 'Attendance + deck artifact',
    ownerRole: 'Program Lead',
    priority: 'medium',
    dueByDays: 14,
    paths: ['pilot', 'advanced'],
    portalPath: 'Enablement & communications (no admin portal required)',
    steps: [
      'Build a short briefing deck covering approved use cases, what is in and out of scope, and data-handling do’s and don’ts.',
      'Add escalation paths and where pilot users go for help.',
      'Include quick-start prompts and links to your org-approved guidance.',
      'Deliver a live session (or share a recording) to the pilot group and capture an attendance record.'
    ],
    docLinks: [
      { label: 'Microsoft 365 Copilot adoption hub', url: 'https://adoption.microsoft.com/en-us/copilot/' },
      { label: 'Copilot end-user enablement resources', url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-enablement-resources' }
    ],
    verify: 'Attendance list is captured and the briefing deck or session recording is stored in your evidence location and linked from this item.'
  },
  {
    id: 'task-helpdesk',
    type: 'task',
    domain: 'access',
    title: 'Helpdesk triage runbook',
    why: 'Improves issue routing and user confidence.',
    how: 'Publish support flow with known issues, ownership matrix, and escalation criteria.',
    evidence: 'Runbook link',
    ownerRole: 'Helpdesk Lead',
    priority: 'medium',
    dueByDays: 18,
    paths: ['baseline', 'pilot', 'advanced'],
    portalPath: 'Operations & support (no admin portal required)',
    steps: [
      'Define the support flow: intake → triage → ownership → escalation.',
      'Document the top known issues and the first-response steps for each.',
      'Publish an ownership matrix mapping issue types to owners (Identity, SharePoint, Purview, app owners).',
      'Set escalation criteria and SLAs, then link the runbook in your helpdesk channel.'
    ],
    docLinks: [
      { label: 'Copilot enablement resources', url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-enablement-resources' }
    ],
    verify: 'The runbook is published and linked in the helpdesk channel, and a test ticket routes to the correct owner per the ownership matrix.'
  }
]

function withCloudAdjustments(items: V2WorkItem[], cloud: V2Cloud): V2WorkItem[] {
  if (cloud === 'commercial') {
    return items.map((i) =>
      i.id === 'ctrl-rss-rcd'
        ? { ...i, how: 'Apply SharePoint governance controls and staged site admission criteria aligned to your tenant policy.' }
        : i
    )
  }
  if (cloud === 'gcc') {
    return items.map((i) =>
      i.id === 'ctrl-web-approval'
        ? { ...i, how: 'Use security approval workflow for web grounding enablement with documented pilot evidence and sign-off.' }
        : i
    )
  }
  return items
}

export const v2Templates: V2Template[] = [
  {
    id: 'gcch',
    label: 'GCC High',
    shellSubtitle: 'Sovereign onboarding workspace',
    guidance: 'Federal-first controls, explicit boundary handling, and evidence-led deployment.',
    paths: [
      { id: 'baseline', label: 'Secure Baseline', effort: 'Medium', risk: 'Low', summary: 'Identity/access/compliance baseline with controlled enablement.' },
      { id: 'pilot', label: 'Pilot-First', effort: 'High', risk: 'Low', summary: 'Controlled pilot with evidence before expansion.' },
      { id: 'advanced', label: 'Advanced Web + Extensibility', effort: 'High', risk: 'Medium', summary: 'Adds boundary-impacting features with formal approval gates.' }
    ],
    work: withCloudAdjustments(baseWork, 'gcch')
  },
  {
    id: 'gcc',
    label: 'GCC',
    shellSubtitle: 'Government onboarding workspace',
    guidance: 'Policy-first onboarding with role accountability and staged expansion.',
    paths: [
      { id: 'baseline', label: 'Secure Baseline', effort: 'Medium', risk: 'Low', summary: 'Control baseline and support readiness.' },
      { id: 'pilot', label: 'Pilot-First', effort: 'High', risk: 'Low', summary: 'Pilot and evidence-driven rollout decisions.' },
      { id: 'advanced', label: 'Advanced Web + Extensibility', effort: 'High', risk: 'Medium', summary: 'Additional controls for web and advanced capabilities.' }
    ],
    work: withCloudAdjustments(baseWork, 'gcc')
  },
  {
    id: 'commercial',
    label: 'Commercial',
    shellSubtitle: 'Enterprise onboarding workspace',
    guidance: 'Fast-start with governance discipline and clear operational ownership.',
    paths: [
      { id: 'baseline', label: 'Secure Baseline', effort: 'Low', risk: 'Low', summary: 'Quick secure setup with core controls.' },
      { id: 'pilot', label: 'Pilot-First', effort: 'Medium', risk: 'Low', summary: 'Pilot validation before broad rollout.' },
      { id: 'advanced', label: 'Advanced Web + Extensibility', effort: 'High', risk: 'Medium', summary: 'Adds advanced controls and approval workflows.' }
    ],
    work: withCloudAdjustments(baseWork, 'commercial')
  }
]

export function getV2Template(id: V2Cloud): V2Template {
  return v2Templates.find((t) => t.id === id) || v2Templates[0]
}

export const v2RoleKits = [
  {
    id: 'exec',
    name: 'Leaders',
    outcomes: 'Approve path, manage risk appetite, and unblock critical decisions.',
    checklist: ['Approve scope and sequencing.', 'Review blockers weekly.', 'Sign risk decisions and exceptions.']
  },
  {
    id: 'security',
    name: 'Security and Compliance',
    outcomes: 'Validate controls and evidence quality.',
    checklist: ['Run control test plan.', 'Confirm retention/DLP/audit coverage.', 'Track unresolved control gaps.']
  },
  {
    id: 'admin',
    name: 'IT and Platform Admins',
    outcomes: 'Implement and sustain policy configuration.',
    checklist: ['Apply app and identity scopes.', 'Validate endpoint prerequisites.', 'Publish admin operation notes.']
  },
  {
    id: 'helpdesk',
    name: 'Helpdesk and Support',
    outcomes: 'Provide consistent user support and escalation.',
    checklist: ['Adopt triage runbook.', 'Route policy incidents correctly.', 'Maintain issue knowledge base.']
  },
  {
    id: 'users',
    name: 'Pilot and End Users',
    outcomes: 'Use Copilot safely and effectively.',
    checklist: ['Attend onboarding.', 'Use approved prompts/behaviors.', 'Report anomalies quickly.']
  }
]

export const v2Cadence = [
  { id: 'weekly', title: 'Weekly readiness standup', rhythm: 'Weekly', owner: 'Program Lead', output: 'Updated owner/action/blocker table.' },
  { id: 'monthly', title: 'Monthly controls verification', rhythm: 'Monthly', owner: 'Security', output: 'Evidence refresh and gap closure plan.' },
  { id: 'quarterly', title: 'Quarterly operating review', rhythm: 'Quarterly', owner: 'Leadership', output: 'Path/risk recalibration and roadmap updates.' }
]

export const V2_SCHEMA_VERSION = '2.0.0'
export const V2_APP_VERSION = 'onboarding-v2'
