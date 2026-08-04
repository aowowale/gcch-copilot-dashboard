import { SectionHead, SpeakerNote } from '../components/Primitives'
import { useStore } from '../lib/store'
import { downloadText } from '../lib/util'
import { actionStatuses } from '../data/dashboard'
import { asks, agents, agentPrinciples } from '../data/content'
import type { ActionItem } from '../data/types'
import { useState } from 'react'

const ACT_COLOR: Record<string, string> = { Open: 'var(--amber)', 'In Progress': 'var(--blue)', Resolved: 'var(--green)', Blocked: 'var(--red)' }

export function ActionsEditor({ heading = true }: { heading?: boolean }) {
  const { state, update } = useStore()
  const acts = state.dashActions

  const edit = (id: string, field: keyof ActionItem, val: string) =>
    update({ dashActions: acts.map((a) => (a.id === id ? { ...a, [field]: val } : a)) })
  const add = () => update({ dashActions: [{ id: 'act-' + Date.now(), title: '', owner: '', due: '', status: 'Open', notes: '' }, ...acts] })
  const remove = (id: string) => update({ dashActions: acts.filter((a) => a.id !== id) })
  const exportAll = () => {
    const txt = 'OPEN ACTIONS — M365 Copilot Deployment\n' + '='.repeat(45) + '\n\n' +
      acts.map((a) => `[${a.status}] ${a.title}\n    Owner: ${a.owner || '—'} | Due: ${a.due || '—'}\n    ${a.notes}`).join('\n\n')
    downloadText(txt, 'copilot-open-actions.txt')
  }

  return (
    <>
      {heading && (
        <>
          <SectionHead num="17" title="Open Actions">
            Items needing follow-up, investigation, or owner assignment. Click any field to edit — owner, due,
            status, and notes are all yours to fill in. Add new actions as they come up.
          </SectionHead>
          <SpeakerNote>
            None of these are technical blockers. The technical foundation is built. Everything here is process —
            approvals, communications, policy docs, validation. Assign owners and due dates live as you work through them.
          </SpeakerNote>
        </>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn" onClick={add}>+ Add action</button>
        <button className="btn" onClick={exportAll} style={{ marginLeft: 'auto' }}>Export ▸</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {acts.map((a) => {
          const col = ACT_COLOR[a.status] || 'var(--gray)'
          return (
            <div className="card" key={a.id} style={{ borderLeft: `4px solid ${col}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <input value={a.title} onChange={(e) => edit(a.id, 'title', e.target.value)} placeholder="Action title"
                  style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: 'var(--navy)', border: 'none', background: 'transparent', outline: 'none', borderBottom: '1px dashed var(--border)', padding: '2px 0' }} />
                <button onClick={() => remove(a.id)} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                <div><div className="mini-label">Owner</div><input value={a.owner} onChange={(e) => edit(a.id, 'owner', e.target.value)} placeholder="—" className="act-input" /></div>
                <div><div className="mini-label">Due</div><input value={a.due} onChange={(e) => edit(a.id, 'due', e.target.value)} placeholder="—" className="act-input" /></div>
                <div><div className="mini-label">Status</div>
                  <select value={a.status} onChange={(e) => edit(a.id, 'status', e.target.value)} className="act-input" style={{ color: col, fontWeight: 700 }}>
                    {actionStatuses.map((s) => <option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div style={{ marginTop: 8 }}><div className="mini-label">Notes</div>
                <textarea value={a.notes} onChange={(e) => edit(a.id, 'notes', e.target.value)} rows={2} placeholder="Notes" className="act-input" style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} /></div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function Actions() { return <ActionsEditor /> }

export function DecisionLogEditor() {
  const { state, update } = useStore()
  const log = state.dashDecisionLog
  const add = () => update({ dashDecisionLog: [...log, { id: 'dl-' + Date.now(), title: '', notes: '' }] })
  const edit = (id: string, field: 'title' | 'notes', val: string) =>
    update({ dashDecisionLog: log.map((d) => (d.id === id ? { ...d, [field]: val } : d)) })
  const remove = (id: string) => update({ dashDecisionLog: log.filter((d) => d.id !== id) })
  return (
    <>
      {log.length === 0 && <p style={{ fontSize: 12, color: 'var(--gray)', fontStyle: 'italic' }}>No additional decisions captured yet.</p>}
      {log.map((d) => (
        <div className="dlog-card" key={d.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <input value={d.title} onChange={(e) => edit(d.id, 'title', e.target.value)} placeholder="Decision / topic"
              style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--navy)', border: 'none', background: 'transparent', outline: 'none', borderBottom: '1px dashed var(--border)', padding: '2px 0' }} />
            <button onClick={() => remove(d.id)} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
          <textarea value={d.notes} onChange={(e) => edit(d.id, 'notes', e.target.value)} rows={2} placeholder="Outcome, owner, follow-up..." className="act-input" style={{ width: '100%', marginTop: 8, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
      ))}
      <button className="btn" onClick={add} style={{ marginTop: 8 }}>+ Add decision</button>
    </>
  )
}

export function Ask() {
  const { state, update } = useStore()
  const setDecision = (id: string, val: string) =>
    update({ decisions: { ...state.decisions, [id]: state.decisions[id] === val ? undefined : val } })

  const exportDecisions = () => {
    const date = new Date().toLocaleString()
    let txt = 'M365 COPILOT DEPLOYMENT — DECISION LOG\n' + '='.repeat(45) + '\nMeeting: ' + date + '\n\n'
    ;(asks as any[]).forEach((a, i) => {
      const d = state.decisions[a.id]
      const stat = d === 'agree' ? 'AGREED' : d === 'defer' ? 'DEFERRED' : d === 'question' ? 'QUESTION RAISED' : 'PENDING — NO DECISION'
      txt += `${i + 1}. ${a.title} [${a.tag}]\n   DECISION: ${stat}\n   ${a.desc}\n\n`
    })
    const agreed = (asks as any[]).filter((a) => state.decisions[a.id] === 'agree').length
    txt += '-'.repeat(45) + `\nSUMMARY: ${agreed} of ${(asks as any[]).length} asks agreed.\n`
    if (state.dashDecisionLog.length) {
      txt += '\nADDITIONAL DECISIONS & NOTES CAPTURED IN MEETING:\n' + '-'.repeat(45) + '\n'
      state.dashDecisionLog.forEach((d, i) => { txt += `${i + 1}. ${d.title || '(untitled)'}\n   ${d.notes || ''}\n\n` })
    }
    txt += '\nDRAFT FOLLOW-UP EMAIL:\n' + '-'.repeat(45) + '\n'
    txt += 'Subject: M365 Copilot Deployment — Decisions and Next Steps\n\n'
    txt += 'Thank you for the time today. To confirm what we agreed:\n\n'
    ;(asks as any[]).forEach((a) => {
      const d = state.decisions[a.id]
      if (d === 'agree') txt += `• AGREED: ${a.title}\n`
      else if (d === 'defer') txt += `• DEFERRED: ${a.title} — to revisit\n`
      else if (d === 'question') txt += `• OPEN QUESTION: ${a.title} — follow-up needed\n`
      else txt += `• PENDING: ${a.title}\n`
    })
    txt += '\nNext steps to follow. Please reply with any corrections.\n'
    downloadText(txt, 'copilot-decision-log.txt')
  }

  return (
    <>
      <SectionHead num="18" title="The Ask">
        Three decisions. Record each live — Agree, Defer, or Question. Capture any other decisions that come up
        in the meeting below. Export the full decision log at the end.
      </SectionHead>
      <SpeakerNote>
        Use this section as a live governance checkpoint. Confirm baseline controls, pilot boundaries, and scale
        gates in writing. Focus on evidence and ownership, then capture open questions for follow-up.
      </SpeakerNote>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={exportDecisions}>Export decision log ▸</button>
      </div>
      {(asks as any[]).map((a, i) => {
        const d = state.decisions[a.id]
        const cls = d === 'agree' ? ' agreed' : d === 'defer' ? ' deferred' : ''
        const stat = d === 'agree' ? 'Agreed' : d === 'defer' ? 'Deferred' : d === 'question' ? 'Question raised' : 'Pending'
        return (
          <div className={`ask${cls}`} key={a.id}>
            <div className="ask-h">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                <div className="ask-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div className="ask-title">{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray)', fontWeight: 600, textTransform: 'uppercase' }}>{a.tag}</div>
                </div>
              </div>
              <span className="ask-status">{stat}</span>
            </div>
            <div className="ask-desc">{a.desc}</div>
            <div className="ask-rationale">{a.rationale}</div>
            <div className="ask-actions">
              <button className={`ask-btn agree${d === 'agree' ? ' on' : ''}`} onClick={() => setDecision(a.id, 'agree')}>✓ Agree</button>
              <button className={`ask-btn defer${d === 'defer' ? ' on' : ''}`} onClick={() => setDecision(a.id, 'defer')}>⏸ Defer</button>
              <button className={`ask-btn question${d === 'question' ? ' on' : ''}`} onClick={() => setDecision(a.id, 'question')}>? Question</button>
            </div>
          </div>
        )
      })}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-h" style={{ marginBottom: 6 }}>Decisions & notes captured in the meeting</div>
        <p style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 10 }}>Anything decided or raised live that isn't one of the three asks above. These export with the decision log.</p>
        <DecisionLogEditor />
      </div>
    </>
  )
}

function AgentsBlock() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      <div className="card" style={{ marginBottom: 16, background: 'var(--sky)' }}>
        <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>{(agentPrinciples as string[]).map((p) => `✓ ${p}`).join('  ·  ')}</div>
      </div>
      <div className="grid">
        {(agents as any[]).map((a, i) => (
          <div className={`agent${open === i ? ' open' : ''}`} key={i} onClick={() => setOpen(open === i ? null : i)}>
            <div className="agent-h">
              <div className="agent-num">{a.n}</div>
              <div className="agent-name">{a.name}</div>
              <svg className="chevron" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}><path d="M7 10l5 5 5-5z" /></svg>
            </div>
            {open === i && (
              <div className="agent-body open"><div className="agent-inner">
                <div className="ag-label">Problem it solves</div>{a.problem}
                <div className="ag-label">What it does</div>{a.does}
                <div className="ag-label">Permissions</div><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--teal)' }}>{a.perms}</span>
              </div></div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export function Other() {
  return (
    <>
      <SectionHead num="22" title="Other">
        Supplementary material — future-state and supporting content that sits outside the core deployment narrative.
      </SectionHead>
      <div className="card-h" style={{ marginBottom: 4 }}>AI Agents — What's Next</div>
      <p style={{ fontSize: 12.5, color: 'var(--gray)', marginBottom: 12 }}>
        Five agents for this environment. Phase 3 — after the Copilot pilot is stable. Click any to expand. All
        use delegated permissions (see only what the user sees), all calls to graph.microsoft.us, all auditable.
      </p>
      <AgentsBlock />
    </>
  )
}
