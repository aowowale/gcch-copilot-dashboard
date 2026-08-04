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
  type SamFinding = { id: string; title: string; severity: Severity; status: ItemStatus; owner: string; notes: string }
  const [findings, setFindings] = useWorkspaceState<SamFinding[]>(LEMON_KEYS.sam, [
    { id: 'sam-1', title: 'High-risk sharing pattern identified', severity: 'High', status: 'Open', owner: 'Security', notes: '' },
    { id: 'sam-2', title: 'Site ownership metadata incomplete', severity: 'Medium', status: 'In Progress', owner: 'SharePoint Admin', notes: '' },
  ], 'sam')
  const canEdit = getRoleMode() !== 'viewer'

  const edit = (id: string, patch: Partial<SamFinding>) => setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const add = () => {
    if (!canEdit) return
    setFindings((prev) => [{ id: `sam-${Date.now()}`, title: 'New finding', severity: 'Medium', status: 'Open', owner: '', notes: '' }, ...prev])
  }
  const remove = (id: string) => setFindings((prev) => prev.filter((f) => f.id !== id))

  return (
    <>
      <SectionHead num="14" title="SAM Findings & Plan">
        Reusable findings workspace. Replace with your tenant-specific discovery and remediation plan.
      </SectionHead>
      <div className="card" style={{ marginBottom: 12, background: 'var(--sky)' }}>
        <p style={{ fontSize: 13 }}>This page is intentionally editable so each customer can own their own SAM baseline, owners, and closure notes.</p>
      </div>
      <button className="btn" onClick={add} disabled={!canEdit}>+ Add finding</button>
      {findings.map((f) => (
        <div className="card" key={f.id} style={{ marginTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8 }}>
            <input className="ci-owner-input" value={f.title} onChange={(e) => edit(f.id, { title: e.target.value })} disabled={!canEdit} />
            <select className="ci-owner-input" value={f.severity} onChange={(e) => edit(f.id, { severity: e.target.value as Severity })} disabled={!canEdit}>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </select>
            <select className="ci-owner-input" value={f.status} onChange={(e) => edit(f.id, { status: e.target.value as ItemStatus })} disabled={!canEdit}>
              <option>Open</option><option>In Progress</option><option>Resolved</option>
            </select>
            <input className="ci-owner-input" value={f.owner} onChange={(e) => edit(f.id, { owner: e.target.value })} placeholder="Owner" disabled={!canEdit} />
            <button className="btn" onClick={() => remove(f.id)} disabled={!canEdit}>Remove</button>
          </div>
          <textarea className="ci-owner-input" rows={2} style={{ marginTop: 8 }} value={f.notes} onChange={(e) => edit(f.id, { notes: e.target.value })} placeholder="Remediation details, dependencies, evidence links..." disabled={!canEdit} />
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
