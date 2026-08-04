import { SectionHead } from '../components/Primitives'

export function Tracker() {
  return (
    <>
      <SectionHead num="21" title="Live Tracker — Start Here">
        GCCH readiness snapshot and action tracker. Review this first before deep-dive sections.
      </SectionHead>

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
