import { ReactNode, useState } from 'react'
import { copyText } from '../lib/util'
import { REFERENCES } from '../data/references'

export function SectionHead({ num, title, children }: { num: string; title: string; children?: ReactNode }) {
  return (
    <div className="section-head">
      <div className="eyebrow">Section {num}</div>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  )
}

export function SpeakerNote({ children }: { children: ReactNode }) {
  return (
    <div className="prep-note">
      <div className="pn-label">▸ Speaker Note</div>
      <p>{children}</p>
    </div>
  )
}

export function Card({ children, style, className }: { children: ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div className={'card' + (className ? ' ' + className : '')} style={style}>{children}</div>
}

export function CopyButton({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="btn"
      style={{ padding: '2px 8px', fontSize: 10, ...style }}
      onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1200) } }}
    >
      {done ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

// Inline citation marker. `n` is the reference number shown in the section's <Sources> list;
// `id` maps to a verified entry in ../data/references.
export function Cite({ n, id }: { n: number; id: string }) {
  const ref = REFERENCES[id]
  if (!ref) return null
  return (
    <sup className="cite">
      <a href={ref.url} target="_blank" rel="noopener noreferrer" title={`${ref.label} — ${ref.publisher}`}>[{n}]</a>
    </sup>
  )
}

// End-of-section list of live sources. `ids` order defines the [n] numbering used by <Cite>.
export function Sources({ ids }: { ids: string[] }) {
  const refs = ids.map((id) => REFERENCES[id]).filter(Boolean)
  if (refs.length === 0) return null
  return (
    <div className="sources">
      <div className="sources-h">Sources</div>
      <ol className="sources-list">
        {refs.map((ref, i) => (
          <li key={ids[i]}>
            <a href={ref!.url} target="_blank" rel="noopener noreferrer">{ref!.label}</a>
            <span className="src-pub"> — {ref!.publisher}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
