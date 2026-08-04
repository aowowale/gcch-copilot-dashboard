import type { V2Status, V2WorkItem } from '../data/onboardingV2'

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

export interface GuidedActionCardProps {
  item: V2WorkItem
  status: V2Status
  doneSteps: number[]
  owner: string
  due: string
  isOpen: boolean
  canEdit: boolean
  depsUnmet: string[]
  variant?: 'full' | 'embedded'
  onToggleOpen: () => void
  onToggleStep: (index: number) => void
  onOwner?: (value: string) => void
  onDue?: (value: string) => void
  onAdvanceStatus?: () => void
  onOpenInPlan?: () => void
}

export function GuidedActionCard(props: GuidedActionCardProps) {
  const { item: w, status, doneSteps, isOpen, canEdit, depsUnmet, variant = 'full' } = props
  const steps = w.steps || []
  const stepPct = steps.length ? Math.round((doneSteps.length / steps.length) * 100) : 0

  return (
    <div id={`action-${w.id}`} className={`action-card ${isOpen ? 'open' : ''}`}>
      <div className="action-head" onClick={props.onToggleOpen}>
        <span className="ah-title">{w.title}</span>
        <span className={`badge ${w.type === 'control' ? 'badge-red' : 'badge-pending'}`}>{w.type}</span>
        <span className={`badge ${w.priority === 'critical' ? 'badge-red' : w.priority === 'high' ? 'badge-progress' : 'badge-pending'}`}>{w.priority}</span>
        <span className={clsStatus(status)}>{prettyStatus(status)}</span>
        <span className="ah-toggle">
          {isOpen ? 'Hide steps' : steps.length ? `Show me how (${doneSteps.length}/${steps.length})` : 'Show details'}
          <svg className="ah-chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
        </span>
      </div>
      {!!steps.length && <div className="action-prog"><div className="ap-fill" style={{ width: `${stepPct}%` }} /></div>}
      {isOpen && (
        <div className="action-body">
          <div className="action-why"><strong>Why this matters:</strong> {w.why}</div>
          {w.portalPath && <div className="action-portal"><span className="apl">Where</span><span>{w.portalPath}</span></div>}
          {!!depsUnmet.length && (
            <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>
              Waiting on: {depsUnmet.join(', ')}. Finish those first for a clean sequence.
            </div>
          )}
          {!!steps.length && (
            <>
              <div className="action-sub">Step-by-step</div>
              <ul className="guide-steps">
                {steps.map((stp, i) => {
                  const checked = doneSteps.includes(i)
                  return (
                    <li key={i} className={`guide-step ${checked ? 'done' : ''}`}>
                      <input className="gs-check" type="checkbox" checked={checked} disabled={!canEdit} onChange={() => props.onToggleStep(i)} />
                      <span className="gs-text">{stp}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          {w.verify && (
            <>
              <div className="action-sub">How to verify it worked</div>
              <div className="action-verify">{w.verify}</div>
            </>
          )}
          <div className="action-sub">Evidence to capture</div>
          <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>{w.evidence}</div>
          {!!(w.docLinks && w.docLinks.length) && (
            <>
              <div className="action-sub">Official documentation</div>
              <div className="action-docs">
                {w.docLinks.map((d) => <a key={d.url} href={d.url} target="_blank" rel="noreferrer noopener">{d.label}</a>)}
              </div>
            </>
          )}
          <div className="action-foot">
            {variant === 'full' ? (
              <>
                <span className="ci-l" style={{ margin: 0 }}>Owner</span>
                <input className="ci-owner-input" style={{ maxWidth: 170 }} value={props.owner} onChange={(e) => props.onOwner?.(e.target.value)} placeholder="Owner" disabled={!canEdit} />
                <input className="ci-owner-input" style={{ maxWidth: 160 }} type="date" value={props.due} onChange={(e) => props.onDue?.(e.target.value)} disabled={!canEdit} />
                <button className="btn" onClick={props.onAdvanceStatus} disabled={!canEdit}>Advance status</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 12, color: 'var(--gray)' }}>Owner: {props.owner || w.ownerRole} · Due: {props.due || 'Not set'}</span>
                <button className="btn" style={{ marginLeft: 'auto' }} onClick={props.onOpenInPlan}>Manage in action plan →</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
