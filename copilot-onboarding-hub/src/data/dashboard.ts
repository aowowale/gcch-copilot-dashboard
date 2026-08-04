// Live Tracker dashboard content. Edit values here.
export const versions = [
  {
    "id": "cv1",
    "label": "Unlicensed Copilot Chat",
    "sub": "Web Grounding OFF",
    "rec": true,
    "badge": "CURRENT SAFE POSTURE",
    "grounding": "No tenant grounding. Responds to manually provided text and model knowledge only.",
    "boundary": "Treat as potentially outside the GCC High sovereignty boundary unless tenant-specific documentation confirms otherwise. Do not use with sensitive or CUI data.",
    "access": "Any M365 G3/G5 user with base license.",
    "useCase": "General Q&A, drafting with pasted text. Users must not enter sensitive or CUI content unless explicitly authorized by policy.",
    "status": "Control via Integrated Apps scoping and CA policy. Web grounding is OFF by default in GCC High.",
    "items": [
      "No email, file, SharePoint, or Teams access",
      "Responses based on prompt input + model knowledge",
      "Web grounding OFF = stays within GCC High when used responsibly",
      "Audit logging behavior should be validated in tenant",
      "Risk is what users type - CUI must never be entered without authorization"
    ]
  },
  {
    "id": "cv2",
    "label": "Unlicensed Copilot Chat",
    "sub": "Web Grounding ON",
    "rec": false,
    "badge": "GCC HIGH BOUNDARY RISK - WEB GROUNDING ENABLED",
    "grounding": "No tenant grounding. Responses based on prompt input + public web content.",
    "boundary": "When web grounding is enabled, Copilot sends a short derived search query to Bing, outside the GCC High boundary. Full prompts, tenant documents, and Graph data are NOT sent to Bing - only a minimal derived query. Bing is a commercial endpoint, so this is a boundary interaction requiring explicit security approval.",
    "access": "Any M365 G3/G5 user with base license.",
    "useCase": "Not recommended. If enabled, restrict strictly to non-sensitive use cases with documented risk acceptance.",
    "status": "OFF by default in GCC High. Requires deliberate admin enablement via Cloud Policy.",
    "items": [
      "No tenant data access",
      "Web queries route to commercial Bing - outside GCC High boundary",
      "Requires explicit security team approval and documented risk acceptance",
      "Do not enable without ISSO sign-off",
      "Cannot scope per individual user - validate granularity in tenant"
    ]
  },
  {
    "id": "cv3",
    "label": "Licensed M365 Copilot",
    "sub": "Web Grounding OFF (Recommended)",
    "rec": true,
    "badge": "RECOMMENDED DEPLOYMENT POSTURE",
    "grounding": "Full Microsoft Graph grounding across email, files, Teams messages, SharePoint content, and calendar - everything the user already has permission to see.",
    "boundary": "Designed to remain within the GCC High boundary when used in Work Mode with web grounding OFF. Validate in tenant.",
    "access": "M365 G3/G5 Government base license + M365 Copilot add-on. Exchange Online primary mailbox required.",
    "useCase": "The full Microsoft 365 Copilot experience - productivity across every M365 app and surface your team uses daily.",
    "status": "Target state for pilot and full production deployment.",
    "items": [
      "Full Graph grounding within user permission boundary",
      "Designed to remain within GCC High in Work Mode with web grounding OFF",
      "CopilotInteraction events auditable in Purview",
      "Governed by Purview retention when Copilot location is configured",
      "Requires Exchange Online mailbox, Current/Monthly channel, WebSocket connectivity",
      "NOT yet in GCC High: Teams Meeting Copilot, Teams Chat Copilot, PowerPoint translation, Mac app"
    ]
  },
  {
    "id": "cv4",
    "label": "Licensed M365 Copilot",
    "sub": "Web Grounding ON",
    "rec": false,
    "badge": "GCC HIGH BOUNDARY RISK - WEB GROUNDING ENABLED",
    "grounding": "Full Microsoft Graph grounding PLUS public web content via Bing search.",
    "boundary": "Both licensed and unlicensed Copilot send only a short derived query to Bing - the same class of boundary interaction. Tenant documents, emails, and Graph data are NOT sent. Licensed adds contractual protections (DPA, no training on data), but the boundary consideration is the same class as unlicensed.",
    "access": "M365 G3/G5 + M365 Copilot add-on.",
    "useCase": "Improved response quality for non-sensitive topics. Not appropriate for sensitive workloads without explicit approval.",
    "status": "OFF by default in GCC High. Requires admin enablement. Treat as a risk decision, not a feature upgrade.",
    "items": [
      "Same class of boundary interaction as unlicensed web ON - only a derived query to Bing",
      "Tenant documents, emails, Graph data NOT sent to Bing",
      "Licensed tier adds contractual protections (DPA, no training)",
      "Requires written security approval and risk acceptance",
      "Real security difference is when web grounding is OFF, not ON"
    ]
  },
  {
    "id": "cv5",
    "label": "Copilot Studio",
    "sub": "GCC High - Separate Product",
    "rec": null,
    "badge": "SEPARATE LICENSING - VALIDATE GCC HIGH AVAILABILITY",
    "grounding": "Custom agents grounded in data sources you configure: SharePoint, Dataverse, custom APIs. Respects user permissions via Microsoft Graph.",
    "boundary": "Stays within GCC High when using GCC High-approved data sources. External connectors must be individually evaluated.",
    "access": "Separate Copilot Studio licensing. Available in GCC High. Only declarative agents via M365 Agents Toolkit (pro-code) currently confirmed.",
    "useCase": "Custom AI agents for specific workflows: help desk, document Q&A, process automation, knowledge base search.",
    "status": "Evaluate for Phase 3 (post-pilot). Agent governance policy must be published before enablement.",
    "items": [
      "Separate product - separate licensing and admin surface",
      "Only declarative agents via M365 Agents Toolkit confirmed in GCC High",
      "Agent Builder and low-code authoring not yet confirmed",
      "Power Platform DLP controls connectors; Purview DLP controls content",
      "Each agent is a change-managed event"
    ]
  }
];
export const lockdown = [
  {
    "risk": "Copilot surfaces overshared SharePoint content",
    "control": "RSS limits Copilot to approved, reviewed sites only - everything else is invisible until explicitly added"
  },
  {
    "risk": "Wrong users access Copilot",
    "control": "CA policy + Integrated Apps (both entries) + Teams permission policy - three independent gates, all must be in place simultaneously"
  },
  {
    "risk": "Data flows outside GCC High boundary",
    "control": "Web grounding OFF by default in GCC High, documented and filed as authorization evidence - validate and confirm, do not assume"
  },
  {
    "risk": "Sensitive content surfaced via Copilot",
    "control": "DLP (Copilot location explicitly added) + Sensitivity Labels + RCD - test enforcement in tenant, do not assume parity"
  },
  {
    "risk": "Access expands faster than governance matures",
    "control": "RSS allowed list expands only as sites clear readiness criteria: EEEU removed, label applied, owner confirmed - deliberate gate at every step"
  },
  {
    "risk": "Agents access unreviewed data sources",
    "control": "Agent governance policy must be published before any agent goes to production - no group-level creation controls exist today"
  }
];
export const samProgress = [
  {
    "id": "sf-1",
    "label": "SharePoint Sites with Oversharing",
    "baseline": 249,
    "current": 249,
    "target": 0,
    "note": "EEEU permissions or excessive access. Remediate via DAG Site Access Reviews, remove EEEU, apply RCD to high-risk sites."
  },
  {
    "id": "sf-2",
    "label": "SharePoint Sites with Zero Sensitivity Labels",
    "baseline": 0,
    "current": 0,
    "target": 249,
    "note": "Label coverage is the foundation for DLP enforcement. Target: all pilot sites labeled before RSS allowed list addition."
  },
  {
    "id": "sf-3",
    "label": "Inactive Sites (180+ days)",
    "baseline": 112,
    "current": 112,
    "target": 0,
    "note": "Stale content that surfaces in Copilot responses. Remediate via Site Lifecycle Management or M365 Archive."
  },
  {
    "id": "sf-4",
    "label": "Legacy Document Protection Documents",
    "baseline": 430,
    "current": 430,
    "target": 0,
    "note": "Legacy IRM documents are invisible to Copilot. Migrate to Purview sensitivity labels."
  },
  {
    "id": "sf-5",
    "label": "Sites on Copilot Allowed List (RSS)",
    "baseline": 0,
    "current": 0,
    "target": 10,
    "note": "Sites reviewed, labeled, EEEU-cleared, added to RSS allowed list. Copilot can only ground against these."
  }
];
export const dashGlossary = [
  [
    "RSS",
    "Restricted SharePoint Search - limits which SharePoint sites Copilot and org-wide Search can access"
  ],
  [
    "RCD",
    "Restricted Content Discovery - removes a site from Copilot and Search without changing permissions"
  ],
  [
    "RCA",
    "Restricted Access Control - per-site hard boundary that changes actual permissions"
  ],
  [
    "DLP",
    "Data Loss Prevention - policy engine that detects and governs sensitive content"
  ],
  [
    "CA",
    "Conditional Access - policy that controls access based on identity, device, and risk signals"
  ],
  [
    "GCC High",
    "Microsoft government community cloud at the highest compliance tier (FedRAMP High, ITAR, DFARS)"
  ],
  [
    "GCC",
    "Government Community Cloud - Microsoft government cloud at FedRAMP Moderate"
  ],
  [
    "AVD",
    "Azure Virtual Desktop - cloud-based virtual desktop infrastructure"
  ],
  [
    "SAM",
    "SharePoint Advanced Management - site governance, oversharing detection, access controls"
  ],
  [
    "DAG",
    "Data Access Governance - SAM reporting that surfaces oversharing, inactive sites, permission anomalies"
  ],
  [
    "EEEU",
    "Everyone Except External Users - SharePoint permission granting access to all internal accounts"
  ],
  [
    "PIM",
    "Privileged Identity Management - just-in-time privileged access in Microsoft Entra ID"
  ],
  [
    "ATO",
    "Authorization to Operate - federal security approval allowing a system to process government information"
  ],
  [
    "ISSO",
    "Information System Security Officer - responsible for maintaining a system security posture"
  ],
  [
    "AO",
    "Authorizing Official - the executive who formally accepts risk and grants ATO"
  ],
  [
    "MFA",
    "Multi-Factor Authentication - requiring more than one proof of identity to sign in"
  ],
  [
    "CUI",
    "Controlled Unclassified Information - information requiring safeguarding under federal regulation"
  ],
  [
    "DSPM",
    "Data Security Posture Management - Microsoft AI-specific security posture dashboard"
  ],
  [
    "SIEM",
    "Security Information and Event Management - centralized security event collection and analysis"
  ],
  [
    "PPAC",
    "Power Platform Admin Center - admin surface for Power Apps, Power Automate, Copilot Studio"
  ]
];
export const faqs = [
  {
    "cat": "Access",
    "q": "Why can't a user see Copilot in Teams?",
    "a": "Work through these in order: (1) Global Teams App Permission Policy blocks Copilot for all users  -  correct by design. The user must also have the M365_Copilot_Allowed permission policy assigned. (2) Integrated Apps must scope Copilot to the user's group. (3) CA policy must allow the user. (4) Policy changes take time to propagate  -  retest after a significant wait before concluding something is broken.",
    "verify": "Teams Admin Center (admin.gov.teams.microsoft.us) -> Users -> select user -> Policies tab -> confirm M365_Copilot_Allowed is assigned. Also check Integrated Apps scoping in admin.microsoft365.us.",
    "gcch": "All three controls must be in place simultaneously. A gap in any one allows or blocks access regardless of the others."
  },
  {
    "cat": "Access",
    "q": "A user shouldn't have Copilot access but they can see it  -  why?",
    "a": "Most likely: Copilot Chat (unlicensed surface) and licensed M365 Copilot are separate service surfaces with separate configuration paths. If only one was scoped in Integrated Apps, the other may remain accessible. Validate both experiences independently.",
    "verify": "admin.microsoft365.us -> Settings -> Integrated Apps -> verify BOTH Microsoft 365 Copilot AND Microsoft 365 Copilot Chat entries are scoped to authorized groups. Then test the unauthorized user's access from Teams and from the M365 portal.",
    "gcch": "Validate both surfaces independently. The separation exists in both product behavior and the compliance boundary."
  },
  {
    "cat": "Licensing",
    "q": "What is the real difference between unlicensed Copilot Chat and licensed M365 Copilot?",
    "a": "The key difference is grounding: unlicensed Copilot Chat does not access tenant data via Microsoft Graph, while licensed M365 Copilot uses Graph to retrieve content the user already has access to.\n\nUnlicensed Copilot Chat: no tenant Graph grounding. Responses are based on prompt input and model knowledge only.\n\nLicensed M365 Copilot (Work Mode, web grounding OFF): uses Microsoft Graph to access content the user already has permission to see. Stays within GCCH in this configuration.\n\nWith web grounding ON (either tier): web grounding may route prompt data outside the GCCH boundary. Validate behavior in your tenant and ensure explicit security team approval before enabling.",
    "verify": "Log in as unlicensed Chat Authorized user -> prompt 'summarize my emails' (should return nothing tenant-grounded). Log in as licensed user in Work Mode -> same prompt should return actual email summaries.",
    "gcch": "Unlicensed Copilot Chat should be treated as potentially outside the GCCH boundary unless tenant documentation explicitly states otherwise. See the Copilot Versions section for the full comparison."
  },
  {
    "cat": "Licensing",
    "q": "The enterprise shield appears on Copilot Chat  -  does that mean we are protected?",
    "a": "No. The enterprise shield indicates a signed-in work identity only. It does not confirm GCCH boundary enforcement, retention coverage, or compliance scope.\n\nThe shield appears based on how you signed in, not which compliance controls are active for that session. For ATO purposes, verify actual controls: web grounding setting, retention policy coverage, CA policy application, and data flow documentation.",
    "verify": "Do not use the shield as ATO evidence. Verify: web grounding setting confirmed OFF, Purview retention policy explicitly covers Copilot and AI apps location, CA policy is evaluated in sign-in logs.",
    "gcch": "Do not cite the enterprise shield as evidence of GCCH compliance in customer communications or ATO documentation. It confirms authenticated work identity only."
  },
  {
    "cat": "Licensing",
    "q": "Teams Premium users want Intelligent Recap  -  do they need an M365 Copilot license?",
    "a": "Validate in your tenant with your specific license combination  -  do not assume based on commercial documentation.\n\nCritical distinction: Intelligent Recap (post-meeting AI notes, action items, chapters) is different from Teams Meeting Copilot (interactive in-meeting AI pane). Teams Meeting Copilot is NOT available in GCCH. Intelligent Recap may work with M365 Copilot license  -  test before communicating.",
    "verify": "Assign intended license combination to test user. Run 2-minute Teams meeting with transcription. Check Recap tab. Document each feature as accessible or locked. Use observed tenant behavior.",
    "gcch": "Teams Meeting Copilot (Footnote 6) NOT available in GCCH. Intelligent Recap GCCH availability must be determined by tenant testing."
  },
  {
    "cat": "Governance",
    "q": "Is web grounding really OFF? How do we confirm and document it?",
    "a": "In GCC High, web grounding is OFF by default. However, default does not substitute for explicit confirmation and authorization documentation.\n\nWhen web grounding is ON, Copilot generates and sends a short derived search query to Bing  -  outside the GCC High sovereignty boundary. Microsoft documentation explicitly confirms that full prompts, tenant documents, and Graph data are NOT sent to Bing. Only a minimal derived query leaves the boundary. In GCC High, Bing is a commercial endpoint, so this boundary interaction requires explicit security team approval and formal risk acceptance documentation regardless of the minimal nature of what is transmitted.",
    "verify": "admin.microsoft365.us -> Settings -> Copilot settings -> locate web grounding / web search control -> confirm OFF -> screenshot with admin account and date -> file to authorization evidence folder.",
    "gcch": "Verify this setting for both unlicensed Copilot Chat and licensed M365 Copilot. Do not enable without written security team approval and formal risk acceptance documentation. ZQL context: Zero Query Logging (ZQL), if active in your environment, ensures Bing does not retain the derived query after processing - covering query text, identifiers, and prompt signals. ZQL is a retention control only; it does not eliminate the boundary crossing or the approval requirement."
  },
  {
    "cat": "Governance",
    "q": "Can we enable web grounding for just one user or group?",
    "a": "Validate in your tenant before asserting. The admin control is cloud-policy-based and may support per-group targeting  -  confirm whether your GCCH tenant supports scoped enablement before communicating it as an option.",
    "verify": "admin.microsoft365.us -> Copilot settings -> check whether web grounding Cloud Policy can be scoped to a group. Document finding before communicating to ISSO.",
    "gcch": "Do not assert per-user/group scoping without tenant verification. Treat it as tenant-wide unless confirmed otherwise."
  },
  {
    "cat": "Data Governance",
    "q": "Our data is a mess  -  nothing labeled, 249 oversharing sites. Can we still deploy Copilot safely?",
    "a": "Yes  -  with layered controls. Tenant grounding cannot be disabled while keeping licensed Copilot active. What you control is the aperture.\n\nRSS (Restricted SharePoint Search): tenant-wide. Limits which SP sites Copilot and Search can access. Sites not on your allowed list are invisible to Copilot. PowerShell only. Temporary  -  disable when remediation complete.\n\nRCD (Restricted Content Discovery): per-site. Removes site from Copilot and Search without changing permissions. Available in SharePoint Admin Center UI.\n\nRCA/RSA (Restricted Access Control): per-site hard boundary. Limits access to a named Entra security group. Changes actual permissions. Permanent governance.\n\nRecommended: enable RSS with narrow initial allowed list. Apply RCD to highest-risk sites. Apply RCA to most sensitive sites. Expand RSS as sites clear readiness criteria. Disable RSS when governance posture is sound.",
    "verify": "Validate each control in tenant before citing in ATO documentation. RSS: Get-SPOTenantRestrictedSearchAllowedList. RCD: SharePoint Admin -> Active sites -> site -> Settings. RCA: same path, Restricted access control.",
    "gcch": "All three controls available in GCCH. Validate behavior per control  -  do not assume commercial parity."
  },
  {
    "cat": "Data Governance",
    "q": "What SharePoint sites can Copilot currently see?",
    "a": "If RSS is enabled, Copilot can only see sites on the allowed list. If disabled, Copilot reaches any SharePoint content the user has access to  -  including all 249 oversharing sites.\n\nImportant: RSS does not restrict OneDrive or Exchange. Users' own files and email are always accessible to Copilot regardless of RSS state.",
    "verify": "Connect-SPOService -Url 'https://TENANT-admin.sharepoint.us' then run Get-SPOTenantRestrictedSearchAllowedList. Validate in tenant before asserting in documentation.",
    "gcch": "PowerShell only for RSS management in GCCH. Admin URL: TENANT-admin.sharepoint.us"
  },
  {
    "cat": "Compliance",
    "q": "Does our DLP policy actually protect Copilot interactions?",
    "a": "Validate in tenant  -  DLP policies must explicitly include Microsoft 365 Copilot as a protected location. Existing Teams/SharePoint/Exchange policies do NOT automatically cover Copilot. Enforcement behavior in GCCH should be tested and documented; do not assume parity with commercial environments.\n\nSIT-based prompt blocking is not confirmed available in GCCH. Label-based conditions are the current supported approach.",
    "verify": "purview.microsoft.us -> DLP -> Policies -> open each policy -> Locations tab -> confirm Microsoft 365 Copilot is an included location. Test enforcement explicitly  -  document what was tested and what was observed.",
    "gcch": "Do not assume DLP enforcement parity with commercial. Known enforcement gaps exist in GCCH Copilot. Test, document, and report findings to ISSO."
  },
  {
    "cat": "Compliance",
    "q": "Does our retention policy cover Copilot interactions?",
    "a": "Retention policies created prior to Copilot may not include the Copilot and AI apps location. Verification and explicit configuration are required.\n\nMicrosoft separated the Copilot interactions location from Teams chats  -  older policies and policies targeting Teams chats do not automatically cover Copilot prompt and response data.\n\nThis has no technical dependencies and can be completed immediately: create a new policy targeting only the Copilot and AI apps location. Treat as urgent  -  unretained Copilot data is an ATO gap.",
    "verify": "purview.microsoft.us -> Data Lifecycle -> Retention Policies -> review each policy -> Locations tab -> look for Microsoft 365 Copilot and Copilot Chat or Copilot and AI apps as an explicit location.",
    "gcch": "Purview portal for GCCH: purview.microsoft.us. The Copilot-specific location is separate from Teams chats. Any policy not explicitly listing it does not cover Copilot interactions."
  },
  {
    "cat": "Compliance",
    "q": "Where are Copilot prompts stored? Can we eDiscover them?",
    "a": "Copilot interaction data is processed within Microsoft 365 services and is discoverable via Purview audit and eDiscovery using the CopilotInteraction activity type. The underlying storage implementation should not be assumed and must not be cited as evidence in ATO documentation  -  compliance validation should rely on observable controls: audit logs, retention policies, and eDiscovery results.\n\nFor compliance: if your Purview retention policy covers the Copilot and AI apps location, interactions are governed by that policy and accessible via eDiscovery.",
    "verify": "purview.microsoft.us -> Audit -> Activities: Interacted with Copilot -> run for known pilot activity -> confirm events appear with expected metadata. Test eDiscovery: create a case, search for Copilot interactions, confirm discoverability. Use these results as ATO evidence.",
    "gcch": "Cite observable controls (audit log events, eDiscovery results, retention policy configuration) as ATO evidence  -  not assumptions about backend storage services."
  },
  {
    "cat": "Troubleshooting",
    "q": "Copilot is missing in Outlook  -  where do we start?",
    "a": "Work through in order:\n\n1. M365 Apps update channel: Semi-Annual Enterprise Channel does NOT support Copilot. Most common silent blocker in gov environments.\n\n2. Optional Connected Experiences: if disabled org-wide, Copilot UI is removed from Office apps. Check before diagnosing anything else.\n\n3. Microsoft People Cards Service principal: multiple GCCH tenants have had Copilot missing in Outlook Classic because this dependency was disabled.\n\n4. License and service plan: confirm add-on assigned and service plan active.\n\n5. CA policy: confirm user is in authorized group via sign-in logs.",
    "verify": "Start with update channel. Then: entra.microsoft.us -> Enterprise applications -> search People Cards -> confirm enabled. Then: Admin Center -> Users -> user -> Licenses -> confirm Copilot add-on.",
    "gcch": "Do not skip the update channel check. Connected Experiences and People Cards SP are GCCH-specific known issues."
  },
  {
    "cat": "SAM",
    "q": "How do we run the SAM reports and what do they show?",
    "a": "SAM provides two report types:\n\nContent Management Assessment: automated tenant-wide scan across 5 categories  -  inactive sites, ownerless, broken inheritance, EEEU permissions, overpermissive sharing links. Takes 2-72 hours. Run FIRST.\n\nDAG Reports: on-demand. Site Permissions Snapshot sorts every site by total permissioned users with EEEU flag. Sharing Links Activity and EEEU Activity show new oversharing in the past 28 days  -  use monthly.\n\nFor this deployment: run Content Management Assessment immediately. Export DAG Site Permissions Snapshot as CSV  -  that is your prioritized remediation list.",
    "verify": "admin.microsoft365.us -> SharePoint Admin Center -> Advanced Management -> Start Assessment. GCCH SharePoint Admin URL: TENANT-admin.sharepoint.us. If Advanced Management not visible, wait 24h for license propagation.",
    "gcch": "SAM is included with M365 Copilot license. Validate in tenant that Advanced Management is accessible."
  },
  {
    "cat": "Compliance",
    "q": "What is the Purview Edge add-in and do we need it?",
    "a": "The Microsoft Purview browser extension for Edge extends DLP and sensitivity labeling to browser-based activities including browser-based Copilot Chat sessions and content accessed via Edge.\n\nRelevant for: DLP enforcement in browser workflows, users accessing Copilot via browser rather than Teams or Office apps, and Endpoint DLP integration.\n\nGCCH-specific behavior must be validated in tenant before relying on it for compliance documentation. Proxy and TLS inspection can affect extension behavior.",
    "verify": "Install extension in Edge for a test user. Trigger a DLP policy condition in a browser workflow. Confirm expected block or notification behavior. Document what was tested.",
    "gcch": "GCCH-specific extension behavior needs tenant validation. Do not represent as a confirmed control without testing."
  },
  {
    "cat": "Availability",
    "q": "Is Teams Meeting Copilot or Teams Chat Copilot available in GCCH?",
    "a": "Teams Meeting Copilot (interactive in-meeting AI pane): NOT available in GCCH per service description. Do not communicate as available.\n\nCopilot in Teams chat and channels: NOT yet available in GCCH per service description. Do not communicate as available.\n\nIntelligent Recap (post-meeting AI notes): validate availability in your specific tenant with your license combination.\n\nCheck service description footnotes and Microsoft Public Sector Blog before communicating any Teams Copilot capability. Features arrive in GCCH without advance notice.",
    "verify": "Assign intended license to test user. Run short Teams meeting with transcription. Check Recap tab. Document what is accessible vs locked.",
    "gcch": "Service description is the authoritative source. Do not rely on commercial documentation not explicitly confirmed for GCC or GCCH."
  },
  {
    "cat": "Governance",
    "q": "Can Copilot agents bypass SharePoint access controls or RSS restrictions?",
    "a": "Copilot agents operate within the Microsoft Graph permission model  -  they cannot access content the user does not have access to.\n\nFor RSS specifically: validate in tenant whether agents respect RSS restrictions. The permission enforcement model is well-documented but RSS interaction with agents should be explicitly tested before publishing agents to users.",
    "verify": "Create a test agent, enable RSS, ask the agent to retrieve content from a site not on the RSS allowed list. Document observed behavior before publishing any agents.",
    "gcch": "Agent Builder rolling out in GCCH as of April 2026. No group-level controls on who can create agents exist today. Publish an agent governance policy before users create agents independently."
  },
  {
    "cat": "Compliance",
    "q": "What is Power Platform DLP and how is it different from Purview DLP?",
    "a": "These are two completely separate DLP systems that protect different things. You need both.\n\nPURVIEW DLP  -  Content Protection:\nPurview DLP inspects actual data content (files, emails, Copilot prompts/responses). It blocks or audits based on what the data contains  -  sensitivity labels, sensitive information types (SITs), or other content conditions. It protects data in SharePoint, OneDrive, Exchange, Teams, and Microsoft 365 Copilot. This is your data-level control.\n\nPOWER PLATFORM DLP  -  Connector Governance:\nPower Platform DLP operates at the connector level in Power Platform Admin Center. It governs which connectors (SharePoint, HTTP, custom APIs, etc.) Power Automate flows and Power Apps can use together. It does NOT inspect data content  -  it controls which services can be combined. Connectors are sorted into Business (can be combined) and Non-Business/Blocked buckets.\n\nFor Copilot Studio agents built with Power Automate: BOTH apply simultaneously. Power Platform DLP governs what external services the agent's flow can connect to. Purview DLP governs what content the agent can surface to users. A gap in either one creates a compliance exposure.",
    "verify": "Power Platform DLP: admin.powerplatform.microsoft.com (or equivalent GCCH URL) -> Policies -> Data policies. Purview DLP: purview.microsoft.us -> Data Loss Prevention -> Policies.",
    "gcch": "Power Platform DLP uses the Power Platform Admin Center, separate from M365 Admin Center. For GCCH, confirm the correct admin URL for your Power Platform environment."
  },
  {
    "cat": "Availability",
    "q": "What features are NOT available in GCC High right now?",
    "a": "Confirmed NOT available (as of May 2026):\n\n- Teams Meeting Copilot (in-meeting AI pane)  -  Footnote 6\n- Copilot in Teams chat and channels  -  Footnote 7\n- M365 Copilot app for Mac (desktop)\n- Copilot Chat in Edge sidebar\n- Built-in agents: Researcher and Analyst  -  targeted 1H 2026, not confirmed\n- Agent Builder and low-code Copilot Studio authoring  -  pro-code M365 Agents Toolkit only\n- Copilot in Excel with Python\n- PowerPoint: translation, speaker notes, presentation summaries, Copilot-powered slide creation\n- Microsoft Security Copilot  -  not available in any government cloud\n- DSPM for AI 'Browse to URL' policies  -  only Microsoft-supported AI sites surfaced\n- External connectors for Graph  -  not enabled by default\n\nValidate current state against the Microsoft 365 Service Description and Public Sector Blog before communicating to users.",
    "verify": "Microsoft 365 Service Description -> GCC High footnotes. Microsoft Public Sector Blog for announcements. Message Center for your tenant.",
    "gcch": "Features arrive without advance warning. Establish a weekly Service Description review process."
  },
  {
    "cat": "Data Governance",
    "q": "What is Microsoft 365 Archive and how does it relate to Copilot?",
    "a": "Microsoft 365 Archive is a pay-as-you-go service that stores inactive SharePoint site content at a lower cost tier while removing it from Copilot's grounding reach.\n\nKey behavior: content placed in Archive is excluded from Microsoft 365 Copilot processing and grounding. Copilot cannot surface archived content. The content is still preserved for eDiscovery and recordkeeping  -  it is just invisible to Copilot.\n\nUse cases:\n- Store legacy or inactive sites cheaply while keeping them out of Copilot responses\n- Exclude high-value but inactive content from AI processing\n- Reduce oversharing exposure without deleting content you cannot delete\n\nThis is an Azure Consumption-based service (excluded from M365 Copilot licensing). Factor into budget planning.",
    "verify": "admin.microsoft365.us -> SharePoint Admin Center -> Archive policies. Review pricing before deploying at scale.",
    "gcch": "Validate GCCH availability via the Service Description. Archive is listed in the E3/E5 FastTrack workbook as an option for excluding inactive content from Copilot."
  },
  {
    "cat": "Availability",
    "q": "What is Copilot Studio and how does it work in GCCH?",
    "a": "Copilot Studio is a separate Microsoft product for building custom AI agents and chatbots. It is NOT part of the M365 Copilot license  -  it requires separate licensing.\n\nIn GCC High: Copilot Studio for US Government has been available since February 2022. However, only declarative agents created with the Microsoft 365 Agents Toolkit (pro-code path) are currently confirmed for GCCH. Agent Builder and low-code studio authoring are not yet confirmed.\n\nKey differences from M365 Copilot:\n- Copilot Studio agents have custom-defined data sources, not automatic Graph grounding\n- Power Platform DLP governs what connectors agents can use\n- Separate admin surface: Power Platform Admin Center\n- Agents can be published to Teams, SharePoint, or the M365 Copilot surface\n- Each agent is a change-managed event requiring its own governance review\n\nFor this deployment, Copilot Studio is a Phase 3 workstream  -  after the M365 Copilot pilot is stable.",
    "verify": "Power Platform Admin Center (GCCH equivalent URL) -> confirm Copilot Studio licensing is assigned. Test creating a simple agent in a dev environment before production.",
    "gcch": "Only pro-code declarative agents via M365 Agents Toolkit confirmed. Validate current low-code availability status before communicating to users."
  },
  {
    "cat": "Governance",
    "q": "What is the Work/Web merge and 'automatic grounding'  -  should we be tracking this?",
    "a": "Microsoft is evolving Copilot experiences toward more automatic grounding across tenant and web data sources. This may reduce reliance on explicit Work/Web mode toggles in the future. The exact control model, naming, and availability in GCC High should be validated as updates are released.\n\nWhy this matters for your deployment: the current security posture documented for authorization relies on web grounding being OFF as an admin-controlled setting. If Microsoft changes how grounding is controlled  -  moving from an explicit toggle to automatic routing  -  the mechanism for enforcing that boundary posture changes. Any change to how grounding is controlled must trigger a review of authorization assumptions, control documentation, and security team-approved boundary assertions.\n\nDo not assert that the toggle will be removed, that a specific feature name is confirmed, or that any timeline applies to GCC High until validated in the tenant.",
    "verify": "Monitor: Microsoft 365 Message Center, Microsoft Public Sector Blog, Service Description updates. When a relevant change is announced: (1) validate behavior in GCC High tenant, (2) determine whether the admin control mechanism changes, (3) review authorization documentation and notify security team if controls are affected.",
    "gcch": "Changes to commercial Copilot do not automatically apply to GCC High. Validate GCC High-specific behavior before updating any compliance documentation."
  },
  {
    "cat": "Licensing",
    "q": "What does 'Enterprise Data Protection' on the Copilot shield mean? And from a security standpoint, what does the license buy us in GCC High?",
    "a": "Enterprise Data Protection (EDP) means the session is handled under enterprise contractual terms (no training on your data, enterprise privacy commitments, and DPA terms). It does not by itself prove GCC High boundary enforcement, web grounding state, or Purview control coverage.\n\nWhat the M365 Copilot license buys you is Microsoft Graph grounding and tighter integration with your existing M365 governance stack. That enables policy-based controls and evidence collection where your team already operates: Purview audit, retention, eDiscovery, DLP, and sensitivity labels.\n\nDecision rule: use the shield as an identity signal only. Use documented controls and tested tenant behavior as compliance evidence.",
    "verify": "Collect evidence from controls, not UI symbols: web grounding setting screenshot, Copilot location in DLP policy, Copilot and AI apps location in retention policy, CopilotInteraction audit events, and eDiscovery test result.",
    "gcch": "The shield is not an authorization artifact. In GCCH, boundary and compliance assertions must be backed by tested controls and documented evidence."
  },
  {
    "cat": "Compliance",
    "q": "What is a practical Purview DLP baseline for a GCC High Copilot pilot?",
    "a": "Start with a small, enforceable baseline and expand after evidence-driven tuning:\n\n1) Scope: include Microsoft 365 Copilot as a protected location in dedicated pilot policies.\n2) Conditions: prioritize sensitivity labels plus a narrow set of high-confidence SITs (SSN, financial account, passport, ITAR/CUI-aligned patterns where available).\n3) Actions: begin in audit mode for 7-14 days, then move critical conditions to block with user override disabled for highest-risk patterns.\n4) Exceptions: avoid broad user exceptions; prefer scoped exclusions by approved site or group with expiration date.\n5) Evidence: retain policy simulation output, incident logs, and false-positive review decisions as ATO artifacts.",
    "verify": "Purview -> DLP -> Policy details: confirm Copilot location is included, test policies with known sample prompts, and validate incident generation and action outcome for each condition.",
    "gcch": "Do not import commercial policy assumptions directly. Validate each condition and action path in-tenant and document deltas."
  },
  {
    "cat": "Compliance",
    "q": "How should we manage Sensitive Information Types (SITs) for Copilot so we avoid noisy enforcement?",
    "a": "Use SIT lifecycle management, not one-time configuration:\n\n- Curate: select a minimal SIT set for pilot. Too many SITs increases false positives and user friction.\n- Tune confidence: require higher confidence and proximity where possible before blocking.\n- Validate with samples: maintain a controlled test corpus for true positive and false positive checks.\n- Version and change control: track SIT/policy changes in a release log with owner and rollback plan.\n- Measure: monitor precision/recall trends through incident reviews and user appeals.\n\nFor CUI-heavy environments, combine SIT with labels and location context to reduce accidental overblocking.",
    "verify": "Run periodic SIT validation tests using approved sample content and compare policy outcomes before and after rule changes. Record pass/fail and exception actions.",
    "gcch": "SIT behavior can differ by service and tenant configuration. Treat SIT tuning as an ongoing governance process, not a static setup."
  },
  {
    "cat": "Data Governance",
    "q": "How should we operationalize DSPM for AI alongside DLP?",
    "a": "Use DSPM for posture discovery and DLP for enforcement. They are complementary:\n\n- DSPM: identify high-risk data exposure patterns, unlabeled content, and risky collaboration paths.\n- DLP: enforce controls on sensitive content movement and Copilot interaction surfaces.\n- Prioritization: remediate high-risk repositories first (overshared + unlabeled + high business impact).\n- Cadence: run weekly DSPM reviews during pilot, then bi-weekly or monthly once stable.\n- Closure criteria: each DSPM finding needs owner, due date, control action, and verification evidence.",
    "verify": "Create a DSPM-to-remediation tracker: finding source, risk score, mapped control (label, DLP, RCD/RCA, retention), status, and closure evidence link.",
    "gcch": "Feature availability in AI DSPM can change over time; validate which DSPM for AI controls are currently present in your GCCH tenant before committing policy dependencies."
  },
  {
    "cat": "Compliance",
    "q": "What Purview controls beyond DLP are most important for Copilot readiness?",
    "a": "Most teams underinvest in these controls:\n\n- Retention: explicit Copilot and AI apps location policy.\n- eDiscovery: repeatable search playbooks for CopilotInteraction investigations.\n- Audit: alerts and detection logic for unusual Copilot usage patterns.\n- Records management: label strategy for mission-critical and regulated content.\n- Insider risk integration: watch for prompt behavior indicating data exfiltration intent.\n- Communication compliance (where applicable): monitor policy violations in conversational workflows.\n\nTreat this as a control stack, not a single-policy project.",
    "verify": "Run a quarterly control validation exercise: one scenario each for DLP, retention, audit, eDiscovery, and insider risk. Capture evidence and remediation items.",
    "gcch": "Prioritize controls that produce auditable artifacts. In GCCH, evidence quality is often as important as the control itself."
  },
  {
    "cat": "Governance",
    "q": "What governance cadence should we run for Purview + Copilot during pilot and scale-up?",
    "a": "Recommended cadence:\n\n- Weekly (pilot): policy incident triage, false-positive review, high-risk exception approvals, and remediation progress.\n- Bi-weekly: SIT tuning decisions, DSPM finding review, and RSS/RCD/RCA posture check.\n- Monthly: executive metrics pack (incident rates, label coverage, remediation SLA, exception age).\n- Quarterly: tabletop for Copilot data leakage response and end-to-end control validation.\n\nRequire named owners for each control area: DLP, labels, retention, eDiscovery, and incident response.",
    "verify": "Maintain a governance log with attendance, decisions, risk acceptances, and action due dates. Audit this log as part of deployment readiness.",
    "gcch": "Without a formal cadence, control drift is likely. Governance discipline is a primary risk reducer in GCCH Copilot deployments."
  },
  {
    "cat": "Compliance",
    "q": "What KPIs should we track to prove Purview controls are working for Copilot?",
    "a": "Track outcome-focused KPIs, not just policy counts:\n\n- Copilot DLP incident rate per 1,000 users\n- High-severity incident mean time to containment\n- False-positive rate by policy and SIT\n- Label coverage for pilot repositories\n- Percent of Copilot interactions under active retention scope\n- eDiscovery retrieval success rate for test cases\n- Exception count and average exception age\n- Remediation SLA attainment for DSPM findings\n\nSet thresholds and escalation rules before broad rollout.",
    "verify": "Publish a monthly scorecard with trend lines and target thresholds. Include corrective actions where thresholds are missed.",
    "gcch": "KPIs should map to risk acceptance criteria used by ISSO/AO reviewers, not generic dashboard metrics."
  },
  {
    "cat": "Troubleshooting",
    "q": "What incident response pattern should we use if Copilot exposes sensitive content unexpectedly?",
    "a": "Use a predefined playbook:\n\n1) Contain: restrict access scope (CA group, app scope, or site controls) and pause affected pilot cohorts if needed.\n2) Preserve evidence: capture prompt, response, user identity, timestamp, and CopilotInteraction audit records.\n3) Classify impact: identify data type, affected systems, and downstream exposure.\n4) Remediate control gaps: adjust labels, DLP rules, RSS/RCD/RCA controls, and sharing permissions.\n5) Validate fix: rerun scenario tests and confirm no recurrence.\n6) Report: document findings, root cause, and control improvements for ISSO/AO review.",
    "verify": "Run at least one tabletop and one technical simulation before production expansion. Ensure responders can collect evidence from Purview within defined SLA.",
    "gcch": "Pre-approved response workflows reduce recovery time and improve evidence quality during compliance reviews."
  },
  {
    "cat": "Licensing",
    "q": "Is licensed M365 Copilot actually more risky than unlicensed Copilot Chat when web grounding is ON? Does tenant data get sent to Bing?",
    "a": "No  -  and this is one of the most common misconceptions worth correcting directly.\n\nWHAT ACTUALLY HAPPENS WHEN WEB GROUNDING IS ON:\nBoth licensed M365 Copilot and unlicensed Copilot Chat generate and send a short derived search query to Bing. Microsoft documentation explicitly confirms that full prompts, tenant documents, emails, and Microsoft Graph data are NOT sent to Bing. Only a minimal query derived from the prompt leaves the boundary.\n\nTHE RISK COMPARISON (web grounding ON):\n- Unlicensed Copilot Chat: sends a derived query to Bing (based on what the user typed)\n- Licensed M365 Copilot: sends a derived query to Bing (based on prompt + context)\n- Both are the same class of boundary interaction\n- Licensed is NOT more risky because tenant data is sent out  -  it is not\n- Licensed operates under stronger contractual protections (DPA, no training on your data)\n\nWHERE THE REAL DIFFERENCE LIVES (web grounding OFF):\n- Unlicensed: no tenant data access at all. EDP applies but your compliance controls have nothing to govern in Copilot context.\n- Licensed: full Graph grounding within GCC High boundary. Your DLP, sensitivity labels, retention, and audit all apply. This is the controlled, compliant path.\n\nTHE ENTERPRISE SHIELD:\nThe shield appears on both because Enterprise Data Protection (EDP) applies to both  -  meaning Microsoft handles the session under enterprise contractual terms (no training on your data, enterprise privacy terms, DPA). It does NOT mean GCC High boundary is enforced, web grounding is off, or your compliance controls are active.",
    "verify": "Review Microsoft's Enterprise Data Protection documentation at learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection for the authoritative statement on what is and is not sent to Bing.",
    "gcch": ""
  },
  {
    "cat": "Data Governance",
    "q": "We applied RSS to restrict SharePoint sites but content from restricted sites is still surfacing in Copilot. Why?",
    "a": "This is a documented limitation of Restricted SharePoint Search that every deployment team should understand.\n\nRSS restricts Copilot's SharePoint SEARCH path  -  sites not on the allowed list are excluded from search-based discovery. However, Copilot uses Microsoft Graph for multiple signal types beyond search, including:\n\n- Recently accessed files: Copilot uses Microsoft Graph signals beyond SharePoint search, including user activity data. Content from restricted sites that a user has recently interacted with may still surface depending on implementation and recency signals\n- Recently received email attachments from restricted site content\n- Recently engaged Teams content\n\nRSS controls the search path. It does not retroactively remove items from a user's recent activity context in Microsoft Graph.\n\nPRACTICAL IMPLICATION: RSS alone is insufficient if users have recently interacted with content from high-risk sites. The required combination is:\n- RSS to limit new search-based discovery going forward\n- RCD (Restricted Content Discovery) on high-risk sites  -  this removes the site from the discovery surface more comprehensively, not just from search\n- RCA (Restricted Access Control) for the most sensitive content  -  this changes actual permissions, which affects the Graph activity path\n\nThe recent-activity signal typically fades after approximately 30 days of no access. For immediate control, apply RCD to sites where users have recent interaction history.",
    "verify": "After applying RSS, ask Copilot to surface content you know a user has recently accessed from a restricted site. If it still appears, confirm via Purview audit whether the interaction used the search path or the activity/Graph path. This will identify whether RCD is also required.",
    "gcch": ""
  }
];
export const actionsSeed = [
  {
    "id": "act-1",
    "title": "Validate Copilot interaction discoverability via Purview audit and eDiscovery",
    "owner": "",
    "due": "",
    "status": "Resolved",
    "notes": "VALIDATED. For licensed M365 Copilot: interactions are processed within the M365 service boundary and stored in the user's Exchange Online mailbox (hidden folder) - auditable via Purview and discoverable via eDiscovery. ATO-safe statement: \"Microsoft 365 Copilot interactions are processed within the Microsoft 365 service boundary and are auditable via Microsoft Purview. For licensed Copilot, prompt/response data is stored in Exchange Online and is discoverable via eDiscovery and audit logs.\" For unlicensed Copilot Chat: limited content logging - audit visibility primarily via Entra and session metadata."
  },
  {
    "id": "act-2",
    "title": "Confirm web grounding granularity in GCC High - per-group or tenant-wide only",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "Web grounding is controlled via Microsoft 365 Cloud Policy, which supports scoped targeting in commercial environments. In GCC High, the availability and granularity of this control must be explicitly validated in the tenant before being relied upon or communicated to the ISSO. Until confirmed, treat as a tenant-level control."
  },
  {
    "id": "act-3",
    "title": "Validate Intelligent Recap with Copilot-only license (no Teams Premium)",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "Run test meeting with Copilot-only licensed user. Check Recap tab. Document each feature as accessible or locked."
  },
  {
    "id": "act-4",
    "title": "Run SAM Content Management Assessment - establish baseline",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "Start immediately - takes 2-72 hours. SharePoint Admin -> Advanced Management -> Start Assessment."
  },
  {
    "id": "act-5",
    "title": "Test Edge Purview add-in behavior in GCC High network environment",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "Proxy/TLS config may affect behavior. Validate before citing as control in ATO documentation."
  },
  {
    "id": "act-6",
    "title": "Test DLP enforcement against Copilot - validate label-based condition blocks",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "Known DLP gaps in GCC High Copilot. Test and document observed behavior. Do not assume coverage."
  },
  {
    "id": "act-7",
    "title": "Create Purview retention policy for Copilot and AI apps location",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "No technical dependencies - can be completed immediately. purview.microsoft.us -> Data Lifecycle -> Retention Policies -> New -> Locations: Microsoft 365 Copilot and Copilot Chat ONLY. Until this exists, Copilot interaction data has no governed retention - an ATO gap."
  },
  {
    "id": "act-8",
    "title": "Configure Power Platform DLP - Phase 3 (Copilot Studio) pre-production gate",
    "owner": "",
    "due": "",
    "status": "Resolved",
    "notes": "Not required for M365 Copilot pilot or rollout. Reclassified as a Phase 3 (Copilot Studio) pre-production gate - must be configured before any Copilot Studio agent goes to production. Power Platform DLP governs connector behavior and is separate from Purview DLP."
  },
  {
    "id": "act-9",
    "title": "Monitor Copilot grounding model changes - Work/Web convergence",
    "owner": "",
    "due": "",
    "status": "Open",
    "notes": "Microsoft is evolving Copilot toward more automatic grounding across tenant and web data sources. Monitor Message Center, Public Sector Blog, Service Description. Any change to how grounding is controlled must trigger a review of authorization assumptions and security-approved boundary assertions before updating documentation."
  }
];
export const actionStatuses = [
  "Open",
  "In Progress",
  "Resolved",
  "Blocked"
];
