# M365 Copilot GCCH Briefing and Onboarding

Reusable deployment-readiness experience for Microsoft 365 Copilot, with a strong GCC High (GCCH) focus and live source citations.

This repository is designed to be public-friendly and portable:
- Build and run locally with standard Node + Vite.
- Deploy static output to any host (Azure, GitHub Pages, CDN, S3-compatible, Nginx, etc.).
- Optional Azure scripts are included for teams that want one-command deployment.

## What is in this repo

There are 3 app surfaces:

1. Root combined app (multi-entry build)
- Main briefing app: `index.html` -> `src/main.tsx`
- Reusable onboarding hub: `homev2.html` -> `src/main-homev2.tsx`

2. Standalone briefing app
- Path: `copilot-briefing/`
- Purpose: focused GCCH briefing deployment (red-glacier target)

3. Standalone onboarding hub app
- Path: `copilot-onboarding-hub/`
- Purpose: reusable onboarding journey experience

## Prerequisites

- Node.js 20 LTS (recommended)
- npm 10+

Optional for Azure scripts:
- Azure CLI
- Static Web Apps CLI (`swa`)
- PowerShell 7+

## Quick start (local)

From repo root:

```powershell
npm install
npm run dev
```

Build root app:

```powershell
npm run build
npm run preview
```

Standalone apps:

```powershell
cd .\copilot-briefing
npm install
npm run build

cd ..\copilot-onboarding-hub
npm install
npm run build
```

## 10-minute first deploy

If you are new to the repo, do this first:

```powershell
npm install
cd .\copilot-briefing; npm install; cd ..
cd .\copilot-onboarding-hub; npm install; cd ..
npm run validate:all
```

This gives you the fastest proof that the repository is healthy on your machine:

- root build passes
- standalone briefing build passes
- standalone onboarding hub build passes
- Playwright smoke tests pass

If that succeeds, move to deployment.

## Deployment matrix

| Goal | Use this | Output |
| --- | --- | --- |
| Try locally | `npm run dev` | local Vite app |
| Validate everything locally | `npm run validate:all` | builds + smoke tests |
| Host anywhere | build + publish `dist/` | static site |
| Deploy briefing only | `copilot-briefing/deploy.ps1` | standalone briefing SWA |
| Deploy onboarding hub only | `copilot-onboarding-hub/deploy.ps1` | standalone onboarding SWA |
| Deploy root combined app to SWA | `deploy-azure-swa.ps1` | root combined host |
| Deploy root combined app to Azure Storage | `deploy-azure-static.ps1` | static website |

For a full step-by-step version, see `DEPLOYMENT.md`.

## Public distribution model (recommended)

For customers who want to host anywhere:

1. Build the app (`npm run build`).
2. Publish the generated static files from `dist/`.
3. Ensure host rewrites all routes to `index.html` if not using hash routing.

This project already uses HashRouter for briefing routes, so most static hosts work without custom rewrite rules.

## GCCH-focused notes

- Content is explicitly written for GCCH customer onboarding and control validation.
- RSS guidance is updated:
  - Restricted SharePoint Search (RSS) is retired for new enablement.
  - Restricted Content Discovery (RCD) is the recommended successor.
- Source citations are live and centralized in `src/data/references.ts`.

## Deployment options

### Option A: Generic static hosting (cloud-agnostic)

Use any host that serves static files:
- Azure Storage static website
- Azure Static Web Apps
- GitHub Pages
- Cloudflare Pages
- S3 + CloudFront
- Nginx/Apache

Publish `dist/` from the surface you built.

### Option B: Azure Static Web Apps scripts (included)

Root combined app:

```powershell
./deploy-azure-swa.ps1
```

Standalone briefing:

```powershell
cd .\copilot-briefing
./deploy.ps1
```

GCCH cloud context example:

```powershell
az cloud set --name AzureUSGovernment
az login --tenant <tenant-id>
az account set --subscription <subscription-id>
```

Copyable placeholder values are provided in `deploy.env.example`.

## CI and dependency hygiene

GitHub automation is included:
- Build matrix workflow: `.github/workflows/ci-build.yml`
  - Validates root + both standalone apps on push/PR.
- Dependabot config: `.github/dependabot.yml`
  - Weekly npm updates across all 3 package roots.
- Playwright smoke workflow: `.github/workflows/smoke-playwright.yml`
  - Validates core routes and Ask/decision-log interactions on each PR/push.

## Security hardening baseline

Security controls currently implemented in-repo:

- Static Web Apps response hardening via `staticwebapp.config.json` in each app surface:
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - baseline `Content-Security-Policy`
- Deployment scripts pin SWA CLI version to avoid floating supply-chain pulls.
- Storage deploy script enforces HTTPS-only and minimum TLS 1.2.
- App Service deploy script enforces HTTPS-only and minimum TLS 1.2.
- CI and release workflows use explicit `permissions` and `concurrency` controls.
- Dependabot covers npm dependencies and GitHub Actions.

## GitHub OIDC deployment (recommended)

This repo now includes OIDC-based deployment workflow for both live SWA surfaces:

- Workflow: `.github/workflows/deploy-swa-oidc.yml`
- Auth model: GitHub OIDC -> Azure AD workload identity (`Azure/login`)
- No long-lived Azure client secret in GitHub.

Required repository secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

Optional repository variable:

- `AZURE_CLOUD` (default: `AzureCloud`, set `AzureUSGovernment` for GCC High tenant automation)

If you are not enabling OIDC yet, ignore this workflow and use the local deployment scripts described in `DEPLOYMENT.md`.

## Dependency advisory note

`react-router-dom` is pinned to latest stable (`7.18.2`) across all app surfaces. As of this snapshot, npm audit reports a high-severity advisory in a React Router server/RSC execution path. This project is a static client-side app (HashRouter) and does not expose React Router server action endpoints. Keep Dependabot enabled and retest advisories on each update.

Track this as an accepted risk until upstream remediation is available; see `SECURITY.md` for the revalidation cadence.

## Open-source governance files

This repository includes baseline governance/trust files for public collaboration:

- License: `LICENSE` (MIT)
- Contribution guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Release/versioning guide: `RELEASING.md`
- Code ownership: `.github/CODEOWNERS`
- PR and issue templates in `.github/`

If your organization requires different legal or security terms, fork and replace these files first.

## Release and versioning conventions

Use semantic tags for source-of-truth releases:

- Stable: `vMAJOR.MINOR.PATCH`
- Pre-release: `vMAJOR.MINOR.PATCH-rc.N`

Quick example:

```powershell
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

Publishing a GitHub Release from the tag triggers artifact packaging via `.github/workflows/release-artifacts.yml`.

## Reusable onboarding journey

The onboarding flow is designed to reduce confusion for first-time users:

1. Home (context)
2. Live Tracker (status and priorities)
3. Controls In Place (implementation detail)
4. The Ask (decision capture)

Guided mode is available in the UI and follows this sequence.

## Standalone single-file briefing artifact

Generate the single-file HTML briefing artifact:

```powershell
npm run build
./build-standalone-briefing.ps1
```

Output:
- `GCCH_Copilot_Interactive_Briefing.html`

## Contributing

If you intend to reuse this for your tenant/customer:

1. Fork the repo.
2. Update content in `src/data/*`.
3. Keep references in `src/data/references.ts` verified and live.
4. Run local builds for all app surfaces before publishing.

For full contribution workflow and quality expectations, see `CONTRIBUTING.md`.

For first-run deployment and validation steps, see `DEPLOYMENT.md`.

## New Customer Setup Checklist

Use this checklist when adapting the project for a new organization:

1. Branding and context
- Update title/subtitle in `src/data/content.ts` (`meta`).
- Confirm terminology (GCCH/GCC/commercial) matches customer cloud.

2. Governance assumptions
- Review Section 18 asks in `src/data/content.ts` and tailor decision language to the customer's governance model.
- Validate boundary assumptions (web grounding, RCD/RSS posture, escalation path).

3. Source hygiene
- Verify every external claim has a live citation.
- Update `src/data/references.ts` only with confirmed URLs.

4. Onboarding journey
- Keep first-time flow: Home -> Tracker -> Controls -> Ask.
- In guided mode, confirm each step is understandable to non-engineering stakeholders.

5. Build and quality gates
- Run all builds:
  - `npm run build`
  - `cd copilot-briefing && npm run build`
  - `cd copilot-onboarding-hub && npm run build`
- Verify CI passes in GitHub Actions.

6. Deployment and handoff
- Deploy preview environment first.
- Confirm core routes render: `#/home`, `#/tracker`, `#/rss`, `#/ask`.
- Export/share customer-facing deployment notes and ownership model.

## Troubleshooting

- If `npm` is not recognized in PowerShell, refresh PATH or open a new shell.
- If deployment fails in GCCH, confirm cloud/region alignment and RBAC permissions.
- If tracker iframe shows 404 in a standalone app, confirm `public/gcch-dashboard-tracker.html` exists in that standalone project.
- If required status checks are not selectable in branch protection yet, open a small PR first so workflows run and checks become available in GitHub settings.
