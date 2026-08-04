import { ReactNode, useState } from 'react'
import { copyText } from '../lib/util'

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
