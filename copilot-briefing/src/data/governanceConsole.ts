// Configuration for the Tenant Governance Console launch module.
//
// The console is the separate "Microsoft 365 Copilot Readiness" (SAM) tool: a
// live tenant governance dashboard with its own backend (Azure Functions +
// Microsoft Graph collectors). This briefing only *launches* it; it does not
// embed the live backend. Set `launchUrl` to a deployed instance to enable the
// embedded/launch experience. Leave it empty to show setup guidance instead.

export interface GovernanceCapability {
  title: string
  detail: string
}

export interface GovernanceConsoleConfig {
  /** Deployed console URL. Empty string = not configured (shows guidance). */
  launchUrl: string
  /** When true and launchUrl is set, render an inline iframe preview. */
  allowEmbed: boolean
  capabilities: GovernanceCapability[]
}

export const governanceConsole: GovernanceConsoleConfig = {
  launchUrl: '',
  allowEmbed: true,
  capabilities: [
    {
      title: '30/60/90-day aging',
      detail: 'Workspace inventory with ownership, membership, guest, and active-channel counts surfaced by age band.',
    },
    {
      title: 'SharePoint exposure',
      detail: 'Exposure indicators and Restricted Content Discovery (RCD) coverage per workspace, with lifecycle status.',
    },
    {
      title: 'Program plan + tasks',
      detail: 'Completion, blockers, overdue work, phase health, and the Copilot rollout gate across all program tasks.',
    },
    {
      title: 'Read-only boundary',
      detail: 'No tenant mutation or remediation controls. Changes require a backend approval workflow with separate identities.',
    },
  ],
}
