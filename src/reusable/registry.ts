import { ComponentType } from 'react'
import { HomeV2 } from '../sections/HomeV2'
import { JourneyDashboard } from './JourneyDashboard'
import { Concerns, Controls, Planes } from '../sections/Narrative1'
import { Paths } from '../sections/Paths'
import { Zql, Scale } from '../sections/ZqlScale'
import { Guardrails, Dlp, AiSec, Acceptance, Human, Reference, Trace, Failure } from '../sections/Content'
import { Actions } from '../sections/Interactive'
import { TestPlan } from '../sections/TestPlan'
import { ReusableAsk, ReusableLessons, ReusableRss, ReusableSam, ReusableTracker } from './ReusableSections'

export const REUSABLE_SECTION_COMPONENTS: Record<string, ComponentType> = {
  journey: JourneyDashboard,
  homev2: HomeV2,
  concerns: Concerns,
  controls: Controls,
  planes: Planes,
  paths: Paths,
  zql: Zql,
  sam: ReusableSam,
  rss: ReusableRss,
  guardrails: Guardrails,
  dlp: Dlp,
  aisec: AiSec,
  scale: Scale,
  trace: Trace,
  failure: Failure,
  acceptance: Acceptance,
  human: Human,
  lessons: ReusableLessons,
  actions: Actions,
  ask: ReusableAsk,
  reference: Reference,
  testplan: TestPlan,
  tracker: ReusableTracker,
}