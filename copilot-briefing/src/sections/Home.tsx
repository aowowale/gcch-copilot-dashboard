import { ChangeEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead } from '../components/Primitives'
import { cadence, getTemplate, metricTargets, roleKits, templates, type WorkItem } from '../data/onboarding'
import { useStore } from '../lib/store'
import type { CloudProfile, EvidenceItem, WorkStatus } from '../data/types'

const STATUS_ORDER: Record<WorkStatus, number> = { blocked: 0, 'in-progress': 1, 'not-started': 2, done: 3 }

function statusBadge(status: WorkStatus) {
  if (status === 'done') return 'badge badge-done'
  if (status === 'in-progress') return 'badge badge-progress'
  if (status === 'blocked') return 'badge badge-red'
  return 'badge badge-pending'
}

function titleCaseStatus(status: WorkStatus) {
  if (status === 'in-progress') return 'In Progress'
  if (status === 'not-started') return 'Not Started'
  return status[0].toUpperCase() + status.slice(1)
}

export function Home() {
  const nav = useNavigate()
  const { state, update } = useStore()
  const [role, setRole] = useState(roleKits[0].id)
  const [setupOpen, setSetupOpen] = useState(false)

  const profile = state.onboardingProfile
  const template = getTemplate(profile.cloud)

  const controls = template.work.filter((w) => w.type === 'control')
  const tasks = template.work.filter((w) => w.type === 'task')

  const completion = (items: WorkItem[]) => {
    if (!items.length) return 0
    const done = items.filter((i) => state.onboardingWork[i.id] === 'done').length
    return Math.round((done / items.length) * 100)
  }

  const overall = completion(template.work)
  const identity = completion(controls.filter((c) => c.domain === 'identity'))
  const access = completion(controls.filter((c) => c.domain === 'access'))
  const governance = completion(controls.filter((c) => c.domain === 'governance'))
  const compliance = completion(controls.filter((c) => c.domain === 'compliance'))

  const immediateActions = useMemo(() => {
    return template.work
      .filter((w) => state.onboardingWork[w.id] !== 'done')
      .sort((a, b) => {
        const sa = STATUS_ORDER[state.onboardingWork[a.id] || 'not-started']
        const sb = STATUS_ORDER[state.onboardingWork[b.id] || 'not-started']
        if (sa !== sb) return sa - sb
        if (a.type !== b.type) return a.type === 'control' ? -1 : 1
        return a.title.localeCompare(b.title)
      })
      .slice(0, 3)
  }, [state.onboardingWork, template.work])

  const openBlockers = state.onboardingBlockers.filter((b) => b.status === 'Open')
  const activeRole = roleKits.find((r) => r.id === role) || roleKits[0]

  const setCloud = (cloud: CloudProfile) => {
    update({ onboardingProfile: { ...profile, cloud } })
  }

  const applyTemplate = () => {
    const target = getTemplate(profile.cloud)
    const nextWork: Record<string, WorkStatus> = {}
    const nextOwners: Record<string, string> = {}
    target.work.forEach((w) => {
      nextWork[w.id] = w.type === 'control' ? 'not-started' : 'not-started'
      nextOwners[w.id] = w.ownerRole
    })
    update({ onboardingWork: nextWork, onboardingOwners: nextOwners })
  }

  const setPath = (pathId: string) => {
    update({ onboardingProfile: { ...profile, selectedPath: pathId } })
  }

  const cycleWorkStatus = (id: string) => {
    const current = state.onboardingWork[id] || 'not-started'
    const next: Record<WorkStatus, WorkStatus> = {
      'not-started': 'in-progress',
      'in-progress': 'done',
      done: 'blocked',
      blocked: 'not-started'
    }
    update({ onboardingWork: { ...state.onboardingWork, [id]: next[current] } })
  }

  const setWorkOwner = (id: string, owner: string) => {
    update({ onboardingOwners: { ...state.onboardingOwners, [id]: owner } })
  }

  const addEvidence = () => {
    const id = `ev-${Date.now()}`
    const next: EvidenceItem = { id, title: 'New evidence artifact', owner: profile.owner || 'Owner', status: 'missing', link: '' }
    update({ onboardingEvidence: [...state.onboardingEvidence, next] })
  }

  const updateEvidence = (id: string, patch: Partial<EvidenceItem>) => {
    update({ onboardingEvidence: state.onboardingEvidence.map((e) => e.id === id ? { ...e, ...patch } : e) })
  }

  const removeEvidence = (id: string) => {
    update({ onboardingEvidence: state.onboardingEvidence.filter((e) => e.id !== id) })
  }

  const toggleBlocker = (id: string) => {
    update({ onboardingBlockers: state.onboardingBlockers.map((b) => b.id === id ? { ...b, status: b.status === 'Open' ? 'Resolved' : 'Open' } : b) })
  }

  const exportPack = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      template: template.id,
      profile: state.onboardingProfile,
      work: state.onboardingWork,
      owners: state.onboardingOwners,
      blockers: state.onboardingBlockers,
      evidence: state.onboardingEvidence
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(profile.teamName || 'copilot-onboarding').replace(/\s+/g, '-').toLowerCase()}-onboarding-pack.json`
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
        if (parsed.profile) update({ onboardingProfile: { ...profile, ...parsed.profile } })
        if (parsed.work) update({ onboardingWork: { ...state.onboardingWork, ...parsed.work } })
        if (parsed.owners) update({ onboardingOwners: { ...state.onboardingOwners, ...parsed.owners } })
        if (Array.isArray(parsed.blockers)) update({ onboardingBlockers: parsed.blockers })
        if (Array.isArray(parsed.evidence)) update({ onboardingEvidence: parsed.evidence })
      } catch {
        // Ignore invalid imports silently to avoid disruptive UX.
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const policyValidationCurrent = controls.filter((c) => c.domain === 'compliance' && state.onboardingWork[c.id] === 'done').length
  const policyValidationTotal = controls.filter((c) => c.domain === 'compliance').length || 1

  return (
    <>
      <SectionHead num="00" title="Copilot Onboarding Hub">
        Reusable homepage for any team: readiness, next actions, blockers, evidence, role kits, and operating cadence.
      </SectionHead>

      <div className="card hub-hero">
        <div>
          <div className="hub-kicker">Team Onboarding Workspace</div>
          <div className="hub-title">{profile.teamName}</div>
          <p className="hub-sub">{template.label} template · {template.guidance}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => nav('/controls')}>Start onboarding</button>
            <button className="btn" onClick={() => document.getElementById('immediate-actions')?.scrollIntoView({ behavior: 'smooth' })}>Resume where we left off</button>
            <button className="btn" onClick={() => setSetupOpen((v) => !v)}>{setupOpen ? 'Hide setup' : 'Open setup wizard'}</button>
          </div>
        </div>
        <div className="hub-score-card">
          <div className="hub-score">{overall}%</div>
          <div className="hub-score-label">Overall readiness</div>
          <div className="hub-mini">Last updated: {new Date().toLocaleString()}</div>
        </div>
      </div>

      {setupOpen && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-h">Setup wizard</div>
          <div className="grid grid-3" style={{ marginTop: 10 }}>
            <div>
              <div className="ci-l">Team name</div>
              <input className="ci-owner-input" value={profile.teamName} onChange={(e) => update({ onboardingProfile: { ...profile, teamName: e.target.value } })} />
            </div>
            <div>
              <div className="ci-l">Cloud profile</div>
              <select className="ci-owner-input" value={profile.cloud} onChange={(e) => setCloud(e.target.value as CloudProfile)}>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <div className="ci-l">Team size</div>
              <input className="ci-owner-input" value={profile.teamSize} onChange={(e) => update({ onboardingProfile: { ...profile, teamSize: e.target.value } })} />
            </div>
            <div>
              <div className="ci-l">Risk posture</div>
              <select className="ci-owner-input" value={profile.riskPosture} onChange={(e) => update({ onboardingProfile: { ...profile, riskPosture: e.target.value as 'low' | 'balanced' | 'strict' } })}>
                <option value="low">Low</option>
                <option value="balanced">Balanced</option>
                <option value="strict">Strict</option>
              </select>
            </div>
            <div>
              <div className="ci-l">Workspace owner</div>
              <input className="ci-owner-input" value={profile.owner} onChange={(e) => update({ onboardingProfile: { ...profile, owner: e.target.value } })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
              <button className="btn" onClick={applyTemplate}>Reset to selected template</button>
              <button className="btn" onClick={exportPack}>Export onboarding pack</button>
              <label className="btn" style={{ margin: 0 }}>
                Import pack
                <input type="file" accept="application/json" onChange={importPack} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-4" style={{ marginTop: 14 }}>
        <div className="card"><div className="ci-l">Identity</div><div className="counter-big" style={{ fontSize: 28 }}>{identity}%</div></div>
        <div className="card"><div className="ci-l">Access</div><div className="counter-big" style={{ fontSize: 28 }}>{access}%</div></div>
        <div className="card"><div className="ci-l">Governance</div><div className="counter-big" style={{ fontSize: 28 }}>{governance}%</div></div>
        <div className="card"><div className="ci-l">Compliance</div><div className="counter-big" style={{ fontSize: 28 }}>{compliance}%</div></div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-h">Choose your path</div>
        <div className="grid grid-3" style={{ marginTop: 10 }}>
          {template.paths.map((p) => (
            <div key={p.id} className={`path-chip ${profile.selectedPath === p.id ? 'sel' : ''}`} onClick={() => setPath(p.id)}>
              <div className="pc-num">{p.id.toUpperCase()}</div>
              <div className="pc-name">{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--gray)' }}>{p.summary}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <span className="badge badge-pending">Effort: {p.effort}</span>
                <span className={`badge ${p.risk === 'Low' ? 'badge-done' : p.risk === 'Medium' ? 'badge-progress' : 'badge-red'}`}>Risk: {p.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="immediate-actions" className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-h">Immediate actions</div>
          {immediateActions.map((a) => (
            <div key={a.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 13 }}>{a.title}</strong>
                <span className={`badge ${a.type === 'control' ? 'badge-red' : 'badge-pending'}`}>{a.type}</span>
                <button className={`badge ${statusBadge(state.onboardingWork[a.id] || 'not-started')}`} onClick={() => cycleWorkStatus(a.id)}>{titleCaseStatus(state.onboardingWork[a.id] || 'not-started')}</button>
              </div>
              <p style={{ marginTop: 6 }}>{a.how}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <input
                  className="ci-owner-input"
                  value={state.onboardingOwners[a.id] || ''}
                  onChange={(e) => setWorkOwner(a.id, e.target.value)}
                  placeholder="Owner"
                />
                <div className="badge badge-pending" style={{ justifySelf: 'start' }}>Source: Template guidance</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-h">Blockers and risks</div>
          {state.onboardingBlockers.map((b) => (
            <div key={b.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{b.title}</strong>
                <span className={`badge ${b.severity === 'High' ? 'badge-red' : b.severity === 'Medium' ? 'badge-progress' : 'badge-pending'}`}>Severity: {b.severity}</span>
                <span className={`badge ${b.status === 'Open' ? 'badge-red' : 'badge-done'}`}>{b.status}</span>
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--gray)' }}>Owner: {b.owner}</span>
                <button className="btn" onClick={() => toggleBlocker(b.id)}>{b.status === 'Open' ? 'Mark Resolved' : 'Reopen'}</button>
              </div>
            </div>
          ))}
          {!!openBlockers.length && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{openBlockers.length} open blocker(s) require owner action.</p>}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-h">Role-based onboarding</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {roleKits.map((r) => (
            <button key={r.id} className={`btn ${role === r.id ? 'btn-primary' : ''}`} onClick={() => setRole(r.id)}>{r.name}</button>
          ))}
        </div>
        <div className="ci-block" style={{ marginTop: 10 }}>
          <div className="ci-l">Outcome</div>
          <p>{activeRole.outcomes}</p>
          <div className="ci-l" style={{ marginTop: 10 }}>Checklist</div>
          <ul className="pd-list" style={{ fontSize: 12.5 }}>
            {activeRole.checklist.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-h">Evidence and audit</div>
          <button className="btn" onClick={addEvidence}>Add evidence item</button>
          {state.onboardingEvidence.map((e) => (
            <div key={e.id} className="ci-block" style={{ marginTop: 8 }}>
              <input className="ci-owner-input" value={e.title} onChange={(evt) => updateEvidence(e.id, { title: evt.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 8 }}>
                <input className="ci-owner-input" value={e.owner} onChange={(evt) => updateEvidence(e.id, { owner: evt.target.value })} placeholder="Owner" />
                <select className="ci-owner-input" value={e.status} onChange={(evt) => updateEvidence(e.id, { status: evt.target.value as 'missing' | 'partial' | 'complete' })}>
                  <option value="missing">Missing</option>
                  <option value="partial">Partial</option>
                  <option value="complete">Complete</option>
                </select>
                <input className="ci-owner-input" value={e.link} onChange={(evt) => updateEvidence(e.id, { link: evt.target.value })} placeholder="Artifact link (optional)" />
                <button className="btn" onClick={() => removeEvidence(e.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-h">Cadence and outcomes</div>
          {cadence.map((c) => (
            <div key={c.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{c.title}</strong>
                <span className="badge badge-pending">{c.rhythm}</span>
              </div>
              <p style={{ marginTop: 6 }}>Owner: {c.owner}. Output: {c.output}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-h">Adoption and quality metrics</div>
        <table className="matrix" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Time to pilot start</td>
              <td>{overall >= 80 ? 'Ready to launch pilot' : 'In readiness execution'}</td>
              <td>{metricTargets.find((m) => m.id === 'time-to-pilot')?.target}</td>
            </tr>
            <tr>
              <td>Control completion rate</td>
              <td>{completion(controls)}%</td>
              <td>{metricTargets.find((m) => m.id === 'control-completion')?.target}</td>
            </tr>
            <tr>
              <td>Policy validation rate</td>
              <td>{Math.round((policyValidationCurrent / policyValidationTotal) * 100)}%</td>
              <td>{metricTargets.find((m) => m.id === 'policy-validation')?.target}</td>
            </tr>
            <tr>
              <td>Pilot activation</td>
              <td>{completion(tasks)}%</td>
              <td>{metricTargets.find((m) => m.id === 'pilot-activation')?.target}</td>
            </tr>
            <tr>
              <td>Open blockers</td>
              <td>{openBlockers.length}</td>
              <td>{metricTargets.find((m) => m.id === 'open-blockers')?.target}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-h">Learn and adopt</div>
        <div className="grid grid-3" style={{ marginTop: 8 }}>
          <div className="ci-block">
            <div className="ci-l">Quick starts</div>
            <ul className="pd-list" style={{ fontSize: 12.5 }}>
              <li>Admin 30-minute secure setup walkthrough</li>
              <li>Pilot user prompt and behavior guide</li>
              <li>Helpdesk triage and escalation guide</li>
            </ul>
          </div>
          <div className="ci-block">
            <div className="ci-l">Reference and FAQ</div>
            <button className="btn" onClick={() => nav('/reference')}>Open technical reference</button>
            <button className="btn" style={{ marginLeft: 8 }} onClick={() => nav('/concerns')}>Open key concerns</button>
          </div>
          <div className="ci-block">
            <div className="ci-l">Operational support</div>
            <ul className="pd-list" style={{ fontSize: 12.5 }}>
              <li>Weekly office hours with security and platform owners</li>
              <li>Escalate blockers through the owner map above</li>
              <li>Export onboarding pack for leadership updates</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
