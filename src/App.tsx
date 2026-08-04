import { useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate, useParams, Navigate } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import { SECTIONS } from './lib/sections'
import { meta } from './data/content'
import { SECTION_COMPONENTS } from './sections/registry'

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
  return (
    <div className="topbar">
      <div style={{ flex: 1, fontSize: 13, color: 'var(--gray)', fontWeight: 600 }}>
        {meta.title}
      </div>
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
    navigate('/concerns', { replace: true })
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
              <Route path="/" element={<Navigate to="/concerns" replace />} />
              <Route path="/:id" element={<SectionView />} />
              <Route path="*" element={<Navigate to="/concerns" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </StoreProvider>
  )
}
