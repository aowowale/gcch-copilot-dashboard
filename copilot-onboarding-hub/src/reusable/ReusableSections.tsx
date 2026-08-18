import { useMemo, useState } from 'react'
import { SectionHead } from '../components/Primitives'
import { getRoleMode, LEMON_KEYS, useWorkspaceState } from './workspaceState'

type Severity = 'Low' | 'Medium' | 'High' | 'Critical'
type ItemStatus = 'Open' | 'In Progress' | 'Resolved'

export function ReusableRss() {
  const [cfg, setCfg] = useWorkspaceState(LEMON_KEYS.rss, {
    mode: 'restricted' as 'restricted' | 'open',
    allowedSites: 0,
    totalSites: 0,
    hasAllowList: false,
    owner: 'SharePoint Admin',
    note: '',
  }, 'rss')
  const canEdit = getRoleMode() !== 'viewer'

  const posture = cfg.mode === 'restricted'
    ? 'Restricted mode is active. Content discoverability is controlled by allow-list decisions.'
    : 'Restricted mode is not active. Discovery is governed through other SharePoint and Purview controls.'

  return (
    <>
      <SectionHead num="06" title="Data Aperture (RSS)">
        Reusable tenant posture worksheet. Capture your current RSS configuration and impact.
      </SectionHead>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-h">Current posture</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Mode</div>
            <select className="ci-owner-input" value={cfg.mode} onChange={(e) => setCfg((s) => ({ ...s, mode: e.target.value as 'restricted' | 'open' }))} disabled={!canEdit}>
              <option value="restricted">Restricted</option>
              <option value="open">Open</option>
            </select>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Allow-list active</div>
            <select className="ci-owner-input" value={cfg.hasAllowList ? 'yes' : 'no'} onChange={(e) => setCfg((s) => ({ ...s, hasAllowList: e.target.value === 'yes' }))} disabled={!canEdit}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Sites in allow list</div>
            <input className="ci-owner-input" type="number" min={0} value={cfg.allowedSites} onChange={(e) => setCfg((s) => ({ ...s, allowedSites: Number(e.target.value || 0) }))} disabled={!canEdit} />
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Total in-scope sites</div>
            <input className="ci-owner-input" type="number" min={0} value={cfg.totalSites} onChange={(e) => setCfg((s) => ({ ...s, totalSites: Number(e.target.value || 0) }))} disabled={!canEdit} />
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Control owner</div>
            <input className="ci-owner-input" value={cfg.owner} onChange={(e) => setCfg((s) => ({ ...s, owner: e.target.value }))} disabled={!canEdit} />
          </div>
        </div>

        <div className="card">
          <div className="card-h">Interpretation</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <p>{posture}</p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Coverage</div>
            <p>
              {cfg.totalSites > 0
                ? `${cfg.allowedSites}/${cfg.totalSites} sites admitted (${Math.round((cfg.allowedSites / cfg.totalSites) * 100)}%).`
                : 'Set total in-scope site count to calculate coverage.'}
            </p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Reusable guidance</div>
            <ul className="pd-list" style={{ fontSize: 12.5 }}>
              <li>Document whether RSS is tenant-wide or pilot-scoped in your change record.</li>
              <li>Define clear criteria for admitting sites to the allow list.</li>
              <li>Pair RSS posture with DLP and retention evidence, not as a standalone control.</li>
            </ul>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Tenant notes</div>
            <textarea className="ci-owner-input" rows={4} value={cfg.note} onChange={(e) => setCfg((s) => ({ ...s, note: e.target.value }))} placeholder="Capture tenant-specific caveats or decision notes." disabled={!canEdit} />
          </div>
        </div>
      </div>
    </>
  )
}

export function ReusableTracker() {
  type TrackItem = { id: string; title: string; owner: string; due: string; status: ItemStatus; notes: string }
  const [items, setItems] = useWorkspaceState<TrackItem[]>(LEMON_KEYS.tracker, [
    { id: 'trk-1', title: 'Confirm identity baseline controls', owner: 'Identity Admin', due: '', status: 'Open', notes: '' },
    { id: 'trk-2', title: 'Run pilot test plan', owner: 'Program Lead', due: '', status: 'Open', notes: '' },
  ], 'tracker')
  const canEdit = getRoleMode() !== 'viewer'

  const edit = (id: string, patch: Partial<TrackItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  const add = () => {
    if (!canEdit) return
    setItems((prev) => [{ id: `trk-${Date.now()}`, title: 'New tracker item', owner: '', due: '', status: 'Open', notes: '' }, ...prev])
  }
  const remove = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id))

  return (
    <>
      <SectionHead num="11" title="Live Tracker">
        Lemon-native tracker for tasks, owners, due dates, and status. No external iframe dependency.
      </SectionHead>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button className="btn" onClick={add} disabled={!canEdit}>+ Add tracker item</button>
        <span className="badge badge-pending">{items.length} item(s)</span>
      </div>
      {items.map((it) => (
        <div className="card" key={it.id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
            <input className="ci-owner-input" value={it.title} onChange={(e) => edit(it.id, { title: e.target.value })} disabled={!canEdit} />
            <input className="ci-owner-input" value={it.owner} onChange={(e) => edit(it.id, { owner: e.target.value })} placeholder="Owner" disabled={!canEdit} />
            <input className="ci-owner-input" type="date" value={it.due} onChange={(e) => edit(it.id, { due: e.target.value })} disabled={!canEdit} />
            <select className="ci-owner-input" value={it.status} onChange={(e) => edit(it.id, { status: e.target.value as ItemStatus })} disabled={!canEdit}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <button className="btn" onClick={() => remove(it.id)} disabled={!canEdit}>Remove</button>
          </div>
          <textarea className="ci-owner-input" style={{ marginTop: 8 }} rows={2} value={it.notes} onChange={(e) => edit(it.id, { notes: e.target.value })} placeholder="Notes" disabled={!canEdit} />
        </div>
      ))}
    </>
  )
}

export function ReusableSam() {
  type Workstream = 'SharePoint & SAM' | 'Microsoft Teams'
  type ReadinessStage = 'Not assessed' | 'Findings identified' | 'Remediation underway' | 'Validation needed' | 'Ready'
  type Applicability = 'Commercial, GCC, and GCC High' | 'Validate in tenant'
  type ValidationResult = 'Not tested' | 'Pass' | 'Fail'
  type SamFinding = {
    id: string
    title: string
    workstream?: Workstream
    category?: string
    severity: Severity
    status?: ItemStatus
    stage?: ReadinessStage
    owner: string
    affectedScope?: number
    targetScope?: number
    due?: string
    impact?: string
    evidence?: string
    applicability?: Applicability
    testQuestion?: string
    expectedSource?: string
    permittedPersona?: string
    prohibitedPersona?: string
    freshnessRequirement?: string
    citationResult?: ValidationResult
    boundaryResult?: ValidationResult
    notes: string
  }
  type FindingTemplate = Omit<SamFinding, 'id' | 'stage' | 'affectedScope' | 'targetScope' | 'due' | 'evidence'> & { id: string }

  const findingTemplates: FindingTemplate[] = [
    {
      id: 'ownerless-sites',
      title: 'Orphaned sites and groups need accountable owners',
      workstream: 'SharePoint & SAM',
      category: 'Ownership review',
      severity: 'High',
      owner: 'SharePoint Admin',
      impact: 'Unowned workspaces can retain stale access and content without a business decision maker.',
      applicability: 'Commercial, GCC, and GCC High',
      notes: 'Inventory sites and connected groups without active owners, assign an accountable owner, and record the attestation result.',
    },
    {
      id: 'broad-sharing',
      title: 'Broad, external, or unique permissions need review',
      workstream: 'SharePoint & SAM',
      category: 'Oversharing',
      severity: 'Critical',
      owner: 'SharePoint Admin',
      impact: 'Copilot respects existing access, so outdated or overly broad permissions can amplify an existing oversharing problem.',
      applicability: 'Commercial, GCC, and GCC High',
      notes: 'Review broad links, external access, and unique permissions; remove inappropriate access and retain approved exceptions.',
    },
    {
      id: 'stale-content',
      title: 'Inactive sites and stale content need lifecycle decisions',
      workstream: 'SharePoint & SAM',
      category: 'Inactive sites',
      severity: 'High',
      owner: 'Records and SharePoint Admins',
      impact: 'Obsolete content can reduce answer quality and create avoidable governance risk.',
      applicability: 'Commercial, GCC, and GCC High',
      notes: 'Classify each location for retention, remediation, archival through an approved process, or disposition. Do not treat manual copying as the default archive method.',
    },
    {
      id: 'rcd-transition',
      title: 'Temporary RCD scope needs an exit plan',
      workstream: 'SharePoint & SAM',
      category: 'RCD scope',
      severity: 'High',
      owner: 'SharePoint Admin',
      impact: 'Restricted Content Discovery limits discovery but does not remove user access or fix underlying permissions.',
      applicability: 'Validate in tenant',
      notes: 'Record why each site is restricted, the underlying access remediation owner, the review date, and the condition for removing the temporary restriction.',
    },
    {
      id: 'grounded-answer-test',
      title: 'Grounded answers need citation and permission-boundary testing',
      workstream: 'SharePoint & SAM',
      category: 'Answer quality validation',
      severity: 'High',
      owner: 'Pilot Test Lead',
      impact: 'A technically available answer is not ready until its source, citation, freshness, and user-specific access behavior are validated.',
      applicability: 'Validate in tenant',
      citationResult: 'Not tested',
      boundaryResult: 'Not tested',
      notes: 'Record the test question, expected authoritative source, permitted and prohibited personas, freshness requirement, citation result, and acceptable abstention behavior.',
    },
    {
      id: 'teams-lifecycle',
      title: 'Inactive or ownerless teams need lifecycle review',
      workstream: 'Microsoft Teams',
      category: 'Lifecycle and ownership',
      severity: 'High',
      owner: 'Teams Admin',
      impact: 'Stale collaboration spaces can retain access and content without an accountable business owner.',
      applicability: 'Commercial, GCC, and GCC High',
      notes: 'Validate owners, activity, guests, connected group and SharePoint resources, retention obligations, and the approved lifecycle decision.',
    },
    {
      id: 'connector-assessment',
      title: 'Agent or connector requires security and quality assessment',
      workstream: 'SharePoint & SAM',
      category: 'Agents and connectors',
      severity: 'High',
      owner: 'AI Platform Owner',
      impact: 'External knowledge can expand value and risk through identity mapping, crawl scope, synchronization latency, and source permissions.',
      applicability: 'Validate in tenant',
      notes: 'Confirm cloud availability, licensing, authentication, ACL and identity mapping, indexed scope, crawl latency, data handling, source ownership, rollback, and answer-quality tests before rollout.',
    },
  ]
  const [findings, setFindings] = useWorkspaceState<SamFinding[]>(LEMON_KEYS.sam, [
    {
      id: 'sam-1',
      title: 'Sites with broad or unclear access',
      workstream: 'SharePoint & SAM',
      category: 'Oversharing',
      severity: 'High',
      stage: 'Findings identified',
      owner: 'SharePoint Admin',
      affectedScope: 249,
      targetScope: 0,
      impact: 'Copilot may surface content to people who already have access but should no longer need it.',
      evidence: '',
      applicability: 'Commercial, GCC, and GCC High',
      notes: '',
    },
    {
      id: 'teams-1',
      title: 'Inactive or ownerless teams need review',
      workstream: 'Microsoft Teams',
      category: 'Lifecycle and ownership',
      severity: 'High',
      stage: 'Not assessed',
      owner: 'Teams Admin',
      affectedScope: 0,
      targetScope: 0,
      impact: 'Stale collaboration spaces can retain access and content without an accountable business owner.',
      evidence: '',
      applicability: 'Commercial, GCC, and GCC High',
      notes: '',
    },
  ], 'sam')
  const canEdit = getRoleMode() !== 'viewer'

  const workstreams: Workstream[] = ['SharePoint & SAM', 'Microsoft Teams']
  const stages: ReadinessStage[] = ['Not assessed', 'Findings identified', 'Remediation underway', 'Validation needed', 'Ready']
  const categories: Record<Workstream, string[]> = {
    'SharePoint & SAM': ['Oversharing', 'Sensitivity labels', 'Inactive sites', 'Legacy protection', 'Pilot search scope', 'RCD scope', 'Ownership review', 'Answer quality validation', 'Agents and connectors'],
    'Microsoft Teams': ['Lifecycle and ownership', 'Guest and external access', 'Public teams', 'Stale channels', 'Sensitivity labels', 'Connected SharePoint content'],
  }

  const hasValidationEvidence = (finding: SamFinding) => {
    if (!finding.evidence?.trim()) return false
    if (finding.category !== 'Answer quality validation') return true
    return Boolean(
      finding.testQuestion?.trim()
      && finding.expectedSource?.trim()
      && finding.permittedPersona?.trim()
      && finding.prohibitedPersona?.trim()
      && finding.freshnessRequirement?.trim()
      && finding.citationResult === 'Pass'
      && finding.boundaryResult === 'Pass',
    )
  }

  const normalizedStage = (finding: SamFinding): ReadinessStage => {
    if (finding.stage === 'Ready' && !hasValidationEvidence(finding)) return 'Validation needed'
    if (finding.stage) return finding.stage
    if (finding.status === 'Resolved') return 'Ready'
    if (finding.status === 'In Progress') return 'Remediation underway'
    return 'Findings identified'
  }

  const rollups = useMemo(() => workstreams.map((workstream) => {
    const items = findings.filter((finding) => (finding.workstream || 'SharePoint & SAM') === workstream)
    const ready = items.filter((finding) => normalizedStage(finding) === 'Ready').length
    const blocked = items.filter((finding) => finding.severity === 'Critical' && normalizedStage(finding) !== 'Ready').length
    const status = items.length === 0
      ? 'Not assessed'
      : ready === items.length
        ? 'Ready'
        : blocked > 0
          ? 'Blocked'
          : 'Needs attention'
    return { workstream, total: items.length, ready, status }
  }), [findings])

  const edit = (id: string, patch: Partial<SamFinding>) => setFindings((prev) => prev.map((finding) => {
    if (finding.id !== id) return finding
    const next = { ...finding, ...patch }
    if (next.stage === 'Ready' && !hasValidationEvidence(next)) next.stage = 'Validation needed'
    return next
  }))
  const add = (workstream: Workstream) => {
    if (!canEdit) return
    setFindings((prev) => [{
      id: `ready-${Date.now()}`,
      title: 'New readiness finding',
      workstream,
      category: categories[workstream][0],
      severity: 'Medium',
      stage: 'Findings identified',
      owner: '',
      affectedScope: 0,
      targetScope: 0,
      due: '',
      impact: '',
      evidence: '',
      applicability: 'Commercial, GCC, and GCC High',
      notes: '',
    }, ...prev])
  }
  const addTemplate = (templateId: string) => {
    if (!canEdit) return
    const template = findingTemplates.find((item) => item.id === templateId)
    if (!template) return
    setFindings((prev) => [{
      ...template,
      id: `ready-${Date.now()}`,
      stage: 'Findings identified',
      affectedScope: 0,
      targetScope: 0,
      due: '',
      evidence: '',
    }, ...prev])
  }
  const remove = (id: string) => setFindings((prev) => prev.filter((f) => f.id !== id))

  return (
    <>
      <SectionHead num="14" title="Get Copilot Ready">
        Find, fix, and validate the content and collaboration issues that matter most for tenant-grounded Copilot.
      </SectionHead>

      <div className="card" style={{ marginBottom: 12, background: 'var(--sky)' }}>
        <div className="card-h">How readiness work moves</div>
        <p style={{ fontSize: 13, marginTop: 6 }}>Assess the tenant, turn findings into owned cleanup work, validate the result, and retain evidence. “Ready” means the target was met and checked, not simply that work was attempted.</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {stages.map((stage, index) => <span className="badge badge-pending" key={stage}>{index + 1}. {stage}</span>)}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-h">Start from a field-informed control</div>
        <p style={{ fontSize: 13, marginTop: 6 }}>Choose a reusable control, then replace the example scope with tenant evidence. Customer-specific techniques remain examples, not required procedures.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="ci-owner-input" aria-label="Field-informed readiness template" defaultValue="">
            <option value="" disabled>Select a control template</option>
            {findingTemplates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}
          </select>
          <button className="btn btn-primary" disabled={!canEdit} onClick={(event) => {
            const select = event.currentTarget.previousElementSibling as HTMLSelectElement | null
            if (select?.value) addTemplate(select.value)
          }}>Add selected control</button>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        {rollups.map((rollup) => (
          <div className="card" key={rollup.workstream}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <div className="card-h">{rollup.workstream}</div>
              <span className={`badge ${rollup.status === 'Ready' ? 'badge-done' : rollup.status === 'Blocked' ? 'badge-red' : rollup.status === 'Not assessed' ? 'badge-pending' : 'badge-progress'}`}>{rollup.status}</span>
            </div>
            <p style={{ marginTop: 8 }}>{rollup.ready} of {rollup.total} finding(s) validated and ready.</p>
            <button className="btn" style={{ marginTop: 10 }} onClick={() => add(rollup.workstream)} disabled={!canEdit}>+ Add {rollup.workstream === 'Microsoft Teams' ? 'Teams' : 'SharePoint'} finding</button>
          </div>
        ))}
      </div>

      {findings.map((f) => (
        <div className="card" key={f.id} style={{ marginTop: 10 }}>
          <div className="readiness-edit-grid readiness-edit-grid-primary">
            <input className="ci-owner-input" value={f.title} onChange={(e) => edit(f.id, { title: e.target.value })} disabled={!canEdit} />
            <select className="ci-owner-input" value={f.workstream || 'SharePoint & SAM'} onChange={(e) => {
              const workstream = e.target.value as Workstream
              edit(f.id, { workstream, category: categories[workstream][0] })
            }} disabled={!canEdit}>
              {workstreams.map((workstream) => <option key={workstream}>{workstream}</option>)}
            </select>
            <select className="ci-owner-input" value={f.severity} onChange={(e) => edit(f.id, { severity: e.target.value as Severity })} disabled={!canEdit}>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
            <button className="btn" onClick={() => remove(f.id)} disabled={!canEdit}>Remove</button>
          </div>

          <div className="readiness-edit-grid readiness-edit-grid-secondary">
            <select className="ci-owner-input" value={f.category || categories[f.workstream || 'SharePoint & SAM'][0]} onChange={(e) => edit(f.id, { category: e.target.value })} disabled={!canEdit}>
              {categories[f.workstream || 'SharePoint & SAM'].map((category) => <option key={category}>{category}</option>)}
            </select>
            <select className="ci-owner-input" value={normalizedStage(f)} onChange={(e) => edit(f.id, { stage: e.target.value as ReadinessStage })} disabled={!canEdit}>
              {stages.map((stage) => <option key={stage} disabled={stage === 'Ready' && !hasValidationEvidence(f)}>{stage}</option>)}
            </select>
            <input className="ci-owner-input" value={f.owner} onChange={(e) => edit(f.id, { owner: e.target.value })} placeholder="Accountable owner" disabled={!canEdit} />
            <input className="ci-owner-input" type="date" value={f.due || ''} onChange={(e) => edit(f.id, { due: e.target.value })} aria-label="Target resolution date" disabled={!canEdit} />
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-pending">Applicability</span>
            <select className="ci-owner-input" aria-label="Environment applicability" value={f.applicability || 'Commercial, GCC, and GCC High'} onChange={(e) => edit(f.id, { applicability: e.target.value as Applicability })} disabled={!canEdit}>
              <option>Commercial, GCC, and GCC High</option>
              <option>Validate in tenant</option>
            </select>
          </div>

          <div className="grid grid-2" style={{ marginTop: 8 }}>
            <div className="ci-block">
              <div className="ci-l">Affected scope</div>
              <input className="ci-owner-input" type="number" min={0} value={f.affectedScope ?? 0} onChange={(e) => edit(f.id, { affectedScope: Number(e.target.value || 0) })} aria-label="Affected sites or teams" disabled={!canEdit} />
            </div>
            <div className="ci-block">
              <div className="ci-l">Target remaining</div>
              <input className="ci-owner-input" type="number" min={0} value={f.targetScope ?? 0} onChange={(e) => edit(f.id, { targetScope: Number(e.target.value || 0) })} aria-label="Target remaining sites or teams" disabled={!canEdit} />
            </div>
          </div>

          <textarea className="ci-owner-input" rows={2} style={{ marginTop: 8 }} value={f.impact || ''} onChange={(e) => edit(f.id, { impact: e.target.value })} placeholder="Explain in plain language why this could affect Copilot readiness." disabled={!canEdit} />
          <textarea className="ci-owner-input" rows={2} style={{ marginTop: 8 }} value={f.notes} onChange={(e) => edit(f.id, { notes: e.target.value })} placeholder="Remediation plan, dependencies, and approved exceptions." disabled={!canEdit} />
          {f.category === 'Answer quality validation' && (
            <div className="ci-block" style={{ marginTop: 8 }}>
              <div className="card-h" style={{ marginBottom: 8 }}>Grounded-answer test</div>
              <div className="grid grid-2">
                <input className="ci-owner-input" value={f.testQuestion || ''} onChange={(e) => edit(f.id, { testQuestion: e.target.value })} placeholder="Representative test question" disabled={!canEdit} />
                <input className="ci-owner-input" value={f.expectedSource || ''} onChange={(e) => edit(f.id, { expectedSource: e.target.value })} placeholder="Expected authoritative source" disabled={!canEdit} />
                <input className="ci-owner-input" value={f.permittedPersona || ''} onChange={(e) => edit(f.id, { permittedPersona: e.target.value })} placeholder="Persona that should receive the answer" disabled={!canEdit} />
                <input className="ci-owner-input" value={f.prohibitedPersona || ''} onChange={(e) => edit(f.id, { prohibitedPersona: e.target.value })} placeholder="Persona that must not receive the answer" disabled={!canEdit} />
                <input className="ci-owner-input" value={f.freshnessRequirement || ''} onChange={(e) => edit(f.id, { freshnessRequirement: e.target.value })} placeholder="Freshness requirement" disabled={!canEdit} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="ci-owner-input" aria-label="Citation result" value={f.citationResult || 'Not tested'} onChange={(e) => edit(f.id, { citationResult: e.target.value as ValidationResult })} disabled={!canEdit}>
                    <option>Not tested</option><option>Pass</option><option>Fail</option>
                  </select>
                  <select className="ci-owner-input" aria-label="Permission boundary result" value={f.boundaryResult || 'Not tested'} onChange={(e) => edit(f.id, { boundaryResult: e.target.value as ValidationResult })} disabled={!canEdit}>
                    <option>Not tested</option><option>Pass</option><option>Fail</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <input className="ci-owner-input" style={{ marginTop: 8 }} value={f.evidence || ''} onChange={(e) => edit(f.id, { evidence: e.target.value })} placeholder="Validation evidence link or reference" disabled={!canEdit} />
          {normalizedStage(f) === 'Validation needed' && !hasValidationEvidence(f) && (
            <p style={{ marginTop: 6, color: 'var(--amber)', fontSize: 12.5 }}>{f.category === 'Answer quality validation' ? 'Complete the grounded-answer fields, pass both checks, and add evidence before marking this finding Ready.' : 'Add validation evidence before marking this finding Ready.'}</p>
          )}

          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Show remediation guidance</summary>
            <ol className="pd-list" style={{ fontSize: 12.5, marginTop: 8 }}>
              <li>Confirm the affected scope and identify an accountable business or service owner.</li>
              <li>Review access, lifecycle, and sensitivity requirements before changing or deleting content.</li>
              <li>Remediate in a controlled batch and record exceptions with an approver and review date.</li>
              <li>Repeat the assessment or access review to verify the target was met.</li>
              <li>Link the validation result before moving this finding to Ready.</li>
            </ol>
          </details>
        </div>
      ))}
    </>
  )
}

export function ReusableLessons() {
  type Lesson = { id: string; title: string; detail: string; takeaway: string }
  const [lessons, setLessons] = useWorkspaceState<Lesson[]>(LEMON_KEYS.lessons, [
    { id: 'lsn-1', title: 'Policy clarity accelerates adoption', detail: 'Teams moved faster when acceptable-use examples were explicit.', takeaway: 'Publish practical do/dont examples early.' },
  ], 'lessons')
  const canEdit = getRoleMode() !== 'viewer'

  const edit = (id: string, patch: Partial<Lesson>) => setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const add = () => {
    if (!canEdit) return
    setLessons((prev) => [{ id: `lsn-${Date.now()}`, title: 'New lesson', detail: '', takeaway: '' }, ...prev])
  }
  const remove = (id: string) => setLessons((prev) => prev.filter((l) => l.id !== id))

  return (
    <>
      <SectionHead num="15" title="Lessons Learned">
        Add, edit, and retain lessons from each rollout so future teams start ahead.
      </SectionHead>
      <button className="btn" onClick={add} disabled={!canEdit}>+ Add lesson</button>
      {lessons.map((l) => (
        <div className="card" key={l.id} style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="ci-owner-input" value={l.title} onChange={(e) => edit(l.id, { title: e.target.value })} disabled={!canEdit} />
            <button className="btn" onClick={() => remove(l.id)} disabled={!canEdit}>Remove</button>
          </div>
          <textarea className="ci-owner-input" rows={3} style={{ marginTop: 8 }} value={l.detail} onChange={(e) => edit(l.id, { detail: e.target.value })} placeholder="What happened?" disabled={!canEdit} />
          <textarea className="ci-owner-input" rows={2} style={{ marginTop: 8 }} value={l.takeaway} onChange={(e) => edit(l.id, { takeaway: e.target.value })} placeholder="What should the next team do differently?" disabled={!canEdit} />
        </div>
      ))}
    </>
  )
}

export function ReusableAsk() {
  type AskItem = { id: string; title: string; rationale: string; decision: 'Pending' | 'Approved' | 'Deferred' | 'Questioned' }
  const [asks, setAsks] = useWorkspaceState<AskItem[]>(LEMON_KEYS.asks, [
    { id: 'ask-1', title: 'Approve pilot scope and participants', rationale: 'Required to start controlled rollout.', decision: 'Pending' },
    { id: 'ask-2', title: 'Approve security gate criteria', rationale: 'Defines objective pass/fail for scale decision.', decision: 'Pending' },
  ], 'asks')
  const canEdit = getRoleMode() !== 'viewer'

  const edit = (id: string, patch: Partial<AskItem>) => setAsks((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  const add = () => {
    if (!canEdit) return
    setAsks((prev) => [{ id: `ask-${Date.now()}`, title: 'New ask', rationale: '', decision: 'Pending' }, ...prev])
  }
  const remove = (id: string) => setAsks((prev) => prev.filter((a) => a.id !== id))

  const counts = useMemo(() => {
    return {
      approved: asks.filter((a) => a.decision === 'Approved').length,
      pending: asks.filter((a) => a.decision === 'Pending').length,
    }
  }, [asks])

  return (
    <>
      <SectionHead num="16" title="Executive Ask">
        Customer-owned asks. Add, edit, or remove asks for each engagement.
      </SectionHead>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button className="btn" onClick={add} disabled={!canEdit}>+ Add ask</button>
        <span className="badge badge-progress">{counts.approved} approved · {counts.pending} pending</span>
      </div>
      {asks.map((a) => (
        <div className="card" key={a.id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8 }}>
            <input className="ci-owner-input" value={a.title} onChange={(e) => edit(a.id, { title: e.target.value })} disabled={!canEdit} />
            <select className="ci-owner-input" value={a.decision} onChange={(e) => edit(a.id, { decision: e.target.value as AskItem['decision'] })} disabled={!canEdit}>
              <option>Pending</option>
              <option>Approved</option>
              <option>Deferred</option>
              <option>Questioned</option>
            </select>
            <button className="btn" onClick={() => remove(a.id)} disabled={!canEdit}>Remove</button>
          </div>
          <textarea className="ci-owner-input" rows={2} style={{ marginTop: 8 }} value={a.rationale} onChange={(e) => edit(a.id, { rationale: e.target.value })} placeholder="Rationale and decision context" disabled={!canEdit} />
        </div>
      ))}
    </>
  )
}
