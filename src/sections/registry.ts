import { ComponentType } from 'react'
import { Home } from './Home'
import { Concerns, Controls, Planes } from './Narrative1'
import { Paths } from './Paths'
import { Zql, Scale } from './ZqlScale'
import { Rss, Guardrails, Dlp, AiSec, Sam, Acceptance, Human, Lessons, Reference, Trace, Failure } from './Content'
import { Actions, Ask, Other } from './Interactive'
import { TestPlan } from './TestPlan'
import { Tracker } from './Dashboard'

export const SECTION_COMPONENTS: Record<string, ComponentType> = {
  home: Home,
  concerns: Concerns,
  controls: Controls,
  planes: Planes,
  paths: Paths,
  zql: Zql,
  sam: Sam,
  rss: Rss,
  guardrails: Guardrails,
  dlp: Dlp,
  aisec: AiSec,
  scale: Scale,
  trace: Trace,
  failure: Failure,
  acceptance: Acceptance,
  human: Human,
  lessons: Lessons,
  actions: Actions,
  ask: Ask,
  reference: Reference,
  testplan: TestPlan,
  tracker: Tracker,
  other: Other,
}
