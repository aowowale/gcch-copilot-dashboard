import { HomeV2 } from '../sections/HomeV2'

export function HomeV2App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-head">
          <h1>Copilot Reusable Hub</h1>
          <div className="sub">Standalone onboarding app</div>
        </div>
        <nav className="nav">
          <a className="nav-item active" href="/homev2.html">
            <span className="ni-num">R1</span>
            <span className="ni-name">Reusable V2</span>
          </a>
        </nav>
      </aside>
      <div className="main">
        <div className="topbar">
          <div style={{ flex: 1, fontSize: 13, color: 'var(--gray)', fontWeight: 600 }}>
            Standalone reusable onboarding hub
          </div>
        </div>
        <div className="content">
          <HomeV2 />
        </div>
      </div>
    </div>
  )
}
