# Releasing and Versioning

This repository follows semantic versioning for release tags:

- `vMAJOR.MINOR.PATCH` for stable releases
- Optional pre-release tags such as `vX.Y.Z-rc.1`

## Versioning guidance

- MAJOR: breaking changes in structure, workflow, or expected consumption
- MINOR: backward-compatible feature/content expansions
- PATCH: fixes, citation corrections, wording updates, docs/tooling fixes

## Release flow

1. Confirm all required changes are merged to `main`.
2. Run local builds for all three app surfaces.
3. Create and push an annotated tag:

```powershell
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

4. Publish a GitHub Release from that tag.
5. The `release-artifacts` workflow uploads build artifacts for:
   - root combined app `dist/`
   - standalone briefing `copilot-briefing/dist/`
   - standalone onboarding hub `copilot-onboarding-hub/dist/`

## Suggested release notes sections

- Summary
- Governance/content changes
- UX/navigation changes
- Deployment/automation changes
- Breaking changes (if any)
- Verification checklist and known limitations
