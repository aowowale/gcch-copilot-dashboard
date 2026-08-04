import { useState, useEffect } from "react";

// ─── COPILOT VERSIONS DATA ────────────────────────────────────────────────────
const COPILOT_VERSIONS = [
  {
    id:"cv1", label:"Unlicensed Copilot Chat", sub:"Web Grounding OFF", filterPhases:["pre","access","unlicensed","adminconfig"],
    rec:true, badge:"CURRENT SAFE POSTURE", badgeColor:"#065F46", badgeBg:"#D1FAE5",
    color:"#1E3A5F",
    grounding:"No tenant grounding. Responds to manually provided text and model knowledge only.",
    boundary:"Treat as potentially outside the GCCH sovereignty boundary unless tenant-specific documentation confirms otherwise. Do not use with sensitive or CUI data.",
    compliance:"Retention and compliance behavior for unlicensed Copilot Chat should be validated in the tenant; do not assume parity with licensed M365 Copilot compliance controls.",
    useCase:"General Q&A, drafting with pasted text. Users must not enter sensitive or CUI content unless explicitly authorized by policy.",
    access:"Any M365 G3/G5 user with base license.",
    shield:"Enterprise shield = authenticated work identity only. Does not confirm GCCH compliance scope.",
    status:"Control via Integrated Apps scoping and CA policy. Web grounding is OFF by default in GCCH.",
    items:["No email, file, SharePoint, or Teams access","Responses based on prompt input + model knowledge","Web grounding OFF = stays within GCCH when used responsibly","Audit logging behavior for unlicensed Copilot Chat should be validated in the tenant; do not assume CopilotInteraction events are generated","Risk is what users type  -  CUI must never be entered without explicit policy authorization"]
  },
  {
    id:"cv2", label:"Unlicensed Copilot Chat", sub:"Web Grounding ON", filterPhases:["pre","access","unlicensed","adminconfig"],
    rec:false, badge:"GCCH BOUNDARY RISK  -  WEB GROUNDING ENABLED", badgeColor:"#991B1B", badgeBg:"#FEE2E2",
    color:"#7C2D12",
    grounding:"No tenant grounding. Responses based on prompt input + public web content.",
    boundary:"When web grounding is enabled, Copilot generates and sends a short derived search query to Bing, which is outside the GCC High boundary. Microsoft documentation confirms that full prompts, tenant documents, and Graph data are not sent to Bing  -  only a minimal query derived from the prompt. In GCC High, Bing is a commercial endpoint outside the sovereign boundary, so this represents a boundary interaction requiring explicit security approval.",
    compliance:"Data processed outside GCCH boundary. Not appropriate for sensitive or CUI-adjacent workloads without explicit security team approval.",
    useCase:"Not recommended. If enabled, restrict strictly to non-sensitive use cases with documented risk acceptance.",
    access:"Any M365 G3/G5 user with base license.",
    shield:"Enterprise shield = authenticated work identity only. Does NOT mean data stays in GCCH when web grounding is ON.",
    status:"Web grounding is OFF by default in GCCH. Requires deliberate admin enablement via Cloud Policy.",
    items:["No tenant data access","Web queries route to commercial Bing  -  outside GCCH boundary","Requires explicit security team approval and documented risk acceptance","Do not enable without ISSO sign-off","Cannot scope per individual user  -  validate granularity in tenant"]
  },
  {
    id:"cv3", label:"Licensed M365 Copilot", sub:"Web Grounding OFF (Recommended)",
    rec:true, badge:"RECOMMENDED DEPLOYMENT POSTURE", badgeColor:"#1E40AF", badgeBg:"#DBEAFE",
    color:"#1D4ED8",
    filterPhases:["pre","access","unlicensed","sam","purview","monitoring","entra","adminconfig","pilotprep","level1","ops"],
    grounding:"Full Microsoft Graph grounding across email, files, Teams messages, SharePoint content, and calendar  -  everything the user already has permission to see.",
    boundary:"Designed to remain within the GCCH boundary when used in Work Mode with web grounding OFF. Behavior should be validated in the tenant.",
    compliance:"CopilotInteraction audit events captured. Governed by Purview retention for Copilot and AI apps location. Accessible via eDiscovery. Interactions subject to DLP, sensitivity labels, and information barriers.",
    useCase:"The full Microsoft 365 Copilot experience  -  productivity across every M365 app and surface your team already uses daily.",
    access:"M365 G3/G5 Government base license + M365 Copilot add-on license. Exchange Online primary mailbox required.",
    shield:"Enterprise shield = authenticated work identity. In Work Mode with web grounding OFF, GCCH boundary maintained  -  validate in tenant.",
    status:"Target state for pilot and full production deployment.",
    valueProps:[
      { icon:"✉", label:"Summarize email threads", desc:"Instantly catch up on long email conversations. Ask Copilot to summarize a thread, identify action items, or draft a reply based on context." },
      { icon:"📄", label:"Draft documents and emails", desc:"Describe what you need  -  Copilot drafts it. First drafts of emails, memos, meeting follow-ups, and reports in seconds." },
      { icon:"🔍", label:"Find anything across M365", desc:"Ask a natural language question  -  Copilot searches across your email, Teams, SharePoint, and files simultaneously to surface the answer." },
      { icon:"📝", label:"Intelligent Recap (post-meeting notes)", desc:"After a meeting, Copilot generates a summary with key discussion points, decisions, and action items  -  attributed to each speaker. Validate availability in your GCCH tenant." },
      { icon:"📊", label:"Excel data analysis", desc:"Describe the analysis you want in plain language. Copilot creates formulas, charts, and pivot tables  -  and explains the findings in plain text." },
      { icon:"📑", label:"PowerPoint drafting", desc:"Describe a presentation topic and Copilot creates a structured slide outline with content. Note: translation, speaker notes generation, and presentation summaries not yet available in GCC High." },
      { icon:"💬", label:"Teams context and follow-up", desc:"Summarize what you missed while away. Draft follow-up messages based on conversation context. Note: in-meeting Copilot and chat/channel Copilot not yet available in GCC High." },
      { icon:"🤖", label:"Custom agents (Phase 3)", desc:"After pilot stabilizes: build custom agents grounded in your SharePoint knowledge bases, automating specific workflows  -  help desk, document Q&A, process guidance. Pro-code path in GCC High." },
    ],
    items:["Full Graph grounding  -  accesses email, files, Teams, SharePoint within user permission boundary","Designed to remain within GCCH in Work Mode with web grounding OFF  -  validate in tenant","CopilotInteraction events auditable in Purview  -  verify CopilotInteraction audit events are being generated","Governed by Purview retention when Copilot and AI apps location is configured  -  MUST be explicitly set","Requires: Exchange Online primary mailbox, M365 Apps on Current or Monthly Enterprise Channel, WebSocket connectivity","NOT yet in GCC High: Teams Meeting Copilot (in-meeting pane), Teams Chat/Channel Copilot, PowerPoint translation/speaker notes, Mac desktop app","Intelligent Recap, DSPM for AI, and other features: validate current availability in your GCCH tenant before communicating"]
  },
  {
    id:"cv4", label:"Licensed M365 Copilot", sub:"Web Grounding ON", filterPhases:["pre","access","unlicensed","sam","purview","monitoring","entra","adminconfig","pilotprep","level1","ops"],
    rec:false, badge:"GCCH BOUNDARY RISK  -  WEB GROUNDING ENABLED", badgeColor:"#92400E", badgeBg:"#FEF3C7",
    color:"#B45309",
    grounding:"Full Microsoft Graph grounding PLUS public web content via Bing search.",
    boundary:"When web grounding is enabled, both licensed and unlicensed Copilot generate and send a short derived search query to Bing  -  the same class of boundary interaction. Microsoft documentation confirms that tenant documents, emails, and Graph data are NOT sent to Bing. Licensed Copilot operates under enterprise contractual protections (DPA, no training on data), but the boundary consideration is the same class as unlicensed. Neither is more risky than the other specifically because of tenant data being sent out  -  that does not happen.",
    compliance:"Licensed tier adds contractual protections  -  but data still routes through commercial Bing infrastructure. Validate implications with ISSO before enabling.",
    useCase:"Improved response quality for non-sensitive topics. Not appropriate for sensitive workloads without explicit approval.",
    access:"M365 G3/G5 + M365 Copilot add-on.",
    shield:"Enterprise shield does not mean web queries stay in GCCH. They do not.",
    status:"Off by default in GCCH. Requires admin enablement via Cloud Policy. Treat as a risk decision, not a feature upgrade.",
    items:["Same class of boundary interaction as unlicensed web ON  -  both send only a short derived query to Bing, NOT full documents or tenant data","Microsoft documentation confirms: tenant documents, emails, and Graph data are not sent to Bing  -  only a minimal derived query","Licensed tier adds contractual protections (DPA, no training on your data)  -  stronger than unlicensed","Requires written security team approval and documented risk acceptance before enabling","Real security difference between licensed and unlicensed is when web grounding is OFF  -  not when it is ON","Cannot be scoped per user  -  validate granularity in tenant before communicating as an option"]
  },
  {
    id:"cv5", label:"Copilot Studio", sub:"GCC High  -  Separate Product", filterPhases:["pre","access","adminconfig","ops"],
    rec:null, badge:"SEPARATE LICENSING  -  VALIDATE GCCH AVAILABILITY", badgeColor:"#4C1D95", badgeBg:"#EDE9FE",
    color:"#6D28D9",
    grounding:"Custom agents grounded in data sources you configure: SharePoint, Dataverse, custom APIs. Respects user permissions via Microsoft Graph.",
    boundary:"Stays within GCCH when using GCCH-approved data sources. External connectors must be individually evaluated.",
    compliance:"Power Platform DLP governs connector-level behavior. Purview DLP governs content. Both apply. Audit logging via Purview. Separate Power Platform tenant/environment considerations.",
    useCase:"Custom AI agents for specific workflows: help desk, document Q&A, process automation, knowledge base search.",
    access:"Separate Copilot Studio licensing. Copilot Studio for US Government available in GCC High. Agent Builder and low-code studio NOT yet confirmed in GCCH  -  only declarative agents via M365 Agents Toolkit (pro-code) currently supported.",
    shield:"Authentication via Entra ID. Agent permissions are user-delegated  -  cannot exceed user's own access.",
    status:"Evaluate for Phase 3 (post-pilot). Agent governance policy must be published before enablement.",
    items:["Separate product from M365 Copilot  -  separate licensing and admin surface","Only declarative agents via M365 Agents Toolkit (pro-code) confirmed in GCCH","Agent Builder and low-code authoring not yet confirmed for GCCH","Power Platform DLP controls which connectors agents can use","Purview DLP controls what content agents can surface","External connectors not enabled by default in GCCH  -  require explicit admin enablement","Each agent is a change-managed event: define data sources, permissions, approval workflow"]
  }
];

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────
const DEFAULT_FAQS = [
  { id:"faq-1", category:"Access", q:"Why can't a user see Copilot in Teams?", a:"Work through these in order: (1) Global Teams App Permission Policy blocks Copilot for all users  -  correct by design. The user must also have the M365_Copilot_Allowed permission policy assigned. (2) Integrated Apps must scope Copilot to the user's group. (3) CA policy must allow the user. (4) Policy changes take time to propagate  -  retest after a significant wait before concluding something is broken.", verify:"Teams Admin Center (admin.teams.microsoft.us) → Users → select user → Policies tab → confirm M365_Copilot_Allowed is assigned. Also check Integrated Apps scoping in admin.microsoft365.us.", gcch:"All three controls must be in place simultaneously. A gap in any one allows or blocks access regardless of the others." },
  { id:"faq-2", category:"Access", q:"A user shouldn't have Copilot access but they can see it  -  why?", a:"Most likely: Copilot Chat (unlicensed surface) and licensed M365 Copilot are separate service surfaces with separate configuration paths. If only one was scoped in Integrated Apps, the other may remain accessible. Validate both experiences independently.", verify:"admin.microsoft365.us → Settings → Integrated Apps → verify BOTH Microsoft 365 Copilot AND Microsoft 365 Copilot Chat entries are scoped to authorized groups. Then test the unauthorized user's access from Teams and from the M365 portal.", gcch:"Validate both surfaces independently. The separation exists in both product behavior and the compliance boundary." },
  { id:"faq-3", category:"Licensing", q:"What is the real difference between unlicensed Copilot Chat and licensed M365 Copilot?", a:"The key difference is grounding: unlicensed Copilot Chat does not access tenant data via Microsoft Graph, while licensed M365 Copilot uses Graph to retrieve content the user already has access to.\n\nUnlicensed Copilot Chat: no tenant Graph grounding. Responses are based on prompt input and model knowledge only.\n\nLicensed M365 Copilot (Work Mode, web grounding OFF): uses Microsoft Graph to access content the user already has permission to see. Stays within GCCH in this configuration.\n\nWith web grounding ON (either tier): web grounding may route prompt data outside the GCCH boundary. Validate behavior in your tenant and ensure explicit security team approval before enabling.", verify:"Log in as unlicensed Chat Authorized user → prompt 'summarize my emails' (should return nothing tenant-grounded). Log in as licensed user in Work Mode → same prompt should return actual email summaries.", gcch:"Unlicensed Copilot Chat should be treated as potentially outside the GCCH boundary unless tenant documentation explicitly states otherwise. See the Copilot Versions section for the full comparison." },
  { id:"faq-4", category:"Licensing", q:"The enterprise shield appears on Copilot Chat  -  does that mean we are protected?", a:"No. The enterprise shield indicates a signed-in work identity only. It does not confirm GCCH boundary enforcement, retention coverage, or compliance scope.\n\nThe shield appears based on how you signed in, not which compliance controls are active for that session. For ATO purposes, verify actual controls: web grounding setting, retention policy coverage, CA policy application, and data flow documentation.", verify:"Do not use the shield as ATO evidence. Verify: web grounding setting confirmed OFF, Purview retention policy explicitly covers Copilot and AI apps location, CA policy is evaluated in sign-in logs.", gcch:"Do not cite the enterprise shield as evidence of GCCH compliance in customer communications or ATO documentation. It confirms authenticated work identity only." },
  { id:"faq-5", category:"Licensing", q:"Teams Premium users want Intelligent Recap  -  do they need an M365 Copilot license?", a:"Validate in your tenant with your specific license combination  -  do not assume based on commercial documentation.\n\nCritical distinction: Intelligent Recap (post-meeting AI notes, action items, chapters) is different from Teams Meeting Copilot (interactive in-meeting AI pane). Teams Meeting Copilot is NOT available in GCCH. Intelligent Recap may work with M365 Copilot license  -  test before communicating.", verify:"Assign intended license combination to test user. Run 2-minute Teams meeting with transcription. Check Recap tab. Document each feature as accessible or locked. Use observed tenant behavior.", gcch:"Teams Meeting Copilot (Footnote 6) NOT available in GCCH. Intelligent Recap GCCH availability must be determined by tenant testing." },
  { id:"faq-6", category:"Governance", q:"Is web grounding really OFF? How do we confirm and document it?", a:"In GCC High, web grounding is OFF by default. However, default does not substitute for explicit confirmation and authorization documentation.\n\nWhen web grounding is ON, Copilot generates and sends a short derived search query to Bing  -  outside the GCC High sovereignty boundary. Microsoft documentation explicitly confirms that full prompts, tenant documents, and Graph data are NOT sent to Bing. Only a minimal derived query leaves the boundary. In GCC High, Bing is a commercial endpoint, so this boundary interaction requires explicit security team approval and formal risk acceptance documentation regardless of the minimal nature of what is transmitted.", verify:"admin.microsoft365.us → Settings → Copilot settings → locate web grounding / web search control → confirm OFF → screenshot with admin account and date → file to authorization evidence folder.", gcch:"Verify this setting for both unlicensed Copilot Chat and licensed M365 Copilot. Do not enable without written security team approval and formal risk acceptance documentation. ZQL context: Zero Query Logging (ZQL), if active in your environment, ensures Bing does not retain the derived query after processing - covering query text, identifiers, and prompt signals. ZQL is a retention control only; it does not eliminate the boundary crossing or the approval requirement." },
  { id:"faq-7", category:"Governance", q:"Can we enable web grounding for just one user or group?", a:"Validate in your tenant before asserting. The admin control is cloud-policy-based and may support per-group targeting  -  confirm whether your GCCH tenant supports scoped enablement before communicating it as an option.", verify:"admin.microsoft365.us → Copilot settings → check whether web grounding Cloud Policy can be scoped to a group. Document finding before communicating to ISSO.", gcch:"Do not assert per-user/group scoping without tenant verification. Treat it as tenant-wide unless confirmed otherwise." },
  { id:"faq-8", category:"Data Governance", q:"Our data is a mess  -  nothing labeled, 249 oversharing sites. Can we still deploy Copilot safely?", a:"Yes  -  with layered controls. Tenant grounding cannot be disabled while keeping licensed Copilot active. What you control is the aperture.\n\nRSS (Restricted SharePoint Search): tenant-wide. Limits which SP sites Copilot and Search can access. Sites not on your allowed list are invisible to Copilot. PowerShell only. Temporary  -  disable when remediation complete.\n\nRCD (Restricted Content Discovery): per-site. Removes site from Copilot and Search without changing permissions. Available in SharePoint Admin Center UI.\n\nRCA/RSA (Restricted Access Control): per-site hard boundary. Limits access to a named Entra security group. Changes actual permissions. Permanent governance.\n\nRecommended: enable RSS with narrow initial allowed list. Apply RCD to highest-risk sites. Apply RCA to most sensitive sites. Expand RSS as sites clear readiness criteria. Disable RSS when governance posture is sound.", verify:"Validate each control in tenant before citing in ATO documentation. RSS: Get-SPOTenantRestrictedSearchAllowedList. RCD: SharePoint Admin → Active sites → site → Settings. RCA: same path, Restricted access control.", gcch:"All three controls available in GCCH. Validate behavior per control  -  do not assume commercial parity." },
  { id:"faq-9", category:"Data Governance", q:"What SharePoint sites can Copilot currently see?", a:"If RSS is enabled, Copilot can only see sites on the allowed list. If disabled, Copilot reaches any SharePoint content the user has access to  -  including all 249 oversharing sites.\n\nImportant: RSS does not restrict OneDrive or Exchange. Users' own files and email are always accessible to Copilot regardless of RSS state.", verify:"Connect-SPOService -Url 'https://TENANT-admin.sharepoint.us' then run Get-SPOTenantRestrictedSearchAllowedList. Validate in tenant before asserting in documentation.", gcch:"PowerShell only for RSS management in GCCH. Admin URL: TENANT-admin.sharepoint.us" },
  { id:"faq-10", category:"Compliance", q:"Does our DLP policy actually protect Copilot interactions?", a:"Validate in tenant  -  DLP policies must explicitly include Microsoft 365 Copilot as a protected location. Existing Teams/SharePoint/Exchange policies do NOT automatically cover Copilot. Enforcement behavior in GCCH should be tested and documented; do not assume parity with commercial environments.\n\nSIT-based prompt blocking is not confirmed available in GCCH. Label-based conditions are the current supported approach.", verify:"compliance.microsoft.us → DLP → Policies → open each policy → Locations tab → confirm Microsoft 365 Copilot is an included location. Test enforcement explicitly  -  document what was tested and what was observed.", gcch:"Do not assume DLP enforcement parity with commercial. Known enforcement gaps exist in GCCH Copilot. Test, document, and report findings to ISSO." },
  { id:"faq-11", category:"Compliance", q:"Does our retention policy cover Copilot interactions?", a:"Retention policies created prior to Copilot may not include the Copilot and AI apps location. Verification and explicit configuration are required.\n\nMicrosoft separated the Copilot interactions location from Teams chats  -  older policies and policies targeting Teams chats do not automatically cover Copilot prompt and response data.\n\nThis has no technical dependencies and can be completed immediately: create a new policy targeting only the Copilot and AI apps location. Treat as urgent  -  unretained Copilot data is an ATO gap.", verify:"compliance.microsoft.us → Data Lifecycle → Retention Policies → review each policy → Locations tab → look for Microsoft 365 Copilot and Copilot Chat or Copilot and AI apps as an explicit location.", gcch:"Purview portal for GCCH: compliance.microsoft.us. The Copilot-specific location is separate from Teams chats. Any policy not explicitly listing it does not cover Copilot interactions." },
  { id:"faq-12", category:"Compliance", q:"Where are Copilot prompts stored? Can we eDiscover them?", a:"Copilot interaction data is processed within Microsoft 365 services and is discoverable via Purview audit and eDiscovery using the CopilotInteraction activity type. The underlying storage implementation should not be assumed and must not be cited as evidence in ATO documentation  -  compliance validation should rely on observable controls: audit logs, retention policies, and eDiscovery results.\n\nFor compliance: if your Purview retention policy covers the Copilot and AI apps location, interactions are governed by that policy and accessible via eDiscovery.", verify:"compliance.microsoft.us → Audit → Activities: Interacted with Copilot → run for known pilot activity → confirm events appear with expected metadata. Test eDiscovery: create a case, search for Copilot interactions, confirm discoverability. Use these results as ATO evidence.", gcch:"Cite observable controls (audit log events, eDiscovery results, retention policy configuration) as ATO evidence  -  not assumptions about backend storage services." },
  { id:"faq-13", category:"Troubleshooting", q:"Copilot is missing in Outlook  -  where do we start?", a:"Work through in order:\n\n1. M365 Apps update channel: Semi-Annual Enterprise Channel does NOT support Copilot. Most common silent blocker in gov environments.\n\n2. Optional Connected Experiences: if disabled org-wide, Copilot UI is removed from Office apps. Check before diagnosing anything else.\n\n3. Microsoft People Cards Service principal: multiple GCCH tenants have had Copilot missing in Outlook Classic because this dependency was disabled.\n\n4. License and service plan: confirm add-on assigned and service plan active.\n\n5. CA policy: confirm user is in authorized group via sign-in logs.", verify:"Start with update channel. Then: entra.microsoft.us → Enterprise applications → search People Cards → confirm enabled. Then: Admin Center → Users → user → Licenses → confirm Copilot add-on.", gcch:"Do not skip the update channel check. Connected Experiences and People Cards SP are GCCH-specific known issues." },
  { id:"faq-14", category:"SAM", q:"How do we run the SAM reports and what do they show?", a:"SAM provides two report types:\n\nContent Management Assessment: automated tenant-wide scan across 5 categories  -  inactive sites, ownerless, broken inheritance, EEEU permissions, overpermissive sharing links. Takes 2-72 hours. Run FIRST.\n\nDAG Reports: on-demand. Site Permissions Snapshot sorts every site by total permissioned users with EEEU flag. Sharing Links Activity and EEEU Activity show new oversharing in the past 28 days  -  use monthly.\n\nFor this deployment: run Content Management Assessment immediately. Export DAG Site Permissions Snapshot as CSV  -  that is your prioritized remediation list.", verify:"admin.microsoft365.us → SharePoint Admin Center → Advanced Management → Start Assessment. GCCH SharePoint Admin URL: TENANT-admin.sharepoint.us. If Advanced Management not visible, wait 24h for license propagation.", gcch:"SAM is included with M365 Copilot license. Validate in tenant that Advanced Management is accessible." },
  { id:"faq-15", category:"Compliance", q:"What is the Purview Edge add-in and do we need it?", a:"The Microsoft Purview browser extension for Edge extends DLP and sensitivity labeling to browser-based activities including browser-based Copilot Chat sessions and content accessed via Edge.\n\nRelevant for: DLP enforcement in browser workflows, users accessing Copilot via browser rather than Teams or Office apps, and Endpoint DLP integration.\n\nGCCH-specific behavior must be validated in tenant before relying on it for compliance documentation. Proxy and TLS inspection can affect extension behavior.", verify:"Install extension in Edge for a test user. Trigger a DLP policy condition in a browser workflow. Confirm expected block or notification behavior. Document what was tested.", gcch:"GCCH-specific extension behavior needs tenant validation. Do not represent as a confirmed control without testing." },
  { id:"faq-16", category:"Availability", q:"Is Teams Meeting Copilot or Teams Chat Copilot available in GCCH?", a:"Teams Meeting Copilot (interactive in-meeting AI pane): NOT available in GCCH per service description. Do not communicate as available.\n\nCopilot in Teams chat and channels: NOT yet available in GCCH per service description. Do not communicate as available.\n\nIntelligent Recap (post-meeting AI notes): validate availability in your specific tenant with your license combination.\n\nCheck service description footnotes and Microsoft Public Sector Blog before communicating any Teams Copilot capability. Features arrive in GCCH without advance notice.", verify:"Assign intended license to test user. Run short Teams meeting with transcription. Check Recap tab. Document what is accessible vs locked.", gcch:"Service description is the authoritative source. Do not rely on commercial documentation not explicitly confirmed for GCC or GCCH." },
  { id:"faq-17", category:"Governance", q:"Can Copilot agents bypass SharePoint access controls or RSS restrictions?", a:"Copilot agents operate within the Microsoft Graph permission model  -  they cannot access content the user does not have access to.\n\nFor RSS specifically: validate in tenant whether agents respect RSS restrictions. The permission enforcement model is well-documented but RSS interaction with agents should be explicitly tested before publishing agents to users.", verify:"Create a test agent, enable RSS, ask the agent to retrieve content from a site not on the RSS allowed list. Document observed behavior before publishing any agents.", gcch:"Agent Builder rolling out in GCCH as of April 2026. No group-level controls on who can create agents exist today. Publish an agent governance policy before users create agents independently." },
  { id:"faq-18", category:"Compliance", q:"What is Power Platform DLP and how is it different from Purview DLP?", a:"These are two completely separate DLP systems that protect different things. You need both.\n\nPURVIEW DLP  -  Content Protection:\nPurview DLP inspects actual data content (files, emails, Copilot prompts/responses). It blocks or audits based on what the data contains  -  sensitivity labels, sensitive information types (SITs), or other content conditions. It protects data in SharePoint, OneDrive, Exchange, Teams, and Microsoft 365 Copilot. This is your data-level control.\n\nPOWER PLATFORM DLP  -  Connector Governance:\nPower Platform DLP operates at the connector level in Power Platform Admin Center. It governs which connectors (SharePoint, HTTP, custom APIs, etc.) Power Automate flows and Power Apps can use together. It does NOT inspect data content  -  it controls which services can be combined. Connectors are sorted into Business (can be combined) and Non-Business/Blocked buckets.\n\nFor Copilot Studio agents built with Power Automate: BOTH apply simultaneously. Power Platform DLP governs what external services the agent's flow can connect to. Purview DLP governs what content the agent can surface to users. A gap in either one creates a compliance exposure.", verify:"Power Platform DLP: admin.powerplatform.microsoft.com (or equivalent GCCH URL) → Policies → Data policies. Purview DLP: compliance.microsoft.us → Data Loss Prevention → Policies.", gcch:"Power Platform DLP uses the Power Platform Admin Center, separate from M365 Admin Center. For GCCH, confirm the correct admin URL for your Power Platform environment." },
  { id:"faq-19", category:"Availability", q:"What features are NOT available in GCC High right now?", a:"Confirmed NOT available (as of May 2026):\n\n- Teams Meeting Copilot (in-meeting AI pane)  -  Footnote 6\n- Copilot in Teams chat and channels  -  Footnote 7\n- M365 Copilot app for Mac (desktop)\n- Copilot Chat in Edge sidebar\n- Built-in agents: Researcher and Analyst  -  targeted 1H 2026, not confirmed\n- Agent Builder and low-code Copilot Studio authoring  -  pro-code M365 Agents Toolkit only\n- Copilot in Excel with Python\n- PowerPoint: translation, speaker notes, presentation summaries, Copilot-powered slide creation\n- Microsoft Security Copilot  -  not available in any government cloud\n- DSPM for AI 'Browse to URL' policies  -  only Microsoft-supported AI sites surfaced\n- External connectors for Graph  -  not enabled by default\n\nValidate current state against the Microsoft 365 Service Description and Public Sector Blog before communicating to users.", verify:"Microsoft 365 Service Description → GCC High footnotes. Microsoft Public Sector Blog for announcements. Message Center for your tenant.", gcch:"Features arrive without advance warning. Establish a weekly Service Description review process." },
  { id:"faq-20", category:"Data Governance", q:"What is Microsoft 365 Archive and how does it relate to Copilot?", a:"Microsoft 365 Archive is a pay-as-you-go service that stores inactive SharePoint site content at a lower cost tier while removing it from Copilot's grounding reach.\n\nKey behavior: content placed in Archive is excluded from Microsoft 365 Copilot processing and grounding. Copilot cannot surface archived content. The content is still preserved for eDiscovery and recordkeeping  -  it is just invisible to Copilot.\n\nUse cases:\n- Store legacy or inactive sites cheaply while keeping them out of Copilot responses\n- Exclude high-value but inactive content from AI processing\n- Reduce oversharing exposure without deleting content you cannot delete\n\nThis is an Azure Consumption-based service (excluded from M365 Copilot licensing). Factor into budget planning.", verify:"admin.microsoft365.us → SharePoint Admin Center → Archive policies. Review pricing before deploying at scale.", gcch:"Validate GCCH availability via the Service Description. Archive is listed in the E3/E5 FastTrack workbook as an option for excluding inactive content from Copilot." },
  { id:"faq-21", category:"Availability", q:"What is Copilot Studio and how does it work in GCCH?", a:"Copilot Studio is a separate Microsoft product for building custom AI agents and chatbots. It is NOT part of the M365 Copilot license  -  it requires separate licensing.\n\nIn GCC High: Copilot Studio for US Government has been available since February 2022. However, only declarative agents created with the Microsoft 365 Agents Toolkit (pro-code path) are currently confirmed for GCCH. Agent Builder and low-code studio authoring are not yet confirmed.\n\nKey differences from M365 Copilot:\n- Copilot Studio agents have custom-defined data sources, not automatic Graph grounding\n- Power Platform DLP governs what connectors agents can use\n- Separate admin surface: Power Platform Admin Center\n- Agents can be published to Teams, SharePoint, or the M365 Copilot surface\n- Each agent is a change-managed event requiring its own governance review\n\nFor this deployment, Copilot Studio is a Phase 3 workstream  -  after the M365 Copilot pilot is stable.", verify:"Power Platform Admin Center (GCCH equivalent URL) → confirm Copilot Studio licensing is assigned. Test creating a simple agent in a dev environment before production.", gcch:"Only pro-code declarative agents via M365 Agents Toolkit confirmed. Validate current low-code availability status before communicating to users." },
  { id:"faq-22", category:"Governance", q:"What is the Work/Web merge and 'automatic grounding'  -  should we be tracking this?", a:"Microsoft is evolving Copilot experiences toward more automatic grounding across tenant and web data sources. This may reduce reliance on explicit Work/Web mode toggles in the future. The exact control model, naming, and availability in GCC High should be validated as updates are released.\n\nWhy this matters for your deployment: the current security posture documented for authorization relies on web grounding being OFF as an admin-controlled setting. If Microsoft changes how grounding is controlled  -  moving from an explicit toggle to automatic routing  -  the mechanism for enforcing that boundary posture changes. Any change to how grounding is controlled must trigger a review of authorization assumptions, control documentation, and security team-approved boundary assertions.\n\nDo not assert that the toggle will be removed, that a specific feature name is confirmed, or that any timeline applies to GCC High until validated in the tenant.", verify:"Monitor: Microsoft 365 Message Center, Microsoft Public Sector Blog, Service Description updates. When a relevant change is announced: (1) validate behavior in GCC High tenant, (2) determine whether the admin control mechanism changes, (3) review authorization documentation and notify security team if controls are affected.", gcch:"Changes to commercial Copilot do not automatically apply to GCC High. Validate GCC High-specific behavior before updating any compliance documentation." },
  { id:"faq-23", category:"Licensing", q:"What does 'Enterprise Data Protection' on the Copilot shield mean? And from a security standpoint, what does the license buy us in GCC High?", a:"Two questions that deserve direct answers.\n\nWHAT ENTERPRISE DATA PROTECTION ACTUALLY MEANS:\nEnterprise Data Protection (EDP) ensures that prompts and responses are handled under Microsoft's enterprise security, privacy, and compliance terms  -  including encryption, isolation, and contractual data handling protections. This applies to both licensed and unlicensed Copilot Chat when signed in with a work account.\n\nWhat EDP does NOT guarantee: that your tenant-specific controls are configured or effective. Sensitivity labels, Data Loss Prevention policies, retention policies, and conditional access rules only protect your environment if they are correctly configured. EDP does not configure them for you and does not verify they are active. EDP covers Microsoft's handling of your data. Your controls cover your environment's governance posture. These are separate concerns.\n\nWHAT THE LICENSE BUYS FROM A SECURITY PERSPECTIVE:\nThe M365 Copilot license does not make your GCC High environment more secure. Your security controls make it secure. The license enables Copilot to operate on tenant data using Microsoft Graph. When that happens, your existing controls  -  permissions, sensitivity labels, Data Loss Prevention, retention, and audit  -  are applied to Copilot interactions.\n\nControls exist regardless of the license. But Copilot only interacts with and enforces them when operating on tenant data via Graph. Without the license, Copilot has no tenant data access, so your controls have nothing to govern in the context of Copilot behavior. With the license:\n- Sensitivity labels and information barriers are respected\n- Data Loss Prevention policies apply to Copilot's retrieval and surfacing of content\n- Copilot audit events are generated  -  interactions become discoverable\n- Retention policies apply when the Copilot and AI apps location is configured\n- Data processing occurs under Microsoft Product Terms and Data Protection Addendum for M365\n\nCopilot does not introduce new access. It amplifies existing permissions and data exposure patterns. If oversharing exists in the tenant, Copilot surfaces that exposure faster and more efficiently than a human could. This is why Restricted SharePoint Search, Restricted Content Discovery, and sensitivity labeling must precede broad deployment.\n\nOne common misconception worth addressing directly: when web grounding is ON, neither licensed nor unlicensed Copilot sends full tenant documents or Graph data to Bing. Both send only a short derived search query. The boundary interaction is the same class for both. Licensed Copilot is not more risky than unlicensed specifically because tenant data gets sent out  -  it does not. The real security difference lives in the web grounding OFF state: licensed accesses tenant data via Graph with your controls applied and everything stays within GCC High; unlicensed has no tenant data access at all.\n\nBottom line: the license is not a security control. It is what enables your security controls to be applied to Copilot behavior.", verify:"Validate that CopilotInteraction audit events are generated for licensed users: run a Purview audit search after a test interaction. Confirm events appear with expected metadata. This confirms the audit trail that forms part of your authorization evidence.", gcch:"In GCC High, the licensed M365 Copilot path is designed to keep processing within the GCC High boundary in Work Mode with web grounding OFF. The unlicensed path has Enterprise Data Protection from Microsoft's side, but no tenant-specific compliance governance path  -  no audit events, no retention policy application, no Data Loss Prevention enforcement against Copilot behavior." },
  { id:"faq-25", category:"Licensing", q:"Is licensed M365 Copilot actually more risky than unlicensed Copilot Chat when web grounding is ON? Does tenant data get sent to Bing?", a:"No  -  and this is one of the most common misconceptions worth correcting directly.\n\nWHAT ACTUALLY HAPPENS WHEN WEB GROUNDING IS ON:\nBoth licensed M365 Copilot and unlicensed Copilot Chat generate and send a short derived search query to Bing. Microsoft documentation explicitly confirms that full prompts, tenant documents, emails, and Microsoft Graph data are NOT sent to Bing. Only a minimal query derived from the prompt leaves the boundary.\n\nTHE RISK COMPARISON (web grounding ON):\n- Unlicensed Copilot Chat: sends a derived query to Bing (based on what the user typed)\n- Licensed M365 Copilot: sends a derived query to Bing (based on prompt + context)\n- Both are the same class of boundary interaction\n- Licensed is NOT more risky because tenant data is sent out  -  it is not\n- Licensed operates under stronger contractual protections (DPA, no training on your data)\n\nWHERE THE REAL DIFFERENCE LIVES (web grounding OFF):\n- Unlicensed: no tenant data access at all. EDP applies but your compliance controls have nothing to govern in Copilot context.\n- Licensed: full Graph grounding within GCC High boundary. Your DLP, sensitivity labels, retention, and audit all apply. This is the controlled, compliant path.\n\nTHE ENTERPRISE SHIELD:\nThe shield appears on both because Enterprise Data Protection (EDP) applies to both  -  meaning Microsoft handles the session under enterprise contractual terms (no training on your data, enterprise privacy terms, DPA). It does NOT mean GCC High boundary is enforced, web grounding is off, or your compliance controls are active.", verify:"Review Microsoft\'s Enterprise Data Protection documentation at learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection for the authoritative statement on what is and is not sent to Bing.", gcch:"In GCC High, Bing is a commercial endpoint outside the sovereign boundary. Even though only a derived query is sent, that boundary crossing requires explicit security team approval and documented risk acceptance before enabling web grounding. Zero Query Logging (ZQL) is a related privacy control: when active, Bing routes the query to a no-logging index and does not retain the query, identifiers, or prompt signals after processing. ZQL is a retention control, not a boundary elimination - the approval requirement remains regardless of ZQL status." },
  { id:"faq-24", category:"Data Governance", q:"We applied RSS to restrict SharePoint sites but content from restricted sites is still surfacing in Copilot. Why?", a:"This is a documented limitation of Restricted SharePoint Search that every deployment team should understand.\n\nRSS restricts Copilot's SharePoint SEARCH path  -  sites not on the allowed list are excluded from search-based discovery. However, Copilot uses Microsoft Graph for multiple signal types beyond search, including:\n\n- Recently accessed files: Copilot uses Microsoft Graph signals beyond SharePoint search, including user activity data. Content from restricted sites that a user has recently interacted with may still surface depending on implementation and recency signals\n- Recently received email attachments from restricted site content\n- Recently engaged Teams content\n\nRSS controls the search path. It does not retroactively remove items from a user's recent activity context in Microsoft Graph.\n\nPRACTICAL IMPLICATION: RSS alone is insufficient if users have recently interacted with content from high-risk sites. The required combination is:\n- RSS to limit new search-based discovery going forward\n- RCD (Restricted Content Discovery) on high-risk sites  -  this removes the site from the discovery surface more comprehensively, not just from search\n- RCA (Restricted Access Control) for the most sensitive content  -  this changes actual permissions, which affects the Graph activity path\n\nThe recent-activity signal typically fades after approximately 30 days of no access. For immediate control, apply RCD to sites where users have recent interaction history.", verify:"After applying RSS, ask Copilot to surface content you know a user has recently accessed from a restricted site. If it still appears, confirm via Purview audit whether the interaction used the search path or the activity/Graph path. This will identify whether RCD is also required.", gcch:"Validate this behavior in your specific GCC High tenant. The interaction between RSS and the Graph activity feed should be tested and documented before citing RSS as a comprehensive control in authorization documentation." },
];

const DEFAULT_ACTIONS = [
  { id:"act-1", title:"Validate Copilot interaction discoverability via Purview audit and eDiscovery", owner:"", due:"", status:"Resolved", notes:"VALIDATED. For licensed M365 Copilot: interactions are processed within the M365 service boundary and stored in the user's Exchange Online mailbox (hidden folder) - auditable via Purview and discoverable via eDiscovery. ATO-safe statement: 'Microsoft 365 Copilot interactions are processed within the Microsoft 365 service boundary and are auditable via Microsoft Purview. For licensed Copilot, prompt/response data is stored in Exchange Online and is discoverable via eDiscovery and audit logs.' For unlicensed Copilot Chat: limited content logging - audit visibility primarily via Entra and session metadata. Evidence paths to cite: Purview Audit (CopilotInteraction events), eDiscovery (Exchange Online mailbox content), Microsoft Learn enterprise data protection documentation." },
  { id:"act-2", title:"Confirm web grounding granularity in GCCH  -  per-group or tenant-wide only", owner:"", due:"", status:"Open", notes:"Web grounding is controlled via Microsoft 365 Cloud Policy, which supports scoped targeting in commercial environments. In GCCH, the availability and granularity of this control must be explicitly validated in the tenant before being relied upon or communicated to the ISSO. Until confirmed, treat as a tenant-level control." },
  { id:"act-3", title:"Validate Intelligent Recap with Copilot-only license (no Teams Premium)", owner:"", due:"", status:"Open", notes:"Run test meeting with Copilot-only licensed user. Check Recap tab. Document each feature as accessible or locked." },
  { id:"act-4", title:"Run SAM Content Management Assessment  -  establish baseline", owner:"", due:"", status:"Open", notes:"Start immediately  -  takes 2-72 hours. SharePoint Admin → Advanced Management → Start Assessment." },
  { id:"act-5", title:"Test Edge Purview add-in behavior in GCCH network environment", owner:"", due:"", status:"Open", notes:"Proxy/TLS config may affect behavior. Validate before citing as control in ATO documentation." },
  { id:"act-7", title:"Test DLP enforcement against Copilot  -  validate label-based condition blocks", owner:"", due:"", status:"Open", notes:"Known DLP gaps in GCCH Copilot. Test and document observed behavior. Do not assume coverage." },
  { id:"act-8", title:"Create Purview retention policy for Copilot and AI apps location", owner:"", due:"", status:"Open", notes:"This action has no technical dependencies and can be completed immediately. compliance.microsoft.us → Data Lifecycle → Retention Policies → New → Locations: Microsoft 365 Copilot and Copilot Chat ONLY  -  separate from Teams chats policy. Until this exists, Copilot interaction data has no governed retention  -  an ATO gap." },
  { id:"act-11", title:"Configure Power Platform DLP  -  Phase 3 (Copilot Studio) pre-production gate", owner:"", due:"", status:"Resolved", notes:"Not required for M365 Copilot pilot or rollout. Reclassified as a Phase 3 (Copilot Studio) pre-production gate  -  must be configured before any Copilot Studio agent goes to production. Power Platform DLP governs connector behavior for agents and is separate from Purview DLP. Configure in Power Platform Admin Center (GCCH equivalent URL)." },
  { id:"act-12", title:"Monitor Copilot grounding model changes  -  Work/Web convergence", owner:"", due:"", status:"Open", notes:"Microsoft is evolving Copilot experiences toward more automatic grounding across tenant and web data sources. This may reduce reliance on explicit Work/Web toggles. Monitor: Message Center, Microsoft Public Sector Blog, Service Description updates. Any change to how grounding is controlled must trigger a review of authorization assumptions, web grounding control documentation, and security officer-approved boundary assertions before updating documentation. Do not assume commercial announcements reflect GCC High availability or timeline." },

  { id:"act-steven", title:"Send Steven the known bugs list", owner:"", due:"", status:"Resolved", notes:"RESOLVED. Validated bugs list ready to send to Steven: (1) Enterprise Shield confusion - indicates EDP (enterprise data protection terms), NOT GCC High boundary enforcement and does not indicate whether web grounding is active or if data leaves GCC High. (2) Web grounding Bing routing - routes derived search queries only (not full prompts or tenant data) to commercial Bing endpoints when enabled; OFF by default in GCC High. (3) SharePoint / People Card inconsistencies - people card metadata and permissions not always aligned with Copilot retrieval experience; can surface perceived unexpected content based on underlying permissions. (4) Optional Connected Experiences dependency - certain Copilot capabilities silently degrade when this setting is disabled (common via FedRAMP hardening policies). (5) WebSocket / network reliability issues in AVD/VPN - impacts Copilot responsiveness and streaming; often tied to proxy inspection and TLS handling. (6) M365 Apps update channel dependency - Copilot features gated by update channel; Semi-Annual = missing capabilities. (7) DLP enforcement gaps in GCC High - known limitations in how label/DLP policies enforce in Copilot scenarios; must be tested, do not assume parity with Exchange/SharePoint enforcement." },
];

const ACTION_STATUSES = ["Open","In Progress","Resolved","Blocked"];
const FAQ_CATEGORIES = ["All","Access","Licensing","Governance","Data Governance","Compliance","SAM","Availability","Troubleshooting"];

// ─── PHASES DATA ──────────────────────────────────────────────────────────────
const PHASES = [
  {
    id:"pre", label:"Pre-Deployment", sub:"Foundation", bg:"#1E3A5F", acc:"#60A5FA",
    items:[
      { id:"pre-1", title:"GCC High Tenant Verification", pri:"CRITICAL", st:"complete",
        what:"Confirm the tenant is genuine GCC High: all admin experiences should use .us domain endpoints (portal.office365.us, admin.microsoft365.us). The Microsoft 365 Admin Center should explicitly display GCC High as the cloud environment.",
        impact:"Running configuration or testing in the wrong environment invalidates all results and may expose data outside the GCC High boundary.",
        how:"Navigate to admin.microsoft365.us. Confirm the URL stays on a .us domain throughout. Admin Center → Settings → Org settings → cloud environment should read GCC High. Do not validate using .com surfaces.",
        gcch:"Authentication routes through login.microsoftonline.us. All GCC High admin portals use .us domains. Commercial .com portals show a different tenant." },
      { id:"pre-2", title:"Network, Transport Security & WebSocket Validation", pri:"CRITICAL", st:"complete",
        what:"Validate three things together from a pilot device on the corporate network: (1) Outbound HTTPS to *.office365.us and *.microsoftonline.us is allowed. (2) TLS inspection is NOT intercepting Microsoft 365 traffic. (3) WebSocket connections succeed for *.gov.cloud.microsoft and *.office.com. Run the official Microsoft 365 Copilot Network Connectivity Test to capture results as authorization evidence.",
        impact:"TLS inspection breaking Microsoft 365 connections is the most common Copilot authentication failure. WebSocket failures cause Copilot to hang silently even when HTTPS looks healthy. Both must be confirmed before licenses are assigned.",
        how:"From a pilot workstation: (1) confirm firewall allows *.office365.us and *.microsoftonline.us with TLS bypass. (2) Test WebSocket connectivity  -  if a proxy is in-path confirm it supports WebSockets. (3) Navigate to connectivity.m365.cloud.microsoft/copilot and run the official test. Save the results as a PDF for authorization evidence.",
        gcch:"GCC High endpoints must be excluded from TLS/SSL inspection appliances. WebSocket failures are a recurring GCC High Copilot deployment hard blocker. The connectivity test tool resolves against .us endpoints  -  run from the corporate network, not VPN unless VPN is the production path." },
      { id:"pre-2c", title:"M365 Apps, Connected Experiences & Outlook Client Check", pri:"CRITICAL", st:"complete",
        what:"Three checks in one pass for a licensed pilot user: (1) Confirm 'Allow connected experiences in Office' and 'Allow connected experiences that analyze content' are both enabled  -  both are required for Copilot in Word, Excel, PowerPoint, Outlook, and Teams. (2) Confirm Microsoft 365 Apps is on Current Channel or Monthly Enterprise Channel  -  Semi-Annual does not support Copilot. (3) Confirm the Outlook client is a supported version. If Copilot is missing in Outlook Classic, check whether the Microsoft People Cards service principal is disabled in Entra  -  this is a documented GCC High issue.",
        impact:"Disabling Connected Experiences via FedRAMP privacy hardening removes Copilot from all Office apps. Semi-Annual Channel is the most common silent deployment blocker in government environments. Both issues present as 'Copilot missing' with no obvious error.",
        how:"Review Cloud Policy or Group Policy for M365 Apps privacy settings. Validate the update channel in Microsoft 365 Apps admin or Intune. For Outlook Classic: sign in as a licensed pilot user and confirm Copilot appears in the ribbon. If not: entra.microsoft.us → Enterprise applications → search People Cards → confirm enabled.",
        gcch:"Check Connected Experiences and update channel BEFORE diagnosing licensing or pinning. FedRAMP-driven privacy hardening is the most common cause in government environments. People Cards SP issue has been confirmed across multiple GCC High tenants." },
      { id:"pre-3", title:"Multi-Factor Authentication via Conditional Access", pri:"CRITICAL", st:"complete",
        what:"Confirm MFA is enforced for all Copilot-bound users via Conditional Access policy. This is a prerequisite, not an enhancement.",
        impact:"A compromised account without MFA gives an attacker full access to everything Copilot can surface  -  email, files, Teams, SharePoint  -  via natural language query with no additional effort.",
        how:"entra.microsoft.us → Conditional Access → confirm MFA required for Microsoft 365 apps for all pilot users. Test sign-in from a pilot account to confirm MFA prompts.",
        gcch:"Entra admin portal for GCC High: entra.microsoft.us. Authentication endpoint: login.microsoftonline.us." },
      { id:"pre-4", title:"Licensing and Exchange Online Verification", pri:"CRITICAL", st:"complete",
        what:"Confirm two prerequisites for every pilot user: (1) M365 G3 or G5 Government base license is assigned  -  the Copilot add-on cannot activate without a qualifying base. (2) Primary mailbox is in Exchange Online  -  on-premises Exchange is not supported and breaks Copilot interaction storage and eDiscovery.",
        impact:"Add-on without qualifying base = silent failure. On-premises mailbox = no audit trail, no retention, no eDiscovery for Copilot interactions.",
        how:"Admin Center → Active Users → select each pilot user → verify G3/G5 Government license and Exchange Online as primary mailbox provider. For bulk validation: Get-EXOMailbox to confirm Exchange Online status for all pilot accounts.",
        gcch:"Government SKUs: M365 G3 or G5 Government. Not commercial E3/E5." },
      { id:"pre-5", title:"Microsoft 365 Apps Update Channel", pri:"CRITICAL", st:"complete",
        what:"Confirm Microsoft 365 Apps for pilot users is on Current Channel or Monthly Enterprise Channel (build 1803 or later). Semi-Annual Enterprise Channel does not support in-app Copilot experiences.",
        impact:"Users on Semi-Annual will have a valid license assigned but no Copilot experience in any Office app. There is no error message  -  it simply does not appear.",
        how:"Admin Center → Apps → Microsoft 365 Apps → Update channel → verify pilot users are on Current or Monthly Enterprise. Validate per device via Intune compliance reports or Office Click-to-Run.",
        gcch:"Many government environments pin to Semi-Annual for stability. This must be validated per device before pilot launch. The macOS desktop app for M365 Copilot is not available in GCC High." },
      { id:"pre-11", title:"Data Readiness Assessment", pri:"CRITICAL", st:"complete",
        what:"Structured workshop to assess the current governance baseline before Copilot deployment: sharing settings, sensitivity labels, DLP policies, retention coverage, eDiscovery readiness, and SharePoint Advanced Management availability.",
        impact:"Establishes the full picture of gaps that must be addressed before safe deployment.",
        how:"COMPLETED. Key findings: zero SharePoint site sensitivity labels, DLP active across all workloads, Audit Log ON, retention policy does not cover Copilot location (critical gap), SAM now included with Copilot license, approximately 430 legacy document protection documents, 249 sites needing oversharing attention, 112 inactive sites.",
        gcch:"Workshop completed. All subsequent remediation is sequenced from these findings." },
    ]
  },
  {
    id:"access", label:"Access Control", sub:"Security Groups & Policies", bg:"#4C1D95", acc:"#A78BFA",
    items:[
      { id:"ac-1", title:"Create Entra Security Groups", pri:"CRITICAL", st:"complete",
        what:"Three security groups required per the Technical Control Guide: M365 Copilot License Group, Copilot Chat Authorized Group, and Copilot Studio License Group.",
        impact:"All Conditional Access policies, Teams App policies, and Integrated Apps configurations depend on these groups being in place first.",
        how:"COMPLETED via 01_Create_M365_Copilot_Security_Groups.ps1. Verify at entra.microsoft.us → Groups.",
        gcch:"Entra admin portal for GCC High: entra.microsoft.us" },
      { id:"ac-2", title:"Conditional Access Policy  -  Enterprise Copilot Platform App", pri:"CRITICAL", st:"complete",
        what:"Create a Conditional Access policy targeting the Enterprise Copilot Platform application (app ID: fb8d773d-7ef8-4ec0-a117-179f88add510). This is the hardest access gate  -  it blocks at the authentication layer regardless of other settings. Must cover both licensed M365 Copilot and unlicensed Copilot Chat.",
        impact:"Without this policy, users outside authorized groups can access Copilot surfaces. This is the gate that actually holds when other controls are misconfigured.",
        how:"First create the service principal: New-MgServicePrincipal -AppId fb8d773d-7ef8-4ec0-a117-179f88add510. Then create the CA policy scoped to authorized groups. Test in report-only mode before switching to enforcement. For belt-and-suspenders: service plan disable can also be applied in PowerShell per user  -  enumerate GUIDs first with Get-MgSubscribedSku as they are tenant-specific.",
        gcch:"Test CA policy changes in report-only mode before enforcement. Policy propagation takes time  -  do not test immediately after creating." },
      { id:"ac-3", title:"Integrated Apps  -  Scope Both Copilot Entries", pri:"CRITICAL", st:"complete",
        what:"In the Microsoft 365 Admin Center, scope both Copilot app entries to authorized groups. There are two separate entries: 'Microsoft 365 Copilot' (the licensed experience) and 'Microsoft 365 Copilot Chat' (the unlicensed experience). Both must be scoped.",
        impact:"Scoping only one entry leaves the other open to all eligible users. This is the most common misconfiguration in Copilot deployments.",
        how:"admin.microsoft365.us → Settings → Integrated Apps → search for 'Copilot' → find both Microsoft 365 Copilot AND Microsoft 365 Copilot Chat → scope each to authorized groups.",
        gcch:"Verify two separate entries exist. The licensed and unlicensed experiences are different Integrated Apps entries." },
      { id:"ac-4", title:"Teams App Permission Policies  -  Block All, Allow Authorized Group", pri:"CRITICAL", st:"complete",
        what:"Three steps in Teams Admin Center: (1) Set the Global (org-wide default) Teams App Permission Policy to block Copilot and Copilot Studio for all users. (2) Create an M365_Copilot_Allowed permission policy that allows the Copilot and Copilot Studio apps. (3) Assign M365_Copilot_Allowed to the License Group and Chat Authorized Group. Additionally, create a Teams App Setup Policy that pins Copilot in the left rail and assign it to licensed users only.",
        impact:"Without the global block, any Teams user can access Copilot regardless of Conditional Access or Integrated Apps settings. This is the Teams-specific access gate.",
        how:"Teams Admin Center (admin.teams.microsoft.us) → App permission policies → Global policy → block Copilot apps. Create new policy M365_Copilot_Allowed → allow Copilot → assign to authorized groups. For pinning: App setup policies → new policy → pin Copilot → assign to License Group only.",
        gcch:"Teams Admin Center for GCC High: admin.teams.microsoft.us. Last-applied policy wins if a user is in multiple groups." },
      { id:"ac-7", title:"Copilot Chat Pinning  -  Do Not Pin", pri:"CRITICAL", st:"complete",
        what:"Controls whether Copilot Chat auto-pins itself in the navigation of Word, Excel, PowerPoint, and OneNote.",
        impact:"Suppresses the entry point but does not block access. Conditional Access and Integrated Apps are the actual security gates.",
        how:"COMPLETED  -  admin.microsoft365.us → Copilot → Settings → Pin Copilot Chat → Do not pin → Do not ask users.",
        gcch:"In GCC High, Copilot Chat is desktop-only for users without a Copilot add-on  -  the web app is not yet available." },
    ]
  },
  {
    id:"unlicensed", label:"Unlicensed Copilot Chat", sub:"Stand-Up, Govern & Test", bg:"#7C2D12", acc:"#FB923C",
    items:[
      { id:"ul-1", title:"Web Grounding  -  Confirm and Document OFF", pri:"CRITICAL", st:"in-progress",
        what:"Verify and formally document that web grounding is OFF at the tenant level. When web grounding is enabled, Copilot may send query content or metadata to commercial Bing infrastructure, introducing potential data flow outside the GCC High boundary.",
        impact:"This is an authorization documentation requirement, not just a configuration check. The documented state is what the security officer and authorizing official will rely on.",
        how:"admin.microsoft365.us → Settings → Copilot settings → locate web grounding control → confirm OFF → take a screenshot showing the setting state, admin account, and date → file to authorization evidence folder.",
        gcch:"GCC High default is OFF by design. Do not enable without written security team approval and formal risk acceptance documentation." },
      { id:"ul-2", title:"Unlicensed Copilot Chat  -  Test Plan Execution", pri:"HIGH", st:"complete",
        what:"Execute the unlicensed Copilot Chat test plan to confirm the experience behaves as intended: no Work/Web toggle, no tenant data grounding, model responds only to what users type.",
        impact:"Confirms the intended experience and prevents assumptions about tenant data access being active for unlicensed users.",
        how:"Sign in as an unlicensed Chat Authorized user → confirm no Work/Web toggle → prompt 'summarize my recent emails' (should return nothing from tenant data) → prompt with pasted text (should summarize the provided text) → check Purview audit log (do not assume audit events are generated  -  validate and document what you observe).",
        gcch:"Treat unlicensed Copilot Chat as potentially outside the GCC High sovereignty boundary unless tenant-specific documentation confirms otherwise. Users must not enter sensitive or CUI data." },
      { id:"ul-3", title:"Unauthorized User Block Test", pri:"CRITICAL", st:"complete",
        what:"Verify that users who are NOT in any authorized group cannot access any Copilot surface.",
        impact:"Confirms all three access controls are working together: Conditional Access, Integrated Apps, and Teams policy.",
        how:"Sign in as a user with no group membership → test Teams left rail (no Copilot should appear) → test Microsoft 365 portal (no Copilot app) → attempt to navigate directly to office365.us/chat (should receive a Conditional Access block error). Test from both the Teams desktop app and a web browser.",
        gcch:"Conditional Access policy propagation takes time after changes. Wait before testing after any policy update." },
      { id:"ul-4", title:"User Communication  -  All Staff", pri:"HIGH", st:"not-started",
        what:"Brief all employees on what AI surfaces are now available, who has access, what the controls mean, and what they must and must not do.",
        impact:"An unbriefed user who discovers Copilot Chat independently may enter sensitive content without understanding the boundary implications. User awareness is a security control.",
        how:"Communication should cover: (1) what Copilot Chat is and is not, (2) who has authorized access and why, (3) web grounding is OFF and what that means for data handling, (4) users must not enter sensitive or CUI content without explicit policy authorization, (5) how to report unexpected behavior or concerns.",
        gcch:"Distinguish from consumer AI tools. Emphasize GCC High boundary protections and the difference between the enterprise and consumer experiences." },
      { id:"ul-5", title:"Deploy Purview Browser Extension in AVD Environment", pri:"HIGH", st:"not-started",
        what:"Deploy the Microsoft Purview browser extension for Microsoft Edge to all Azure Virtual Desktop session hosts. This extends Data Loss Prevention and sensitivity label enforcement to browser-based Copilot Chat sessions inside the virtual desktop environment.",
        impact:"Without the extension, users accessing Copilot Chat via Edge in an AVD session bypass Endpoint DLP enforcement  -  the Data Loss Prevention control boundary does not extend into the browser layer.",
        how:"Deploy via GCC High Intune as a force-installed extension: Device Configuration → Extensions policy → force-install extension ID echcggldkblnoonpioixfbomdpmohmjl to AVD device groups. Alternatively use Group Policy with Edge ADMX templates. After deployment, validate from inside an AVD session.",
        gcch:"Proxy and TLS inspection in the AVD network path can affect extension behavior. Test explicitly from inside an AVD session on the customer network  -  document observed behavior before citing as an active control." },
      { id:"ul-6", title:"Shadow AI Controls  -  Defender Policy and Network Enforcement", pri:"HIGH", st:"not-started",
        what:"Two-layer approach to governing non-Microsoft AI tools: (1) In Microsoft Defender for Cloud Apps, create a Cloud Discovery policy to enumerate and categorize generative AI services in use  -  sanctioned (Microsoft 365 Copilot), monitored, or blocked (consumer AI tools). (2) Work with the network team to block consumer AI service domains at the firewall or proxy level for domains not approved for organizational use.",
        impact:"Without these controls, staff are likely using consumer AI services with organizational content today. Network-level blocking is the most reliable control  -  application-layer policies can be worked around, network blocks cannot.",
        how:"Defender for Cloud Apps → Cloud Discovery → review AI app findings → create App Control policy → categorize tools. Common domains to block at network level: chat.openai.com, claude.ai, gemini.google.com. Validate that enterprise Microsoft 365 Copilot endpoints remain accessible  -  they are different from consumer Copilot endpoints.",
        gcch:"Defender for Cloud Apps is available in GCC High. Coordinate with the security operations team. Document the approved/blocked list for the authorization record. Ensure the block list distinguishes consumer Microsoft Copilot endpoints from enterprise M365 Copilot endpoints." },
      { id:"ul-8", title:"Change Request: Enable Unlicensed Copilot Chat  -  Full Deployment Procedure", pri:"CRITICAL", st:"not-started",
        what:"Document and execute the formal change request to enable unlicensed Copilot Chat for all authorized staff. Covers the complete procedure: who submits the request, who approves it, which security groups are modified, which admin settings are changed, required pre/post testing, and the rollback procedure.",
        impact:"Without a formal change procedure, enablement is undocumented. Authorization reviewers will look for evidence that this change went through an approved change management process.",
        how:"Change request checklist: (1) add authorized staff to the Copilot Chat Authorized security group, (2) confirm Integrated Apps scoping covers both Copilot Chat entries, (3) confirm Conditional Access policy covers the authorized group, (4) confirm web grounding is documented OFF, (5) confirm user communication was sent before go-live, (6) assign a rollback owner. Document each step with timestamps and approver names.",
        gcch:"File the completed change request package to the authorization evidence folder, including approval records, group membership screenshots, admin setting screenshots with timestamps, and post-go-live validation results." },
      { id:"ul-9", title:"Finalize CyberOps Data Loss Prevention Requirements  -  PII Flags and Exfiltration Controls", pri:"CRITICAL", st:"not-started",
        what:"Working session with the cybersecurity operations team to finalize Data Loss Prevention policy requirements specific to Copilot interactions: which sensitive data types should trigger policy violations, the enforcement action per type, how exfiltration via Copilot will be detected and alerted in Microsoft Sentinel, and what the incident response procedure is.",
        impact:"Without security operations-validated requirements, the Copilot DLP policy is incomplete from a cybersecurity standpoint. This is an active security control that the security operations team must own and monitor  -  not just a compliance configuration.",
        how:"Working session agenda: (1) sensitive information types to protect in Copilot context, (2) enforcement posture per type  -  audit, warn, or block, (3) alert routing for DLP violations to Microsoft Sentinel, (4) how Copilot exfiltration attempts will appear in the SIEM, (5) incident response playbook for Copilot-related data incidents.",
        gcch:"Coordinate with the security operations team who owns Microsoft Sentinel in the GCC High environment (Sentinel already has an Authorization to Operate). Route Copilot DLP violations to Sentinel via the Microsoft 365 connector for centralized monitoring." },
    ]
  },
  {
    id:"sam", label:"SharePoint Governance", sub:"Remediation & Access Controls", bg:"#064E3B", acc:"#34D399",
    items:[
      { id:"sam-1", title:"Activate SharePoint Advanced Management", pri:"CRITICAL", st:"in-progress",
        what:"SharePoint Advanced Management is now included with the M365 Copilot license. Confirm the Advanced Management option is accessible in the SharePoint Admin Center. This unlocks the Content Management Assessment, Data Access Governance reports, and all site lifecycle features.",
        impact:"Without SharePoint Advanced Management active, none of the governance reports or oversharing remediation tools are available.",
        how:"Navigate to the GCC High SharePoint Admin Center: TENANT-admin.sharepoint.us → Advanced Management. If not visible, wait 24 hours for license propagation.",
        gcch:"GCC High SharePoint Admin Center URL: TENANT-admin.sharepoint.us (not .com). This is a common error." },
      { id:"sam-2", title:"Run Content Management Assessment and Export Reports", pri:"CRITICAL", st:"not-started",
        what:"Two steps: (1) Start the automated Content Management Assessment  -  a tenant-wide scan across inactive sites, ownerless sites, broken permission inheritance, Everyone Except External Users permissions, and overpermissive sharing links. Takes 2-72 hours. Run this first before any remediation. (2) Export the Data Access Governance Site Permissions Snapshot as a CSV  -  this sorts every site by total permissioned users with an Everyone Except External Users flag. This is your prioritized remediation list.",
        impact:"The assessment gives you the full governance baseline. The snapshot shows you exactly which sites pose the highest Copilot oversharing risk  -  highest permissioned sites at the top.",
        how:"SharePoint Admin Center → Advanced Management → Start Assessment. Also run: Site Permissions report and Sharing Links report. Wait for completion → export each report as CSV.",
        gcch:"Available in GCC High with the M365 Copilot license. Run before enabling Restricted SharePoint Search to establish your baseline." },
      { id:"sam-4", title:"Oversharing Remediation and External Sharing Review", pri:"CRITICAL", st:"not-started",
        what:"Two parallel workstreams: (1) Using the Data Access Governance snapshot, remove Everyone Except External Users permissions from sites in the pilot scope  -  start with the highest permissioned sites. Apply Restricted Content Discovery to sites you cannot immediately remediate. (2) Review tenant-level external sharing settings: sharing level (most GCC High customers run at Existing guests only or stricter), default link type, link expiration, and domain allow/block lists.",
        impact:"249 sites currently flagged for oversharing. These are what Copilot surfaces to users when asked about organizational content. External sharing settings determine the maximum exposure boundary.",
        how:"Use the Data Access Governance CSV to prioritize  -  filter for Everyone Except External Users = Yes and sort by total permissioned users. Remove Everyone Except External Users per site via SharePoint Admin Center or PowerShell. External sharing: TENANT-admin.sharepoint.us → Policies → Sharing → review all settings.",
        gcch:"Document any exceptions to Existing guests only sharing level with CAB approval. External sharing settings in GCC High may be more restricted than commercial defaults." },
      { id:"sam-6", title:"Site Access Reviews and Ownership Policy", pri:"HIGH", st:"not-started",
        what:"Two steps: (1) Send formal site Access Reviews to owners of the highest-risk sites identified in the Data Access Governance report  -  owners review and confirm or remove permissions. (2) Run the Site Ownership Policy to identify ownerless or single-owner sites and send notifications to assign ownership. Sites with no owner cannot receive Access Reviews and cannot be governed.",
        impact:"Scales governance across hundreds of sites by involving the people who know the content. Ownerless sites are a governance dead zone.",
        how:"Access Reviews: Data Access Governance report → select sites with valid owners → Send access review → 5-day deadline for Everyone Except External Users sites, 14 days for others. Site Ownership: SharePoint Admin Center → Advanced Management → Site lifecycle → Site ownership → run in simulation mode first.",
        gcch:"Run simulation mode before activating the Site Ownership Policy. Confirm site owner email addresses are current before sending reviews." },
      { id:"sam-8", title:"Enable Restricted SharePoint Search", pri:"CRITICAL", st:"in-progress",
        what:"PowerShell-only tenant control that limits Copilot and org-wide SharePoint Search to a curated allowed list of sites. Sites not on the allowed list are invisible to Copilot search-based discovery. IMPORTANT LIMITATION: Restricted SharePoint Search restricts the search discovery path only. Copilot also uses Microsoft Graph signals including user activity data  -  content from restricted sites that a user has recently interacted with may still surface depending on implementation and recency signals. For comprehensive control, pair Restricted SharePoint Search with Restricted Content Discovery on high-risk sites. Also note: Restricted SharePoint Search also restricts org-wide SharePoint Search, not just Copilot  -  communicate to users before enabling.",
        impact:"Primary deployment-phase safety mechanism. Limits Copilot's SharePoint reach to only what you have reviewed. Does NOT restrict OneDrive or Exchange  -  users' own email and files are always accessible to Copilot.",
        how:"Connect-SPOService -Url 'https://TENANT-admin.sharepoint.us'\nEnable-SPORestrictedSearch\nAdd-SPOTenantRestrictedSearchAllowedList -SitesList @('https://TENANT.sharepoint.us/sites/SITENAME')\n\nFor sites where users have recent interaction history: also apply Restricted Content Discovery to remove those sites from the discovery surface.",
        gcch:"PowerShell only  -  no UI available in GCC High. Admin URL: TENANT-admin.sharepoint.us. Temporary control  -  disable when tenant remediation is complete." },
      { id:"sam-9", title:"Restricted Content Discovery  -  High-Risk Sites", pri:"HIGH", st:"not-started",
        what:"Per-site control that removes a site from Copilot and SharePoint Search without changing the site's actual permissions. Users who already have direct access can still navigate to the site. Apply immediately to the highest-risk sites identified in the Data Access Governance report.",
        impact:"Fastest per-site emergency control. Addresses the Restricted SharePoint Search limitation for sites where users have recent interaction history  -  Restricted Content Discovery removes those sites from the discovery surface more comprehensively than Restricted SharePoint Search alone.",
        how:"SharePoint Admin Center → Active sites → select site → Settings → Restrict content discoverability → Enable. Note: index propagation can take up to a week for sites with more than 500,000 items.",
        gcch:"Available in GCC High via the SharePoint Admin Center. Validate that the setting is applying correctly by testing Copilot search from a user account that has access to the site." },
      { id:"sam-10", title:"Restricted Access Control  -  Critical Sites", pri:"HIGH", st:"not-started",
        what:"Per-site hard boundary that limits access to a named Entra security group  -  changes actual SharePoint permissions, not just discovery. Only members of the specified group can access the site at all, regardless of tool. For the most sensitive content: CUI, HR records, mission-critical data.",
        impact:"Strongest per-site control. Affects browser access, API access, and Copilot  -  not just discovery.",
        how:"CRITICAL: Create the Entra security group FIRST. If you enable Restricted Access Control without a group, the site locks with no access  -  including your own. SharePoint Admin Center → Active sites → site → Settings → Restricted access control → Enable → enter security group name.",
        gcch:"Permanent governance  -  not a temporary deployment workaround. For GCC High: available via SharePoint Admin Center. Validate that the assigned security group contains the correct members before enabling." },
      { id:"sam-14", title:"Site Lifecycle Management and Ongoing Governance", pri:"ONGOING", st:"not-started",
        what:"Two ongoing actions: (1) Configure the Inactive Sites policy to identify and address the 112 inactive sites  -  notify owners, archive non-responsive sites. Archived sites are excluded from Copilot grounding and preserved for eDiscovery. (2) Schedule monthly Data Access Governance report reviews on the 1st of each month  -  run Sharing Links Activity and Everyone Except External Users Activity reports and action all flags within 48 hours.",
        impact:"Without ongoing monitoring, remediation gains erode as users create new sharing and sites go stale. The inactive sites contain content Copilot can still surface.",
        how:"Site lifecycle: SharePoint Admin Center → Advanced Management → Site lifecycle → Inactive sites → Simulation mode first → 14-day response timeout → activate. For Teams-connected sites, archive the Team first via Teams Admin Center. Monthly monitoring: calendar reminder → run both Data Access Governance reports → action flags.",
        gcch:"Consider automating the monthly reporting step with the Governance Agent (Phase 11  -  Full Operations)." },
    ]
  },
  {
    id:"purview", label:"Purview & Compliance", sub:"Labels, DLP, Retention", bg:"#78350F", acc:"#FCD34D",
    items:[
      { id:"pur-2", title:"Unified Audit Log  -  Active", pri:"CRITICAL", st:"complete",
        what:"Unified Audit Log must be enabled for CopilotInteraction events to be captured and available for eDiscovery.",
        impact:"Without audit logging, there is no record of what users asked Copilot or what data it retrieved and surfaced.",
        how:"CONFIRMED active. Validate CopilotInteraction events are being generated: compliance.microsoft.us → Audit → search 'Interacted with Copilot' for a date range with known pilot activity → confirm events appear with expected metadata.",
        gcch:"Purview compliance portal for GCC High: compliance.microsoft.us" },
      { id:"pur-4", title:"Retention Policy  -  Copilot and AI Apps Location", pri:"CRITICAL", st:"not-started",
        what:"Create a Purview retention policy that explicitly covers the 'Microsoft 365 Copilot and Copilot Chat' location. Retention policies created before Copilot was released  -  including policies covering Teams chats  -  do not automatically cover Copilot interactions. This location must be explicitly added in a separate policy.",
        impact:"Without this policy, Copilot prompt and response data has no governed retention period  -  an authorization gap with no workaround. This has no technical dependencies and can be completed immediately.",
        how:"compliance.microsoft.us → Solutions → Data Lifecycle Management → Retention Policies → New Policy → Locations: select 'Microsoft 365 Copilot and Copilot Chat' ONLY → set retention period per records management requirements → Submit. Must be a separate policy from Teams chats.",
        gcch:"Confirm the location name in your tenant  -  it may appear as 'Copilot and AI apps' depending on when the policy interface was last updated." },
      { id:"pur-5", title:"Data Loss Prevention Policy  -  Add Copilot as Protected Location", pri:"HIGH", st:"not-started",
        what:"Data Loss Prevention policies must explicitly include Microsoft 365 Copilot as a protected location. Existing policies covering Teams, SharePoint, Exchange, or OneDrive do NOT automatically cover Copilot. Enforcement behavior in GCC High must be tested and documented  -  do not assume parity with commercial environments.",
        impact:"Without this, sensitive content can be retrieved and surfaced by Copilot even if DLP would have blocked it through other channels.",
        how:"compliance.microsoft.us → Data Loss Prevention → Policies → New → Locations → add Microsoft 365 Copilot → Rules: use label-based conditions (SIT-based prompt DLP not confirmed in GCC High) → set enforcement action → enable in test mode first → document what was tested and observed before switching to enforcement.",
        gcch:"Test DLP enforcement explicitly in the GCC High tenant. Known enforcement gaps exist. Document observed behavior and report findings to the security officer." },
      { id:"pur-6", title:"Sensitivity Labels  -  SharePoint Sites and Teams", pri:"CRITICAL", st:"not-started",
        what:"Apply sensitivity labels to SharePoint sites, Microsoft 365 Groups, and Teams. Currently zero site-level labels in this tenant. Without site labels, DLP cannot enforce label-based conditions and Copilot cannot inherit content classifications. Every site going onto the Restricted SharePoint Search allowed list must be labeled before being added.",
        impact:"Site sensitivity labels are the foundation for everything downstream: DLP enforcement, label inheritance, governance reporting, and Copilot classification awareness. Zero labels means zero DLP label coverage for Copilot.",
        how:"compliance.microsoft.us → Information Protection → enable sensitivity labels for SharePoint sites and groups → create label hierarchy (Public, Internal, Confidential minimum) → apply to highest-risk and pilot sites first → configure a default label policy for new sites. Enable Teams labels as well.",
        gcch:"Start with the 5-10 sites going on the Restricted SharePoint Search pilot allowed list. Label before adding to the list." },
      { id:"pur-8", title:"Default Label Policy  -  Baseline Label for Unlabeled Content", pri:"HIGH", st:"not-started",
        what:"Configure a default label policy that applies a designated baseline label to all content that has not been explicitly labeled. This makes unlabeled content visible to DLP policy enforcement, including when that content is attached to or referenced in a Copilot prompt.",
        impact:"With a baseline default label in place, DLP policies can treat unlabeled content as a distinct class  -  restricting unlabeled files referenced in Copilot interactions. Without this, unlabeled content is invisible to label-based DLP conditions.",
        how:"compliance.microsoft.us → Information Protection → Label policies → create or update the default label policy → assign a baseline label (e.g., 'Unclassified  -  Pending Review') as the default for SharePoint, OneDrive, and Exchange → write a DLP rule targeting this label in Copilot interactions → set enforcement to audit first, then warn or block after validation.",
        gcch:"Operationally pragmatic for environments where full content classification is not yet feasible. Default label plus DLP provides governance coverage over unlabeled content while classification is phased in." },
      { id:"pur-10", title:"Legacy Document Protection  -  Inventory and Migration", pri:"HIGH", st:"not-started",
        what:"Approximately 430 documents are protected with legacy Information Rights Management encryption. These documents are invisible to Copilot  -  it cannot read or surface them. Users asking Copilot about content in these documents will get nothing back.",
        impact:"Legacy document protection is a silent content gap that undermines user confidence in Copilot. Until these documents are migrated to Purview sensitivity labels, they remain inaccessible to AI grounding.",
        how:"Use Purview Content Explorer and PowerShell to inventory legacy protected documents → prioritize by usage frequency and mission relevance → migrate to Purview sensitivity labels → validate Copilot can access post-migration.",
        gcch:"Legacy Information Rights Management encryption is not recognized by Copilot. Only Purview sensitivity label encryption is supported for Copilot grounding." },
      { id:"pur-12", title:"eDiscovery and Content Search Readiness", pri:"HIGH", st:"not-started",
        what:"Confirm Copilot interaction data is discoverable via Purview audit and eDiscovery. Use the CopilotInteraction activity type as the filter. Document the results  -  these are your authorization evidence, not assumptions about storage services.",
        impact:"Required for compliance and forensic readiness. Observable eDiscovery results are the defensible evidence path for authorization documentation.",
        how:"compliance.microsoft.us → eDiscovery → create a test case → run a Content Search filtered by CopilotInteraction activity from a known pilot user → confirm results appear correctly → document findings and file to authorization evidence folder.",
        gcch:"Cite observable controls as authorization evidence: audit log events, eDiscovery results, retention policy configuration. Do not assert storage implementation details." },
      { id:"pur-14", title:"Communication Compliance  -  Copilot Coverage", pri:"HIGH", st:"in-progress",
        what:"Verify that Communication Compliance policies explicitly cover Copilot interactions. Use the 'Detect Microsoft Copilot interactions' policy template. Evaluate for AI-generated content violations, policy language, and code-of-conduct concerns.",
        impact:"Without explicit Copilot coverage in Communication Compliance, policy-violating interactions may go undetected.",
        how:"compliance.microsoft.us → Communication Compliance → review existing policies → confirm Copilot interactions are in scope → apply the Detect Microsoft Copilot interactions template → tune thresholds.",
        gcch:"Communication Compliance is available in GCC High with most core features. Verify the Copilot-specific template is available in your tenant." },
    ]
  },
  {
    id:"monitoring", label:"Monitoring & Signals", sub:"Ongoing Oversight", bg:"#92400E", acc:"#FBBF24",
    items:[
      { id:"mon-1", title:"Data Security Posture Management for AI  -  Setup and Risk Assessments", pri:"HIGH", st:"not-started",
        what:"Two steps: (1) Complete the DSPM for AI onboarding checklist in Purview: confirm Audit is on, install the Purview compliance browser extension, onboard devices via Defender for Endpoint, apply the one-click recommended policies. (2) Configure data risk assessments for pilot SharePoint sites to identify oversharing exposure specific to Copilot.",
        impact:"DSPM for AI provides the AI-specific security posture dashboard with automatic recommendations. The data risk assessments score each site's Copilot exposure risk. Both require E5/G5 licensing.",
        how:"compliance.microsoft.us → DSPM for AI → Get Started checklist → apply one-click policies → Activity Explorer for AI signals → Data risk assessments → configure pilot sites (up to 10 sites, 200,000 items per location). Note: OneDrive item-level scanning is NOT currently supported  -  use Data Access Governance reports for OneDrive.",
        gcch:"Available in GCC High with one limitation: Browse to URL policies cannot be created  -  only Microsoft-supported AI sites are surfaced. Validate E5/G5 licensing before configuration." },
      { id:"mon-3", title:"Insider Risk Management  -  Risky AI Usage Policy", pri:"HIGH", st:"not-started",
        what:"Configure an Insider Risk Management policy using the risky AI usage template to detect potentially risky Copilot behavior patterns across the organization.",
        impact:"Behavioral security monitoring for Copilot. Catches abuse and anomalous usage patterns that DLP policies and audit log reviews alone miss.",
        how:"compliance.microsoft.us → Insider Risk Management → Policies → New → Risky AI usage template → tune detection thresholds against pilot cohort activity before broad enforcement.",
        gcch:"Core Insider Risk Management features are generally available in GCC High. Some advanced policy templates may be in Preview  -  verify the risky AI usage template is available in your tenant against the GCC High Purview feature matrix." },
      { id:"mon-4", title:"Defender for Cloud Apps  -  Shadow AI Discovery", pri:"MEDIUM", st:"not-started",
        what:"Review Microsoft Defender for Cloud Apps Cloud Discovery findings to identify non-Microsoft generative AI services in active use across the organization. Apply ongoing monitoring policies for sanctioned, tolerated, and blocked AI tools. This is the monitoring complement to the Shadow AI Controls setup task in the Unlicensed Chat phase.",
        impact:"Provides ongoing visibility into shadow AI usage after the initial block policies are in place. New services emerge continuously.",
        how:"Defender for Cloud Apps → Cloud Discovery → review AI app category findings monthly → update App Control policies as new tools emerge → coordinate with security operations team for enforcement actions.",
        gcch:"Available in GCC High. Coordinate with the security operations team. Shadow AI findings should feed into the risk register and be reviewed quarterly." },
      { id:"mon-6", title:"Quarterly Audit Log Review", pri:"ONGOING", st:"not-started",
        what:"Quarterly review of Copilot audit logs for anomalous usage patterns, unexpected data access, and potential policy violations. Required for continuous authorization monitoring.",
        impact:"Required evidence for authorization continuous monitoring. Demonstrates active oversight of Copilot behavior in the tenant.",
        how:"compliance.microsoft.us → Audit → CopilotInteraction activity for the previous quarter → review for anomalous patterns → document findings → file to authorization evidence folder. Export the results for the security officer's quarterly review.",
        gcch:"File quarterly review results to the authorization evidence folder. Maintain a log of findings and remediation actions taken." },
    ]
  },
  {
    id:"entra", label:"Entra ID Governance", sub:"Access Reviews & Lifecycle", bg:"#1E3A5F", acc:"#38BDF8",
    items:[
      { id:"ent-1", title:"Configure Quarterly Access Reviews  -  Guests, Privileged Roles, and Groups", pri:"HIGH", st:"not-started",
        what:"Three access reviews configured in the same admin session: (1) B2B guest users with access to Microsoft 365 Groups, Teams, or SharePoint sites in pilot scope  -  auto-revoke on no response. (2) All Entra roles with material privilege: Global Admin, SharePoint Admin, Exchange Admin, Compliance Admin, Security Admin  -  pair with Privileged Identity Management just-in-time activation. (3) Microsoft 365 Groups and Teams that own SharePoint sites in pilot scope  -  site owners as reviewers.",
        impact:"Unreviewed guest access and stale group memberships are two of the most common sources of Copilot oversharing risk. Privileged accounts with Copilot access can surface significantly more data than standard users.",
        how:"Entra Identity Governance → Access Reviews → Create → configure one review for each category with a quarterly cadence. For guest reviews: auto-revoke non-responders. For privileged role reviews: pair with Privileged Identity Management just-in-time activation. For group reviews: assign site owners as reviewers.",
        gcch:"GCC High customers often operate at Existing guests only sharing level  -  verify alignment between SharePoint sharing settings and Entra B2B configuration. Privileged Identity Management available in GCC High  -  verify advanced features against service description." },
      { id:"ent-4", title:"Access Reviews  -  Applications and Service Principals", pri:"HIGH", st:"not-started",
        what:"Identify applications and service principals with access to Microsoft Graph or SharePoint that could surface content in Copilot agents or connectors. Review consented permissions and remove stale or overpermissioned service principals.",
        impact:"Critical as Copilot agents and connectors are introduced. Each registered application with Graph access is a potential data exposure path for Copilot behavior.",
        how:"Entra → App registrations + Enterprise applications → review all apps with SharePoint or Graph permissions → run access reviews on application assignments → identify and remove stale service principals → document current application permission state.",
        gcch:"Critical before onboarding any Copilot agents. Each agent registration creates a new service principal that must be included in future access reviews." },
      { id:"ent-5", title:"Lifecycle Workflows  -  Employee Onboarding, Transfer, and Offboarding", pri:"HIGH", st:"not-started",
        what:"Configure or validate Entra ID Governance Lifecycle Workflows for three employee events: joiners (new hires receive correct group memberships and licenses), movers (internal transfers get updated access), and leavers (departing employees lose Copilot license and group memberships within the target SLA).",
        impact:"A departing employee who retains a Copilot license retains Microsoft Graph access to tenant data until manually revoked. In a licensed Copilot deployment, this is a data exposure risk that grows with organizational turnover.",
        how:"Entra Identity Governance → Lifecycle workflows → configure joiner, mover, and leaver workflows → integrate with HR system signals where available → document the deprovisioning evidence loop.",
        gcch:"Document the deprovisioning timeline and process for authorization purposes. Federal customers should target same-day revocation for leavers." },
      { id:"ent-6", title:"Conditional Access  -  Validate Copilot Sign-Ins", pri:"HIGH", st:"not-started",
        what:"Use the Conditional Access What If tool to confirm that Copilot-related sign-ins trigger the correct policy evaluations: device compliance enforcement, multi-factor authentication, sign-in risk assessment.",
        impact:"Copilot must not create an expanded data access and discovery surface by bypassing existing Conditional Access controls.",
        how:"entra.microsoft.us → Conditional Access → What If tool → test with a representative pilot user identity → verify the correct CA policy evaluates → test from a non-compliant device (should be blocked) → document results.",
        gcch:"Test Conditional Access changes in report-only mode before enforcement to avoid breaking the pilot cohort." },
    ]
  },
  {
    id:"adminconfig", label:"Admin Config Settings", sub:"Key Control Decisions", bg:"#0F4C81", acc:"#7DD3FC",
    items:[
      { id:"cfg-1", title:"Copilot Chat Pinning  -  Do Not Pin", pri:"CRITICAL", st:"complete",
        what:"Controls whether Copilot Chat auto-pins in the navigation of Word, Excel, PowerPoint, and OneNote.",
        impact:"Suppresses the entry point but does not block access. Conditional Access and Integrated Apps are the actual security gates.",
        how:"COMPLETED  -  admin.microsoft365.us → Copilot → Settings → Pin Copilot Chat → Do not pin → Do not ask users.",
        gcch:"In GCC High, Copilot Chat is desktop-only for unlicensed users  -  the web app surface is not yet available." },
      { id:"cfg-2", title:"Web Grounding (Cloud Policy)  -  Confirmed OFF and Documented", pri:"CRITICAL", st:"complete",
        what:"Web grounding is OFF by default in GCC High. This setting must be explicitly confirmed, screenshot, and filed as authorization evidence  -  default state does not substitute for documented evidence. When enabled, web grounding may send query content or metadata to commercial Bing infrastructure outside the GCC High boundary.",
        impact:"This documented setting is a core authorization control assertion. Any future change to how this is controlled  -  including potential evolution toward automatic grounding  -  must trigger a review of authorization assumptions.",
        how:"admin.microsoft365.us → Copilot → Settings → web grounding / web search control → confirm OFF → screenshot showing setting, admin account, and date → file to authorization evidence folder.",
        gcch:"Do not enable without written security team approval and formal risk acceptance. Per-group scoping via Cloud Policy may be possible  -  validate in tenant before communicating to the security officer as an option." },
      { id:"cfg-4", title:"Agents Governance Policy  -  Publish Before Enabling", pri:"CRITICAL", st:"not-started",
        what:"Before the Agents admin setting is enabled for any user, publish a formal agent governance policy defining who can create agents, what data sources they are permitted to access, the review and approval process before an agent goes to production, and the monitoring requirements.",
        impact:"Without governance, any licensed user can create a declarative agent that accesses tenant data with no oversight. In GCC High, no group-level creation controls currently exist  -  policy is the only mechanism.",
        how:"Draft agent governance policy → review with security and compliance teams → publish to SharePoint → confirm all licensed users have been notified. Policy must cover: creator authorization, permitted data sources, approval workflow, monitoring requirements, and decommissioning process. Then: admin.microsoft365.us → Settings → Agents → configure per policy.",
        gcch:"Only declarative agents via M365 Agents Toolkit (pro-code path) are currently confirmed in GCC High. Agent Builder and low-code Copilot Studio authoring not yet confirmed. Do not communicate those capabilities as available until validated in your tenant." },
      { id:"cfg-10", title:"Graph Connectors  -  Governance and Enablement Policy", pri:"HIGH", st:"not-started",
        what:"Microsoft Graph connectors enable ingestion of line-of-business data into Microsoft Graph for Copilot grounding. In GCC High, external connections and third-party connectors are NOT enabled by default. Each connector enablement brings a new data source into Copilot's grounding surface.",
        impact:"Each connector is a change-managed event  -  a new data source that Copilot can search and surface. Security and privacy review required before any connector is enabled.",
        how:"admin.microsoft365.us → Settings → Connectors → review available connectors → define the governance process: Privacy/Security review, data classification, CAB approval, ongoing monitoring. Enable only after completing this process.",
        gcch:"Connectors are not enabled by default in GCC High. Treat each as a change-managed event with formal review. Document each enabled connector in the authorization record." },
    ]
  },
  {
    id:"pilotprep", label:"Pilot Preparation", sub:"Before First License", bg:"#1E3A5F", acc:"#60A5FA",
    items:[
      { id:"pp-2", title:"Build Restricted SharePoint Search Allowed List  -  5 to 10 Clean Sites", pri:"CRITICAL", st:"not-started",
        what:"Build the initial Restricted SharePoint Search allowed list with 5-10 sites that have been reviewed and cleared. Each site must meet readiness criteria before being added. Separately confirm and document that web grounding is OFF for licensed users.",
        impact:"The allowed list is the aperture. Everything not on this list is invisible to Copilot. This determines exactly what the pilot can access.",
        how:"For each candidate site: confirm not in Everyone Except External Users report + sensitivity label applied + site owner confirmed and active + no broken permission inheritance. Add cleared sites: Add-SPOTenantRestrictedSearchAllowedList -SitesList @('https://TENANT.sharepoint.us/sites/SITENAME'). Document each site added with date and approval.",
        gcch:"PowerShell only in GCC High. Admin URL: TENANT-admin.sharepoint.us" },
      { id:"pp-3", title:"Select and Brief Pilot Users", pri:"CRITICAL", st:"not-started",
        what:"Select 20-50 technically capable pilot users who can recognize and report anomalies: IT staff, power users, compliance team, security engineers. Brief every pilot user before license activation  -  not after.",
        impact:"The right pilot users surface issues early. Unbriefed pilot users are a security and compliance risk from day one.",
        how:"Selection criteria: understands GCC High data handling, Exchange Online primary mailbox confirmed, already in License Group. Briefing session (30 minutes before license activation): (1) Copilot uses Microsoft Graph within your permission boundary, (2) interactions are stored and subject to retention and eDiscovery, (3) web grounding is OFF, (4) do not enter sensitive content without policy authorization, (5) how to report unexpected behavior.",
        gcch:"Pilot users must understand the Work vs Web mode distinction and GCC High boundary implications." },
      { id:"pp-4", title:"Security Officer Notification  -  Level 1 Pilot", pri:"CRITICAL", st:"not-started",
        what:"Formally notify the security officer before any Copilot licenses are activated. Prepare a briefing package covering the data flow, security controls in place, planned pilot scope, open risk items, and confirmed feedback controls (restricted feedback  -  no verbatim prompt/response data  -  became the default for GCC High on March 31, 2026).",
        impact:"GCC High environments require security team awareness before new AI tools are activated. This is a process gate, not optional.",
        how:"Prepare briefing package: data flow diagram, controls summary, pilot scope documentation, open risk register. Include confirmation that restricted feedback is active: admin.microsoft365.us → Settings → Org settings → Microsoft feedback → confirm restricted feedback setting. Brief the security officer → document date, attendees, and acknowledgment received.",
        gcch:"Level 1 requires awareness and notification at minimum. Level 2 requires formal written sign-off  -  begin that conversation at the Level 1 briefing." },
    ]
  },
  {
    id:"level1", label:"Level 1 Pilot", sub:"Restricted  -  20 to 50 Users", bg:"#0F3460", acc:"#38BDF8",
    items:[
      { id:"l1-1", title:"Assign Licenses  -  Pilot Group Only", pri:"CRITICAL", st:"not-started",
        what:"Assign the M365 Copilot add-on license to selected pilot users ONLY. License assignment activates full Microsoft Graph grounding  -  this is the moment Copilot gains access to tenant data.",
        impact:"Assigning licenses broadly before readiness is confirmed is a security risk. Every licensed user's email, files, Teams conversations, and SharePoint content becomes accessible to Copilot.",
        how:"Admin Center → Users → Active Users → select pilot users individually → Licenses → add M365 Copilot add-on. Confirm M365 G3 or G5 Government base license is present for each user before adding the add-on.",
        gcch:"Confirm base license is Government SKU. Do not assign to users not in the authorized pilot group." },
      { id:"l1-2", title:"Restricted Pilot Launch", pri:"CRITICAL", st:"not-started",
        what:"Activate the Level 1 pilot. Pre-launch checklist before communicating to pilot users: licenses assigned, Restricted SharePoint Search enabled with allowed list, web grounding documented OFF, Conditional Access verified, pilot users briefed, security officer notified, audit logging confirmed. Work Mode only  -  no agents.",
        impact:"This is the discovery phase. The goal is to surface issues before broader deployment while the blast radius is limited to 20-50 users.",
        how:"Complete checklist → communicate go-live to pilot users → begin daily audit log monitoring. Teams Meeting Copilot and Chat/Channel Copilot are NOT available in GCC High  -  do not include in pilot communications.",
        gcch:"Work Mode ONLY. No agent enablement. Daily audit monitoring from day one." },
      { id:"l1-3", title:"Permission Boundary, File Security, and Storage Tests", pri:"CRITICAL", st:"not-started",
        what:"Three security validation tests to run in the same session: (1) Ask Copilot for content from a site NOT on the Restricted SharePoint Search allowed list  -  verify no results are returned. Ask about an allowed site  -  verify results are returned. Document both. (2) From an unmanaged or non-compliant device, generate a file via Copilot and attempt to download it  -  document whether Conditional Access controls are honored (known GCC High Sev1 concern). (3) Generate files via Copilot across key surfaces and verify the user-facing link path matches actual storage and eDiscovery paths.",
        impact:"Test (1) is the primary security validation. Test (2) must be documented before Level 2  -  unmanaged device bypass has been raised as a Sev1 concern in GCC High. Test (3) validates the compliance chain for Copilot-generated content.",
        how:"(1) RSS boundary test: use a pilot licensed account, ask about restricted site content, document result. (2) Unmanaged device test: use a non-enrolled device, generate a Copilot file, attempt download, document result and identify compensating controls. (3) Storage validation: generate files, record URLs, verify storage path via compliance tools.",
        gcch:"Document all three tests with results before proceeding to Level 2. The unmanaged device test result must be on file." },
      { id:"l1-4", title:"Audit Log Monitoring and Conditional Access Validation", pri:"CRITICAL", st:"not-started",
        what:"Two monitoring tasks during the pilot: (1) Check Purview audit logs daily for CopilotInteraction events  -  verify they match expected pilot activity, investigate gaps immediately, export weekly for the security officer. (2) Review Entra sign-in logs to confirm Conditional Access policies are correctly evaluating for Copilot sessions  -  test from a non-compliant device to confirm block behavior.",
        impact:"Real-time view of what Copilot is doing in the tenant. The sign-in log review confirms Copilot is not bypassing Conditional Access controls.",
        how:"(1) compliance.microsoft.us → Audit → Interacted with Copilot → last 24 hours → verify events match pilot user activity. (2) entra.microsoft.us → Sign-in logs → filter for Copilot application → verify CA policy evaluated → test block from non-compliant device.",
        gcch:"Purview portal: compliance.microsoft.us. Entra portal: entra.microsoft.us. Export audit results weekly for security officer review." },
      { id:"l1-7", title:"Level 1 Exit Criteria Review  -  Gate to Level 2", pri:"CRITICAL", st:"not-started",
        what:"Formal review of Level 1 outcomes before any expansion. All three permission boundary tests must pass. Document any open issues. Brief the security officer with findings. Receive written acknowledgment before scheduling Level 2.",
        impact:"This is the gate. Proceeding to Level 2 without the security officer's acknowledgment creates authorization risk.",
        how:"Prepare findings summary: test results, any anomalies observed, open risk items, proposed compensating controls for anything not passing. Brief security officer → document acknowledgment → schedule Level 2 conversation.",
        gcch:"Written security officer acknowledgment is required before Level 2 expansion in GCC High. Begin the Level 2 conversation (broader scope, more users, ISSO formal sign-off) at the Level 1 debrief." },
    ]
  },
  {
    id:"ops", label:"Full Operations", sub:"Ongoing Governance", bg:"#1F2937", acc:"#9CA3AF",
    items:[
      { id:"op-1", title:"Monthly Governance Audits  -  SharePoint Reports and Label Coverage", pri:"ONGOING", st:"not-started",
        what:"Monthly cadence on the 1st of each month: (1) Run Sharing Links Activity and Everyone Except External Users Activity reports in Data Access Governance  -  action all flags within 48 hours. (2) Track sensitivity label coverage using Purview Content Explorer  -  target 80%+ label coverage on business-critical sites and report progress to the security officer quarterly.",
        impact:"Without ongoing monitoring, remediation gains erode continuously as users create new sharing and new content arrives unlabeled.",
        how:"Calendar reminder → 1st of month → run both Data Access Governance activity reports → action any new Everyone Except External Users flags within 48 hours. Quarterly: Purview Content Explorer → filter by label status → calculate coverage percentage → include in security officer report.",
        gcch:"Consider automating via the Governance Agent once Phase 11 is active." },
      { id:"op-3", title:"Service Description and Policy Reviews", pri:"ONGOING", st:"not-started",
        what:"Two ongoing monitoring responsibilities: (1) Weekly review of Microsoft 365 Message Center, Microsoft Public Sector Blog, and Service Description footnotes for GCC High feature changes  -  Copilot features arrive in GCC High without advance notice. (2) Annual review of all AI-related policies: AI usage policy, Copilot retention policy, DLP Copilot location, feedback controls, and agent governance policy. Update and re-communicate any changes.",
        impact:"Features arrive in GCC High without warning. Missing an availability change means users find capabilities before the security team has evaluated them. Annual policy reviews ensure governance keeps pace with product evolution.",
        how:"Weekly: 15-minute scan of Message Center + Public Sector Blog. When a new feature is announced: validate in GCC High tenant before communicating. Annual: calendar reminder → review each policy document → assess whether product changes require updates → brief security officer on changes.",
        gcch:"Monitor Work/Web grounding model evolution closely  -  any change to how web grounding is controlled must trigger a review of authorization assumptions and ISSO-approved boundary assertions before updating documentation." },
      { id:"op-5", title:"Governance Agent  -  Automate the Ongoing Cycle", pri:"ONGOING", st:"not-started",
        what:"Build and deploy a Governance Agent to automate the ongoing governance cycle: continuous oversharing monitoring, policy drift detection, automatic authorization evidence collection, alerts on GCC High feature changes, and on-demand governance status briefs.",
        impact:"Replaces the manual monthly and quarterly governance cadence with continuous automated monitoring. Without this, the governance workload is a permanent manual overhead.",
        how:"Build using Copilot Studio + M365 Agents Toolkit + Power Automate + Microsoft Graph APIs. Permissions required: Sites.Read.All, Reports.Read.All, AuditLog.Read.All, Policy.Read.All. All calls to graph.microsoft.us. See agents deck for full architecture and 12-week build plan.",
        gcch:"Copilot Studio and M365 Agents Toolkit confirmed available in GCC High as of April 2026. All agent calls route to graph.microsoft.us  -  no data exits GCC High. All interactions auditable via Purview." },
    ]
  },
];

const LOCKDOWN_CONTROLS = [
  { risk:"Copilot surfaces overshared SharePoint content", control:"RSS limits Copilot to approved, reviewed sites only  -  everything else is invisible until explicitly added", color:"#064E3B", bg:"#D1FAE5" },
  { risk:"Wrong users access Copilot", control:"CA policy + Integrated Apps (both entries) + Teams permission policy  -  three independent gates, all must be in place simultaneously", color:"#1E3A5F", bg:"#EFF6FF" },
  { risk:"Data flows outside GCC High boundary", control:"Web grounding OFF by default in GCC High, documented and filed as authorization evidence  -  validate and confirm, do not assume", color:"#7C2D12", bg:"#FEF2F2" },
  { risk:"Sensitive content surfaced via Copilot", control:"DLP (Copilot location explicitly added) + Sensitivity Labels + RCD  -  test enforcement in tenant, do not assume parity", color:"#78350F", bg:"#FFF7ED" },
  { risk:"Access expands faster than governance matures", control:"RSS allowed list expands only as sites clear readiness criteria: EEEU removed, label applied, owner confirmed  -  deliberate gate at every step", color:"#4C1D95", bg:"#EDE9FE" },
  { risk:"Agents access unreviewed data sources", control:"Agent governance policy must be published before any agent goes to production  -  no group-level creation controls exist today", color:"#0F3460", bg:"#F0F9FF" },
];

const GLOSSARY = {
  "RSS": "Restricted SharePoint Search  -  limits which SharePoint sites Copilot and org-wide Search can access",
  "RCD": "Restricted Content Discovery  -  removes a site from Copilot and Search without changing permissions",
  "RCA": "Restricted Access Control  -  per-site hard boundary that changes actual permissions",
  "RSA": "Restricted Site Access  -  same as Restricted Access Control",
  "DLP": "Data Loss Prevention  -  policy engine that detects and governs sensitive content",
  "CA": "Conditional Access  -  policy that controls access based on identity, device, and risk signals",
  "GCC High": "Microsoft's government community cloud at the highest compliance tier (FedRAMP High, ITAR, DFARS)",
  "GCC": "Government Community Cloud  -  Microsoft's government cloud at FedRAMP Moderate",
  "AVD": "Azure Virtual Desktop  -  Microsoft's cloud-based virtual desktop infrastructure",
  "SAM": "SharePoint Advanced Management  -  toolset for site governance, oversharing detection, and access controls",
  "DAG": "Data Access Governance  -  SAM reporting that surfaces oversharing, inactive sites, and permission anomalies",
  "EEEU": "Everyone Except External Users  -  a SharePoint permission that grants access to all internal accounts",
  "PIM": "Privileged Identity Management  -  just-in-time privileged access in Microsoft Entra ID",
  "ATO": "Authorization to Operate  -  federal security approval allowing a system to process government information",
  "ISSO": "Information System Security Officer  -  the person responsible for maintaining a system's security posture",
  "AO": "Authorizing Official  -  the executive who formally accepts risk and grants ATO",
  "MFA": "Multi-Factor Authentication  -  requiring more than one proof of identity to sign in",
  "TLS": "Transport Layer Security  -  encryption protocol for data in transit",
  "CUI": "Controlled Unclassified Information  -  information requiring safeguarding under federal regulation",
  "DSPM": "Data Security Posture Management  -  Microsoft's AI-specific security posture dashboard",
  "IRM": "Insider Risk Management (Purview) OR Information Rights Management (legacy document protection)  -  context-dependent",
  "SIEM": "Security Information and Event Management  -  centralized platform for security event collection and analysis",
  "PPAC": "Power Platform Admin Center  -  admin surface for Power Apps, Power Automate, and Copilot Studio",
  "FSLogix": "Microsoft technology for managing user profiles in virtualized environments like AVD",
  "WSS": "WebSocket Secure  -  the encrypted WebSocket protocol used by Copilot chat experiences",
};

const SAM_FINDINGS = [
  { id:"sf-1", label:"SharePoint Sites with Oversharing", baseline:249, current:249, target:0, unit:"sites", color:"#991B1B", bg:"#FEF2F2", note:"Sites with Everyone Except External Users permissions or excessive access. Remediate via DAG Site Access Reviews, remove EEEU, apply RCD to high-risk sites." },
  { id:"sf-2", label:"SharePoint Sites with Zero Sensitivity Labels", baseline:0, current:0, target:249, unit:"sites labeled", color:"#92400E", bg:"#FEF3C7", note:"Label coverage is the foundation for DLP enforcement. Target: all pilot sites labeled before RSS allowed list addition. Track progress monthly." },
  { id:"sf-3", label:"Inactive Sites (180+ days)", baseline:112, current:112, target:0, unit:"inactive sites", color:"#1E40AF", bg:"#DBEAFE", note:"Stale content that surfaces in Copilot responses. Remediate via Site Lifecycle Management policy or Microsoft 365 Archive." },
  { id:"sf-4", label:"Legacy Document Protection Documents", baseline:430, current:430, target:0, unit:"documents", color:"#4C1D95", bg:"#EDE9FE", note:"Legacy Information Rights Management documents are invisible to Copilot. Migrate to Purview sensitivity labels." },
  { id:"sf-5", label:"Sites on Copilot Allowed List (RSS)", baseline:0, current:0, target:10, unit:"approved sites", color:"#065F46", bg:"#D1FAE5", note:"Sites reviewed, labeled, EEEU-cleared, and added to the Restricted SharePoint Search allowed list. Copilot can only ground against these sites." },
];

const PRI = { BLOCKER:{bg:"#FEE2E2",tc:"#991B1B",dot:"#EF4444"}, CRITICAL:{bg:"#FEF3C7",tc:"#92400E",dot:"#F59E0B"}, HIGH:{bg:"#DBEAFE",tc:"#1E40AF",dot:"#3B82F6"}, MEDIUM:{bg:"#F3F4F6",tc:"#374151",dot:"#9CA3AF"}, ONGOING:{bg:"#D1FAE5",tc:"#065F46",dot:"#10B981"}, LOW:{bg:"#F0F9FF",tc:"#0369A1",dot:"#38BDF8"} };
const STS = { "complete":{lbl:"Complete",ic:"✓",bg:"#D1FAE5",tc:"#065F46",br:"#10B981"}, "in-progress":{lbl:"In Progress",ic:"◐",bg:"#FEF3C7",tc:"#92400E",br:"#F59E0B"}, "blocked":{lbl:"Blocked",ic:"✗",bg:"#FEE2E2",tc:"#991B1B",br:"#EF4444"}, "not-started":{lbl:"Not Started",ic:"○",bg:"#F8FAFC",tc:"#64748B",br:"#CBD5E1"} };
const CYCLE = ["not-started","in-progress","complete","blocked"];
const FEEDBACK_SP_URL = "PLACEHOLDER_SHAREPOINT_SITE_URL";

export default function App() {
  const [statuses, setStatuses]         = useState({});
  const [selected, setSelected]         = useState(null);
  const [activeTab, setActiveTab]       = useState("what");
  const [filterSt, setFilterSt]         = useState("all");
  const [filterPri, setFilterPri]       = useState("all");
  const [search, setSearch]             = useState("");
  const [timeframes, setTimeframes]     = useState({});
  const [refs, setRefs]                 = useState([]);
  const [faqs, setFaqs]                 = useState(DEFAULT_FAQS);
  const [faqCat, setFaqCat]             = useState("All");
  const [faqSearch, setFaqSearch]       = useState("");
  const [openFaq, setOpenFaq]           = useState(null);
  const [editingFaq, setEditingFaq]     = useState(null);
  const [actions, setActions]           = useState(DEFAULT_ACTIONS);
  const [editingAction, setEditingAction] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbType, setFbType]             = useState("Bug");
  const [fbTitle, setFbTitle]           = useState("");
  const [fbBody, setFbBody]             = useState("");
  const [fbSent, setFbSent]             = useState(false);
  const [editingRef, setEditingRef]     = useState(null);
  const [versionFilter, setVersionFilter]   = useState(null);
  const [samFindings, setSamFindings]       = useState(SAM_FINDINGS);
  const [showSam, setShowSam]               = useState(false);
  const [summaryMode, setSummaryMode]       = useState(false);
  const [showVersions, setShowVersions]     = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showLockdown, setShowLockdown]     = useState(true);

  useEffect(() => {
    try {
      const d = localStorage.getItem("gcch-roadmap-v4"); if (d) setStatuses(JSON.parse(d));
      const tf = localStorage.getItem("gcch-roadmap-tf"); if (tf) setTimeframes(JSON.parse(tf));
      const r = localStorage.getItem("gcch-roadmap-refs"); if (r) setRefs(JSON.parse(r));
      const fq = localStorage.getItem("gcch-roadmap-faqs"); if (fq) setFaqs(JSON.parse(fq));
      const ac = localStorage.getItem("gcch-roadmap-acts"); if (ac) setActions(JSON.parse(ac));
    } catch(e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem("gcch-roadmap-v4", JSON.stringify(statuses)); } catch(e){} }, [statuses]);
  useEffect(() => { try { localStorage.setItem("gcch-roadmap-tf", JSON.stringify(timeframes)); } catch(e){} }, [timeframes]);
  useEffect(() => { try { localStorage.setItem("gcch-roadmap-refs", JSON.stringify(refs)); } catch(e){} }, [refs]);
  useEffect(() => { try { localStorage.setItem("gcch-roadmap-faqs", JSON.stringify(faqs)); } catch(e){} }, [faqs]);
  useEffect(() => { try { localStorage.setItem("gcch-roadmap-acts", JSON.stringify(actions)); } catch(e){} }, [actions]);

  const getSt = (item) => statuses[item.id] ?? item.st;
  const cycleSt = (e, item) => { e.stopPropagation(); const c=getSt(item); setStatuses(p=>({...p,[item.id]:CYCLE[(CYCLE.indexOf(c)+1)%CYCLE.length]})); };
  const filteredPhases = versionFilter
    ? PHASES.filter(phase => {
        const ver = COPILOT_VERSIONS.find(v => v.id === versionFilter);
        return ver && ver.filterPhases && ver.filterPhases.includes(phase.id);
      })
    : PHASES;
  const filteredItems = filteredPhases.flatMap(p => p.items);
  const allItems = PHASES.flatMap(p=>p.items);
  const done=filteredItems.filter(i=>getSt(i)==="complete").length;
  const inProg=filteredItems.filter(i=>getSt(i)==="in-progress").length;
  const blocked=filteredItems.filter(i=>getSt(i)==="blocked").length;
  const pct=Math.round((done/filteredItems.length)*100);
  const matches = (item) => {
    if (filterSt!=="all" && getSt(item)!==filterSt) return false;
    if (filterPri!=="all" && item.pri!==filterPri) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  };

  const S = {
    app:{ fontFamily:"system-ui,sans-serif", background:"#F8FAFC", minHeight:"100vh", color:"#1E293B" },
    hdr:{ background:"#FFFFFF", borderBottom:"1px solid #E2E8F0", padding:"14px 18px 10px", position:"sticky", top:0, zIndex:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" },
    filterBar:{ display:"flex", gap:6, flexWrap:"wrap", padding:"8px 18px", background:"#F1F5F9", borderBottom:"1px solid #E2E8F0", position:"sticky", top:106, zIndex:19 },
    board:{ display:"flex", overflowX:"auto", padding:"16px 18px 60px", alignItems:"flex-start", gap:0 },
    phaseCol:{ minWidth:270, maxWidth:270, marginRight:12, flexShrink:0 },
    card:{ margin:"4px 7px", borderRadius:6, padding:"8px 10px", cursor:"pointer", transition:"all .12s", borderWidth:1, borderStyle:"solid", borderLeftWidth:3, background:"#FFFFFF" },
    cardDone:{ background:"#F0FDF4" },
    cardBlocked:{ background:"#FFF5F5" },
    cardInProg:{ background:"#FFFBF0" },
    panel:{ position:"absolute", top:0, right:0, height:"100vh", width:440, maxWidth:"95vw", background:"#FFFFFF", borderLeft:"1px solid #E2E8F0", display:"flex", flexDirection:"column", boxShadow:"-4px 0 20px rgba(0,0,0,0.08)" },
    section:{ padding:"32px 18px 0" },
    sectionTitle:{ fontSize:16, fontWeight:700, color:"#1E293B", marginBottom:4 },
    sectionSub:{ fontSize:11, color:"#94A3B8", marginBottom:14 },
  };

  const fbtn = (active) => ({ padding:"3px 9px", borderRadius:5, fontSize:10, fontFamily:"monospace", border:`1px solid ${active?"#3B82F6":"#E2E8F0"}`, background:active?"#3B82F6":"#FFFFFF", color:active?"#fff":"#64748B", cursor:"pointer", transition:"all .1s" });
  const inputStyle = { padding:"4px 9px", borderRadius:5, fontSize:11, background:"#FFFFFF", border:"1px solid #E2E8F0", color:"#1E293B", outline:"none" };

  return (
    <div style={S.app}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
        .card:hover{transform:translateY(-1px)!important;box-shadow:0 4px 12px rgba(0,0,0,.1)!important}
        .sbtn:hover{opacity:.85;transform:scale(1.03)}
        .fbtn:hover{opacity:.9}
        a{color:#2563EB}
      `}</style>

      {/* HEADER */}
      <div style={S.hdr}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:9,letterSpacing:3,color:"#3B82F6",marginBottom:3}}>GCCH · FEDRAMP HIGH · M365 COPILOT DEPLOYMENT</div>
            <div style={{fontSize:18,fontWeight:700,color:"#0F172A"}}>Deployment Readiness Roadmap</div>
            <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>Click any item to drill down · Click status badge to cycle · Progress saves automatically</div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[{l:"Progress",v:`${pct}%`,c:pct>50?"#2563EB":"#D97706"},{l:"Complete",v:done,c:"#065F46"},{l:"In Progress",v:inProg,c:"#92400E"},{l:"Blocked",v:blocked,c:"#991B1B"},{l:"Total Items",v:versionFilter?`${filteredItems.length}/${allItems.length}`:allItems.length,c:"#475569"}].map(x=>(
              <div key={x.l} style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:7,padding:"6px 12px",textAlign:"center"}}>
                <div style={{fontFamily:"monospace",fontSize:17,fontWeight:700,color:x.c}}>{x.v}</div>
                <div style={{fontSize:9,color:"#94A3B8"}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
          {["Roadmap","Copilot Versions","Lock-Down Model","SAM Progress","Actions","FAQ","Glossary","Feedback","References"].map(tab=>(
            <a key={tab} href={`#${tab.toLowerCase().replace(/[ /]/g,"-")}`} onClick={tab==="SAM Progress"?()=>setShowSam(true):undefined} style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:600,background:"#EFF6FF",color:"#1D4ED8",textDecoration:"none",border:"1px solid #BFDBFE"}}>
              {tab}
            </a>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div style={S.filterBar}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items..." style={{...inputStyle,width:150}} />
        {["all","not-started","in-progress","complete","blocked"].map(s=>(
          <button key={s} style={fbtn(filterSt===s)} onClick={()=>setFilterSt(s)}>{s==="all"?"All Status":STS[s]?.lbl}</button>
        ))}
        <div style={{width:1,background:"#E2E8F0",alignSelf:"stretch"}} />
        {["all","BLOCKER","CRITICAL","HIGH","MEDIUM"].map(p=>(
          <button key={p} style={fbtn(filterPri===p)} onClick={()=>setFilterPri(p)}>{p==="all"?"All Priority":p}</button>
        ))}
      </div>

      {/* COPILOT VERSIONS COMPARISON */}
      <div id="copilot-versions" style={{...S.section, paddingTop:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <div>
            <div style={S.sectionTitle}>Copilot Versions  -  What Are We Deploying?</div>
            <div style={S.sectionSub}>Click any version to see full details · Customer is evaluating all options below</div>
          </div>
          <button onClick={()=>setShowVersions(!showVersions)} style={{...fbtn(false),fontSize:11}}>{showVersions?"Hide":"Show"}</button>
        </div>
        {showVersions && (
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
            {COPILOT_VERSIONS.map(v=>(
              <div key={v.id} onClick={()=>setSelectedVersion(selectedVersion?.id===v.id?null:v)}
                style={{minWidth:220,maxWidth:220,flexShrink:0,background:"#FFFFFF",border:`2px solid ${selectedVersion?.id===v.id?"#2563EB":"#E2E8F0"}`,borderRadius:10,padding:14,cursor:"pointer",transition:"all .15s",boxShadow:selectedVersion?.id===v.id?"0 0 0 3px #BFDBFE":"0 1px 3px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:v.color,flexShrink:0,marginTop:3}} />
                  {v.rec===true && <span style={{fontSize:8,padding:"1px 5px",borderRadius:8,background:"#D1FAE5",color:"#065F46",fontWeight:700,fontFamily:"monospace"}}>✓ REC</span>}
                  {v.rec===false && <span style={{fontSize:8,padding:"1px 5px",borderRadius:8,background:"#FEE2E2",color:"#991B1B",fontWeight:700,fontFamily:"monospace"}}>⚠ CAUTION</span>}
                </div>
                <div style={{fontSize:12,fontWeight:700,color:"#0F172A",lineHeight:1.3}}>{v.label}</div>
                <div style={{fontSize:10,color:"#64748B",marginTop:2,marginBottom:8}}>{v.sub}</div>
                <div style={{fontSize:9,padding:"2px 6px",borderRadius:8,background:v.badgeBg,color:v.badgeColor,fontWeight:700,fontFamily:"monospace",lineHeight:1.3}}>{v.badge}</div>
                <div style={{fontSize:10,color:"#64748B",marginTop:8,lineHeight:1.5}}>{v.grounding.substring(0,80)}...</div>
              </div>
            ))}
          </div>
        )}
        {selectedVersion && (
          <div style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,padding:18,marginTop:10,borderLeft:`4px solid ${selectedVersion.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>{selectedVersion.label}  -  {selectedVersion.sub}</div>
                <div style={{fontSize:11,padding:"2px 8px",borderRadius:8,display:"inline-block",marginTop:4,background:selectedVersion.badgeBg,color:selectedVersion.badgeColor,fontWeight:700}}>{selectedVersion.badge}</div>
              </div>
              <button onClick={()=>setSelectedVersion(null)} style={{background:"#F1F5F9",border:"none",borderRadius:5,width:26,height:26,cursor:"pointer",color:"#64748B",fontSize:14}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["Grounding",selectedVersion.grounding,"#1E3A5F"],["GCC High Boundary",selectedVersion.boundary,"#78350F"],["Compliance",selectedVersion.compliance,"#064E3B"],["Access",selectedVersion.access,"#4C1D95"],["Appropriate Use",selectedVersion.useCase,"#0F3460"],["Current Status",selectedVersion.status,"#374151"]].map(([label,val,col])=>(
                <div key={label} style={{background:"#F8FAFC",borderRadius:6,padding:"10px 12px",borderLeft:`3px solid ${col}`}}>
                  <div style={{fontSize:9,fontFamily:"monospace",color:"#94A3B8",letterSpacing:1,marginBottom:4}}>{label.toUpperCase()}</div>
                  <div style={{fontSize:12,color:"#334155",lineHeight:1.6}}>{val}</div>
                </div>
              ))}
            </div>
            {selectedVersion.valueProps && (
              <div style={{marginTop:12,background:"#EFF6FF",borderRadius:8,padding:"12px 14px",border:"1px solid #BFDBFE"}}>
                <div style={{fontSize:9,fontFamily:"monospace",color:"#2563EB",letterSpacing:1,marginBottom:8,fontWeight:700}}>WHAT YOU GET WITH THIS LICENSE  -  GCC HIGH</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {selectedVersion.valueProps.map((vp,i)=>(
                    <div key={i} style={{display:"flex",gap:8,background:"#FFFFFF",borderRadius:6,padding:"8px 10px",border:"1px solid #DBEAFE"}}>
                      <span style={{fontSize:16,flexShrink:0}}>{vp.icon}</span>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:"#1E3A5F",marginBottom:2}}>{vp.label}</div>
                        <div style={{fontSize:10,color:"#64748B",lineHeight:1.5}}>{vp.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginTop:12,background:"#F8FAFC",borderRadius:6,padding:"10px 12px"}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#94A3B8",letterSpacing:1,marginBottom:6}}>KEY POINTS</div>
              <ul style={{listStyle:"none",margin:0,padding:0}}>
                {selectedVersion.items.map((item,i)=>(
                  <li key={i} style={{display:"flex",gap:8,marginBottom:4,fontSize:12,color:"#334155"}}>
                    <span style={{color:"#3B82F6",flexShrink:0}}>→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* LOCK-DOWN MODEL */}
      <div id="lockdown" style={{...S.section, paddingTop:24, paddingBottom:8}}>
        <div style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,padding:"18px 20px",borderLeft:"4px solid #1E3A5F"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:showLockdown?12:0}}>
            <div>
              <div style={{fontFamily:"monospace",fontSize:9,letterSpacing:3,color:"#3B82F6",marginBottom:4}}>DEPLOYMENT PHILOSOPHY</div>
              <div style={{fontSize:16,fontWeight:700,color:"#0F172A"}}>Deploy Locked Down. Open Up as You Go.</div>
              {!showLockdown && <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>Access minimized by default  -  every expansion is a deliberate, documented decision</div>}
            </div>
            <button onClick={()=>setShowLockdown(!showLockdown)} style={{padding:"3px 12px",borderRadius:6,fontSize:11,fontWeight:600,background:"#F1F5F9",border:"1px solid #E2E8F0",color:"#64748B",cursor:"pointer",flexShrink:0,marginLeft:16}}>
              {showLockdown?"Hide":"Show"}
            </button>
          </div>
          {showLockdown && (
            <>
              <div style={{fontSize:12,color:"#334155",marginBottom:12,lineHeight:1.7}}>
                Access is minimized by default and expanded only through deliberate, documented decisions. At Day 1, Copilot has the minimum viable access needed to function. Every expansion beyond that requires a deliberate decision. The objective is not to delay deployment, but to ensure each expansion is a deliberate, documented decision rather than an implicit assumption.
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))",gap:8}}>
                {LOCKDOWN_CONTROLS.map((c,i)=>(
                  <div key={i} style={{background:c.bg,borderRadius:7,padding:"10px 12px",borderLeft:`3px solid ${c.color}`}}>
                    <div style={{fontSize:10,fontWeight:700,color:c.color,marginBottom:4,fontFamily:"monospace",letterSpacing:0.5}}>RISK</div>
                    <div style={{fontSize:11,color:"#1E293B",marginBottom:6,fontWeight:600}}>{c.risk}</div>
                    <div style={{fontSize:10,fontFamily:"monospace",fontWeight:700,color:"#64748B",marginBottom:3,letterSpacing:0.5}}>CONTROL IN PLACE</div>
                    <div style={{fontSize:11,color:"#334155",lineHeight:1.6}}>{c.control}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* VERSION FILTER BAR */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px 6px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",flexWrap:"wrap"}}>
        <span style={{fontSize:10,fontFamily:"monospace",color:"#94A3B8",letterSpacing:1}}>FILTER BY VERSION:</span>
        <button onClick={()=>setVersionFilter(null)} style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${!versionFilter?"#2563EB":"#E2E8F0"}`,background:!versionFilter?"#2563EB":"#FFFFFF",color:!versionFilter?"#fff":"#64748B"}}>All Tasks</button>
        {COPILOT_VERSIONS.map(v=>(
          <button key={v.id} onClick={()=>setVersionFilter(versionFilter===v.id?null:v.id)} style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${versionFilter===v.id?v.color:"#E2E8F0"}`,background:versionFilter===v.id?v.color:"#FFFFFF",color:versionFilter===v.id?"#fff":"#64748B",whiteSpace:"nowrap"}}>
            {v.label} {v.sub}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button onClick={()=>setSummaryMode(!summaryMode)} style={{padding:"3px 10px",borderRadius:12,fontSize:10,fontWeight:600,cursor:"pointer",border:`1px solid ${summaryMode?"#7C3AED":"#E2E8F0"}`,background:summaryMode?"#EDE9FE":"#FFFFFF",color:summaryMode?"#4C1D95":"#64748B"}}>
            {summaryMode?"Detailed View":"Summary View"}
          </button>
        </div>
      </div>

      {versionFilter && (
        <div style={{padding:"6px 18px",background:"#EFF6FF",borderBottom:"1px solid #BFDBFE",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"#1D4ED8",fontWeight:600}}>Showing tasks relevant to: {COPILOT_VERSIONS.find(v=>v.id===versionFilter)?.label}  -  {COPILOT_VERSIONS.find(v=>v.id===versionFilter)?.sub}</span>
          <button onClick={()=>setVersionFilter(null)} style={{padding:"1px 8px",borderRadius:8,fontSize:10,background:"#DBEAFE",border:"1px solid #93C5FD",color:"#1D4ED8",cursor:"pointer"}}>Clear ×</button>
        </div>
      )}

      {/* BOARD */}
      <div id="roadmap" style={S.board}>
        {PHASES.map(phase=>{
          // Apply version filter
          if(versionFilter){
            const ver = COPILOT_VERSIONS.find(v=>v.id===versionFilter);
            if(ver && ver.filterPhases && !ver.filterPhases.includes(phase.id)) return null;
          }
          const vis=phase.items.filter(i=>matches(i));
          if(!vis.length) return null;
          const pDone=phase.items.filter(i=>getSt(i)==="complete").length;
          const pPct=Math.round((pDone/phase.items.length)*100);
          return (
            <div key={phase.id} style={S.phaseCol}>
              <div style={{background:phase.bg,borderRadius:"7px 7px 0 0",padding:"9px 11px 8px"}}>
                <div style={{fontFamily:"monospace",fontSize:8,letterSpacing:2,color:"rgba(255,255,255,.5)",marginBottom:1}}>PHASE</div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{phase.label}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.65)",marginTop:1}}>{phase.sub}</div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginTop:6}}>
                  <div style={{flex:1,background:"rgba(0,0,0,.3)",borderRadius:3,height:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pPct}%`,background:phase.acc,borderRadius:3,transition:"width .5s"}} />
                  </div>
                  <span style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,.8)"}}>{pDone}/{phase.items.length}</span>
                </div>
                <input value={timeframes[phase.id]||""} onChange={e=>setTimeframes(p=>({...p,[phase.id]:e.target.value}))}
                  placeholder="Add target timeframe..."
                  style={{marginTop:5,width:"100%",background:"rgba(0,0,0,.2)",border:"1px solid rgba(255,255,255,.2)",borderRadius:4,padding:"3px 6px",fontSize:9,color:"rgba(255,255,255,.8)",outline:"none"}} />
              </div>
              <div style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderTop:"none",paddingTop:5,paddingBottom:8}}>
                {vis.map(item=>{
                  const st=getSt(item); const sc=STS[st]; const pc=PRI[item.pri]||PRI.MEDIUM;
                  const isComplete = st==="complete";
                  const bgMap={complete:S.cardDone,blocked:S.cardBlocked,"in-progress":S.cardInProg};
                  if(summaryMode) return (
                    <div key={item.id} className="card" onClick={()=>{setSelected(item);setActiveTab("what");}}
                      style={{...S.card,...(bgMap[st]||{}),borderColor:sc.br,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:11,fontWeight:600,color:isComplete?"#065F46":"#1E293B",flex:1}}>{item.title}</div>
                      <button className="sbtn" onClick={e=>cycleSt(e,item)} style={{fontSize:9,fontWeight:700,fontFamily:"monospace",padding:"2px 6px",borderRadius:4,border:`1px solid ${sc.br}`,background:sc.bg,color:sc.tc,cursor:"pointer",flexShrink:0,marginLeft:6}}>
                        {sc.ic}
                      </button>
                    </div>
                  );
                  return (
                    <div key={item.id} className="card" onClick={()=>{setSelected(item);setActiveTab("what");}}
                      style={{...S.card,...(bgMap[st]||{}),borderColor:sc.br}}>
                      <div style={{fontSize:11,fontWeight:600,color:isComplete?"#065F46":"#1E293B",lineHeight:1.3,marginBottom:5}}>{item.title}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"1px 6px",borderRadius:8,background:isComplete?"#F1F5F9":pc.bg,color:isComplete?"#94A3B8":pc.tc,fontSize:9,fontWeight:700,fontFamily:"monospace"}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:isComplete?"#CBD5E1":pc.dot,display:"inline-block"}} />
                          {item.pri}
                        </span>
                        <button className="sbtn" onClick={e=>cycleSt(e,item)} style={{fontSize:9,fontWeight:700,fontFamily:"monospace",padding:"2px 6px",borderRadius:4,border:`1px solid ${sc.br}`,background:sc.bg,color:sc.tc,cursor:"pointer",whiteSpace:"nowrap"}}>
                          {sc.ic} {sc.lbl}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* SAM FINDINGS TRACKER */}
      <div id="sam-tracker" style={{...S.section, paddingTop:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={S.sectionTitle}>SharePoint Advanced Management  -  Findings Progress</div>
            <div style={S.sectionSub}>Track remediation progress against workshop baseline findings · Click a number to update it</div>
          </div>
          <button onClick={()=>setShowSam(!showSam)} style={{padding:"5px 14px",borderRadius:6,fontSize:11,fontWeight:600,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",cursor:"pointer"}}>{showSam?"Hide":"Show Progress"}</button>
        </div>
        {showSam && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {samFindings.map(f=>{
              const pct = f.id==="sf-2"||f.id==="sf-5"
                ? Math.min(100,Math.round((f.current/f.target)*100))
                : f.baseline===0 ? 0 : Math.min(100,Math.round(((f.baseline-f.current)/f.baseline)*100));
              return (
                <div key={f.id} style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:8,padding:"14px 16px",borderLeft:`4px solid ${f.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1E293B"}}>{f.label}</div>
                      <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{f.note}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:16}}>
                      <div style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>BASELINE</div>
                      <div style={{fontSize:18,fontWeight:700,color:f.color}}>{f.baseline}</div>
                      <div style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace",marginTop:4}}>CURRENT</div>
                      <input type="number" value={f.current}
                        onChange={e=>setSamFindings(p=>p.map(x=>x.id===f.id?{...x,current:parseInt(e.target.value)||0}:x))}
                        style={{width:60,padding:"2px 6px",borderRadius:4,border:`1px solid ${f.color}`,textAlign:"center",fontSize:16,fontWeight:700,color:f.color,background:f.bg}} />
                    </div>
                  </div>
                  <div style={{background:"#F1F5F9",borderRadius:4,height:8,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:f.color,borderRadius:4,transition:"width .5s"}} />
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    <span style={{fontSize:10,color:"#94A3B8"}}>{f.id==="sf-2"||f.id==="sf-5"?"Progress toward target":"Remediated"}</span>
                    <span style={{fontSize:10,fontWeight:700,color:f.color}}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REFERENCE DOCUMENTS */}
      <div id="references" style={S.section}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={S.sectionTitle}>Reference Documents</div><div style={S.sectionSub}>Links to key documents  -  UAT plan, security architecture, test plan, SAM report</div></div>
          <button onClick={()=>{const n={id:`ref-${Date.now()}`,label:"",url:"",desc:""};setRefs(p=>[...p,n]);setEditingRef(n.id);}} style={{padding:"5px 14px",borderRadius:6,fontSize:11,fontWeight:600,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",cursor:"pointer"}}>+ Add Document</button>
        </div>
        {refs.length===0 && <div style={{padding:20,background:"#F8FAFC",borderRadius:8,border:"1px dashed #CBD5E1",textAlign:"center",color:"#94A3B8",fontSize:12}}>No reference documents yet. Click + Add Document to add the UAT plan, security architecture doc, test plan, or any key reference.</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {refs.map(r=>(
            <div key={r.id} style={{background:"#FFFFFF",border:`1px solid ${editingRef===r.id?"#3B82F6":"#E2E8F0"}`,borderRadius:8,padding:"12px 14px",minWidth:280,maxWidth:380,flex:"1 1 280px"}}>
              {editingRef===r.id ? (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <input value={r.label} onChange={e=>setRefs(p=>p.map(x=>x.id===r.id?{...x,label:e.target.value}:x))} placeholder="Document label" style={inputStyle} />
                  <input value={r.url} onChange={e=>setRefs(p=>p.map(x=>x.id===r.id?{...x,url:e.target.value}:x))} placeholder="URL (paste when on customer network)" style={inputStyle} />
                  <input value={r.desc} onChange={e=>setRefs(p=>p.map(x=>x.id===r.id?{...x,desc:e.target.value}:x))} placeholder="Description (optional)" style={inputStyle} />
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setEditingRef(null)} style={{padding:"4px 12px",borderRadius:4,background:"#2563EB",border:"none",color:"#fff",fontSize:11,cursor:"pointer"}}>Save</button>
                    <button onClick={()=>setRefs(p=>p.filter(x=>x.id!==r.id))} style={{padding:"4px 12px",borderRadius:4,background:"transparent",border:"1px solid #EF4444",color:"#DC2626",fontSize:11,cursor:"pointer"}}>Remove</button>
                  </div>
                </div>
              ) : (
                <div onClick={()=>setEditingRef(r.id)} style={{cursor:"pointer"}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{r.label||<span style={{color:"#CBD5E1",fontStyle:"italic"}}>Untitled document</span>}</div>
                  {r.desc && <div style={{fontSize:11,color:"#64748B",marginTop:3}}>{r.desc}</div>}
                  {r.url ? <a href={r.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"block",marginTop:5,fontSize:11,wordBreak:"break-all"}}>{r.url}</a>
                    : <div style={{marginTop:5,fontSize:11,color:"#CBD5E1",fontStyle:"italic"}}>No URL yet  -  click to add</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* OPEN ACTIONS */}
      <div id="actions" style={S.section}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={S.sectionTitle}>Open Actions</div><div style={S.sectionSub}>Items needing follow-up, investigation, or owner assignment  -  click any cell to edit</div></div>
          <button onClick={()=>{const n={id:`act-${Date.now()}`,title:"",owner:"",due:"",status:"Open",notes:""};setActions(p=>[n,...p]);setEditingAction(n.id);}} style={{padding:"5px 14px",borderRadius:6,fontSize:11,fontWeight:600,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",cursor:"pointer"}}>+ Add Action</button>
        </div>
        <div style={{background:"#FFFFFF",borderRadius:8,border:"1px solid #E2E8F0",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 110px 120px 100px 1fr 28px",padding:"7px 12px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0"}}>
            {["Action","Owner","Due (week)","Status","Notes",""].map((h,i)=><div key={i} style={{fontSize:9,fontWeight:700,color:"#94A3B8",fontFamily:"monospace",letterSpacing:1}}>{h}</div>)}
          </div>
          {actions.map((a,idx)=>{
            const sc={Open:"#D97706","In Progress":"#2563EB",Resolved:"#065F46",Blocked:"#DC2626"}[a.status]||"#64748B";
            return (
              <div key={a.id} style={{display:"grid",gridTemplateColumns:"1fr 110px 120px 100px 1fr 28px",padding:"8px 12px",borderBottom:idx<actions.length-1?"1px solid #F1F5F9":"none",alignItems:"center",background:idx%2===0?"#FFFFFF":"#FAFAFA"}}>
                {editingAction===a.id ? (
                  <>
                    <input value={a.title} onChange={e=>setActions(p=>p.map(x=>x.id===a.id?{...x,title:e.target.value}:x))} style={{...inputStyle,fontSize:11}} />
                    <input value={a.owner} onChange={e=>setActions(p=>p.map(x=>x.id===a.id?{...x,owner:e.target.value}:x))} placeholder="Owner" style={{...inputStyle,fontSize:11}} />
                    <input value={a.due} onChange={e=>setActions(p=>p.map(x=>x.id===a.id?{...x,due:e.target.value}:x))} placeholder="Week of..." style={{...inputStyle,fontSize:11}} />
                    <select value={a.status} onChange={e=>setActions(p=>p.map(x=>x.id===a.id?{...x,status:e.target.value}:x))} style={{...inputStyle,fontSize:11}}>
                      {ACTION_STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <input value={a.notes} onChange={e=>setActions(p=>p.map(x=>x.id===a.id?{...x,notes:e.target.value}:x))} placeholder="Notes" style={{...inputStyle,fontSize:11}} />
                    <button onClick={()=>setEditingAction(null)} style={{padding:"2px 6px",borderRadius:3,background:"#2563EB",border:"none",color:"#fff",fontSize:10,cursor:"pointer"}}>✓</button>
                  </>
                ) : (
                  <>
                    <div onClick={()=>setEditingAction(a.id)} style={{fontSize:12,color:a.status==="Resolved"?"#065F46":"#1E293B",cursor:"pointer",fontWeight:500}}>{a.title||<span style={{color:"#CBD5E1",fontStyle:"italic"}}>Click to add</span>}</div>
                    <div onClick={()=>setEditingAction(a.id)} style={{fontSize:11,color:"#64748B",cursor:"pointer"}}>{a.owner||" - "}</div>
                    <div onClick={()=>setEditingAction(a.id)} style={{fontSize:11,color:"#64748B",cursor:"pointer",fontFamily:"monospace"}}>{a.due||" - "}</div>
                    <div onClick={()=>setEditingAction(a.id)} style={{cursor:"pointer"}}><span style={{padding:"2px 8px",borderRadius:10,background:`${sc}18`,color:sc,fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{a.status}</span></div>
                    <div onClick={()=>setEditingAction(a.id)} style={{fontSize:11,color:"#94A3B8",cursor:"pointer"}}>{a.notes||" - "}</div>
                    <button onClick={()=>setActions(p=>p.filter(x=>x.id!==a.id))} style={{background:"transparent",border:"none",color:"#CBD5E1",cursor:"pointer",fontSize:13}}>×</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={S.section}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div><div style={S.sectionTitle}>FAQ & Knowledge Base</div><div style={S.sectionSub}>Common questions, answers, and verification steps  -  click to expand · Add your own</div></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <input value={faqSearch} onChange={e=>setFaqSearch(e.target.value)} placeholder="Search FAQs..." style={{...inputStyle,width:160}} />
            {FAQ_CATEGORIES.map(c=><button key={c} style={fbtn(faqCat===c)} onClick={()=>setFaqCat(c)}>{c}</button>)}
            <button onClick={()=>{const n={id:`faq-${Date.now()}`,category:"General",q:"New question",a:"",verify:"",gcch:""};setFaqs(p=>[...p,n]);setOpenFaq(n.id);setEditingFaq(n.id);}} style={{padding:"5px 14px",borderRadius:6,fontSize:11,fontWeight:600,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",cursor:"pointer"}}>+ Add FAQ</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {faqs.filter(f=>{
            if(faqCat!=="All"&&f.category!==faqCat) return false;
            if(faqSearch&&!f.q.toLowerCase().includes(faqSearch.toLowerCase())&&!f.a.toLowerCase().includes(faqSearch.toLowerCase())) return false;
            return true;
          }).map(f=>(
            <div key={f.id} style={{background:"#FFFFFF",border:`1px solid ${openFaq===f.id?"#3B82F6":"#E2E8F0"}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}} onClick={()=>setOpenFaq(openFaq===f.id?null:f.id)}>
                <span style={{fontFamily:"monospace",fontSize:9,padding:"1px 7px",borderRadius:8,background:"#EFF6FF",color:"#2563EB",whiteSpace:"nowrap"}}>{f.category}</span>
                <div style={{flex:1,fontSize:13,fontWeight:600,color:"#1E293B"}}>{f.q}</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={e=>{e.stopPropagation();setEditingFaq(editingFaq===f.id?null:f.id);setOpenFaq(f.id);}} style={{padding:"2px 8px",borderRadius:4,background:"#F1F5F9",border:"1px solid #E2E8F0",color:"#64748B",fontSize:10,cursor:"pointer"}}>Edit</button>
                  <button onClick={e=>{e.stopPropagation();setFaqs(p=>p.filter(x=>x.id!==f.id));}} style={{padding:"2px 8px",borderRadius:4,background:"#F1F5F9",border:"1px solid #E2E8F0",color:"#94A3B8",fontSize:10,cursor:"pointer"}}>✕</button>
                  <span style={{color:"#94A3B8",fontSize:14}}>{openFaq===f.id?"▲":"▼"}</span>
                </div>
              </div>
              {openFaq===f.id && (
                <div style={{borderTop:"1px solid #F1F5F9",padding:"14px 16px",background:"#FAFAFA"}}>
                  {editingFaq===f.id ? (
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {[["QUESTION",f.q,v=>setFaqs(p=>p.map(x=>x.id===f.id?{...x,q:v}:x))],["CATEGORY",f.category,v=>setFaqs(p=>p.map(x=>x.id===f.id?{...x,category:v}:x))]].map(([lbl,val,fn])=>(
                        <div key={lbl}><div style={{fontSize:9,fontFamily:"monospace",color:"#3B82F6",marginBottom:2}}>{lbl}</div><input value={val} onChange={e=>fn(e.target.value)} style={{...inputStyle,width:"100%"}} /></div>
                      ))}
                      {[["ANSWER",f.a,v=>setFaqs(p=>p.map(x=>x.id===f.id?{...x,a:v}:x)),5],["HOW TO VERIFY",f.verify,v=>setFaqs(p=>p.map(x=>x.id===f.id?{...x,verify:v}:x)),2],["GCCH NOTES",f.gcch,v=>setFaqs(p=>p.map(x=>x.id===f.id?{...x,gcch:v}:x)),2]].map(([lbl,val,fn,rows])=>(
                        <div key={lbl}><div style={{fontSize:9,fontFamily:"monospace",color:"#3B82F6",marginBottom:2}}>{lbl}</div><textarea value={val} onChange={e=>fn(e.target.value)} rows={rows} style={{...inputStyle,width:"100%",resize:"vertical",fontFamily:"system-ui"}} /></div>
                      ))}
                      <button onClick={()=>setEditingFaq(null)} style={{alignSelf:"flex-start",padding:"6px 18px",borderRadius:5,background:"#2563EB",border:"none",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Done Editing</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <div style={{fontSize:13,color:"#334155",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{f.a}</div>
                      {f.verify && <div style={{background:"#EFF6FF",borderLeft:"3px solid #3B82F6",borderRadius:"0 6px 6px 0",padding:"10px 12px"}}>
                        <div style={{fontSize:9,fontFamily:"monospace",color:"#2563EB",letterSpacing:2,marginBottom:4}}>HOW TO VERIFY</div>
                        <div style={{fontSize:12,color:"#475569",lineHeight:1.7}}>{f.verify}</div>
                      </div>}
                      {f.gcch && <div style={{background:"#F0F9FF",borderLeft:"3px solid #38BDF8",borderRadius:"0 6px 6px 0",padding:"10px 12px"}}>
                        <div style={{fontSize:9,fontFamily:"monospace",color:"#0284C7",letterSpacing:2,marginBottom:4}}>★ GCCH-SPECIFIC</div>
                        <div style={{fontSize:12,color:"#0369A1",lineHeight:1.7}}>{f.gcch}</div>
                      </div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GLOSSARY */}
      <div id="glossary" style={{...S.section, paddingTop:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={S.sectionTitle}>Acronym Glossary</div>
            <div style={S.sectionSub}>Hover any term in the dashboard to see its definition · Full glossary below</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:8}}>
          {Object.entries(GLOSSARY).map(([abbr,def])=>(
            <div key={abbr} style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:6,padding:"8px 12px",display:"flex",gap:10}}>
              <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#2563EB",minWidth:52,flexShrink:0}}>{abbr}</div>
              <div style={{fontSize:11,color:"#64748B",lineHeight:1.5}}>{def}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEEDBACK */}
      <div id="feedback" style={{...S.section, paddingBottom:80}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div><div style={S.sectionTitle}>Feedback</div><div style={S.sectionSub}>Report a bug, request a feature, or flag something that is incorrect</div></div>
          <button onClick={()=>setShowFeedback(!showFeedback)} style={{padding:"5px 16px",borderRadius:6,fontSize:11,fontWeight:600,background:"#F1F5F9",border:"1px solid #E2E8F0",color:"#64748B",cursor:"pointer"}}>{showFeedback?"Close":"Submit Feedback"}</button>
        </div>
        {showFeedback && (
          <div style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:8,padding:16}}>
            {fbSent ? (
              <div style={{textAlign:"center",padding:20,color:"#065F46"}}><div style={{fontSize:24,marginBottom:8}}>✓</div>Feedback submitted.<div style={{marginTop:12}}><button onClick={()=>{setFbSent(false);setFbTitle("");setFbBody("");}} style={{padding:"5px 16px",borderRadius:5,background:"#EFF6FF",border:"1px solid #BFDBFE",color:"#1D4ED8",fontSize:11,cursor:"pointer"}}>Submit another</button></div></div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["Bug","Feature Request","Incorrect Information","Question"].map(t=><button key={t} onClick={()=>setFbType(t)} style={{padding:"4px 12px",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${fbType===t?"#2563EB":"#E2E8F0"}`,background:fbType===t?"#2563EB":"#FFFFFF",color:fbType===t?"#fff":"#64748B"}}>{t}</button>)}
                </div>
                <input value={fbTitle} onChange={e=>setFbTitle(e.target.value)} placeholder="Short title" style={{...inputStyle,fontSize:12}} />
                <textarea value={fbBody} onChange={e=>setFbBody(e.target.value)} rows={4} placeholder="Describe the issue or request..." style={{...inputStyle,fontSize:12,resize:"vertical",fontFamily:"system-ui"}} />
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <button onClick={()=>{if(!fbTitle.trim())return;const entry={id:`fb-${Date.now()}`,type:fbType,title:fbTitle,body:fbBody,date:new Date().toLocaleDateString()};try{const log=JSON.parse(localStorage.getItem("gcch-feedback")||"[]");localStorage.setItem("gcch-feedback",JSON.stringify([entry,...log]));}catch(e){}setFbSent(true);}} style={{padding:"7px 20px",borderRadius:6,background:"#2563EB",border:"none",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Submit</button>
                  {FEEDBACK_SP_URL==="PLACEHOLDER_SHAREPOINT_SITE_URL" && <span style={{fontSize:10,color:"#94A3B8",fontFamily:"monospace"}}>Saving locally · Replace FEEDBACK_SP_URL to sync to SharePoint</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",zIndex:40}}>
          <div onClick={e=>e.stopPropagation()} style={{...S.panel,position:"absolute",top:0,right:0}}>
            <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #F1F5F9",flexShrink:0,background:"#FFFFFF"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {(()=>{const pc=PRI[selected.pri]||PRI.MEDIUM; return <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"3px 9px",borderRadius:9,background:pc.bg,color:pc.tc,fontSize:10,fontWeight:700,fontFamily:"monospace"}}><span style={{width:5,height:5,borderRadius:"50%",background:pc.dot,display:"inline-block"}} />{selected.pri}</span>; })()}
                  <button className="sbtn" onClick={e=>cycleSt(e,selected)} style={{fontSize:10,fontWeight:700,fontFamily:"monospace",padding:"3px 10px",borderRadius:9,border:`1px solid ${STS[getSt(selected)].br}`,background:STS[getSt(selected)].bg,color:STS[getSt(selected)].tc,cursor:"pointer"}}>
                    {STS[getSt(selected)].ic} {STS[getSt(selected)].lbl}  -  click to cycle
                  </button>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"#F1F5F9",border:"1px solid #E2E8F0",borderRadius:5,width:28,height:28,color:"#64748B",cursor:"pointer",fontSize:16}}>×</button>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:"#0F172A",marginTop:7,lineHeight:1.3}}>{selected.title}</div>
              <div style={{display:"flex",gap:4,marginTop:10,flexWrap:"wrap"}}>
                {[["what","What Is This"],["impact","Why It Matters"],["how","How To Do It"],["gcch","GCCH Notes"]].map(([id,lbl])=>(
                  <button key={id} onClick={()=>setActiveTab(id)} style={{padding:"4px 11px",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${activeTab===id?"#2563EB":"#E2E8F0"}`,background:activeTab===id?"#2563EB":"#FFFFFF",color:activeTab===id?"#fff":"#64748B"}}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div style={{padding:"14px 16px 30px",overflowY:"auto",flex:1,background:"#FAFAFA"}}>
              {activeTab==="what" && <div style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:7,padding:"12px 14px",fontSize:12.5,color:"#334155",lineHeight:1.8}}>{selected.what}</div>}
              {activeTab==="impact" && <div style={{background:"#FFFBF0",borderLeft:"3px solid #F59E0B",borderRadius:"0 7px 7px 0",padding:"12px 14px",fontSize:12.5,color:"#334155",lineHeight:1.8}}>{selected.impact}</div>}
              {activeTab==="how" && <div style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:7,padding:"12px 14px",fontSize:12,color:"#475569",lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{selected.how}</div>}
              {activeTab==="gcch" && <div style={{background:"#EFF6FF",borderLeft:"3px solid #3B82F6",borderRadius:"0 7px 7px 0",padding:"12px 14px"}}>
                <div style={{fontFamily:"monospace",fontSize:9,letterSpacing:2,color:"#2563EB",marginBottom:6}}>★ GCCH-SPECIFIC</div>
                <div style={{fontSize:12.5,color:"#1D4ED8",lineHeight:1.8}}>{selected.gcch}</div>
              </div>}
              <div style={{marginTop:16,padding:"11px 13px",background:"#FFFFFF",borderRadius:7,border:"1px solid #E2E8F0"}}>
                <div style={{fontFamily:"monospace",fontSize:9,letterSpacing:2,color:"#94A3B8",marginBottom:7}}>UPDATE STATUS</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {CYCLE.map(st=>{const sc=STS[st];const isA=getSt(selected)===st; return (
                    <button key={st} onClick={()=>setStatuses(p=>({...p,[selected.id]:st}))} style={{padding:"6px 14px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",border:`2px solid ${isA?sc.br:"#E2E8F0"}`,background:isA?sc.bg:"#FFFFFF",color:isA?sc.tc:"#94A3B8"}}>
                      {sc.ic} {sc.lbl}
                    </button>
                  );})}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
