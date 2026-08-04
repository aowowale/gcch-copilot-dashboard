import { useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { SECTIONS } from './lib/sections'
import { meta } from './data/content'
import { SECTION_COMPONENTS } from './sections/registry'
import { useStore } from './lib/store'

const GUIDED_SEQUENCE = ['home', 'tracker', 'controls', 'ask']

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h1>M365 Copilot</h1>
        <div className="sub">GCC High — Interactive Briefing</div>
      </div>
      <nav className="nav">
        {SECTIONS.map((s) => (
          <NavLink
            key={s.id}
            to={`/${s.id}`}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            <span className="nav-num">{s.num}</span>
            <span className="nav-name">{s.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function Topbar() {
  const { state, update } = useStore()
  const nav = useNavigate()
  const loc = useLocation()
  const current = (loc.pathname.split('/')[1] || 'home').toLowerCase()
  const idx = GUIDED_SEQUENCE.indexOf(current)

  const startGuided = () => {
    update({ guidedMode: true, guidedStep: 0 })
    nav('/home')
  }

  const stopGuided = () => update({ guidedMode: false, guidedStep: 0 })

  const moveGuided = (dir: -1 | 1) => {
    const currentStep = idx >= 0 ? idx : state.guidedStep
    const next = Math.max(0, Math.min(GUIDED_SEQUENCE.length - 1, currentStep + dir))
    update({ guidedStep: next })
    nav(`/${GUIDED_SEQUENCE[next]}`)
  }

  return (
    <div className="topbar">
      <div style={{ flex: 1, fontSize: 13, color: 'var(--gray)', fontWeight: 600 }}>
        {meta.title}
      </div>
      {!state.guidedMode && (
        <button className="btn" onClick={startGuided}>Start guided mode</button>
      )}
      {state.guidedMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-progress">Guided mode</span>
          <span style={{ fontSize: 12, color: 'var(--gray)' }}>
            Step {Math.max(idx, state.guidedStep) + 1} of {GUIDED_SEQUENCE.length}
          </span>
          <button className="btn" disabled={(idx >= 0 ? idx : state.guidedStep) <= 0} onClick={() => moveGuided(-1)}>Back</button>
          <button className="btn btn-primary" disabled={(idx >= 0 ? idx : state.guidedStep) >= GUIDED_SEQUENCE.length - 1} onClick={() => moveGuided(1)}>Next</button>
          {(idx >= 0 ? idx : state.guidedStep) >= GUIDED_SEQUENCE.length - 1 && (
            <button className="btn" onClick={stopGuided}>Finish</button>
          )}
        </div>
      )}
      <button className="btn" onClick={() => window.print()}>Print</button>
    </div>
  )
}

function SectionView() {
  const { id } = useParams()
  const def = SECTIONS.find((s) => s.id === id)
  const Comp = id ? SECTION_COMPONENTS[id] : undefined
  const navigate = useNavigate()
  useEffect(() => {
    const el = document.querySelector('.content')
    if (el) el.scrollTop = 0
  }, [id])
  if (!def || !Comp) {
    navigate('/home', { replace: true })
    return null
  }
  return <div className="section active">{<Comp />}</div>
}

export default function App() {
  return (
    <StoreProvider>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/:id" element={<SectionView />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </StoreProvider>
  )
}
