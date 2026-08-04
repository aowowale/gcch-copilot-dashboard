// Structural types for briefing content. Intentionally permissive so data stays easy to edit.
export interface Ask { id: string; title: string; tag: string; desc: string; rationale: string; }
export interface Fear { id: string; q: string; status: string; tag: string; short: string; control: string; }
export interface Path {
  id: string; num: string; name: string; status: string; statusLabel: string;
  tagline: string; gets: string[]; done: string[]; remaining: string[]; turnon: string[];
  note: string; benefits?: [string, string][];
}
export interface OperatingLayer { t: string; short: string; detail: string; signals: string[]; }
export interface Agent { n: number; name: string; problem: string; does: string; perms: string; }
export interface Lesson { t: string; d: string; takeaway: string; }
export interface TestItem { s: string; how: string; exp: string; val: string; ex?: string; link?: [string, string]; }
export interface TestCategory { cat: string; tests: TestItem[]; }
export interface TestPlan { intro: string; categories: TestCategory[]; }
export interface TrackerItem { t: string; s: string; p: string; }
export interface TrackerPhase { phase: string; sub: string; items: TrackerItem[]; }
export interface Tracker { phases: TrackerPhase[]; }

// Dashboard types
export interface Version {
  id: string; label: string; sub: string; rec: boolean | null; badge: string;
  grounding: string; boundary: string; access: string; useCase: string; status: string; items: string[];
}
export interface LockdownRow { risk: string; control: string; }
export interface SamFinding { id: string; label: string; baseline: number; current: number; target: number; note: string; }
export interface Faq { cat: string; q: string; a: string; verify: string; gcch: string; }
export interface ActionItem { id: string; title: string; owner: string; due: string; status: string; notes: string; }
export interface RefItem { id: string; label: string; url: string; desc: string; }
export interface DecisionLogItem { id: string; title: string; notes: string; }
export interface FeedbackItem {
  id: string;
  area: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Planned' | 'Done';
  detail: string;
}

export type CloudProfile = 'gcch' | 'gcc' | 'commercial'
export type WorkStatus = 'not-started' | 'in-progress' | 'done' | 'blocked'

export interface OnboardingProfile {
  teamName: string
  cloud: CloudProfile
  teamSize: string
  riskPosture: 'low' | 'balanced' | 'strict'
  selectedPath: string
  owner: string
}

export interface EvidenceItem {
  id: string
  title: string
  owner: string
  status: 'missing' | 'partial' | 'complete'
  link: string
}

export type BriefingData = Record<string, unknown>;
