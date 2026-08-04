import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom'
import { meta } from '../data/content'
import { JOURNEY_STEPS, PHASE_LABELS, REUSABLE_SECTIONS, journeyPosition, type ReusablePhase } from './sections'
import { REUSABLE_SECTION_COMPONENTS } from './registry'
import { SectionGuide, sectionProgress, type V2Shape } from './SectionGuide'
import { LEMON_KEYS, readWorkspaceValue } from './workspaceState'

const GUIDE_SKIP = new Set(['journey', 'homev2'])
const PHASE_ORDER: ReusablePhase[] = ['setup', 'baseline', 'pilot', 'operate', 'reference']

function useSharedV2(): V2Shape | null {
  const location = useLocation()
  const [v2, setV2] = useState<V2Shape | null>(() => readWorkspaceValue<V2Shape | null>(LEMON_KEYS.onboardingV2, null))
  // Components here stay mounted across routes; re-read shared state on each navigation
  // so progress made on a section's guided actions is reflected everywhere.
  useEffect(() => {
    setV2(readWorkspaceValue<V2Shape | null>(LEMON_KEYS.onboardingV2, null))
  }, [location.pathname])
  return v2
}

function Sidebar() {
  const location = useLocation()
  const v2 = useSharedV2()
  const currentId = location.pathname.split('/')[1] || ''
  const currentPhase = REUSABLE_SECTIONS.find((s) => s.id === currentId)?.phase

  const [openPhases, setOpenPhases] = useState<Set<ReusablePhase>>(
    () => new Set<ReusablePhase>(currentPhase ? [currentPhase] : ['setup']),
  )
  // Progressive disclosure: keep the phase you are working in open without collapsing
  // phases the user expanded themselves.
  useEffect(() => {
    if (!currentPhase) return
    setOpenPhases((prev) => {
      if (prev.has(currentPhase)) return prev
      const nextSet = new Set(prev)
      nextSet.add(currentPhase)
      return nextSet
    })
  }, [currentPhase])

  const togglePhase = (phase: ReusablePhase) =>
    setOpenPhases((prev) => {
      const nextSet = new Set(prev)
      if (nextSet.has(phase)) nextSet.delete(phase)
      else nextSet.add(phase)
      return nextSet
    })

  const grouped = useMemo(
    () => PHASE_ORDER.map((phase) => ({ phase, items: REUSABLE_SECTIONS.filter((s) => s.phase === phase) })),
    [],
  )

  const overall = useMemo(() => {
    let total = 0
    let done = 0
    REUSABLE_SECTIONS.forEach((s) => {
      const p = sectionProgress(v2, s.id)
      total += p.total
      done += p.done
    })
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [v2])

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h1>Copilot Reusable Hub</h1>
        <div className="sub">Standalone onboarding app</div>
      </div>
      {v2 && overall.total > 0 && (
        <div className="sidebar-prog">
          <div className="sp-top"><span>Guided progress</span><span>{overall.done}/{overall.total}</span></div>
          <div className="sp-bar"><div className="sp-fill" style={{ width: `${overall.pct}%` }} /></div>
        </div>
      )}
      <nav className="nav">
        {grouped.map((g) => {
          const open = openPhases.has(g.phase)
          const roll = g.items.reduce(
            (acc, s) => {
              const p = sectionProgress(v2, s.id)
              return { total: acc.total + p.total, done: acc.done + p.done }
            },
            { total: 0, done: 0 },
          )
          const rollBadge =
            v2 && roll.total > 0 ? (
              <span className={`phase-badge${roll.done >= roll.total ? ' done' : ''}`}>{roll.done}/{roll.total}</span>
            ) : null
          return (
            <div key={g.phase} className={`phase-group${open ? ' open' : ''}`}>
              <button className="phase-toggle" onClick={() => togglePhase(g.phase)} aria-expanded={open}>
                <span className="pt-name">{PHASE_LABELS[g.phase]}</span>
                <span className="pt-right">
                  {rollBadge}
                  <span className="pt-chev">{open ? '−' : '+'}</span>
                </span>
              </button>
              {open &&
                g.items.map((s) => {
                  const p = sectionProgress(v2, s.id)
                  const mark = p.total === 0 ? null : p.done >= p.total ? 'done' : p.started > 0 ? 'partial' : 'todo'
                  return (
                    <NavLink
                      key={s.id}
                      to={`/${s.id}`}
                      className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
                    >
                      <span className="nav-num">{s.num}</span>
                      <span className="nav-name">{s.name}</span>
                      {mark && (
                        <span className={`nav-mark ${mark}`} title={`${p.done}/${p.total} guided actions complete`}>
                          {mark === 'done' ? '✓' : mark === 'partial' ? '◐' : '○'}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const v2 = useSharedV2()
  const id = location.pathname.split('/')[1] || ''
  const pos = journeyPosition(id)
  const isDashboard = id === 'journey'
  const stepLabel = pos?.inJourney
    ? `Step ${pos.step} of ${pos.total}`
    : pos?.def.phase === 'reference'
      ? 'Reference'
      : 'Overview'
  const nextStep = pos?.next || (isDashboard ? JOURNEY_STEPS[0] : undefined)

  const overall = useMemo(() => {
    let total = 0
    let done = 0
    REUSABLE_SECTIONS.forEach((s) => {
      const p = sectionProgress(v2, s.id)
      total += p.total
      done += p.done
    })
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [v2])

  return (
    <div className="topbar">
      <div className="ctx-crumb">
        {pos ? (
          <>
            <span className="ctx-phase">{PHASE_LABELS[pos.def.phase]}</span>
            <span className="ctx-sep">›</span>
            <span className="ctx-name">{pos.def.name}</span>
            <span className="ctx-step">{stepLabel}</span>
          </>
        ) : (
          <span className="ctx-name">{meta.title} · Reusable Hub</span>
        )}
      </div>
      {v2 && overall.total > 0 && (
        <div className="ctx-prog" title={`${overall.done} of ${overall.total} guided actions complete`}>
          <span className="ctx-prog-num">{overall.pct}%</span>
          <div className="ctx-prog-bar"><div className="ctx-prog-fill" style={{ width: `${overall.pct}%` }} /></div>
        </div>
      )}
      {nextStep && (
        <button className="btn btn-primary ctx-next" onClick={() => navigate(`/${nextStep.id}`)}>
          {isDashboard ? 'Start' : 'Next'}: {nextStep.name} →
        </button>
      )}
      <button className="btn" onClick={() => window.print()}>Print</button>
    </div>
  )
}

function SectionView() {
  const { id } = useParams()
  const def = REUSABLE_SECTIONS.find((s) => s.id === id)
  const Comp = id ? REUSABLE_SECTION_COMPONENTS[id] : undefined
  const navigate = useNavigate()

  useEffect(() => {
    const el = document.querySelector('.content')
    if (el) el.scrollTop = 0
  }, [id])

  if (!def || !Comp) {
    navigate('/journey', { replace: true })
    return null
  }
  return (
    <div className="section active">
      <Comp />
      {id && !GUIDE_SKIP.has(id) && <SectionGuide key={id} id={id} />}
    </div>
  )
}

export function AppReusable() {
  return (
    <div className="app reusable-hub">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/journey" replace />} />
            <Route path="/:id" element={<SectionView />} />
            <Route path="*" element={<Navigate to="/journey" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}