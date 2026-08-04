param(
  [string]$ResourceGroup = "rg-gcch-dashboard",
  [string]$Location = "eastus2",
  [string]$StaticWebAppName = "gcchdashswabdito1pz",
  [string]$SubscriptionId = "",
  [switch]$SkipBuild,
  [switch]$ForceBuild
)

# Deploys the standalone Copilot Briefing app (the "red glacier" site) to Azure Static Web Apps.
# Live URL: https://red-glacier-04780bd0f.7.azurestaticapps.net

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

function Fail { param([string]$Message) throw $Message }
function Assert-LastExitCode {
  param([string]$Command, [string]$Hint = "")
  if ($LASTEXITCODE -ne 0) {
    $msg = "Command failed: $Command"
    if (-not [string]::IsNullOrWhiteSpace($Hint)) { $msg = "$msg`n$Hint" }
    Fail $msg
  }
}

Set-Location -Path $PSScriptRoot

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Fail "Azure CLI not found. Install Azure CLI before running this script."
}

$swaCliVersion = "2.0.10"

$currentCloud = az cloud show --query name -o tsv
Assert-LastExitCode "az cloud show" "Run 'az login' after selecting the correct cloud."

if ($currentCloud -eq "AzureUSGovernment" -and $Location -notmatch "^usgov") {
  Fail "Current cloud is AzureUSGovernment, but location '$Location' is not a usgov region. Use usgovvirginia, usgovtexas, or usgovarizona."
}

if ([string]::IsNullOrWhiteSpace($SubscriptionId)) {
  $SubscriptionId = (az account show --query id -o tsv)
  Assert-LastExitCode "az account show" "Sign in with 'az login' and retry."
}

if ($ForceBuild -and $SkipBuild) { Fail "Use either -ForceBuild or -SkipBuild, not both." }

Write-Host "Subscription : $SubscriptionId"
Write-Host "Resource grp : $ResourceGroup"
Write-Host "Location     : $Location"
Write-Host "Static Web App: $StaticWebAppName"
Write-Host "Cloud        : $currentCloud"

az account set --subscription $SubscriptionId | Out-Null
Assert-LastExitCode "az account set"

az group create --name $ResourceGroup --location $Location --output none
Assert-LastExitCode "az group create"

$existing = az staticwebapp show -n $StaticWebAppName -g $ResourceGroup --query name -o tsv 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($existing)) {
  az staticwebapp create -n $StaticWebAppName -g $ResourceGroup -l $Location --sku Free --output none
  Assert-LastExitCode "az staticwebapp create"
}

$token = az staticwebapp secrets list -n $StaticWebAppName -g $ResourceGroup --query properties.apiKey -o tsv
Assert-LastExitCode "az staticwebapp secrets list" "Your account needs Microsoft.Web/staticSites/listSecrets/action (Contributor or equivalent)."

$shouldBuild = $ForceBuild -or ((-not $SkipBuild) -and (-not (Test-Path "dist")))
if ($shouldBuild) {
  npm run build
  Assert-LastExitCode "npm run build" "Run 'npm install' and ensure the build succeeds locally."
}
if (-not (Test-Path "dist")) {
  Fail "dist folder not found. Run 'npm run build' or drop -SkipBuild."
}

npx --yes "@azure/static-web-apps-cli@$swaCliVersion" deploy ./dist --deployment-token "$token" --env production
Assert-LastExitCode "swa deploy"

$url = az staticwebapp show -n $StaticWebAppName -g $ResourceGroup --query defaultHostname -o tsv
Assert-LastExitCode "az staticwebapp show"

Write-Host ""
Write-Host "Deployment complete."
Write-Host "URL: https://$url"
