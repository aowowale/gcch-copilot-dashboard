import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { actionsSeed, samProgress } from '../data/dashboard'
import { getTemplate } from '../data/onboarding'
import type { ActionItem, RefItem, DecisionLogItem, FeedbackItem, OnboardingProfile, EvidenceItem, WorkStatus } from '../data/types'

const PKEY = 'gcch_copilot_briefing_v1'

export interface AppState {
  decisions: Record<string, string | undefined>
  tracker: Record<string, string>           // trackerKey -> status
  dashActions: ActionItem[]
  dashSam: Record<string, number>
  dashRefs: RefItem[]
  dashDecisionLog: DecisionLogItem[]
  dashFeedback: FeedbackItem[]
  onboardingProfile: OnboardingProfile
  onboardingWork: Record<string, WorkStatus>
  onboardingOwners: Record<string, string>
  onboardingBlockers: Array<{ id: string; title: string; owner: string; severity: 'Low' | 'Medium' | 'High'; status: 'Open' | 'Resolved' }>
  onboardingEvidence: EvidenceItem[]
  guidedMode: boolean
  guidedStep: number
}

function defaultState(): AppState {
  const baseTemplate = getTemplate('gcch')
  const work: Record<string, WorkStatus> = {}
  const owners: Record<string, string> = {}
  baseTemplate.work.forEach((w) => {
    work[w.id] = w.type === 'control' ? 'done' : 'not-started'
    owners[w.id] = w.ownerRole
  })
  const sam: Record<string, number> = {}
  samProgress.forEach((s) => { sam[s.id] = s.current })
  return {
    decisions: {},
    tracker: {},
    dashActions: JSON.parse(JSON.stringify(actionsSeed)),
    dashSam: sam,
    dashRefs: [],
    dashDecisionLog: [],
    dashFeedback: [],
    onboardingProfile: {
      teamName: 'Team Onboarding Workspace',
      cloud: 'gcch',
      teamSize: '20-50',
      riskPosture: 'balanced',
      selectedPath: 'p2',
      owner: 'Program Lead'
    },
    onboardingWork: work,
    onboardingOwners: owners,
    onboardingBlockers: [
      { id: 'blk-1', title: 'Copilot DLP validation pending', owner: 'CyberOps', severity: 'High', status: 'Open' },
      { id: 'blk-2', title: 'Helpdesk runbook not published', owner: 'Helpdesk Lead', severity: 'Medium', status: 'Open' }
    ],
    onboardingEvidence: [
      { id: 'ev-1', title: 'Conditional Access test evidence', owner: 'Identity Admin', status: 'complete', link: '' },
      { id: 'ev-2', title: 'DLP pilot test report', owner: 'CyberOps', status: 'partial', link: '' },
      { id: 'ev-3', title: 'Retention policy artifact', owner: 'Compliance Admin', status: 'missing', link: '' }
    ],
    guidedMode: false,
    guidedStep: 0,
  }
}

function load(): AppState {
  const base = defaultState()
  try {
    const raw = localStorage.getItem(PKEY)
    if (raw) {
      const d = JSON.parse(raw)
      if (d.decisions) base.decisions = d.decisions
      if (d.tracker) base.tracker = d.tracker
      if (d.dashActions) base.dashActions = d.dashActions
      if (d.dashSam) base.dashSam = { ...base.dashSam, ...d.dashSam }
      if (d.dashRefs) base.dashRefs = d.dashRefs
      if (d.dashDecisionLog) base.dashDecisionLog = d.dashDecisionLog
      if (d.dashFeedback) base.dashFeedback = d.dashFeedback
      if (d.onboardingProfile) base.onboardingProfile = { ...base.onboardingProfile, ...d.onboardingProfile }
      if (d.onboardingWork) base.onboardingWork = { ...base.onboardingWork, ...d.onboardingWork }
      if (d.onboardingOwners) base.onboardingOwners = { ...base.onboardingOwners, ...d.onboardingOwners }
      if (d.onboardingBlockers) base.onboardingBlockers = d.onboardingBlockers
      if (d.onboardingEvidence) base.onboardingEvidence = d.onboardingEvidence
      if (typeof d.guidedMode === 'boolean') base.guidedMode = d.guidedMode
      if (typeof d.guidedStep === 'number') base.guidedStep = d.guidedStep
    }
  } catch { /* ignore corrupt storage */ }
  return base
}

interface StoreCtx {
  state: AppState
  update: (patch: Partial<AppState>) => void
  reset: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try { localStorage.setItem(PKEY, JSON.stringify(state)) } catch { /* quota */ }
  }, [state])

  const update = (patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch }))
  const reset = () => setState(defaultState())

  return <Ctx.Provider value={{ state, update, reset }}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore must be used within StoreProvider')
  return c
}

export const trackerKey = (pi: number, ii: number) => `trk_${pi}_${ii}`
