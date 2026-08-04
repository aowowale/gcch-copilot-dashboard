# Copilot Briefing

Standalone **M365 Copilot — GCC High Deployment Briefing** app (the interactive briefing, a.k.a. the "red glacier" site).

- **Live URL:** https://red-glacier-04780bd0f.7.azurestaticapps.net
- **Type:** Vite + React + TypeScript single-page app (HashRouter)
- **Entry:** `index.html` → `src/main.tsx` → `src/App.tsx`

This is a self-contained project. It shares no files with the onboarding hub.

## Develop

```powershell
npm install
npm run dev        # http://localhost:5173
```

## Build

```powershell
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

## Deploy

Deploys `dist/` to the existing Azure Static Web App `gcchdashswabdito1pz`.

```powershell
az login
./deploy.ps1                 # build + deploy
./deploy.ps1 -SkipBuild      # deploy the current dist/ without rebuilding
./deploy.ps1 -ForceBuild     # force a fresh build, then deploy
```

## Structure

| Area | Path |
| --- | --- |
| App shell / routing | `src/App.tsx`, `src/main.tsx` |
| Section order | `src/lib/sections.ts` |
| Section → component map | `src/sections/registry.ts` |
| Section components | `src/sections/*` |
| Interactive Live Tracker | `src/sections/Dashboard.tsx` (backed by `src/data/dashboard.ts`) |
| Shared primitives | `src/components/Primitives.tsx` |
| Content / data | `src/data/*` |
| State + utils | `src/lib/*` |
| Styles | `src/styles/app.css` |
