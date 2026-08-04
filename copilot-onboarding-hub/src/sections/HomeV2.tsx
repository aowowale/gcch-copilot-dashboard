import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { SectionHead } from '../components/Primitives'
import { appendAudit, getRoleMode } from '../reusable/workspaceState'
import { GuidedActionCard } from '../reusable/GuidedActionCard'
import {
  getV2Template,
  v2Cadence,
  v2RoleKits,
  V2_APP_VERSION,
  V2_SCHEMA_VERSION,
  type V2Cloud,
  type V2Path,
  type V2Priority,
  type V2Status,
  type V2WorkItem,
  type V2Template
} from '../data/onboardingV2'

interface V2Profile {
  teamName: string
  cloud: V2Cloud
  path: V2Path
  teamSize: string
  owner: string
  riskPosture: 'low' | 'balanced' | 'strict'
  archetype: 'regulated' | 'pilot' | 'enterprise'
}

interface V2State {
  profile: V2Profile
  workStatus: Record<string, V2Status>
  workOwners: Record<string, string>
  workDue: Record<string, string>
  workSteps: Record<string, number[]>
  blockers: Array<{ id: string; title: string; owner: string; severity: 'Low' | 'Medium' | 'High'; status: 'Open' | 'Resolved'; linkedWorkId?: string }>
  evidence: Array<{
    id: string
    title: string
    owner: string
    status: 'missing' | 'partial' | 'complete'
    link: string
    linkedWorkId?: string
    linkType?: 'runbook' | 'screenshot' | 'ticket' | 'report' | 'other'
    validatedOn?: string
    reviewer?: string
  }>
}

const KEY = 'copilot_onboarding_v2_state'
const REQUIRED_SCHEMA_MAJOR = '2'

const archetypePresets: Record<V2Profile['archetype'], Partial<V2Profile>> = {
  regulated: { path: 'baseline', riskPosture: 'strict', teamSize: '20-50' },
  pilot: { path: 'pilot', riskPosture: 'balanced', teamSize: '20-50' },
  enterprise: { path: 'advanced', riskPosture: 'balanced', teamSize: '200+' },
}

const PRI_WEIGHT: Record<V2Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const ST_WEIGHT: Record<V2Status, number> = { blocked: 0, 'in-progress': 1, 'not-started': 2, done: 3 }

function clsStatus(status: V2Status) {
  if (status === 'done') return 'badge badge-done'
  if (status === 'in-progress') return 'badge badge-progress'
  if (status === 'blocked') return 'badge badge-red'
  return 'badge badge-pending'
}

function prettyStatus(status: V2Status) {
  if (status === 'in-progress') return 'In Progress'
  if (status === 'not-started') return 'Not Started'
  return status[0].toUpperCase() + status.slice(1)
}

function toISODate(daysFromNow: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

function seedFromTemplate(template: V2Template): Pick<V2State, 'workStatus' | 'workOwners' | 'workDue'> {
  const workStatus: Record<string, V2Status> = {}
  const workOwners: Record<string, string> = {}
  const workDue: Record<string, string> = {}
  template.work.forEach((w) => {
    workStatus[w.id] = 'not-started'
    workOwners[w.id] = w.ownerRole
    workDue[w.id] = toISODate(w.dueByDays)
  })
  return { workStatus, workOwners, workDue }
}

function defaultV2State(): V2State {
  const template = getV2Template('gcch')
  const seeded = seedFromTemplate(template)
  return {
    profile: {
      teamName: 'Reusable Team Workspace',
      cloud: 'gcch',
      path: 'pilot',
      teamSize: '20-50',
      owner: 'Program Lead',
      riskPosture: 'balanced',
      archetype: 'pilot'
    },
    ...seeded,
    workSteps: {},
    blockers: [
      { id: 'blk-1', title: 'DLP validation run not scheduled', owner: 'CyberOps', severity: 'High', status: 'Open', linkedWorkId: 'ctrl-dlp' }
    ],
    evidence: [
      {
        id: 'ev-1',
        title: 'CA policy validation evidence',
        owner: 'Identity Admin',
        status: 'missing',
        link: '',
        linkedWorkId: 'ctrl-ca',
        linkType: 'screenshot',
        validatedOn: '',
        reviewer: ''
      }
    ]
  }
}

function validateImport(raw: any): { ok: boolean; error?: string } {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Invalid JSON payload.' }
  const schemaVersion = String(raw.schemaVersion || 'unknown')
  const schemaMajor = schemaVersion.split('.')[0]
  if (schemaMajor !== REQUIRED_SCHEMA_MAJOR) return { ok: false, error: `Unsupported schema version: ${schemaVersion}.` }
  const appVersion = String(raw.appVersion || '')
  if (appVersion && appVersion !== V2_APP_VERSION) return { ok: false, error: `Unsupported app version: ${appVersion}.` }
  if (!raw.profile || !raw.workStatus || !raw.workOwners || !raw.workDue) return { ok: false, error: 'Missing required onboarding fields.' }
  return { ok: true }
}

export function HomeV2() {
  const roleMode = getRoleMode()
  const canEdit = roleMode !== 'viewer'
  const [state, setState] = useState<V2State>(defaultV2State)
  const [selectedRoleId, setSelectedRoleId] = useState(v2RoleKits[0].id)
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all')
  const [setupOpen, setSetupOpen] = useState(true)
  const [guidedMode, setGuidedMode] = useState(true)
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [newBlocker, setNewBlocker] = useState({ title: '', owner: '', severity: 'Medium' as 'Low' | 'Medium' | 'High', linkedWorkId: '' })
  const [openActionId, setOpenActionId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        const valid = validateImport(parsed)
        if (valid.ok) {
          setState({
            profile: { ...defaultV2State().profile, ...parsed.profile },
            workStatus: parsed.workStatus,
            workOwners: parsed.workOwners,
            workDue: parsed.workDue,
            workSteps: parsed.workSteps && typeof parsed.workSteps === 'object' ? parsed.workSteps : {},
            blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
            evidence: Array.isArray(parsed.evidence) ? parsed.evidence : []
          })
        }
      }
    } catch {
      // Keep defaults if local payload is invalid.
    }
  }, [])

  useEffect(() => {
    const payload = {
      schemaVersion: V2_SCHEMA_VERSION,
      appVersion: V2_APP_VERSION,
      exportedAt: new Date().toISOString(),
      ...state
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(payload))
      appendAudit('onboarding', 'autosave')
    } catch { /* no-op */ }
  }, [state])

  const template = getV2Template(state.profile.cloud)
  const activeWork = template.work.filter((w) => w.paths.includes(state.profile.path))
  const controls = activeWork.filter((w) => w.type === 'control')
  const tasks = activeWork.filter((w) => w.type === 'task')

  const pct = (items: V2WorkItem[]) => {
    if (!items.length) return 0
    const done = items.filter((i) => state.workStatus[i.id] === 'done').length
    return Math.round((done / items.length) * 100)
  }

  const overall = pct(activeWork)
  const identity = pct(controls.filter((c) => c.domain === 'identity'))
  const access = pct(controls.filter((c) => c.domain === 'access'))
  const governance = pct(controls.filter((c) => c.domain === 'governance'))
  const compliance = pct(controls.filter((c) => c.domain === 'compliance'))

  const immediate = useMemo(() => {
    return activeWork
      .filter((w) => state.workStatus[w.id] !== 'done')
      .sort((a, b) => {
        const depA = (a.dependsOn || []).some((d) => state.workStatus[d] !== 'done') ? 1 : 0
        const depB = (b.dependsOn || []).some((d) => state.workStatus[d] !== 'done') ? 1 : 0
        if (depA !== depB) return depA - depB
        const pa = PRI_WEIGHT[a.priority]
        const pb = PRI_WEIGHT[b.priority]
        if (pa !== pb) return pa - pb
        const sa = ST_WEIGHT[state.workStatus[a.id] || 'not-started']
        const sb = ST_WEIGHT[state.workStatus[b.id] || 'not-started']
        if (sa !== sb) return sa - sb
        return (state.workDue[a.id] || '').localeCompare(state.workDue[b.id] || '')
      })
  }, [activeWork, state.workStatus, state.workDue])

  const openBlockers = state.blockers.filter((b) => b.status === 'Open')

  const today = new Date().toISOString().slice(0, 10)
  const overdueCount = activeWork.filter((w) => state.workStatus[w.id] !== 'done' && (state.workDue[w.id] || '') < today).length

  const hasQualityEvidence = (workId: string) => {
    const match = state.evidence.find((e) => e.linkedWorkId === workId)
    return !!(match && match.status === 'complete' && match.link.trim().length > 0)
  }

  const baselineGate = pct(controls) >= 70 && openBlockers.length <= 3
  const pilotGate = pct(controls) >= 85 && pct(tasks) >= 60 && openBlockers.length <= 2
  const advancedGate = baselineGate && pilotGate && activeWork.filter((w) => w.priority === 'critical').every((w) => state.workStatus[w.id] === 'done')

  const nextBest = useMemo(() => {
    return activeWork
      .filter((w) => state.workStatus[w.id] !== 'done')
      .map((w) => {
        let score = 0
        if (w.priority === 'critical') score += 100
        if (w.priority === 'high') score += 70
        if (w.priority === 'medium') score += 40
        if (w.priority === 'low') score += 20
        if ((w.dependsOn || []).length) score += 10
        if (w.type === 'control') score += 15
        const due = state.workDue[w.id] || ''
        if (due && due < today) score += 30
        return { ...w, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [activeWork, state.workDue, state.workStatus, today])

  const roleScopedWork = useMemo(() => {
    if (roleFilter === 'all') return activeWork
    const role = v2RoleKits.find((r) => r.id === roleFilter)
    if (!role) return activeWork
    const lower = role.name.toLowerCase()
    return activeWork.filter((w) => w.ownerRole.toLowerCase().includes(lower.split(' ')[0]))
  }, [activeWork, roleFilter])

  const milestones = useMemo(() => {
    return activeWork
      .map((w) => {
        const due = state.workDue[w.id] || ''
        const status = state.workStatus[w.id] || 'not-started'
        let health: 'on-track' | 'at-risk' | 'overdue' = 'on-track'
        if (status !== 'done' && due) {
          if (due < today) health = 'overdue'
          else {
            const inDays = Math.ceil((new Date(due).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))
            if (inDays <= 3) health = 'at-risk'
          }
        }
        return { id: w.id, title: w.title, due, status, health }
      })
      .sort((a, b) => (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'))
      .slice(0, 8)
  }, [activeWork, state.workDue, state.workStatus, today])

  const setCloud = (cloud: V2Cloud) => {
    if (!canEdit) return
    const nextTemplate = getV2Template(cloud)
    const seeded = seedFromTemplate(nextTemplate)
    setState((s) => ({ ...s, profile: { ...s.profile, cloud }, ...seeded }))
  }

  const applyArchetype = (archetype: V2Profile['archetype']) => {
    if (!canEdit) return
    const preset = archetypePresets[archetype]
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        ...preset,
        archetype,
      }
    }))
  }

  const setPath = (path: V2Path) => {
    if (!canEdit) return
    if (guidedMode) {
      if (path === 'pilot' && !baselineGate) {
        setStatusMsg({ type: 'err', text: 'Pilot path is gated until baseline readiness reaches 70% controls and blockers are reduced.' })
        return
      }
      if (path === 'advanced' && !advancedGate) {
        setStatusMsg({ type: 'err', text: 'Advanced path is gated until baseline and pilot gates pass and critical items are complete.' })
        return
      }
    }
    setState((s) => ({ ...s, profile: { ...s.profile, path } }))
    setStatusMsg(null)
  }

  const cycleStatus = (id: string) => {
    if (!canEdit) return
    setState((s) => {
      const cur = s.workStatus[id] || 'not-started'
      const next: Record<V2Status, V2Status> = {
        'not-started': 'in-progress',
        'in-progress': 'done',
        done: 'blocked',
        blocked: 'not-started'
      }
      if (next[cur] === 'done' && !hasQualityEvidence(id)) {
        setStatusMsg({ type: 'err', text: `Cannot mark item complete until linked evidence is set to Complete and has an artifact link.` })
        return s
      }
      return { ...s, workStatus: { ...s.workStatus, [id]: next[cur] } }
    })
  }

  const upOwner = (id: string, owner: string) => setState((s) => ({ ...s, workOwners: { ...s.workOwners, [id]: owner } }))
  const upDue = (id: string, due: string) => setState((s) => ({ ...s, workDue: { ...s.workDue, [id]: due } }))

  const toggleStep = (id: string, index: number, totalSteps: number) => {
    if (!canEdit) return
    setState((s) => {
      const current = s.workSteps[id] || []
      const has = current.includes(index)
      const nextSteps = has ? current.filter((i) => i !== index) : [...current, index].sort((a, b) => a - b)
      const allDone = totalSteps > 0 && nextSteps.length >= totalSteps
      const curStatus = s.workStatus[id] || 'not-started'
      // Reflect progress automatically; final 'done' still flows through the evidence gate.
      let nextStatus = curStatus
      if (nextSteps.length > 0 && curStatus === 'not-started') nextStatus = 'in-progress'
      if (allDone && curStatus !== 'done') nextStatus = 'in-progress'
      return { ...s, workSteps: { ...s.workSteps, [id]: nextSteps }, workStatus: { ...s.workStatus, [id]: nextStatus } }
    })
  }

  const openAction = (id: string) => {
    setOpenActionId(id)
    setTimeout(() => document.getElementById(`action-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  useEffect(() => {
    let pending: string | null = null
    try { pending = sessionStorage.getItem('v2_open_action') } catch { /* ignore */ }
    if (pending) {
      try { sessionStorage.removeItem('v2_open_action') } catch { /* ignore */ }
      setOpenActionId(pending)
      setTimeout(() => document.getElementById(`action-${pending}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 220)
    }
  }, [])

  const addBlocker = () => {
    if (!canEdit) return
    if (!newBlocker.title.trim()) return
    const id = `blk-${Date.now()}`
    setState((s) => ({
      ...s,
      blockers: [
        ...s.blockers,
        {
          id,
          title: newBlocker.title.trim(),
          owner: newBlocker.owner.trim() || 'Unassigned',
          severity: newBlocker.severity,
          status: 'Open',
          linkedWorkId: newBlocker.linkedWorkId || undefined
        }
      ]
    }))
    setNewBlocker({ title: '', owner: '', severity: 'Medium', linkedWorkId: '' })
  }

  const editBlocker = (id: string, patch: Partial<V2State['blockers'][number]>) => {
    if (!canEdit) return
    setState((s) => ({ ...s, blockers: s.blockers.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
  }

  const removeBlocker = (id: string) => {
    if (!canEdit) return
    setState((s) => ({ ...s, blockers: s.blockers.filter((b) => b.id !== id) }))
  }

  const addEvidence = () => {
    if (!canEdit) return
    const id = `ev-${Date.now()}`
    setState((s) => ({
      ...s,
      evidence: [...s.evidence, {
        id,
        title: 'New evidence artifact',
        owner: s.profile.owner || 'Owner',
        status: 'missing',
        link: '',
        linkedWorkId: '',
        linkType: 'other',
        validatedOn: '',
        reviewer: ''
      }]
    }))
  }

  const editEvidence = (id: string, patch: Partial<V2State['evidence'][number]>) => {
    if (!canEdit) return
    setState((s) => ({ ...s, evidence: s.evidence.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  }

  const removeEvidence = (id: string) => {
    if (!canEdit) return
    setState((s) => ({ ...s, evidence: s.evidence.filter((e) => e.id !== id) }))
  }

  const exportPack = () => {
    const payload = {
      schemaVersion: V2_SCHEMA_VERSION,
      appVersion: V2_APP_VERSION,
      exportedAt: new Date().toISOString(),
      ...state
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(state.profile.teamName || 'copilot-onboarding').replace(/\s+/g, '-').toLowerCase()}-v2-pack.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importPack = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        const valid = validateImport(parsed)
        if (!valid.ok) {
          setImportMsg({ type: 'err', text: valid.error || 'Import failed.' })
          return
        }
        setState({
          profile: parsed.profile,
          workStatus: parsed.workStatus,
          workOwners: parsed.workOwners,
          workDue: parsed.workDue,
          workSteps: parsed.workSteps && typeof parsed.workSteps === 'object' ? parsed.workSteps : {},
          blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
          evidence: Array.isArray(parsed.evidence) ? parsed.evidence : []
        })
        setImportMsg({ type: 'ok', text: 'Onboarding pack imported successfully.' })
      } catch {
        setImportMsg({ type: 'err', text: 'Import failed. File is not valid JSON.' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const startOnboarding = () => {
    setSetupOpen(true)
    document.getElementById('v2-setup')?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeRole = v2RoleKits.find((r) => r.id === selectedRoleId) || v2RoleKits[0]

  const renderActionCard = (w: V2WorkItem) => {
    const blockedByDep = (w.dependsOn || []).filter((d) => state.workStatus[d] !== 'done')
    return (
      <GuidedActionCard
        key={w.id}
        item={w}
        status={state.workStatus[w.id] || 'not-started'}
        doneSteps={state.workSteps[w.id] || []}
        owner={state.workOwners[w.id] || ''}
        due={state.workDue[w.id] || ''}
        isOpen={openActionId === w.id}
        canEdit={canEdit}
        depsUnmet={blockedByDep}
        variant="full"
        onToggleOpen={() => setOpenActionId(openActionId === w.id ? null : w.id)}
        onToggleStep={(i) => toggleStep(w.id, i, (w.steps || []).length)}
        onOwner={(v) => upOwner(w.id, v)}
        onDue={(v) => upDue(w.id, v)}
        onAdvanceStatus={() => cycleStatus(w.id)}
      />
    )
  }

  return (
    <>
      <SectionHead num="01" title="Reusable Onboarding Hub V2">
        Standalone onboarding workspace for cross-team rollout, readiness tracking, and governance execution.
      </SectionHead>

      <div className="card hub-hero">
        <div>
          <div className="hub-kicker">{template.shellSubtitle}</div>
          <div className="hub-title">{state.profile.teamName}</div>
          <p className="hub-sub">{template.label} · {template.guidance}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={startOnboarding}>Start onboarding (guided)</button>
            <button className="btn" onClick={() => document.getElementById('v2-actions')?.scrollIntoView({ behavior: 'smooth' })}>Resume next actions</button>
            <button className="btn" onClick={() => setSetupOpen((v) => !v)}>{setupOpen ? 'Hide setup' : 'Open setup wizard'}</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray)' }}>Role mode: {roleMode}</div>
        </div>
        <div className="hub-score-card">
          <div className="hub-score">{overall}%</div>
          <div className="hub-score-label">Overall readiness</div>
          <div className="hub-mini">Updated: {new Date().toLocaleString()}</div>
        </div>
      </div>

      <div className="card next-step" style={{ marginTop: 12 }}>
        {immediate.length ? (
          <>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="ns-kicker">Your next step</div>
              <div className="ns-title">{immediate[0].title}</div>
              <div className="ns-sub">
                {immediate[0].why}{immediate[0].steps?.length ? ` ${immediate[0].steps.length} guided steps walk you through it.` : ''}
              </div>
              <div className="ns-meta">
                <span className="ns-chip">Owner: {state.workOwners[immediate[0].id] || immediate[0].ownerRole}</span>
                <span className="ns-chip">Priority: {immediate[0].priority}</span>
                <span className="ns-chip">Due: {state.workDue[immediate[0].id] || 'Not set'}</span>
              </div>
            </div>
            <div className="ns-cta">
              <button className="btn btn-primary" onClick={() => openAction(immediate[0].id)}>Show me how →</button>
              <span style={{ fontSize: 11, color: '#CADCFC', textAlign: 'center' }}>{overall}% ready · {immediate.length} action{immediate.length === 1 ? '' : 's'} left</span>
            </div>
          </>
        ) : (
          <div className="ns-done" style={{ width: '100%' }}>
            <div className="nsd-big">All current actions complete</div>
            <div style={{ fontSize: 12.5, color: '#CADCFC', marginTop: 6 }}>You're at {overall}% readiness on this path. Review the progression gates below, or advance your deployment path.</div>
          </div>
        )}
      </div>

      {importMsg && (
        <div className="card" style={{ marginTop: 10, borderLeft: `4px solid ${importMsg.type === 'ok' ? 'var(--green)' : 'var(--red)'}` }}>
          <strong>{importMsg.type === 'ok' ? 'Import success' : 'Import error'}:</strong> {importMsg.text}
        </div>
      )}

      {statusMsg && (
        <div className="card" style={{ marginTop: 10, borderLeft: `4px solid ${statusMsg.type === 'ok' ? 'var(--green)' : 'var(--red)'}` }}>
          <strong>{statusMsg.type === 'ok' ? 'Update' : 'Guidance'}:</strong> {statusMsg.text}
        </div>
      )}

      {setupOpen && (
        <div className="card" id="v2-setup" style={{ marginTop: 12 }}>
          <div className="card-h">Setup wizard (versioned)</div>
          <div className="grid grid-3" style={{ marginTop: 10 }}>
            <div>
              <div className="ci-l">Team name</div>
              <input className="ci-owner-input" value={state.profile.teamName} onChange={(e) => setState((s) => ({ ...s, profile: { ...s.profile, teamName: e.target.value } }))} disabled={!canEdit} />
            </div>
            <div>
              <div className="ci-l">Cloud profile</div>
              <select className="ci-owner-input" value={state.profile.cloud} onChange={(e) => setCloud(e.target.value as V2Cloud)} disabled={!canEdit}>
                <option value="gcch">GCC High</option>
                <option value="gcc">GCC</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <div className="ci-l">Onboarding path</div>
              <select className="ci-owner-input" value={state.profile.path} onChange={(e) => setPath(e.target.value as V2Path)} disabled={!canEdit}>
                {template.paths.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <div className="ci-l">Archetype</div>
              <select className="ci-owner-input" value={state.profile.archetype} onChange={(e) => applyArchetype(e.target.value as V2Profile['archetype'])} disabled={!canEdit}>
                <option value="regulated">Highly Regulated Agency</option>
                <option value="pilot">Pilot-First Team</option>
                <option value="enterprise">Large Enterprise Rollout</option>
              </select>
            </div>
            <div>
              <div className="ci-l">Team size</div>
              <input className="ci-owner-input" value={state.profile.teamSize} onChange={(e) => setState((s) => ({ ...s, profile: { ...s.profile, teamSize: e.target.value } }))} disabled={!canEdit} />
            </div>
            <div>
              <div className="ci-l">Risk posture</div>
              <select className="ci-owner-input" value={state.profile.riskPosture} onChange={(e) => setState((s) => ({ ...s, profile: { ...s.profile, riskPosture: e.target.value as 'low' | 'balanced' | 'strict' } }))} disabled={!canEdit}>
                <option value="low">Low</option>
                <option value="balanced">Balanced</option>
                <option value="strict">Strict</option>
              </select>
            </div>
            <div>
              <div className="ci-l">Owner</div>
              <input className="ci-owner-input" value={state.profile.owner} onChange={(e) => setState((s) => ({ ...s, profile: { ...s.profile, owner: e.target.value } }))} disabled={!canEdit} />
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
              <button className="btn" onClick={exportPack}>Export pack</button>
              <label className="btn" style={{ margin: 0 }}>
                Import pack
                <input type="file" accept="application/json" onChange={importPack} style={{ display: 'none' }} disabled={!canEdit} />
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button className={`btn ${guidedMode ? 'btn-primary' : ''}`} onClick={() => setGuidedMode((v) => !v)} disabled={!canEdit}>
                {guidedMode ? 'Guided mode: ON' : 'Guided mode: OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-4" style={{ marginTop: 12 }}>
        <div className="card"><div className="ci-l">Identity</div><div className="counter-big" style={{ fontSize: 28 }}>{identity}%</div></div>
        <div className="card"><div className="ci-l">Access</div><div className="counter-big" style={{ fontSize: 28 }}>{access}%</div></div>
        <div className="card"><div className="ci-l">Governance</div><div className="counter-big" style={{ fontSize: 28 }}>{governance}%</div></div>
        <div className="card"><div className="ci-l">Compliance</div><div className="counter-big" style={{ fontSize: 28 }}>{compliance}%</div></div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-h">Next best actions</div>
          {nextBest.map((w) => (
            <div key={w.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{w.title}</strong>
                <span className="badge badge-progress">Score: {w.score}</span>
                <button className="btn" style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: 11 }} onClick={() => openAction(w.id)}>Show me how →</button>
              </div>
              <p style={{ marginTop: 6 }}>{w.how}</p>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-h">Guided progression gates</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 13 }}>Baseline gate</strong>
              <span className={`badge ${baselineGate ? 'badge-done' : 'badge-red'}`}>{baselineGate ? 'Pass' : 'Blocked'}</span>
            </div>
            <p style={{ marginTop: 6 }}>{'Controls completion >= 70% and open blockers <= 3.'}</p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 13 }}>Pilot gate</strong>
              <span className={`badge ${pilotGate ? 'badge-done' : 'badge-red'}`}>{pilotGate ? 'Pass' : 'Blocked'}</span>
            </div>
            <p style={{ marginTop: 6 }}>{'Controls >= 85%, tasks >= 60%, blockers <= 2.'}</p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 13 }}>Advanced gate</strong>
              <span className={`badge ${advancedGate ? 'badge-done' : 'badge-red'}`}>{advancedGate ? 'Pass' : 'Blocked'}</span>
            </div>
            <p style={{ marginTop: 6 }}>Baseline + Pilot gates and all critical items complete.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-h">Path options</div>
        <div className="grid grid-3" style={{ marginTop: 8 }}>
          {template.paths.map((p) => (
            <div key={p.id} className={`path-chip ${state.profile.path === p.id ? 'sel' : ''}`} onClick={() => canEdit && setPath(p.id)}>
              <div className="pc-num">{p.id.toUpperCase()}</div>
              <div className="pc-name">{p.label}</div>
              <div style={{ fontSize: 12, color: 'var(--gray)' }}>{p.summary}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <span className="badge badge-pending">Effort: {p.effort}</span>
                <span className={`badge ${p.risk === 'Low' ? 'badge-done' : p.risk === 'Medium' ? 'badge-progress' : 'badge-red'}`}>Risk: {p.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2" id="v2-actions" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-h">Guided action plan — click any action for step-by-step help</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="ci-l" style={{ margin: 0 }}>Role filter</span>
            <select className="ci-owner-input" style={{ maxWidth: 260 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              {v2RoleKits.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {immediate.map((w) => renderActionCard(w))}
          {!immediate.length && <p style={{ marginTop: 10, fontSize: 12.5, color: 'var(--green)' }}>Every action on this path is complete. Nice work.</p>}
        </div>

        <div className="card">
          <div className="card-h">Blockers (full CRUD)</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Add blocker</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
              <input className="ci-owner-input" value={newBlocker.title} onChange={(e) => setNewBlocker((b) => ({ ...b, title: e.target.value }))} placeholder="Blocker title" />
              <input className="ci-owner-input" value={newBlocker.owner} onChange={(e) => setNewBlocker((b) => ({ ...b, owner: e.target.value }))} placeholder="Owner" />
              <select className="ci-owner-input" value={newBlocker.severity} onChange={(e) => setNewBlocker((b) => ({ ...b, severity: e.target.value as 'Low' | 'Medium' | 'High' }))}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select className="ci-owner-input" value={newBlocker.linkedWorkId} onChange={(e) => setNewBlocker((b) => ({ ...b, linkedWorkId: e.target.value }))}>
                <option value="">Linked work (optional)</option>
                {activeWork.map((w) => <option key={w.id} value={w.id}>{w.id}</option>)}
              </select>
              <button className="btn" onClick={addBlocker} disabled={!canEdit}>Add</button>
            </div>
          </div>
          {state.blockers.map((b) => (
            <div key={b.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto auto', gap: 8 }}>
                <input className="ci-owner-input" value={b.title} onChange={(e) => editBlocker(b.id, { title: e.target.value })} disabled={!canEdit} />
                <input className="ci-owner-input" value={b.owner} onChange={(e) => editBlocker(b.id, { owner: e.target.value })} disabled={!canEdit} />
                <select className="ci-owner-input" value={b.severity} onChange={(e) => editBlocker(b.id, { severity: e.target.value as 'Low' | 'Medium' | 'High' })} disabled={!canEdit}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <select className="ci-owner-input" value={b.status} onChange={(e) => editBlocker(b.id, { status: e.target.value as 'Open' | 'Resolved' })} disabled={!canEdit}>
                  <option>Open</option>
                  <option>Resolved</option>
                </select>
                <button className="btn" onClick={() => editBlocker(b.id, { status: b.status === 'Open' ? 'Resolved' : 'Open' })} disabled={!canEdit}>{b.status === 'Open' ? 'Resolve' : 'Reopen'}</button>
                <button className="btn" onClick={() => removeBlocker(b.id)} disabled={!canEdit}>Remove</button>
              </div>
            </div>
          ))}
          <p style={{ marginTop: 8, fontSize: 12, color: openBlockers.length ? 'var(--red)' : 'var(--green)' }}>
            {openBlockers.length ? `${openBlockers.length} open blocker(s).` : 'No open blockers.'}
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-h">Execution board (role scoped)</div>
          {roleScopedWork.map((w) => (
            <div key={w.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{w.title}</strong>
                <span className="badge badge-pending">{w.ownerRole}</span>
                <button className={`${clsStatus(state.workStatus[w.id] || 'not-started')}`} onClick={() => cycleStatus(w.id)} disabled={!canEdit}>{prettyStatus(state.workStatus[w.id] || 'not-started')}</button>
              </div>
              <p style={{ marginTop: 6 }}>{w.why}</p>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray)' }}>Due: {state.workDue[w.id] || 'Not set'}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-h">Milestones and schedule health</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Overdue work items</div>
            <p style={{ color: overdueCount ? 'var(--red)' : 'var(--green)' }}>{overdueCount ? `${overdueCount} overdue item(s)` : 'No overdue items'}</p>
          </div>
          {milestones.map((m) => (
            <div key={m.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{m.title}</strong>
                <span className={`badge ${m.health === 'overdue' ? 'badge-red' : m.health === 'at-risk' ? 'badge-progress' : 'badge-done'}`}>{m.health}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray)' }}>Due {m.due || 'TBD'} · Status {prettyStatus(m.status)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-h">Role-based onboarding kit</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {v2RoleKits.map((r) => (
            <button key={r.id} className={`btn ${activeRole.id === r.id ? 'btn-primary' : ''}`} onClick={() => setSelectedRoleId(r.id)}>{r.name}</button>
          ))}
        </div>
        <div className="ci-block" style={{ marginTop: 8 }}>
          <div className="ci-l">Outcome</div>
          <p>{activeRole.outcomes}</p>
          <div className="ci-l" style={{ marginTop: 8 }}>Checklist</div>
          <ul className="pd-list" style={{ fontSize: 12.5 }}>{activeRole.checklist.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-h">Evidence tracking</div>
          <button className="btn" onClick={addEvidence} disabled={!canEdit}>Add evidence</button>
          {state.evidence.map((e) => (
            <div key={e.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto', gap: 8 }}>
                <input className="ci-owner-input" value={e.title} onChange={(evt) => editEvidence(e.id, { title: evt.target.value })} disabled={!canEdit} />
                <input className="ci-owner-input" value={e.owner} onChange={(evt) => editEvidence(e.id, { owner: evt.target.value })} disabled={!canEdit} />
                <select className="ci-owner-input" value={e.status} onChange={(evt) => editEvidence(e.id, { status: evt.target.value as 'missing' | 'partial' | 'complete' })} disabled={!canEdit}>
                  <option value="missing">Missing</option>
                  <option value="partial">Partial</option>
                  <option value="complete">Complete</option>
                </select>
                <input className="ci-owner-input" value={e.link} onChange={(evt) => editEvidence(e.id, { link: evt.target.value })} placeholder="Artifact link" disabled={!canEdit} />
                <select className="ci-owner-input" value={e.linkType || 'other'} onChange={(evt) => editEvidence(e.id, { linkType: evt.target.value as 'runbook' | 'screenshot' | 'ticket' | 'report' | 'other' })} disabled={!canEdit}>
                  <option value="runbook">Runbook</option>
                  <option value="screenshot">Screenshot</option>
                  <option value="ticket">Ticket</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
                <input className="ci-owner-input" type="date" value={e.validatedOn || ''} onChange={(evt) => editEvidence(e.id, { validatedOn: evt.target.value })} disabled={!canEdit} />
                <input className="ci-owner-input" value={e.reviewer || ''} onChange={(evt) => editEvidence(e.id, { reviewer: evt.target.value })} placeholder="Reviewer" disabled={!canEdit} />
                <select className="ci-owner-input" value={e.linkedWorkId || ''} onChange={(evt) => editEvidence(e.id, { linkedWorkId: evt.target.value || undefined })} disabled={!canEdit}>
                  <option value="">Link to work item</option>
                  {activeWork.map((w) => <option key={w.id} value={w.id}>{w.id}</option>)}
                </select>
                <button className="btn" onClick={() => removeEvidence(e.id)} disabled={!canEdit}>Remove</button>
              </div>
            </div>
          ))}
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Evidence quality check</div>
            <p>{activeWork.filter((w) => hasQualityEvidence(w.id)).length}/{activeWork.length} active items have complete evidence with links.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-h">Cadence and metrics</div>
          {v2Cadence.map((c) => (
            <div key={c.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{c.title}</strong>
                <span className="badge badge-pending">{c.rhythm}</span>
              </div>
              <p style={{ marginTop: 6 }}>Owner: {c.owner}. Output: {c.output}</p>
            </div>
          ))}
          <table className="matrix" style={{ marginTop: 10 }}>
            <thead><tr><th>Metric</th><th>Current</th><th>Target</th></tr></thead>
            <tbody>
              <tr><td>Control completion</td><td>{pct(controls)}%</td><td>{'>= 90%'}</td></tr>
              <tr><td>Task completion</td><td>{pct(tasks)}%</td><td>{'>= 80%'}</td></tr>
              <tr><td>Open blockers</td><td>{openBlockers.length}</td><td>{'<= 2'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
