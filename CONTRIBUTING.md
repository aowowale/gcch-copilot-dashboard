# Contributing

Thanks for helping improve this project.

## Ground rules

- Keep changes tenant-agnostic unless a section explicitly requires customer-specific examples.
- Every external factual claim should have a live source citation where applicable.
- Preserve the onboarding flow intent: Home -> Tracker -> Controls -> Ask.

## Local setup

1. Install Node.js 20 LTS and npm 10+.
2. Install dependencies at root and standalone surfaces:

```powershell
npm install
cd .\copilot-briefing; npm install
cd ..\copilot-onboarding-hub; npm install
cd ..
```

## Build and verification

Run all build surfaces before opening a PR:

```powershell
npm run build
cd .\copilot-briefing; npm run build
cd ..\copilot-onboarding-hub; npm run build
cd ..
```

Optional local preview:

```powershell
npm run dev
cd .\copilot-briefing; npm run dev
cd ..\copilot-onboarding-hub; npm run dev
cd ..
```

## Pull request process

1. Create a focused branch from `main`.
2. Keep PRs small and scoped (content-only, UI-only, infra-only where practical).
3. Fill out the PR template and link issues.
4. Confirm CI passes for all app surfaces.
5. Request review from code owners.

## Content and citation quality

When changing narrative or product posture:

1. Update supporting references in `src/data/references.ts`.
2. Ensure each new claim links to a live, authoritative source.
3. Recheck section-level source lists in affected section components.

## Commit conventions (recommended)

Use concise prefixes to improve changelog quality:

- `feat:` new functionality
- `fix:` bug or behavior correction
- `docs:` documentation/content updates
- `chore:` maintenance and tooling

## Code style

- TypeScript + React conventions used in existing files.
- Keep edits minimal and avoid unrelated reformatting.
- Prefer shared primitives over duplicating UI patterns.
