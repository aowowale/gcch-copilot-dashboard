# Deployment Guide

This guide is for a new user who wants to run, validate, and deploy the project without guessing.

## Choose your path

| Goal | Best path | What you need | Output |
| --- | --- | --- | --- |
| Review locally | Local Vite run | Node.js 20, npm | Working dev site |
| Prove repo works before deploy | `npm run validate:all` | Node.js 20, npm, Playwright browser install on first run | All builds + smoke tests |
| Host anywhere | Build and publish `dist/` | Any static host | Root combined app |
| Deploy briefing only | `copilot-briefing/deploy.ps1` | Azure CLI login, target subscription | Briefing SWA |
| Deploy onboarding hub only | `copilot-onboarding-hub/deploy.ps1` | Azure CLI login, target subscription | Onboarding SWA |
| Deploy combined app to SWA | `deploy-azure-swa.ps1` | Azure CLI login, target subscription | Root briefing surface |
| Deploy combined app to Azure Storage | `deploy-azure-static.ps1` | Azure CLI login, target subscription | Static website |

## 10-minute first deploy

If you only want to confirm the repo works on your machine:

```powershell
npm install
cd .\copilot-briefing; npm install; cd ..
cd .\copilot-onboarding-hub; npm install; cd ..
npm run validate:all
```

What success looks like:

- root build succeeds
- standalone briefing build succeeds
- standalone onboarding hub build succeeds
- Playwright smoke tests pass

## Local development

Run the root combined app:

```powershell
npm install
npm run dev
```

Run the standalone briefing app:

```powershell
cd .\copilot-briefing
npm install
npm run dev
```

Run the standalone onboarding hub:

```powershell
cd .\copilot-onboarding-hub
npm install
npm run dev
```

## Static hosting (generic)

This is the easiest public deployment path.

1. Build the app surface you want.
2. Upload the generated `dist/` folder to your host.
3. If your host supports SPA rewrites, point unknown routes to `index.html`.
4. If you deploy one of the SWA-targeted surfaces, keep `staticwebapp.config.json` in the published output.

Root combined app:

```powershell
npm run build
```

Publish:

- `dist/index.html`
- `dist/homev2.html`
- `dist/assets/*`
- root-level static files emitted from `public/`

Standalone briefing:

```powershell
cd .\copilot-briefing
npm run build
```

Publish everything under `copilot-briefing/dist/`.

Standalone onboarding hub:

```powershell
cd .\copilot-onboarding-hub
npm run build
```

Publish everything under `copilot-onboarding-hub/dist/`.

## Azure deployment scripts

Populate values from `deploy.env.example` before running scripts.

### Root combined app to Static Web Apps

```powershell
./deploy-azure-swa.ps1 -SubscriptionId <subscription-id> -ResourceGroup <resource-group> -StaticWebAppName <site-name> -Location <region>
```

### Root combined app to Azure Storage static website

```powershell
./deploy-azure-static.ps1 -SubscriptionId <subscription-id> -ResourceGroup <resource-group> -StorageAccount <storage-account-name> -Location <region>
```

### Standalone briefing

```powershell
cd .\copilot-briefing
./deploy.ps1 -SubscriptionId <subscription-id> -ResourceGroup <resource-group> -StaticWebAppName <site-name> -Location <region>
```

### Standalone onboarding hub

```powershell
cd .\copilot-onboarding-hub
./deploy.ps1 -SubscriptionId <subscription-id> -ResourceGroup <resource-group> -StaticWebAppName <site-name> -Location <region>
```

## GCC High / Azure Government example

```powershell
az cloud set --name AzureUSGovernment
az login --tenant <tenant-id>
az account set --subscription <subscription-id>
```

Then run the same deployment scripts with a `usgov*` region.

## GitHub Actions deployment

The repo includes:

- build validation workflow
- Playwright smoke workflow
- release artifact workflow
- OIDC deployment workflow

If you are not configuring OIDC yet, ignore the deploy workflow and use the local scripts above.

## Copyable parameter template

See `deploy.env.example` for a placeholder file you can fill in before deployment.

## Post-deploy checks

After any deployment, verify:

1. Home renders.
2. Tracker renders.
3. RSS section renders and shows RSS retired / RCD successor messaging.
4. Ask section renders and decision buttons work.
5. Browser dev tools show no blocking CSP errors.

Useful routes:

- `#/home`
- `#/tracker`
- `#/rss`
- `#/ask`

## Common failure points

- `npm` missing: install Node.js 20 LTS and reopen terminal.
- Azure login mismatch: confirm correct cloud, tenant, and subscription.
- Government cloud mismatch: use `AzureUSGovernment` and a `usgov*` region.
- Tracker 404: confirm `gcch-dashboard-tracker.html` was published with the app.
- Smoke test failures: run `npm run build` before `npm run test:smoke` if you changed app code.

## Which surface should a stranger choose?

- Choose root app if you want the combined repo experience.
- Choose standalone briefing if you only want the customer-facing GCCH briefing.
- Choose standalone onboarding hub if you only want the guided reusable journey.
