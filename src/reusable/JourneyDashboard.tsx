import { ChangeEvent, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionHead } from '../components/Primitives'
import { getV2Template, type V2Status } from '../data/onboardingV2'
import {
  applyStarterTemplate,
  exportWorkspacePack,
  getRoleMode,
  getStarterTemplates,
  importWorkspacePack,
  LEMON_KEYS,
  readWorkspaceValue,
  setRoleMode,
  type AuditEvent,
  type RoleMode,
} from './workspaceState'

const KEY = 'copilot_onboarding_v2_state'

type V2Persisted = {
  profile?: { cloud?: 'gcch' | 'gcc' | 'commercial'; path?: 'baseline' | 'pilot' | 'advanced'; teamName?: string }
  workStatus?: Record<string, V2Status>
  workDue?: Record<string, string>
  blockers?: Array<{ status: 'Open' | 'Resolved' }>
}

function loadPersisted(): V2Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function JourneyDashboard() {
  const nav = useNavigate()
  const persisted = loadPersisted()
  const cloud = persisted.profile?.cloud || 'gcch'
  const path = persisted.profile?.path || 'pilot'
  const template = getV2Template(cloud)
  const activeWork = template.work.filter((w) => w.paths.includes(path))
  const statuses = persisted.workStatus || {}
  const due = persisted.workDue || {}

  const metrics = useMemo(() => {
    const controls = activeWork.filter((w) => w.type === 'control')
    const tasks = activeWork.filter((w) => w.type === 'task')
    const done = activeWork.filter((w) => statuses[w.id] === 'done').length
    const overdue = activeWork.filter((w) => {
      const d = due[w.id]
      if (!d) return false
      if (statuses[w.id] === 'done') return false
      return d < new Date().toISOString().slice(0, 10)
    }).length
    const openBlockers = (persisted.blockers || []).filter((b) => b.status === 'Open').length
    return {
      total: activeWork.length || 1,
      done,
      pct: Math.round((done / (activeWork.length || 1)) * 100),
      controlsPct: controls.length ? Math.round((controls.filter((w) => statuses[w.id] === 'done').length / controls.length) * 100) : 0,
      tasksPct: tasks.length ? Math.round((tasks.filter((w) => statuses[w.id] === 'done').length / tasks.length) * 100) : 0,
      overdue,
      openBlockers,
    }
  }, [activeWork, due, statuses, persisted.blockers])

  const recommendations = useMemo(() => {
    const items = activeWork
      .filter((w) => statuses[w.id] !== 'done')
      .map((w) => {
        let score = 0
        if (w.priority === 'critical') score += 100
        if (w.priority === 'high') score += 70
        if (w.priority === 'medium') score += 40
        if (w.priority === 'low') score += 20
        if (w.type === 'control') score += 15
        if ((w.dependsOn || []).length) score += 10
        const d = due[w.id]
        if (d && d < new Date().toISOString().slice(0, 10)) score += 30
        return { id: w.id, title: w.title, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    return items
  }, [activeWork, due, statuses])

  const roleMode = getRoleMode()
  const templates = getStarterTemplates()
  const audit = readWorkspaceValue<AuditEvent[]>(LEMON_KEYS.audit, []).slice(0, 8)

  const exportPack = () => {
    const pack = exportWorkspacePack()
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lemon-workspace-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportPack = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result || '{}'))
        const valid = importWorkspacePack(parsed)
        if (!valid.ok) {
          alert(valid.error || 'Import failed')
          return
        }
        window.location.reload()
      } catch {
        alert('Invalid workspace pack')
      }
    }
    r.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <SectionHead num="00" title="Onboarding Dashboard">
        Executive snapshot of readiness, blockers, milestones, and next best actions.
      </SectionHead>

      <div className="grid grid-4" style={{ marginTop: 10 }}>
        <div className="card"><div className="ci-l">Overall readiness</div><div className="counter-big" style={{ fontSize: 30 }}>{metrics.pct}%</div></div>
        <div className="card"><div className="ci-l">Controls complete</div><div className="counter-big" style={{ fontSize: 30 }}>{metrics.controlsPct}%</div></div>
        <div className="card"><div className="ci-l">Tasks complete</div><div className="counter-big" style={{ fontSize: 30 }}>{metrics.tasksPct}%</div></div>
        <div className="card"><div className="ci-l">Open blockers</div><div className="counter-big" style={{ fontSize: 30 }}>{metrics.openBlockers}</div></div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-h">Next best actions</div>
          {recommendations.map((r) => (
            <div key={r.id} className="ci-block" style={{ marginTop: 8 }}>
              <strong style={{ fontSize: 13 }}>{r.title}</strong>
              <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6 }}>Priority score: {r.score}</div>
            </div>
          ))}
          {!recommendations.length && <p style={{ marginTop: 8 }}>All active items are complete for the selected path.</p>}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => nav('/homev2')}>Open guided onboarding</button>
            <button className="btn" onClick={() => nav('/tracker')}>Open live tracker</button>
          </div>
        </div>

        <div className="card">
          <div className="card-h">Risk and milestone health</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Current profile</div>
            <p>{template.label} · {path.toUpperCase()} · {(persisted.profile?.teamName || 'Reusable Team Workspace')}</p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Overdue items</div>
            <p style={{ color: metrics.overdue ? 'var(--red)' : 'var(--green)' }}>
              {metrics.overdue ? `${metrics.overdue} item(s) are overdue.` : 'No overdue items.'}
            </p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Delivery health</div>
            <p>{metrics.done}/{metrics.total} active items complete.</p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Health score formula</div>
            <p>
              Score = 70% x completion + 20% x blocker health + 10% x timeline health.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-h">Workspace controls</div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Role mode</div>
            <select className="ci-owner-input" value={roleMode} onChange={(e) => { setRoleMode(e.target.value as RoleMode); window.location.reload() }}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <p style={{ marginTop: 6 }}>Viewer can read only. Editor can update onboarding data. Admin can manage workspace-level actions.</p>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Starter templates</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {templates.map((t) => (
                <button key={t.id} className="btn" onClick={() => { applyStarterTemplate(t.id); window.location.reload() }} disabled={roleMode !== 'admin'}>
                  Apply {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="ci-block" style={{ marginTop: 8 }}>
            <div className="ci-l">Workspace pack</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={exportPack}>Export workspace</button>
              <label className="btn" style={{ margin: 0 }}>
                Import workspace
                <input type="file" accept="application/json" onChange={onImportPack} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">Audit trail</div>
          {audit.length === 0 && <p>No audit events captured yet.</p>}
          {audit.map((a) => (
            <div key={a.id} className="ci-block" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 13 }}>{a.area} · {a.action}</strong>
                <span style={{ fontSize: 12, color: 'var(--gray)' }}>{new Date(a.at).toLocaleString()}</span>
              </div>
              {a.detail && <p style={{ marginTop: 6 }}>{a.detail}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
