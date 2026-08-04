import { SectionHead, SpeakerNote, CopyButton } from '../components/Primitives'
import { testPlan } from '../data/content'

export function TestPlan() {
  const t = testPlan as any
  return (
    <>
      <SectionHead num="20" title="Comprehensive Test Plan">
        {t.intro} Each test includes a ready-to-run example you can copy straight into Copilot during a live demo.
      </SectionHead>
      <SpeakerNote>
        This is the validation backbone and a live demo script. The deterministic tests (label-based DLP) prove
        control. The unknown tests (SIT detection, classification strings, prompt injection) are where you are
        honest that the test IS the validation. The example prompts are copy-pasteable — run them live. Frame gap
        items as pilot acceptance criteria, not failures.
      </SpeakerNote>
      {t.categories.map((c: any, ci: number) => (
        <div key={ci} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>{c.cat}</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          {c.tests.map((test: any, ti: number) => (
            <div className="card" key={ti} style={{ marginBottom: 10 }}>
              <div className="card-h" style={{ fontSize: 14 }}>{test.s}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase' }}>How to test</div>
                  <p style={{ fontSize: 12.5, marginTop: 3 }}>{test.how}</p></div>
                <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>Expected result</div>
                  <p style={{ fontSize: 12.5, marginTop: 3 }}>{test.exp}</p></div>
              </div>
              {test.ex && (
                <div style={{ background: 'var(--lgreen)', border: '1px solid var(--green)', borderRadius: 6, padding: 10, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase' }}>▶ Try it live — example</div>
                    <CopyButton text={test.ex} />
                  </div>
                  <p style={{ fontSize: 12.5, marginTop: 4, fontStyle: 'italic', color: 'var(--slate)' }}>{test.ex}</p>
                </div>
              )}
              <div style={{ background: 'var(--sky)', borderRadius: 6, padding: 10, marginTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase' }}>How to validate</div>
                <p style={{ fontSize: 12.5, marginTop: 3 }}>{test.val}</p>
                {test.link && (
                  <a href={test.link[1]} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--blue)', display: 'inline-block', marginTop: 6 }}>{test.link[0]} ↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
