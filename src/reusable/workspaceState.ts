import { useState } from 'react'

export type RoleMode = 'viewer' | 'editor' | 'admin'

export interface AuditEvent {
  id: string
  at: string
  area: string
  action: string
  detail?: string
}

export const LEMON_KEYS = {
  role: 'lemon_role_mode',
  audit: 'lemon_audit_trail',
  rss: 'lemon_rss_state',
  tracker: 'lemon_live_tracker_items',
  sam: 'lemon_sam_findings',
  lessons: 'lemon_lessons',
  asks: 'lemon_asks',
  onboardingV2: 'copilot_onboarding_v2_state',
} as const

export interface WorkspacePack {
  schemaVersion: '1.0.0'
  exportedAt: string
  roleMode: RoleMode
  data: Record<string, unknown>
}

function readRaw<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function readWorkspaceValue<T>(key: string, fallback: T): T {
  return readRaw(key, fallback)
}

export function getRoleMode(): RoleMode {
  const raw = localStorage.getItem(LEMON_KEYS.role)
  if (raw === 'viewer' || raw === 'editor' || raw === 'admin') return raw
  return 'editor'
}

export function setRoleMode(role: RoleMode) {
  localStorage.setItem(LEMON_KEYS.role, role)
  appendAudit('workspace', 'role-change', `Role set to ${role}`)
}

export function appendAudit(area: string, action: string, detail?: string) {
  const current = readRaw<AuditEvent[]>(LEMON_KEYS.audit, [])
  const next: AuditEvent[] = [{ id: `aud-${Date.now()}`, at: new Date().toISOString(), area, action, detail }, ...current].slice(0, 300)
  localStorage.setItem(LEMON_KEYS.audit, JSON.stringify(next))
}

export function useWorkspaceState<T>(key: string, fallback: T, auditArea: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => readRaw(key, fallback))
  const wrappedSet: React.Dispatch<React.SetStateAction<T>> = (next) => {
    setState((prev) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
        appendAudit(auditArea, 'update')
      } catch {
        // best effort persistence
      }
      return resolved
    })
  }
  return [state, wrappedSet]
}

export function exportWorkspacePack(): WorkspacePack {
  const keys = [
    LEMON_KEYS.rss,
    LEMON_KEYS.tracker,
    LEMON_KEYS.sam,
    LEMON_KEYS.lessons,
    LEMON_KEYS.asks,
    LEMON_KEYS.onboardingV2,
  ]

  const data: Record<string, unknown> = {}
  keys.forEach((k) => {
    const raw = localStorage.getItem(k)
    if (raw) {
      try {
        data[k] = JSON.parse(raw)
      } catch {
        data[k] = raw
      }
    }
  })

  const pack: WorkspacePack = {
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    roleMode: getRoleMode(),
    data,
  }

  appendAudit('workspace', 'export-pack')
  return pack
}

export function importWorkspacePack(pack: WorkspacePack): { ok: boolean; error?: string } {
  if (!pack || typeof pack !== 'object') return { ok: false, error: 'Invalid workspace pack.' }
  if (pack.schemaVersion !== '1.0.0') return { ok: false, error: `Unsupported workspace schema: ${String((pack as any).schemaVersion || 'unknown')}` }
  if (!pack.data || typeof pack.data !== 'object') return { ok: false, error: 'Workspace pack data is missing.' }

  Object.entries(pack.data).forEach(([k, v]) => {
    localStorage.setItem(k, JSON.stringify(v))
  })
  if (pack.roleMode) {
    localStorage.setItem(LEMON_KEYS.role, pack.roleMode)
  }

  appendAudit('workspace', 'import-pack', `Imported ${Object.keys(pack.data).length} data blocks`)
  return { ok: true }
}

export function getStarterTemplates() {
  return [
    {
      id: 'strict-federal',
      label: 'Strict Federal Baseline',
      roleMode: 'editor' as RoleMode,
      onboardingV2: {
        profile: { cloud: 'gcch', path: 'baseline', riskPosture: 'strict', archetype: 'regulated' },
      },
      rss: { mode: 'restricted', hasAllowList: false },
    },
    {
      id: 'pilot-first',
      label: 'Pilot-First Team',
      roleMode: 'editor' as RoleMode,
      onboardingV2: {
        profile: { cloud: 'gcc', path: 'pilot', riskPosture: 'balanced', archetype: 'pilot' },
      },
      rss: { mode: 'restricted', hasAllowList: true },
    },
    {
      id: 'enterprise-scale',
      label: 'Enterprise Scale',
      roleMode: 'editor' as RoleMode,
      onboardingV2: {
        profile: { cloud: 'commercial', path: 'advanced', riskPosture: 'balanced', archetype: 'enterprise' },
      },
      rss: { mode: 'open', hasAllowList: true },
    },
  ]
}

export function applyStarterTemplate(id: string): { ok: boolean; error?: string } {
  const template = getStarterTemplates().find((t) => t.id === id)
  if (!template) return { ok: false, error: 'Template not found.' }

  const v2 = readRaw<Record<string, any>>(LEMON_KEYS.onboardingV2, {})
  const merged = {
    ...v2,
    profile: { ...(v2.profile || {}), ...(template.onboardingV2.profile || {}) },
  }
  localStorage.setItem(LEMON_KEYS.onboardingV2, JSON.stringify(merged))

  const rss = readRaw<Record<string, any>>(LEMON_KEYS.rss, {})
  localStorage.setItem(LEMON_KEYS.rss, JSON.stringify({ ...rss, ...template.rss }))
  localStorage.setItem(LEMON_KEYS.role, template.roleMode)

  appendAudit('workspace', 'apply-template', template.label)
  return { ok: true }
}
