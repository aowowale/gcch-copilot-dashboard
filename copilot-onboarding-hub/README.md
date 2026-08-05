# Copilot Onboarding Hub

Standalone **Reusable Copilot Onboarding Hub** app (the guided "Start Here" journey, a.k.a. the "lemon sand" site).

- **Live URL:** https://lemon-sand-0d5b79e0f.7.azurestaticapps.net
- **Type:** Vite + React + TypeScript single-page app (HashRouter)
- **Entry:** `index.html` → `src/main-homev2.tsx` → `src/reusable/AppReusable.tsx`

This is a self-contained project. It shares no files with the briefing app.

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

If you want a repo-wide confidence check before choosing a deploy path, run `npm run validate:all` from the repo root.

## Deploy

Deploys `dist/` to the existing Azure Static Web App `gcchdashswareusable1pz`.

```powershell
az login
./deploy.ps1                 # build + deploy
./deploy.ps1 -SkipBuild      # deploy the current dist/ without rebuilding
./deploy.ps1 -ForceBuild     # force a fresh build, then deploy
```

For a full deployment decision tree and copyable parameter placeholders, see `../DEPLOYMENT.md` and `../deploy.env.example`.

## Governance and reuse docs

This standalone app follows repository-level governance documents at the repo root:

- `../LICENSE`
- `../CONTRIBUTING.md`
- `../SECURITY.md`
- `../RELEASING.md`

## Structure

| Area | Path |
| --- | --- |
| App shell (sidebar, breadcrumb topbar, routing) | `src/reusable/AppReusable.tsx` |
| Mount | `src/main-homev2.tsx` |
| Journey order + position helpers | `src/reusable/sections.ts` |
| Section → component map | `src/reusable/registry.ts` |
| Guided journey footer | `src/reusable/SectionGuide.tsx` |
| Guided action card | `src/reusable/GuidedActionCard.tsx` |
| Onboarding dashboard | `src/reusable/JourneyDashboard.tsx` |
| "Start Here" action plan | `src/sections/HomeV2.tsx` |
| Workspace state (localStorage) | `src/reusable/workspaceState.ts` |
| Guided action templates | `src/data/onboardingV2.ts` |
| Shared content section components | `src/sections/*` |
| Styles | `src/styles/app.css` |
