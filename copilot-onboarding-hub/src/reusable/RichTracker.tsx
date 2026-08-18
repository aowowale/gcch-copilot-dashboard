import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead } from '../components/Primitives'
import { getV2Template, type V2Status } from '../data/onboardingV2'
import { getRoleMode, LEMON_KEYS, readWorkspaceValue, useWorkspaceState } from './workspaceState'

type ItemStatus = 'Open' | 'In Progress' | 'Resolved'
type RoleFilter = 'all' | 'security' | 'admin' | 'program' | 'helpdesk' | 'users'

type TrackItem = {
  id: string
  title: string
  owner: string
  due: string
  status: ItemStatus
  notes: string
}

type V2Persisted = {
  profile?: { cloud?: 'gcch' | 'gcc' | 'commercial'; path?: 'baseline' | 'pilot' | 'advanced' }
  workStatus?: Record<string, V2Status>
  workDue?: Record<string, string>
  blockers?: Array<{ id?: string; title: string; severity: 'Low' | 'Medium' | 'High'; status: 'Open' | 'Resolved' }>
  evidence?: Array<{ id?: string; title: string; status: 'missing' | 'partial' | 'complete' }>
}

type ReviewSnapshot = {
  capturedAt: string
  work: Record<string, V2Status>
  blockers: Array<{ id?: string; title: string; status: 'Open' | 'Resolved' }>
  evidence: Array<{ id?: string; title: string; status: 'missing' | 'partial' | 'complete' }>
}

const STATUS_ORDER: Record<V2Status, number> = { blocked: 0, 'in-progress': 1, 'not-started': 2, done: 3 }

function statusClass(status: V2Status) {
  if (status === 'done') return 'badge badge-done'
  if (status === 'in-progress') return 'badge badge-progress'
  if (status === 'blocked') return 'badge badge-red'
  return 'badge badge-pending'
}

function statusLabel(status: V2Status) {
  if (status === 'in-progress') return 'In Progress'
  if (status === 'not-started') return 'Not Started'
  return status[0].toUpperCase() + status.slice(1)
}

export function RichTracker() {
  const nav = useNavigate()
  const trackerRef = useRef<HTMLIFrameElement>(null)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const persisted = readWorkspaceValue<V2Persisted>(LEMON_KEYS.onboardingV2, {})
  const cloud = persisted.profile?.cloud || 'gcch'
  const path = persisted.profile?.path || 'pilot'
  const activeWork = getV2Template(cloud).work.filter((item) => item.paths.includes(path))
  const statuses = persisted.workStatus || {}
  const due = persisted.workDue || {}
  const blockers = persisted.blockers || []
  const evidence = persisted.evidence || []
  const canEdit = getRoleMode() !== 'viewer'
  const [items, setItems] = useWorkspaceState<TrackItem[]>(LEMON_KEYS.tracker, [
    { id: 'trk-1', title: 'Confirm identity baseline controls', owner: 'Identity Admin', due: '', status: 'Open', notes: '' },
    { id: 'trk-2', title: 'Run pilot test plan', owner: 'Program Lead', due: '', status: 'Open', notes: '' },
  ], 'tracker')
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(() =>
    readWorkspaceValue<ReviewSnapshot | null>(LEMON_KEYS.trackerSnapshot, null),
  )

  const roleMatch = (ownerRole: string) => {
    if (roleFilter === 'all') return true
    if (roleFilter === 'security') return /CyberOps|Compliance|Identity|Security/i.test(ownerRole)
    if (roleFilter === 'admin') return /Admin/i.test(ownerRole)
    if (roleFilter === 'program') return /Program/i.test(ownerRole)
    if (roleFilter === 'helpdesk') return /Helpdesk|Support/i.test(ownerRole)
    return /Pilot|User|Adoption/i.test(ownerRole)
  }

  const quickActions = useMemo(() => activeWork
    .filter((item) => statuses[item.id] !== 'done')
    .filter((item) => roleMatch(item.ownerRole))
    .sort((first, second) => {
      const statusDelta = STATUS_ORDER[statuses[first.id] || 'not-started'] - STATUS_ORDER[statuses[second.id] || 'not-started']
      if (statusDelta !== 0) return statusDelta
      if (first.priority !== second.priority) {
        const priority = { critical: 0, high: 1, medium: 2, low: 3 }
        return priority[first.priority] - priority[second.priority]
      }
      return (due[first.id] || '').localeCompare(due[second.id] || '')
    })
    .slice(0, 3), [activeWork, due, roleFilter, statuses])

  const openHighBlockers = blockers.filter((blocker) => blocker.status === 'Open' && blocker.severity === 'High').length
  const gates = [
    {
      label: 'Identity boundary validated (CA + app scope)',
      pass: statuses['ctrl-ca'] === 'done' && statuses['ctrl-integrated'] === 'done',
    },
    {
      label: 'Compliance baseline active (Retention + DLP)',
      pass: statuses['ctrl-retention'] === 'done' && (!activeWork.some((item) => item.id === 'ctrl-dlp') || statuses['ctrl-dlp'] === 'done'),
    },
    {
      label: 'SharePoint governance strategy set (RCD/RSS transition)',
      pass: statuses['ctrl-rss-rcd'] === 'in-progress' || statuses['ctrl-rss-rcd'] === 'done',
    },
    { label: 'No open high-severity blockers', pass: openHighBlockers === 0 },
    {
      label: 'Required evidence is complete',
      pass: evidence.length > 0 && evidence.every((item) => item.status === 'complete'),
    },
  ]
  const gatePass = gates.filter((gate) => gate.pass).length

  const changes = useMemo(() => {
    if (!snapshot) return [] as string[]
    const result: string[] = []
    activeWork.forEach((item) => {
      const previous = snapshot.work[item.id]
      const current = statuses[item.id] || 'not-started'
      if (previous && previous !== current) result.push(`${item.title}: ${statusLabel(previous)} -> ${statusLabel(current)}`)
    })
    blockers.forEach((blocker) => {
      const previous = snapshot.blockers.find((item) => item.id === blocker.id || item.title === blocker.title)
      if (previous && previous.status !== blocker.status) result.push(`Blocker '${blocker.title}': ${previous.status} -> ${blocker.status}`)
    })
    evidence.forEach((artifact) => {
      const previous = snapshot.evidence.find((item) => item.id === artifact.id || item.title === artifact.title)
      if (previous && previous.status !== artifact.status) result.push(`Evidence '${artifact.title}': ${previous.status} -> ${artifact.status}`)
    })
    return result.slice(0, 12)
  }, [activeWork, blockers, evidence, snapshot, statuses])

  const captureSnapshot = () => {
    const next: ReviewSnapshot = {
      capturedAt: new Date().toISOString(),
      work: statuses,
      blockers: blockers.map(({ id, title, status }) => ({ id, title, status })),
      evidence: evidence.map(({ id, title, status }) => ({ id, title, status })),
    }
    localStorage.setItem(LEMON_KEYS.trackerSnapshot, JSON.stringify(next))
    setSnapshot(next)
  }

  const edit = (id: string, patch: Partial<TrackItem>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  const add = () => {
    if (!canEdit) return
    setItems((current) => [{ id: `trk-${Date.now()}`, title: 'New tracker item', owner: '', due: '', status: 'Open', notes: '' }, ...current])
  }
  const remove = (id: string) => setItems((current) => current.filter((item) => item.id !== id))

  return (
    <>
      <SectionHead num="11" title="Live Tracker — Start Here">
        Readiness gates, next actions, review changes, and the deployment roadmap in one operating view.
      </SectionHead>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="card-h" style={{ margin: 0 }}>Top 3 next actions</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} role="group" aria-label="Filter next actions by role">
            {(['all', 'security', 'admin', 'program', 'helpdesk', 'users'] as RoleFilter[]).map((role) => (
              <button key={role} className={`btn ${roleFilter === role ? 'btn-primary' : ''}`} onClick={() => setRoleFilter(role)}>
                {role === 'all' ? 'All' : role === 'admin' ? 'Admins' : role[0].toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-3" style={{ marginTop: 10 }}>
          {quickActions.map((action) => (
            <div key={action.id} className="ci-block" style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: 13 }}>{action.title}</strong>
                <span className={statusClass(statuses[action.id] || 'not-started')}>{statusLabel(statuses[action.id] || 'not-started')}</span>
              </div>
              <p style={{ marginTop: 6 }}>{action.how}</p>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray)' }}>Owner role: {action.ownerRole}</div>
            </div>
          ))}
          {!quickActions.length && <div className="ci-block"><p>No pending actions for this role filter.</p></div>}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-h">Copilot readiness gate scorecard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="counter-big" style={{ fontSize: 30 }}>{gatePass}/{gates.length}</span>
            <span className={`badge ${gatePass === gates.length ? 'badge-done' : 'badge-progress'}`}>
              {gatePass === gates.length ? 'Ready for scale' : 'Pilot gating active'}
            </span>
          </div>
          <table className="matrix">
            <thead><tr><th>Gate</th><th>Status</th></tr></thead>
            <tbody>{gates.map((gate) => (
              <tr key={gate.label}><td>{gate.label}</td><td><span className={`badge ${gate.pass ? 'badge-done' : 'badge-red'}`}>{gate.pass ? 'Pass' : 'Fail'}</span></td></tr>
            ))}</tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h">What changed since last review</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={captureSnapshot}>Capture review snapshot</button>
            {!snapshot && <span className="badge badge-pending">No baseline captured yet</span>}
            {snapshot && <span className="badge badge-progress">Baseline: {new Date(snapshot.capturedAt).toLocaleString()}</span>}
          </div>
          {!snapshot && <p>Capture a baseline at the start of a review to track status changes automatically.</p>}
          {snapshot && changes.length === 0 && <p>No tracked changes since the last review.</p>}
          {changes.length > 0 && <ul className="pd-list">{changes.map((change) => <li key={change}>{change}</li>)}</ul>}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => nav('/controls')}>Open controls</button>
            <button className="btn" onClick={() => nav('/sam')}>Open readiness work</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="card-h">Owned tracker items</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-pending">{items.length} item(s)</span>
            <button className="btn" onClick={add} disabled={!canEdit}>+ Add tracker item</button>
          </div>
        </div>
        {items.map((item) => (
          <div className="ci-block" key={item.id} style={{ marginTop: 10 }}>
            <div className="tracker-edit-grid">
              <input className="ci-owner-input" value={item.title} onChange={(event) => edit(item.id, { title: event.target.value })} disabled={!canEdit} />
              <input className="ci-owner-input" value={item.owner} onChange={(event) => edit(item.id, { owner: event.target.value })} placeholder="Owner" disabled={!canEdit} />
              <input className="ci-owner-input" type="date" value={item.due} onChange={(event) => edit(item.id, { due: event.target.value })} aria-label="Tracker due date" disabled={!canEdit} />
              <select className="ci-owner-input" value={item.status} onChange={(event) => edit(item.id, { status: event.target.value as ItemStatus })} disabled={!canEdit}>
                <option>Open</option><option>In Progress</option><option>Resolved</option>
              </select>
              <button className="btn" onClick={() => remove(item.id)} disabled={!canEdit}>Remove</button>
            </div>
            <textarea className="ci-owner-input" style={{ marginTop: 8 }} rows={2} value={item.notes} onChange={(event) => edit(item.id, { notes: event.target.value })} placeholder="Notes" disabled={!canEdit} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => trackerRef.current?.requestFullscreen?.()}>View full screen</button>
        <a className="btn" href="/gcch-dashboard-tracker.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Open standalone</a>
      </div>
      <div className="card tracker-roadmap" style={{ padding: 0, overflow: 'hidden' }}>
        <iframe ref={trackerRef} title="GCCH Copilot Dashboard Tracker" src="/gcch-dashboard-tracker.html" allowFullScreen />
      </div>
    </>
  )
}