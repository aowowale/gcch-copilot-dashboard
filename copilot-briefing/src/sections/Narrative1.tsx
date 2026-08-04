import { useState } from 'react'
import { CopyButton, SectionHead, SpeakerNote } from '../components/Primitives'
import { fears, controls, pending, planes } from '../data/content'

export function Concerns() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <>
      <SectionHead num="01" title="Your Concerns, Answered">
        Every fear mapped to the specific control that addresses it. Click any card to expand.
      </SectionHead>
      <SpeakerNote>
        Walk each one. The strongest three: data exposure (RSS locks it), sensitive prompts (Exchange
        Online + governance), web grounding (ZQL). Shadow AI is the one in-progress item — be honest it is amber.
      </SpeakerNote>
      <div className="grid grid-2">
        {(fears as any[]).map((f) => (
          <div
            key={f.id}
            className={`fear-card ${f.status}${open === f.id ? ' open' : ''}`}
            onClick={() => setOpen(open === f.id ? null : f.id)}
          >
            <div className="fc-top">
              <div className="fc-q">
                {f.q}
                <svg className="chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
              </div>
              <div className="fc-short">{f.short}</div>
            </div>
            {open === f.id && (
              <div className="fc-body open">
                <div className="fc-inner">
                  <div className="fc-control"><div className="fcc-tag">{f.tag}</div>{f.control}</div>
                  {f.detail && <div className="fc-detail">{f.detail}</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export function Controls() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [pendingState, setPendingState] = useState((pending as any[]).map((p) => ({ owner: p.owner || '', status: p.status || 'not-started' })))
  const pendingCycle = ['not-started', 'in-progress', 'complete']

  const model: Record<string, any[]> = { ...(controls as Record<string, any[]>), Pending: (pending as any[]) }
  const cats = Object.keys(model)
  const allItems = cats.flatMap((cat: string) => model[cat].map((item: any, i: number) => ({ cat, item, i })))
  const total = allItems.length
  const done = allItems.filter(({ cat, item, i }) => {
    if (cat === 'Pending') return pendingState[i]?.status === 'complete'
    return item.status === 'complete'
  }).length

  const statusLabel = (status: string) => {
    if (status === 'complete') return 'Complete'
    if (status === 'in-progress') return 'In Progress'
    return 'Not Started'
  }

  const statusClass = (status: string) => {
    if (status === 'complete') return 'badge-done'
    if (status === 'in-progress') return 'badge-progress'
    return 'badge-pending'
  }

  const cyclePendingStatus = (idx: number) => {
    setPendingState((prev) => {
      const next = [...prev]
      const current = next[idx]?.status || 'not-started'
      const nextStatus = pendingCycle[(pendingCycle.indexOf(current) + 1) % pendingCycle.length]
      next[idx] = { ...next[idx], status: nextStatus }
      return next
    })
  }

  const updatePendingOwner = (idx: number, owner: string) => {
    setPendingState((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], owner }
      return next
    })
  }

  return (
    <>
      <SectionHead num="02" title="Controls Already In Place">
        Expanded implementation reference. Click any control for purpose, where to configure, steps, verification, and GCC High notes.
      </SectionHead>
      <SpeakerNote>
        This section is now a stand-up guide, not just a checklist. Pending controls use live owner and status fields so it can run as a working tracker during meetings.
      </SpeakerNote>
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div>
            <div className="counter-big">{done}<span style={{ fontSize: 18, color: 'var(--gray)' }}>/{total}</span></div>
            <div style={{ fontSize: 12, color: 'var(--gray)' }}>controls complete</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="progress-bar"><div className="pb-fill" style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
            <div style={{ fontSize: 12, color: 'var(--gray)' }}>{done} complete · {total - done} remaining</div>
          </div>
        </div>
      </div>
      <div className="grid grid-2">
        {cats.map((cat) => (
          <div className="ctrl-cat" key={cat}>
            <div className="ctrl-cat-h">{cat}</div>
            {model[cat].map((c: any, i: number) => {
              const k = cat + i
              const pState = cat === 'Pending' ? pendingState[i] : null
              return (
                <div className={`ctrl-item${open[k] ? ' open' : ''}`} key={k}>
                  <div className="ci-t" onClick={() => setOpen((o) => ({ ...o, [k]: !o[k] }))}>
                    <span className="ci-check">{cat === 'Pending' ? '○' : '✓'}</span>
                    <span>{c.t}</span>
                    {cat === 'Pending'
                      ? <button className={`badge ${statusClass(pState?.status || 'not-started')}`} onClick={(e) => { e.stopPropagation(); cyclePendingStatus(i) }}>{statusLabel(pState?.status || 'not-started')}</button>
                      : <span className={`badge ${statusClass(c.status || 'complete')}`}>{statusLabel(c.status || 'complete')}</span>}
                  </div>
                  <div className="ci-d">
                    <p className="ci-summary">{c.d}</p>

                    {cat === 'Pending' ? (
                      <>
                        {pState?.status !== 'not-started' && c.when && String(c.when).trim() && (
                          <div className="ci-block"><div className="ci-l">When</div><p>{c.when}</p></div>
                        )}
                        <div className="ci-block"><div className="ci-l">How</div><p>{c.how}</p></div>
                        <div className="ci-owner-row">
                          <div className="ci-l">Owner</div>
                          <input
                            value={pState?.owner || ''}
                            placeholder="Assign owner"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updatePendingOwner(i, e.target.value)}
                            className="ci-owner-input"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="ci-block"><div className="ci-l">Purpose</div><p>{c.purpose}</p></div>
                        <div className="ci-block"><div className="ci-l">Where</div><p>{c.where}</p></div>
                        <div className="ci-block"><div className="ci-l">Steps</div>
                          <ol className="ci-steps">{(c.steps || []).map((s: string, idx: number) => <li key={idx}>{s}</li>)}</ol>
                        </div>
                        <div className="ci-block">
                          <div className="ci-l">Verify</div>
                          <p>{c.verify}</p>
                          <CopyButton text={c.verify || ''} />
                        </div>
                        <div className="ci-block"><div className="ci-l">GCCH Note</div><p>{c.gcch}</p></div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

export function Planes() {
  const [open, setOpen] = useState<string | null>(null)
  const badge = (r: string) => r === 'locked' ? 'badge-done' : r === 'active' ? 'badge-progress' : r === 'future' ? 'badge-red' : 'badge-pending'
  return (
    <>
      <SectionHead num="03" title="The Four Data Planes">
        Copilot pulls from four data planes. Each has a different risk profile and control. Click to expand.
      </SectionHead>
      <SpeakerNote>
        Key insight: with RSS at zero allowed list, SharePoint is locked. The Graph plane (email, Teams)
        becomes the primary surface — and there is no RSS equivalent for it. That is where labels and DLP
        matter. Extensibility is the future highest-risk vector.
      </SpeakerNote>
      <div className="grid">
        {(planes as any[]).map((p) => (
          <div key={p.id} className={`plane ${p.risk}${open === p.id ? ' open' : ''}`} onClick={() => setOpen(open === p.id ? null : p.id)}>
            <div className="plane-h">
              <div><div className="plane-name">{p.name}</div><div className="plane-what">{p.what}</div></div>
              <span className={`badge ${badge(p.risk)}`}>{p.riskLabel}</span>
            </div>
            {open === p.id && (
              <div className="plane-body open"><div className="plane-inner">
                <div className="pi-label">Current Status</div>{p.status}
                <div className="pi-label">What's Next</div>{p.next}
              </div></div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
