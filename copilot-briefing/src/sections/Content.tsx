import { useState } from 'react'
import { SectionHead, SpeakerNote, CopyButton, Cite, Sources } from '../components/Primitives'
import {
  guardrails, dlp, aiLayers, samPlan, acceptance, humanRisk, lessons,
  endpoints, sam, gotchas, traceability, failures,
} from '../data/content'

export function Rss() {
  return (
    <>
      <SectionHead num="07" title="RSS — Current State">
        Restricted SharePoint Search<Cite n={1} id="rss" /> is enabled with no allowed list. Here is what that means.
      </SectionHead>
      <SpeakerNote>
        RSS is enabled with NO allowed list — SharePoint completely locked. IMPORTANT: the customer correctly
        flagged that RSS affects the entire org-wide search index, not just Copilot. This should go through a CR
        documenting user impact and a plan to populate the allowed list so search is not broken. Acknowledge this
        directly — it builds trust.
      </SpeakerNote>
      <div className="grid grid-2">
        <div className="card" style={{ borderLeft: '5px solid var(--green)' }}>
          <div className="card-h">SharePoint Plane — LOCKED</div>
          <p style={{ fontSize: 13, color: 'var(--gray)' }}>Zero sites accessible to Copilot. The allowed list is empty. Every SharePoint site is off limits until explicitly reviewed and added. All 249 oversharing sites invisible.</p>
          <div style={{ marginTop: 14 }}>
            <div className="counter-big" style={{ color: 'var(--green)' }}>0<span style={{ fontSize: 16, color: 'var(--gray)' }}>/249</span></div>
            <div style={{ fontSize: 11, color: 'var(--gray)' }}>sites on allowed list</div>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '5px solid var(--amber)' }}>
          <div className="card-h">Graph Plane — ACTIVE</div>
          <p style={{ fontSize: 13, color: 'var(--gray)' }}>Email, Teams, calendar, own OneDrive remain accessible. No RSS equivalent exists for this plane. This is the user's own data they already access daily. Governed by DLP and retention.</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16, background: 'var(--lamber)', border: '1px solid var(--amber)' }}>
        <div className="card-h" style={{ color: 'var(--amber)' }}>⚠ Important — RSS affects all-user search</div>
        <p style={{ fontSize: 13, color: '#78350F' }}>RSS is not Copilot-only. It restricts the organization-wide M365 search index for all users. Searching from the SharePoint start page or M365 search returns only the user's own content until sites are added to the allowed list. This should go through a change request documenting user impact and a plan to populate the allowed list quickly.</p>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">Criteria to add a site to the allowed list</div>
        <ul className="pd-list pd-done" style={{ fontSize: 13 }}>
          <li>Sensitivity label applied to the site<Cite n={2} id="purviewAI" /></li>
          <li>EEEU (Everyone Except External Users) permissions removed or exception approved</li>
          <li>Site owner confirmed and notified</li>
          <li>Access review completed</li>
          <li>Governance team sign-off</li>
        </ul>
      </div>
      <Sources ids={['rss', 'purviewAI']} />
    </>
  )
}

export function Guardrails() {
  const g = guardrails as any
  const classStmt = 'Copilot does not interpret classification markings. It has no concept of FOUO or CUI as categories. It enforces whatever policies are applied to the underlying data. SIT-based prompt DLP is a known GCC High gap and must be tested before being relied upon.'
  return (
    <>
      <SectionHead num="08" title="Guardrails — What Actually Happens">
        Two layers. The behavior matrix shows what blocks, what filters, what alerts — enforced through Microsoft
        Purview DLP<Cite n={1} id="dlpCopilot" /> and sensitivity labels<Cite n={2} id="purviewAI" />.
      </SectionHead>
      <SpeakerNote>
        Two layers: model safety (always on, no admin visibility, no alerting) and policy enforcement (Purview —
        where real GCC High control lives). The customer's question: block or alert? Answer: hard block ONLY via
        DLP. No native real-time alerting. Copilot does not interpret classification — it enforces policy.
        SIT-based prompt DLP is a GCC High gap — do not promise it.
      </SpeakerNote>
      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {g.layers.map((l: any, i: number) => (
          <div className="card" key={i} style={{ borderLeft: `5px solid var(--${l.color === 'slate' ? 'gray' : 'teal'})` }}>
            <div className="card-h">{l.name}</div>
            <p style={{ fontSize: 12.5, color: 'var(--gray)' }}>{l.desc}</p>
            <div style={{ marginTop: 10 }}>{l.covers.map((c: string, j: number) => <span key={j} className="badge badge-pending" style={{ margin: 2 }}>{c}</span>)}</div>
            <p style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 10, fontStyle: 'italic' }}>{l.behavior}</p>
          </div>
        ))}
      </div>
      <div className="card-h" style={{ marginBottom: 8 }}>Behavior matrix — block vs filter vs alert</div>
      <table className="matrix">
        <thead><tr><th>Trigger</th><th>User experience</th><th>Admin visibility</th><th>Verdict</th></tr></thead>
        <tbody>{g.matrix.map((m: any, i: number) => (
          <tr key={i}><td><strong>{m.scenario}</strong></td><td>{m.ux}</td><td>{m.admin}</td><td className="verdict">{m.verdict}</td></tr>
        ))}</tbody>
      </table>
      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card"><div className="card-h" style={{ color: 'var(--green)' }}>Available in GCC High</div>
          <ul className="pd-list pd-done" style={{ fontSize: 12.5 }}>{g.gaps.available.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div>
        <div className="card"><div className="card-h" style={{ color: 'var(--red)' }}>NOT available / not confirmed</div>
          <ul className="pd-list" style={{ fontSize: 12.5 }}>{g.gaps.notAvailable.map((x: string, i: number) => <li key={i} style={{ color: 'var(--slate)' }}>✗ {x}</li>)}</ul></div>
      </div>
      <div className="statement" style={{ borderLeftColor: 'var(--amber)', background: 'var(--lamber)' }}>
        <div style={{ float: 'right' }}><CopyButton text={classStmt} /></div>
        <div className="st-label" style={{ color: 'var(--amber)' }}>On classification markings</div>
        {g.classification}
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-h">Controlled test plan</div>
        {g.testplan.map((t: any, i: number) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--ltgray)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{t.n} — {t.t}</div>
            <div style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 3 }}>{t.steps}</div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 10, fontWeight: 600 }}>Use clearly fictional test content only. Never use actual classified or sensitive content.</p>
      </div>
      <Sources ids={['dlpCopilot', 'purviewAI']} />
    </>
  )
}

export function Dlp() {
  return (
    <>
      <SectionHead num="09" title="DLP Decision Framework">
        Three scenarios, three distinct DLP<Cite n={1} id="dlpCopilot" /> conversations. The hard block vs alert
        distinction is critical — web grounding is a separate authorization conversation<Cite n={2} id="webSearch" />.
      </SectionHead>
      <SpeakerNote>
        For go-live: DLP in audit mode gives visibility, not blocking. Web grounding is not a DLP conversation,
        it is an authorization conversation. Tenant grounding: label-based DLP works, SIT-based prompt DLP is a
        GCC High gap — test it.
      </SpeakerNote>
      {(dlp as any[]).map((d, i) => (
        <div className="card" key={i} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div className="card-h" style={{ margin: 0 }}>{d.scenario}</div>
            <span className="badge badge-pending">Scenario {i + 1}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase' }}>What leaves the boundary</div>
              <p style={{ fontSize: 13, marginTop: 3 }}>{d.leaves}</p></div>
            <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase' }}>Minimum DLP</div>
              <p style={{ fontSize: 13, marginTop: 3 }}>{d.min}</p></div>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 10, fontStyle: 'italic' }}>{d.why}</p>
          <div style={{ marginTop: 8 }}><span className="badge badge-progress">Gate: {d.gate}</span></div>
        </div>
      ))}
      <Sources ids={['dlpCopilot', 'webSearch']} />
    </>
  )
}

export function AiSec() {
  const [open, setOpen] = useState<number | null>(null)
  const stmt = 'Federal AI security is currently identity- and data-driven, not AI-native. Strong: identity, network, governance. Moderate: data controls. Weak/emerging: runtime AI controls and monitoring. Control strategy must assume the AI layer is partially untrusted and compensate above and below it.'
  return (
    <>
      <SectionHead num="10" title="Federal AI Security Framework">
        The seven-layer control model with federal reality ratings. Identity and Purview data controls<Cite n={1} id="purviewAI" />
        carry the model; enterprise data protection<Cite n={2} id="edp" /> underpins the AI layer. Click each layer.
      </SectionHead>
      <SpeakerNote>
        The framing that lands: "Federal AI security is identity- and data-driven, not AI-native." Strong:
        identity, network, governance. Moderate: data. Weak/emerging: runtime and monitoring. The customer is not
        behind — the whole industry is here. Their SAM findings are the textbook example of identity
        misconfiguration exposed at scale.
      </SpeakerNote>
      <div className="grid" style={{ gap: 10 }}>
        {(aiLayers as any[]).map((l, i) => (
          <div key={i} className={`layer ${l.rating}${open === i ? ' open' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
            <div className="layer-h"><div className="layer-name">{l.n}. {l.name}</div><div className="layer-rating">{l.ratingLabel}</div></div>
            {open === i && (
              <div className="layer-body open">
                <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 8 }}><strong>Controls:</strong> {l.covers}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 6 }}><strong>Federal reality:</strong> {l.federal}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="statement">
        <div style={{ float: 'right' }}><CopyButton text={stmt} /></div>
        <div className="st-label">Bottom line for the ISSO/AO</div>
        Federal AI security is currently identity- and data-driven, not AI-native. Control strategy must assume
        the AI layer is partially untrusted and compensate above and below it with identity and data controls.
      </div>
      <Sources ids={['purviewAI', 'edp']} />
    </>
  )
}

export function Sam() {
  const s = samPlan as any
  return (
    <>
      <SectionHead num="06" title="SAM Findings & Remediation Plan">
        The data governance findings and the parallel pipeline for moving forward — Restricted SharePoint Search<Cite n={1} id="rss" />
        plus Purview data governance<Cite n={2} id="purviewAI" /> — without blocking deployment.
      </SectionHead>
      <SpeakerNote>
        Lead with the control model box and the core principle: remediation pace sets expansion pace, not
        deployment pace. RSS removes SharePoint as a risk surface but does NOT eliminate Graph risk — be precise
        about that. The five-point gate is your strongest artifact. Ownership is a hard gate. KPIs make it trackable.
      </SpeakerNote>
      <div className="card" style={{ background: 'linear-gradient(135deg,var(--navy),var(--blue))', color: '#fff', border: 'none', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: '#7BAFD4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Control Model — anchor for the whole conversation</div>
        <div className="grid grid-2" style={{ gap: 10 }}>
          {s.controlModel.map((c: any, i: number) => (
            <div key={i} style={{ background: 'rgba(27,138,194,.2)', border: '1px solid var(--ltblue)', borderRadius: 8, padding: '10px 12px' }}>
              <span style={{ fontWeight: 800, fontSize: 13 }}>{c.k}</span> <span style={{ color: '#CADCFC', fontSize: 12.5 }}>= {c.v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="statement"><div className="st-label">Core principle</div>{s.principle}</div>
      <div className="card" style={{ margin: '16px 0' }}>
        <div className="card-h">Baseline findings</div>
        <table className="ref-table"><tbody>{s.baseline.map((b: any, i: number) => (
          <tr key={i}><td>{b.label}</td><td style={{ fontWeight: 700, color: 'var(--navy)' }}>{b.count}</td></tr>
        ))}</tbody></table>
      </div>
      <div className="card-h" style={{ margin: '18px 0 10px' }}>The phased remediation pipeline</div>
      {s.phases.map((p: any, i: number) => (
        <div className="card" key={i} style={{ marginBottom: 12, borderLeft: '4px solid var(--blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div className="card-h" style={{ margin: 0 }}>{p.n} — {p.t}</div>
            <span className="badge badge-pending">{p.when}</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--gray)', margin: '8px 0' }}>{p.d}</p>
          <ul className="pd-list" style={{ fontSize: 12.5 }}>{p.items.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
        </div>
      ))}
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card" style={{ borderLeft: '4px solid var(--amber)' }}>
          <div className="card-h">Graph Plane Hygiene (parallel track)</div>
          <p style={{ fontSize: 12.5, color: 'var(--gray)' }}>{s.graphHygiene.intro}</p>
          <ul className="pd-list" style={{ fontSize: 12.5, marginTop: 8 }}>{s.graphHygiene.items.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--green)' }}>
          <div className="card-h">The Five-Point Readiness Gate</div>
          <p style={{ fontSize: 12.5, color: 'var(--gray)' }}>{s.readinessGate.intro}</p>
          <ul className="pd-list pd-done" style={{ fontSize: 12.5, marginTop: 8 }}>{s.readinessGate.gates.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
          <div style={{ background: 'var(--lamber)', borderRadius: 6, padding: 10, marginTop: 10, fontSize: 12, color: '#78350F' }}><strong>Hard gate:</strong> {s.readinessGate.ownerRule}</div>
        </div>
      </div>
      <div className="statement" style={{ marginTop: 16 }}><div className="st-label">RSS → visibility, Labels → behavior</div>{s.enforcementLink}</div>
      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card"><div className="card-h">Remediation KPIs</div>
          <table className="ref-table" style={{ fontSize: 12 }}><tbody>{s.kpis.map((k: any, i: number) => (
            <tr key={i}><td>{k.m}</td><td style={{ color: 'var(--gray)', fontSize: 11.5 }}>{k.target}</td></tr>
          ))}</tbody></table></div>
        <div className="card"><div className="card-h">Auditability of remediation</div>
          <p style={{ fontSize: 12.5, color: 'var(--gray)' }}>{s.auditability.intro}</p>
          <ul className="pd-list pd-done" style={{ fontSize: 12.5, marginTop: 8 }}>{s.auditability.items.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul></div>
      </div>
      <div className="card" style={{ marginTop: 16, background: 'var(--sky)' }}>
        <div className="card-h">How this is framed for the customer</div>
        <p style={{ fontSize: 13, color: 'var(--slate)' }}>{s.customerFraming}</p>
      </div>
      <div className="card" style={{ marginTop: 12, background: 'var(--ltgray)' }}>
        <p style={{ fontSize: 12, color: 'var(--gray)' }}><strong>Timeline note:</strong> {s.timelineNote}</p>
      </div>
      <Sources ids={['rss', 'purviewAI']} />
    </>
  )
}

export function Acceptance() {
  const a = acceptance as any
  return (
    <>
      <SectionHead num="14" title="Pilot Acceptance Criteria">{a.intro}</SectionHead>
      <SpeakerNote>
        AOs love this — it turns the briefing into a decision framework. The honest "gap" rows (logging
        completeness, DLP enforcement, audit reconstruction) are the items the pilot exists to validate. Frame:
        "these are the conditions we prove before scaling. The gaps are not unknowns — they are tested items with
        a clear pass condition."
      </SpeakerNote>
      <table className="matrix">
        <thead><tr><th>Control area</th><th>Requirement</th><th>Pass condition</th><th>Status</th></tr></thead>
        <tbody>{a.criteria.map((c: any, i: number) => {
          const sc = c.status === 'validate' ? 'badge-progress' : 'badge-red'
          const sl = c.status === 'validate' ? 'Validate in pilot' : 'Known gap — test'
          return <tr key={i}><td><strong>{c.area}</strong></td><td>{c.req}</td><td>{c.pass}</td><td><span className={`badge ${sc}`}>{sl}</span></td></tr>
        })}</tbody>
      </table>
      <div className="card" style={{ marginTop: 16, background: 'var(--ltgray)' }}><p style={{ fontSize: 12.5, color: 'var(--gray)' }}>{a.note}</p></div>
    </>
  )
}

export function Human() {
  const h = humanRisk as any
  return (
    <>
      <SectionHead num="15" title="Human & Process Risk">{h.intro}</SectionHead>
      <SpeakerNote>
        Federal teams push here. Naming the non-technical risks — and pairing each with a control — shows you do
        not treat AI as purely technical. The FOUO-in-prompt scenario from Failure Simulation is the concrete example.
      </SpeakerNote>
      <div className="grid grid-2">
        {h.factors.map((f: any, i: number) => (
          <div className="card" key={i}>
            <div className="card-h">{f.t}</div>
            <p style={{ fontSize: 13, color: 'var(--gray)' }}>{f.d}</p>
            <div style={{ background: 'var(--lgreen)', borderRadius: 6, padding: '8px 10px', marginTop: 10, fontSize: 12 }}><strong style={{ color: 'var(--green)' }}>Control:</strong> {f.control}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export function Lessons() {
  return (
    <>
      <SectionHead num="16" title="Lessons Learned">
        Insights from M365 Copilot deployments across federal and GCC High environments — what consistently works and what consistently surprises.
      </SectionHead>
      <SpeakerNote>
        These are shared insights, not this customer's failures. They position you as someone who has done this
        before. The strongest ones for trust-building: "Copilot exposes problems it doesn't create," "honesty
        about gaps builds more trust than polish," and "audit reconstruction decides ATOs."
      </SpeakerNote>
      <div className="grid grid-2">
        {(lessons as any[]).map((l, i) => (
          <div className="card" key={i}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--blue)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>{i + 1}</div>
              <div className="card-h" style={{ margin: 0, fontSize: 14 }}>{l.t}</div>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--gray)', margin: '10px 0' }}>{l.d}</p>
            <div style={{ background: 'var(--lgreen)', borderRadius: 6, padding: '8px 10px', fontSize: 12 }}><strong style={{ color: 'var(--green)' }}>Takeaway:</strong> {l.takeaway}</div>
          </div>
        ))}
      </div>
    </>
  )
}

export function Reference() {
  return (
    <>
      <SectionHead num="19" title="Technical Reference">
        GCC High endpoints, SAM findings, known gotchas. Always available for quick lookup.
      </SectionHead>
      <div className="grid grid-2">
        <div className="card"><div className="card-h">GCC High Endpoints</div>
          <table className="ref-table"><tbody>{(endpoints as any[]).map((e, i) => (
            <tr key={i}><td>{e[0]}</td><td>{e[1]}</td></tr>
          ))}</tbody></table></div>
        <div><div className="card" style={{ marginBottom: 14 }}><div className="card-h">SAM Findings Baseline</div>
          <table className="ref-table"><tbody>{(sam as any[]).map((s, i) => (
            <tr key={i}><td>{s.label}</td><td style={{ color: 'var(--navy)', fontWeight: 700 }}>{s.count} <span style={{ fontWeight: 400, color: 'var(--gray)', fontSize: 11 }}>{s.note}</span></td></tr>
          ))}</tbody></table></div></div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">Known Deployment Gotchas</div>
        {(gotchas as any[]).map((g, i) => (
          <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid var(--ltgray)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{g.t}</span>
            <span style={{ fontSize: 12.5, color: 'var(--gray)' }}> — {g.d}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export function Trace() {
  const t = traceability as any
  return (
    <>
      <SectionHead num="12" title="Operational Traceability">{t.intro}<Cite n={1} id="auditCopilot" /></SectionHead>
      <SpeakerNote>
        This is the artifact an AO probes hardest. Do not just say "auditable" — walk the reconstruction chain.
        Be explicit that the log sample is representative schema, not a tenant capture, and that completeness is a
        pilot acceptance item. That honesty is what makes it defensible.
      </SpeakerNote>
      <div className="card" style={{ marginBottom: 16, background: 'var(--navy)', color: '#fff', border: 'none' }}>
        <div style={{ fontSize: 11, color: '#7BAFD4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>IR reconstruction chain</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {t.chain.map((c: string, i: number) => (
            <span key={i} style={{ display: 'contents' }}>
              <span style={{ background: 'rgba(27,138,194,.25)', border: '1px solid var(--ltblue)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600 }}>{c}</span>
              {i < t.chain.length - 1 && <span style={{ color: '#7BAFD4' }}>→</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="card-h" style={{ marginBottom: 8 }}>Reconstruction table — can each step be traced?</div>
      <table className="matrix">
        <thead><tr><th>Step</th><th>What happened</th><th>Where logged</th><th>Key fields</th><th>Reconstructable?</th></tr></thead>
        <tbody>{t.table.map((r: any, i: number) => {
          const rc = r.recon === 'yes' ? 'badge-done' : r.recon === 'partial' ? 'badge-progress' : 'badge-pending'
          const rl = r.recon === 'yes' ? 'Yes' : r.recon === 'partial' ? 'Partial' : 'Validate in pilot'
          return <tr key={i}><td><strong>{r.step}</strong></td><td>{r.what}</td><td>{r.where}</td><td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--blue)' }}>{r.fields}</td><td><span className={`badge ${rc}`}>{rl}</span></td></tr>
        })}</tbody>
      </table>
      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card"><div className="card-h">Evidence panel — representative log</div>
          <div style={{ background: 'var(--lamber)', border: '1px solid var(--amber)', borderRadius: 6, padding: '8px 10px', fontSize: 11, color: '#78350F', fontWeight: 600, marginBottom: 10 }}>⚠ {t.logNote}</div>
          <pre style={{ background: '#0E2841', color: '#CADCFC', padding: 14, borderRadius: 8, fontSize: 11, overflowX: 'auto', fontFamily: "'Cascadia Code',Consolas,monospace", lineHeight: 1.5 }}>{t.logSample}</pre></div>
        <div>
          <div className="card" style={{ marginBottom: 14 }}><div className="card-h" style={{ color: 'var(--green)' }}>Present in the event</div>
            <ul className="pd-list pd-done" style={{ fontSize: 12.5 }}>{t.present.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></div>
          <div className="card"><div className="card-h" style={{ color: 'var(--amber)' }}>To validate in pilot</div>
            <ul className="pd-list" style={{ fontSize: 12.5 }}>{t.validate.map((p: string, i: number) => <li key={i} style={{ color: 'var(--slate)' }}>{p}</li>)}</ul></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16, background: 'var(--sky)' }}>
        <div className="card-h">IR / SIEM flow</div>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{t.irFlow}</div>
        <p style={{ fontSize: 12.5, color: 'var(--gray)', marginTop: 8 }}>Answers the SOC question directly: can my team actually use this? The pilot validates ingestion and correlation into Sentinel Gov.</p>
      </div>
      <Sources ids={['auditCopilot']} />
    </>
  )
}

export function Failure() {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const vc: Record<string, string> = { 'working-as-designed': 'badge-done', 'silent-pass': 'badge-progress', 'silent-fail': 'badge-red' }
  return (
    <>
      <SectionHead num="13" title="Failure Simulation">
        What happens when things go wrong. Click "Reveal" on each scenario to walk the attempt, the behavior,
        what gets logged, and the residual risk.
      </SectionHead>
      <SpeakerNote>
        This is what separates a mature briefing from a sales pitch. Showing where controls do NOT fully protect —
        especially the silent failures (SIT gap, prompt injection) — builds more credibility than claiming
        everything works. Be honest: "here is where it breaks, here is what we do about it."
      </SpeakerNote>
      {(failures as any[]).map((f) => (
        <div className="card" key={f.id} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div className="card-h" style={{ margin: 0 }}>{f.name}</div>
            <span className={`badge ${vc[f.verdict]}`}>{f.verdictLabel}</span>
          </div>
          <div style={{ background: 'var(--ltgray)', borderRadius: 8, padding: '10px 12px', margin: '10px 0', fontSize: 12.5, fontStyle: 'italic', color: 'var(--slate)' }}>Prompt: "{f.prompt}"</div>
          <button className="btn btn-primary" onClick={() => setOpen((o) => ({ ...o, [f.id]: !o[f.id] }))}>
            {open[f.id] ? 'Hide ▾' : 'Reveal what happens ▸'}
          </button>
          {open[f.id] && (
            <div style={{ paddingTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--sky)', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase' }}>Attempt</div><p style={{ fontSize: 12.5, marginTop: 4 }}>{f.attempt}</p></div>
                <div style={{ background: 'var(--lgreen)', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>Behavior</div><p style={{ fontSize: 12.5, marginTop: 4 }}>{f.behavior}</p></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div style={{ background: '#0E2841', color: '#CADCFC', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 10, fontWeight: 800, color: '#7BAFD4', textTransform: 'uppercase' }}>What gets logged</div><p style={{ fontSize: 12.5, marginTop: 4, color: '#CADCFC' }}>{f.logged}</p></div>
                <div style={{ background: 'var(--lred)', borderRadius: 8, padding: 12 }}><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase' }}>Residual risk</div><p style={{ fontSize: 12.5, marginTop: 4 }}>{f.residual}</p></div>
              </div>
              <div style={{ background: 'var(--lamber)', borderRadius: 8, padding: 12, marginTop: 12 }}><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase' }}>Mitigation</div><p style={{ fontSize: 12.5, marginTop: 4, color: '#78350F' }}>{f.mitigation}</p></div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}
