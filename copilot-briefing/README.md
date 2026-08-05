# Copilot Briefing (Standalone)

Standalone M365 Copilot GCC High deployment briefing app.

- Live example: https://red-glacier-04780bd0f.7.azurestaticapps.net
- Stack: Vite + React + TypeScript (HashRouter)
- Entry: `index.html` -> `src/main.tsx` -> `src/App.tsx`

## Who this is for

Teams that want a deployable customer-facing briefing experience and can host static files anywhere.

## Quick start

```powershell
npm install
npm run dev
```

If you are starting from the repo root and want the quickest confidence check first, run `npm run validate:all` from the root project.

Build production assets:

```powershell
npm run build
npm run preview
```

Output is generated in `dist/`.

## Deploy anywhere

This app is static output and can be hosted on:
- Azure Static Web Apps
- Azure Storage static website
- GitHub Pages
- Cloudflare Pages
- S3-compatible static hosting
- Nginx/Apache static hosting

Publish the `dist/` folder.

## Azure deployment (optional script)

The included script deploys to Azure Static Web Apps:

```powershell
az login
./deploy.ps1
./deploy.ps1 -SkipBuild
./deploy.ps1 -ForceBuild
```

For a full decision tree and exact parameter examples, see `../DEPLOYMENT.md` and `../deploy.env.example`.

## GCCH content posture

The briefing is GCCH-focused and includes:
- live source citations for key claims
- RSS retirement guidance
- RCD as the recommended successor
- tracker-first onboarding journey

## Governance and reuse docs

This standalone app follows repository-level governance documents at the repo root:

- `../LICENSE`
- `../CONTRIBUTING.md`
- `../SECURITY.md`
- `../RELEASING.md`

## Project map

| Area | Path |
| --- | --- |
| App shell / routing | `src/App.tsx`, `src/main.tsx` |
| Section order | `src/lib/sections.ts` |
| Section to component mapping | `src/sections/registry.ts` |
| Section implementations | `src/sections/*` |
| Live tracker wrapper | `src/sections/Dashboard.tsx` |
| Source citations registry | `src/data/references.ts` |
| Data/content | `src/data/*` |
| Shared state and utilities | `src/lib/*` |
| Styles | `src/styles/app.css` |
