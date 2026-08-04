# Security Policy

## Supported versions

This project supports security fixes on the latest commit in `main`.

If you are running a fork or older snapshot, rebase to the latest `main` first and retest.

## Reporting a vulnerability

Please do not open public GitHub issues for security vulnerabilities.

To report a vulnerability:

1. Email the maintainer with subject line: `SECURITY: gcch-copilot-dashboard`.
2. Include a clear description, impact, affected files/routes, and reproduction steps.
3. If possible, include a minimal proof of concept and suggested remediation.

## Response targets

- Initial acknowledgement: within 3 business days
- Triage and severity assessment: within 7 business days
- Remediation plan or mitigation guidance: as soon as validated

## Scope notes

- This repository is a static web app and related deployment scripts.
- Dependency vulnerabilities should include the affected package and version range.
- Content accuracy issues (citations, product posture, docs drift) should be filed as normal issues unless they are security-impacting.

## Accepted security risks (tracked)

Current accepted risk:

- Package: `react-router-dom` / `react-router`
- Advisory surfaced by npm audit: `GHSA-qwww-vcr4-c8h2`
- Context: advisory path targets server/RSC action handling; this project is static client-rendered HashRouter with no React Router server endpoints.

Revalidation policy:

1. Re-run `npm audit --omit=dev` weekly (automated in CI and Dependabot cadence).
2. Re-evaluate immediately when upstream publishes a confirmed fix that does not introduce unsupported breaking changes.
3. Remove this accepted-risk entry once all three package roots are on remediated versions and CI passes.
