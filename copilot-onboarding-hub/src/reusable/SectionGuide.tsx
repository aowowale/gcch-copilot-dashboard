import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getV2Template, type V2Status, type V2WorkItem } from '../data/onboardingV2'
import { JOURNEY_STEPS, PHASE_LABELS, journeyPosition } from './sections'
import { LEMON_KEYS, getRoleMode, useWorkspaceState } from './workspaceState'
import { GuidedActionCard } from './GuidedActionCard'

/** Work items that are most actionable from each journey section. */
export const SECTION_ACTION_IDS: Record<string, string[]> = {
  concerns: ['ctrl-ca'],
  controls: ['ctrl-ca', 'ctrl-integrated'],
  dlp: ['ctrl-dlp', 'ctrl-retention'],
  aisec: ['ctrl-web-approval'],
  rss: ['ctrl-rss-rcd'],
  guardrails: ['ctrl-dlp', 'ctrl-web-approval'],
  acceptance: ['task-briefing'],
  testplan: ['ctrl-dlp', 'ctrl-ca'],
  sam: ['ctrl-rss-rcd'],
  actions: ['task-helpdesk'],
}

export interface V2Shape {
  profile?: { cloud?: 'gcch' | 'gcc' | 'commercial'; path?: 'baseline' | 'pilot' | 'advanced' }
  workStatus?: Record<string, V2Status>
  workSteps?: Record<string, number[]>
  workOwners?: Record<string, string>
  workDue?: Record<string, string>
}

/** Aggregate completion of the guided actions tied to a section, scoped to the active cloud + path. */
export function sectionProgress(v2: V2Shape | null, id: string): { total: number; done: number; started: number } {
  if (!v2) return { total: 0, done: 0, started: 0 }
  const cloud = v2.profile?.cloud || 'gcch'
  const path = v2.profile?.path || 'pilot'
  const template = getV2Template(cloud)
  const items = (SECTION_ACTION_IDS[id] || [])
    .map((aid) => template.work.find((w) => w.id === aid))
    .filter((w): w is V2WorkItem => !!w && w.paths.includes(path))
  const statusOf = (w: V2WorkItem) => v2.workStatus?.[w.id] || 'not-started'
  const done = items.filter((w) => statusOf(w) === 'done').length
  const started = items.filter((w) => statusOf(w) !== 'not-started').length
  return { total: items.length, done, started }
}


export function SectionGuide({ id }: { id: string }) {
  const navigate = useNavigate()
  const canEdit = getRoleMode() !== 'viewer'
  const [v2, setV2] = useWorkspaceState<V2Shape | null>(LEMON_KEYS.onboardingV2, null, 'onboarding')
  const [openId, setOpenId] = useState<string | null>(null)

  const pos = journeyPosition(id)
  const def = pos?.def

  const cloud = v2?.profile?.cloud || 'gcch'
  const path = v2?.profile?.path || 'pilot'

  const inJourney = !!pos?.inJourney
  const jIdx = pos && pos.inJourney ? pos.step - 1 : -1
  const prev = pos?.prev
  const next = pos?.next

  const related = useMemo<V2WorkItem[]>(() => {
    if (!v2) return []
    const template = getV2Template(cloud)
    return (SECTION_ACTION_IDS[id] || [])
      .map((aid) => template.work.find((w) => w.id === aid))
      .filter((w): w is V2WorkItem => !!w && w.paths.includes(path))
  }, [v2, cloud, path, id])

  // First later journey step that still has unfinished guided actions.
  const nextUnfinished = useMemo(() => {
    if (!v2 || !inJourney) return undefined
    const template = getV2Template(cloud)
    const hasOpen = (sid: string) =>
      (SECTION_ACTION_IDS[sid] || [])
        .map((aid) => template.work.find((w) => w.id === aid))
        .filter((w): w is V2WorkItem => !!w && w.paths.includes(path))
        .some((w) => (v2.workStatus?.[w.id] || 'not-started') !== 'done')
    return JOURNEY_STEPS.slice(jIdx + 1).find((s) => hasOpen(s.id))
  }, [v2, cloud, path, inJourney, jIdx])

  if (!def || !pos) return null

  const statusOf = (wid: string): V2Status => v2?.workStatus?.[wid] || 'not-started'
  const incomplete = related.filter((w) => statusOf(w.id) !== 'done')

  const toggleStep = (wid: string, index: number, total: number) => {
    if (!canEdit) return
    setV2((s) => {
      if (!s) return s
      const current = s.workSteps?.[wid] || []
      const has = current.includes(index)
      const nextSteps = has ? current.filter((i) => i !== index) : [...current, index].sort((a, b) => a - b)
      const allDone = total > 0 && nextSteps.length >= total
      const cur = s.workStatus?.[wid] || 'not-started'
      let nextStatus = cur
      if (nextSteps.length > 0 && cur === 'not-started') nextStatus = 'in-progress'
      if (allDone && cur !== 'done') nextStatus = 'in-progress'
      return {
        ...s,
        workSteps: { ...(s.workSteps || {}), [wid]: nextSteps },
        workStatus: { ...(s.workStatus || {}), [wid]: nextStatus },
      }
    })
  }

  const openInPlan = (wid: string) => {
    try { sessionStorage.setItem('v2_open_action', wid) } catch { /* ignore */ }
    navigate('/homev2')
  }

  return (
    <div className="journey-guide">
      <div className="jg-rail">
        <div className="jg-pos">
          <span className="jg-kicker">
            {inJourney ? `${PHASE_LABELS[def.phase]} · Step ${pos.step} of ${pos.total}` : 'Reference deep dive'}
          </span>
          <span className="jg-step">{def.name}</span>
        </div>
        <div className="jg-nav">
          {prev && <button className="btn" onClick={() => navigate(`/${prev.id}`)}>← {prev.name}</button>}
          {!inJourney && <button className="btn" onClick={() => navigate('/journey')}>↩ Journey</button>}
          {next ? (
            <button className="btn btn-primary" onClick={() => navigate(`/${next.id}`)}>{inJourney ? 'Continue' : 'Next'}: {next.name} →</button>
          ) : inJourney ? (
            <button className="btn btn-primary" onClick={() => navigate('/journey')}>Finish · Back to dashboard →</button>
          ) : null}
        </div>
      </div>

      {!v2 && (SECTION_ACTION_IDS[id]?.length ? (
        <div className="jg-cta">
          <div>
            <strong>Turn this into action.</strong> Set up your onboarding plan once and the exact steps for this area show up right here.
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/homev2')}>Open Start Here →</button>
        </div>
      ) : null)}

      {v2 && !!related.length && (
        <div className="jg-actions">
          <div className="jg-actions-h">Do this here — guided steps for {def.name}</div>
          {related.map((w) => (
            <GuidedActionCard
              key={w.id}
              item={w}
              status={statusOf(w.id)}
              doneSteps={v2.workSteps?.[w.id] || []}
              owner={v2.workOwners?.[w.id] || ''}
              due={v2.workDue?.[w.id] || ''}
              isOpen={openId === w.id}
              canEdit={canEdit}
              depsUnmet={(w.dependsOn || []).filter((d) => statusOf(d) !== 'done')}
              variant="embedded"
              onToggleOpen={() => setOpenId(openId === w.id ? null : w.id)}
              onToggleStep={(i) => toggleStep(w.id, i, (w.steps || []).length)}
              onOpenInPlan={() => openInPlan(w.id)}
            />
          ))}
          <div className="jg-nudge">
            {incomplete.length ? (
              <span>Next move: finish <strong>{incomplete[0].title}</strong>{next ? <>, then continue to <strong>{next.name}</strong>.</> : '.'}</span>
            ) : nextUnfinished ? (
              <>
                <span>This area is complete. Your next unfinished step is <strong>{nextUnfinished.name}</strong>.</span>
                <button className="btn btn-primary jg-nudge-btn" onClick={() => navigate(`/${nextUnfinished.id}`)}>Go to {nextUnfinished.name} →</button>
              </>
            ) : (
              <span>This area is complete.{next ? <> Continue to <strong>{next.name}</strong>.</> : ' You have reached the end of the guided journey.'}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
