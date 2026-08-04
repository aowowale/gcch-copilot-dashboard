// Live source references. Every entry links to an authoritative, verified source
// (Microsoft Learn / Microsoft Support). Cite these in sections via the <Cite> and
// <Sources> components in ../components/Primitives.
//
// Verified 2026-08-04. When adding a source, link only to a real page you have confirmed.

export interface SourceRef {
  /** Human-readable title of the source. */
  label: string
  /** Canonical URL of the source. */
  url: string
  /** Publisher, shown after the label in the Sources list. */
  publisher: string
}

export const REFERENCES: Record<string, SourceRef> = {
  webSearch: {
    label: 'Data, privacy, and security for web search in Microsoft 365 Copilot and Microsoft 365 Copilot Chat',
    url: 'https://learn.microsoft.com/en-us/microsoft-365/copilot/manage-public-web-access',
    publisher: 'Microsoft Learn',
  },
  privacy: {
    label: 'Data, Privacy, and Security for Microsoft 365 Copilot',
    url: 'https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy',
    publisher: 'Microsoft Learn',
  },
  edp: {
    label: 'Enterprise data protection in Microsoft 365 Copilot',
    url: 'https://learn.microsoft.com/en-us/microsoft-365/copilot/enterprise-data-protection',
    publisher: 'Microsoft Learn',
  },
  researcher: {
    label: 'Researcher in Microsoft 365 Copilot',
    url: 'https://support.microsoft.com/topic/e63ab760-f3de-4c47-ae87-dad601b0e9c4',
    publisher: 'Microsoft Support',
  },
  analyst: {
    label: 'Analyst in Microsoft 365 Copilot',
    url: 'https://support.microsoft.com/topic/ff505b9c-a06c-4be9-b855-69d89b1d25d2',
    publisher: 'Microsoft Support',
  },
  purviewAI: {
    label: 'Microsoft Purview data security and compliance protections for generative AI apps',
    url: 'https://learn.microsoft.com/en-us/purview/ai-microsoft-purview',
    publisher: 'Microsoft Learn',
  },
  retentionCopilot: {
    label: 'Learn about retention for Copilot',
    url: 'https://learn.microsoft.com/en-us/purview/retention-policies-copilot',
    publisher: 'Microsoft Learn',
  },
  auditCopilot: {
    label: 'Audit log activities — Copilot activities',
    url: 'https://learn.microsoft.com/en-us/purview/audit-log-activities',
    publisher: 'Microsoft Learn',
  },
}
