# M365 Copilot - GCC High Deployment Briefing

This workspace now uses the imported React + TypeScript Vite source from `GCCH_Copilot_Briefing_React_Source.zip`.
The deployable output is static content in `dist/`.

## Run locally

```powershell
npm install
npm run dev
```

## Build for production

```powershell
npm run build
```

Build output is generated in dist.

## Standalone Interactive Briefing (single HTML)

This workspace can also produce a true single-file briefing deliverable:
- `GCCH_Copilot_Interactive_Briefing.html` (self-contained, no external assets required)

Generate it after a build:

```powershell
npm run build
./build-standalone-briefing.ps1
```

The output file is in project root:
- `GCCH_Copilot_Interactive_Briefing.html`

If you want this standalone file hosted at the same URL path after deployment, copy it into `dist` before deploying:

```powershell
Copy-Item .\GCCH_Copilot_Interactive_Briefing.html .\dist\GCCH_Copilot_Interactive_Briefing.html -Force
```

## Updating from a new zip drop

If you receive new files like `*_Source.zip` and `*_Dist.zip`:

1. Prefer the `*_Source.zip` package (source of truth).
2. Extract it and copy these items into this project root:
	- `src/`
	- `public/` (if present)
	- `index.html`
	- `package.json`
	- `package-lock.json`
	- `tsconfig.json`
	- `vite.config.ts`
3. Run:

```powershell
npm install
npm run build
```

4. Deploy using the script below.

Use the `*_Dist.zip` package only when you want to deploy prebuilt static files as-is and do not need source edits.

## Deploy to Azure Static Web Apps (recommended)

```powershell
./deploy-azure-swa.ps1
```

Optional parameters:

```powershell
./deploy-azure-swa.ps1 -ResourceGroup rg-name -Location eastus2 -StaticWebAppName my-unique-swa-name -SubscriptionId <subscription-id>
```

This script creates or reuses an Azure Static Web App, retrieves a deployment token, and deploys dist.
Before deploy, it also creates a friendly alias file:
- `dist/GCCH_Copilot_Interactive_Briefing.html` (copy of `dist/index.html`)

Note: this `dist` alias references `dist/assets/*`. For a single self-contained file, use `build-standalone-briefing.ps1`.

### Deploy in another tenant (including GCCH)

1. Select the correct cloud first:

```powershell
az cloud set --name AzureUSGovernment   # for GCCH/Azure Government
# az cloud set --name AzureCloud        # for commercial
```

2. Sign in to the target tenant and set subscription:

```powershell
az login --tenant <tenant-id>
az account set --subscription <subscription-id>
```

Quick tenant/subscription discovery:

```powershell
az account show --query "{subscriptionId:id,subscriptionName:name,tenantId:tenantId,user:user.name,cloud:environmentName}" -o jsonc
az account list -o table
```

3. Run deployment with a cloud-appropriate region:

```powershell
./deploy-azure-swa.ps1 -SubscriptionId <subscription-id> -ResourceGroup rg-name -StaticWebAppName my-swa-name -Location usgovvirginia
```

Notes:
- In AzureUSGovernment, use a `usgov*` region.
- Script fails early if cloud and region do not match.
- Account needs permission to create/read static web apps and list secrets (`Microsoft.Web/staticSites/listSecrets/action`).

### Fast redeploy after app changes

If you edited source and already built:

```powershell
./deploy-azure-swa.ps1 -StaticWebAppName <existing-swa-name> -SkipBuild
```

If you want one command to rebuild and redeploy:

```powershell
./deploy-azure-swa.ps1 -StaticWebAppName <existing-swa-name> -ForceBuild
```

## ASAP GCCH one-command deployment (app + standalone)

Use this wrapper script to deploy all artifacts quickly into GCCH:

```powershell
./deploy-gcch-all.ps1 -TenantId <tenant-id> -SubscriptionId <subscription-id> -StaticWebAppName <unique-swa-name>
```

Optional: include your legacy standalone file as a second hosted path:

```powershell
./deploy-gcch-all.ps1 -TenantId <tenant-id> -SubscriptionId <subscription-id> -StaticWebAppName <unique-swa-name> -LegacyStandalonePath "C:\path\GCCH_Copilot_Interactive_Briefing (1).html"
```

This deploys:
- Main sectioned app: `https://<swa-name>.1.azurestaticapps.net/#/concerns`
- Current standalone: `https://<swa-name>.1.azurestaticapps.net/GCCH_Copilot_Interactive_Briefing.html`
- Legacy standalone (if provided): `https://<swa-name>.1.azurestaticapps.net/GCCH_Copilot_Interactive_Briefing_Legacy.html`

## Deploy to Azure Static Website (Storage Account)

```powershell
./deploy-azure-static.ps1
```

Optional parameters:

```powershell
./deploy-azure-static.ps1 -ResourceGroup rg-name -Location eastus2 -StorageAccount uniqueacctname -SubscriptionId <subscription-id>
```

The script creates/uses a resource group and storage account, enables static website hosting, uploads dist, and prints the public URL.
Before upload, it also creates:
- `dist/GCCH_Copilot_Interactive_Briefing.html` (copy of `dist/index.html`)

Note: some environments enforce Azure AD-only blob auth and can block this path if storage data-plane RBAC is not granted.
