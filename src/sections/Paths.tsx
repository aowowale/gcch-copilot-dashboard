import { useState } from 'react'
import { SectionHead, SpeakerNote } from '../components/Primitives'
import { paths } from '../data/content'

const badgeClass: Record<string, string> = {
  ready: 'badge-done', gates: 'badge-progress', recommended: 'badge-progress', target: 'badge-target',
}

export function Paths() {
  const [sel, setSel] = useState('path3')
  const p = (paths as any[]).find((x) => x.id === sel)!
  return (
    <>
      <SectionHead num="04" title="Four Deployment Paths">
        Click a path to see what users get, the business outcomes it drives, the status, and exactly how to turn it on.
      </SectionHead>
      <SpeakerNote>
        Path 1 is ready now. Path 3 is the recommended next step — and you can start it TODAY because RSS
        already locks SharePoint. Path 4 is the target; the path to it starts with the Path 3 pilot. Lead with
        the outcomes, not the features. Don't ask them to flip web grounding today — ask for agreement on direction.
      </SpeakerNote>
      <div className="path-rail">
        {(paths as any[]).map((x) => (
          <div
            key={x.id}
            className={`path-chip${x.id === sel ? ' sel' : ''}${x.status === 'target' ? ' target' : ''}`}
            onClick={() => setSel(x.id)}
          >
            <div className="pc-num">PATH {x.num}</div>
            <div className="pc-name">{x.name}</div>
            <span className={`badge ${badgeClass[x.status]}`} style={{ fontSize: 8 }}>{x.statusLabel}</span>
          </div>
        ))}
      </div>
      <div className="path-detail">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
          <div><h3>Path {p.num} — {p.name}</h3><div className="pd-tag">{p.tagline}</div></div>
          <span className={`badge ${badgeClass[p.status]}`}>{p.statusLabel}</span>
        </div>
        {p.benefits && (
          <div className="card" style={{ margin: '14px 0', background: 'var(--lgreen)', border: '1px solid var(--green)' }}>
            <div className="pdb-label" style={{ color: 'var(--green)', marginBottom: 8 }}>Why this is the right move — real outcomes</div>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {p.benefits.map((b: [string, string], i: number) => (
                <div key={i} style={{ background: '#fff', borderRadius: 7, padding: '10px 12px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)' }}>{b[0]}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3, lineHeight: 1.55 }}>{b[1]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pd-cols">
          <div className="pd-box gets">
            <div className="pdb-label">What users get</div>
            <ul className="pd-list">{p.gets.map((g: string, i: number) => <li key={i}>{g}</li>)}</ul>
          </div>
          <div className="pd-box status">
            <div className="pdb-label" style={{ color: 'var(--green)' }}>✓ Done</div>
            <ul className="pd-list pd-done">{p.done.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
            <div className="pdb-label" style={{ color: 'var(--gray)', marginTop: 14 }}>○ Remaining</div>
            <ul className="pd-list pd-rem">{p.remaining.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>
          </div>
        </div>
        <div className="turnon">
          <div className="to-label">How to turn it on</div>
          <ol>{p.turnon.map((t: string, i: number) => <li key={i}>{t}</li>)}</ol>
        </div>
        <div className="path-note">{p.note}</div>
      </div>
    </>
  )
}
