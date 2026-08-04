import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead } from '../components/Primitives'
import { getTemplate } from '../data/onboarding'
import { useStore } from '../lib/store'
import type { WorkStatus } from '../data/types'

const REVIEW_SNAPSHOT_KEY = 'gcch_last_review_v1'

type RoleFilter = 'all' | 'security' | 'admin' | 'program' | 'helpdesk' | 'users'

const STATUS_ORDER: Record<WorkStatus, number> = {
  blocked: 0,
  'in-progress': 1,
  'not-started': 2,
  done: 3,
}

function statusClass(s: WorkStatus) {
  if (s === 'done') return 'badge badge-done'
  if (s === 'in-progress') return 'badge badge-progress'
  if (s === 'blocked') return 'badge badge-red'
  return 'badge badge-pending'
}

function statusLabel(s: WorkStatus) {
  if (s === 'in-progress') return 'In Progress'
  if (s === 'not-started') return 'Not Started'
  if (s === 'done') return 'Done'
  return 'Blocked'
}

interface ReviewSnapshot {
  capturedAt: string
  work: Record<string, WorkStatus>
  blockers: Array<{ id: string; status: 'Open' | 'Resolved' }>
  evidence: Array<{ id: string; status: 'missing' | 'partial' | 'complete' }>
}

export function Tracker() {
  const nav = useNavigate()
  const { state } = useStore()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(() => {
    try {
      const raw = localStorage.getItem(REVIEW_SNAPSHOT_KEY)
      return raw ? (JSON.parse(raw) as ReviewSnapshot) : null
    } catch {
      return null
    }
  })

  const template = getTemplate(state.onboardingProfile.cloud)

  const roleMatch = (ownerRole: string) => {
    if (roleFilter === 'all') return true
    if (roleFilter === 'security') return /CyberOps|Compliance|Identity/i.test(ownerRole)
    if (roleFilter === 'admin') return /Admin/i.test(ownerRole)
    if (roleFilter === 'program') return /Program/i.test(ownerRole)
    if (roleFilter === 'helpdesk') return /Helpdesk|Support/i.test(ownerRole)
    return /Pilot|User/i.test(ownerRole)
  }

  const quickActions = useMemo(() => {
    return template.work
      .filter((w) => state.onboardingWork[w.id] !== 'done')
      .filter((w) => roleMatch(w.ownerRole))
      .sort((a, b) => {
        const sa = STATUS_ORDER[state.onboardingWork[a.id] || 'not-started']
        const sb = STATUS_ORDER[state.onboardingWork[b.id] || 'not-started']
        if (sa !== sb) return sa - sb
        if (a.type !== b.type) return a.type === 'control' ? -1 : 1
        return a.title.localeCompare(b.title)
      })
      .slice(0, 3)
  }, [roleFilter, state.onboardingWork, template.work])

  const openHighBlockers = state.onboardingBlockers.filter((b) => b.status === 'Open' && b.severity === 'High').length
  const controlsComplete = template.work
    .filter((w) => w.type === 'control')
    .every((w) => (state.onboardingWork[w.id] || 'not-started') === 'done')

  const gates = [
    {
      label: 'Identity boundary validated (CA + app scope)',
      pass: (state.onboardingWork['ctrl-ca'] || 'not-started') === 'done' && (state.onboardingWork['ctrl-integrated-apps'] || 'not-started') === 'done',
    },
    {
      label: 'Compliance baseline active (Retention + DLP)',
      pass: (state.onboardingWork['ctrl-purview-retention'] || 'not-started') === 'done' && (state.onboardingWork['ctrl-dlp-copilot'] || 'not-started') === 'done',
    },
    {
      label: 'SharePoint governance strategy set (RCD/RSS transition)',
      pass: ['in-progress', 'done'].includes(state.onboardingWork['ctrl-rss-rcd'] || 'not-started'),
    },
    {
      label: 'No open high-severity blockers',
      pass: openHighBlockers === 0,
    },
    {
      label: 'Control completion threshold met',
      pass: controlsComplete,
    },
  ]

  const gatePass = gates.filter((g) => g.pass).length

  const captureSnapshot = () => {
    const next: ReviewSnapshot = {
      capturedAt: new Date().toISOString(),
      work: state.onboardingWork,
      blockers: state.onboardingBlockers.map((b) => ({ id: b.id, status: b.status })),
      evidence: state.onboardingEvidence.map((e) => ({ id: e.id, status: e.status })),
    }
    localStorage.setItem(REVIEW_SNAPSHOT_KEY, JSON.stringify(next))
    setSnapshot(next)
  }

  const changes = useMemo(() => {
    if (!snapshot) return [] as string[]
    const out: string[] = []

    template.work.forEach((w) => {
      const prev = snapshot.work[w.id]
      const curr = state.onboardingWork[w.id]
      if (prev && curr && prev !== curr) out.push(`${w.title}: ${statusLabel(prev)} -> ${statusLabel(curr)}`)
    })

    state.onboardingBlockers.forEach((b) => {
      const prev = snapshot.blockers.find((x) => x.id === b.id)
      if (prev && prev.status !== b.status) out.push(`Blocker '${b.title}' changed: ${prev.status} -> ${b.status}`)
    })

    state.onboardingEvidence.forEach((e) => {
      const prev = snapshot.evidence.find((x) => x.id === e.id)
      if (prev && prev.status !== e.status) out.push(`Evidence '${e.title}' changed: ${prev.status} -> ${e.status}`)
    })

    return out.slice(0, 12)
  }, [snapshot, state.onboardingBlockers, state.onboardingEvidence, state.onboardingWork, template.work])

  return (
    <>
      <SectionHead num="21" title="Live Tracker — Start Here">
        GCCH readiness snapshot and action tracker. Review this first before deep-dive sections.
      </SectionHead>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="card-h" style={{ margin: 0 }}>Top 3 next actions</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button className={`btn ${roleFilter === 'all' ? 'btn-primary' : ''}`} onClick={() => setRoleFilter('all')}>All</button>
            <button className={`btn ${roleFilter === 'security' ? 'btn-primary' : ''}`} onClick={() => setRoleFilter('security')}>Security</button>
            <button className={`btn ${roleFilter === 'admin' ? 'btn-primary' : ''}`} onClick={() => setRoleFilter('admin')}>Admins</button>
            <button className={`btn ${roleFilter === 'program' ? 'btn-primary' : ''}`} onClick={() => setRoleFilter('program')}>Program</button>
            <button className={`btn ${roleFilter === 'helpdesk' ? 'btn-primary' : ''}`} onClick={() => setRoleFilter('helpdesk')}>Helpdesk</button>
            <button className={`btn ${roleFilter === 'users' ? 'btn-primary' : ''}`} onClick={() => setRoleFilter('users')}>Users</button>
          </div>
        </div>
        <div className="grid grid-3" style={{ marginTop: 10 }}>
          {quickActions.map((a) => (
            <div key={a.id} className="ci-block" style={{ marginTop: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: 13 }}>{a.title}</strong>
                <span className={statusClass(state.onboardingWork[a.id] || 'not-started')}>{statusLabel(state.onboardingWork[a.id] || 'not-started')}</span>
              </div>
              <p style={{ marginTop: 6 }}>{a.how}</p>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray)' }}>Owner role: {a.ownerRole}</div>
            </div>
          ))}
          {quickActions.length === 0 && (
            <div className="ci-block" style={{ marginTop: 0 }}>
              <p>No pending actions for this role filter. Try "All" or another role.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-h">GCCH readiness gate scorecard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="counter-big" style={{ fontSize: 30 }}>{gatePass}/{gates.length}</span>
            <span className={`badge ${gatePass === gates.length ? 'badge-done' : 'badge-progress'}`}>
              {gatePass === gates.length ? 'Ready for scale' : 'Pilot gating active'}
            </span>
          </div>
          <table className="matrix">
            <thead><tr><th>Gate</th><th>Status</th></tr></thead>
            <tbody>
              {gates.map((g, i) => (
                <tr key={i}>
                  <td>{g.label}</td>
                  <td><span className={`badge ${g.pass ? 'badge-done' : 'badge-red'}`}>{g.pass ? 'Pass' : 'Fail'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h">What changed since last review</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={captureSnapshot}>Capture review snapshot</button>
            {!snapshot && <span className="badge badge-pending">No baseline captured yet</span>}
            {snapshot && <span className="badge badge-progress">Baseline: {new Date(snapshot.capturedAt).toLocaleString()}</span>}
          </div>
          {!snapshot && <p style={{ fontSize: 12.5, color: 'var(--gray)' }}>Capture a baseline at the start of each review, then this panel shows status changes automatically.</p>}
          {!!snapshot && changes.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--gray)' }}>No tracked changes since last captured review.</p>}
          {!!changes.length && (
            <ul className="pd-list" style={{ fontSize: 12.5 }}>
              {changes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => nav('/controls')}>Open controls</button>
            <button className="btn" onClick={() => nav('/ask')}>Open decision asks</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <iframe
          title="GCCH Copilot Dashboard Tracker"
          src="/gcch-dashboard-tracker.html"
          style={{ width: '100%', height: 'calc(100vh - 220px)', minHeight: 900, border: 0, display: 'block' }}
        />
      </div>
    </>
  )
}
