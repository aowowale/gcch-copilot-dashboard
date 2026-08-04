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

## CI and dependency hygiene

GitHub automation is included:
- Build matrix workflow: `.github/workflows/ci-build.yml`
  - Validates root + both standalone apps on push/PR.
- Dependabot config: `.github/dependabot.yml`
  - Weekly npm updates across all 3 package roots.

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

## Troubleshooting

- If `npm` is not recognized in PowerShell, refresh PATH or open a new shell.
- If deployment fails in GCCH, confirm cloud/region alignment and RBAC permissions.
- If tracker iframe shows 404 in a standalone app, confirm `public/gcch-dashboard-tracker.html` exists in that standalone project.
