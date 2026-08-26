import { SectionHead, SpeakerNote } from '../components/Primitives'
import { governanceConsole as cfg } from '../data/governanceConsole'

// Launch module for the separate "Microsoft 365 Copilot Readiness" (SAM) tool.
// Keeps the briefing a static site: it links/embeds a deployed console instance
// when one is configured, and otherwise shows how to stand it up.
export function GovernanceConsole() {
  const configured = cfg.launchUrl.trim().length > 0
  return (
    <div className="gov-console">
      <SectionHead num="23" title="Tenant Governance Console">
        The operational companion to this briefing — a live tenant governance and cleanup
        dashboard for Microsoft 365 Copilot readiness. It runs as a separate application
        with its own backend and read-only Microsoft Graph collectors.
      </SectionHead>

      <SpeakerNote>
        This briefing is the "why and the plan." The Governance Console is the "where you
        track it." Be explicit about the boundary: the console demonstrates with clearly
        labeled sample data and has no tenant mutation or remediation controls. Live tenant
        collection requires a backend service identity, not browser JavaScript.
      </SpeakerNote>

      <div className="gov-note">
        <span className="gn-badge">Boundary</span>
        <div>
          Sample data by default. The console shows clearly labeled sample governance records,
          not findings from a Microsoft 365 tenant. Live collection is a separate, backend-hosted
          milestone that runs under a service identity with approved read-only Graph permissions.
        </div>
      </div>

      <div className="gov-grid">
        {cfg.capabilities.map((c) => (
          <div className="gov-cap" key={c.title}>
            <h4>{c.title}</h4>
            <p>{c.detail}</p>
          </div>
        ))}
      </div>

      {configured ? (
        <>
          <div className="gov-launch">
            <div className="gl-copy">
              <div className="gl-title">Open the Governance Console</div>
              <div className="gl-sub">Launches the deployed readiness dashboard in a new tab.</div>
            </div>
            <a className="btn btn-primary" href={cfg.launchUrl} target="_blank" rel="noopener noreferrer">
              Open console ↗
            </a>
          </div>
          {cfg.allowEmbed && (
            <iframe
              className="gov-frame"
              src={cfg.launchUrl}
              title="Tenant Governance Console"
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </>
      ) : (
        <div className="gov-unset">
          <strong>Console not configured yet.</strong> The readiness tool lives in a separate
          project (the <code>SAM</code> folder) and deploys independently. To enable this launch
          module, deploy the console (see its <code>START-HERE.md</code>) and set{' '}
          <code>launchUrl</code> in <code>src/data/governanceConsole.ts</code>. Until then, run it
          locally with <code>python -m http.server 8080</code> from the console project and open{' '}
          <code>http://localhost:8080/index.html#governance</code>.
        </div>
      )}
    </div>
  )
}
