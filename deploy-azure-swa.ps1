param(
  [string]$ResourceGroup = "rg-gcch-dashboard",
  [string]$Location = "eastus2",
  [string]$StaticWebAppName = "",
  [string]$SubscriptionId = "",
  [switch]$SkipBuild,
  [switch]$ForceBuild
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

function Fail {
  param([string]$Message)
  throw $Message
}

function Assert-LastExitCode {
  param(
    [string]$Command,
    [string]$Hint = ""
  )
  if ($LASTEXITCODE -ne 0) {
    $msg = "Command failed: $Command"
    if (-not [string]::IsNullOrWhiteSpace($Hint)) {
      $msg = "$msg`n$Hint"
    }
    Fail $msg
  }
}

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Fail "Azure CLI not found. Install Azure CLI before running this script."
}

$swaCliVersion = "2.0.10"

$currentCloud = az cloud show --query name -o tsv
Assert-LastExitCode "az cloud show" "Run 'az login' after selecting the correct cloud."

if ($currentCloud -eq "AzureUSGovernment" -and $Location -notmatch "^usgov") {
  Fail "Current cloud is AzureUSGovernment, but location '$Location' is not a usgov region. Use a government region such as usgovvirginia, usgovtexas, or usgovarizona."
}

if ([string]::IsNullOrWhiteSpace($SubscriptionId)) {
  $SubscriptionId = (az account show --query id -o tsv)
  Assert-LastExitCode "az account show" "Sign in with 'az login' (or 'az login --tenant <tenant-id>') and retry."
}

if ([string]::IsNullOrWhiteSpace($StaticWebAppName)) {
  $suffix = -join ((48..57) + (97..122) | Get-Random -Count 8 | ForEach-Object { [char]$_ })
  $StaticWebAppName = ("gcchdashswa" + $suffix).ToLower()
}

if ($StaticWebAppName -notmatch "^[a-z0-9-]{3,60}$") {
  Fail "StaticWebAppName must be 3-60 chars using lowercase letters, numbers, or hyphens."
}

$knownLocation = az account list-locations --query "[?name=='$Location'] | length(@)" -o tsv
Assert-LastExitCode "az account list-locations" "Verify your cloud and subscription access."
if ($knownLocation -eq "0") {
  Fail "Location '$Location' is not valid in the current cloud context ($currentCloud)."
}

Write-Host "Using subscription: $SubscriptionId"
Write-Host "Using resource group: $ResourceGroup"
Write-Host "Using location: $Location"
Write-Host "Using static web app name: $StaticWebAppName"
Write-Host "Using cloud: $currentCloud"

az account set --subscription $SubscriptionId | Out-Null
Assert-LastExitCode "az account set" "Confirm the subscription exists in your signed-in tenant and cloud."

az group create --name $ResourceGroup --location $Location --output none
Assert-LastExitCode "az group create"

$existing = az staticwebapp show -n $StaticWebAppName -g $ResourceGroup --query name -o tsv 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($existing)) {
  az staticwebapp create -n $StaticWebAppName -g $ResourceGroup -l $Location --sku Free --output none
  Assert-LastExitCode "az staticwebapp create" "If this fails in GCCH, verify Static Web Apps is available in this subscription/region and your role can create Microsoft.Web/staticSites."
}

$token = az staticwebapp secrets list -n $StaticWebAppName -g $ResourceGroup --query properties.apiKey -o tsv
Assert-LastExitCode "az staticwebapp secrets list" "Your account needs permission for Microsoft.Web/staticSites/listSecrets/action (Contributor or equivalent)."

if ($ForceBuild -and $SkipBuild) {
  Fail "Use either -ForceBuild or -SkipBuild, not both."
}

$shouldBuild = $ForceBuild -or ((-not $SkipBuild) -and (-not (Test-Path "dist")))
if ($shouldBuild) {
  npm run build
  Assert-LastExitCode "npm run build" "Run 'npm install' and ensure build succeeds locally."
}

if (-not (Test-Path "dist")) {
  Fail "dist folder not found. Build output is required. Run 'npm run build' or remove -SkipBuild."
}

function New-StagingFolder {
  param([string]$Path)

  if (Test-Path $Path) {
    Remove-Item -Path $Path -Recurse -Force
  }
  New-Item -ItemType Directory -Path $Path | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $Path 'assets') | Out-Null
}

function Copy-StaticAppFiles {
  param(
    [string]$SourceHtml,
    [string]$DestinationFolder
  )

  $html = Get-Content -Path $SourceHtml -Raw
  Copy-Item -Path $SourceHtml -Destination (Join-Path $DestinationFolder 'index.html') -Force

  $matches = [regex]::Matches($html, './assets/[^"]+')
  if ($matches.Count -eq 0) {
    Fail "No assets found in $SourceHtml."
  }

  $assets = @{}
  foreach ($m in $matches) {
    $value = $m.Value
    if ($value.StartsWith('./assets/')) {
      $assets[$value.Substring(9)] = $true
    }
  }

  foreach ($assetName in $assets.Keys) {
    $sourceAsset = Join-Path 'dist' ('assets\\' + $assetName)
    if (-not (Test-Path $sourceAsset)) {
      Fail "Missing asset '$assetName' in dist/assets. Run 'npm run build' again."
    }
    Copy-Item -Path $sourceAsset -Destination (Join-Path $DestinationFolder ('assets\\' + $assetName)) -Force
  }

  # Copy root-level static files emitted from public/ (e.g. gcch-dashboard-tracker.html)
  # so iframes/links that reference them (like the Live Tracker) resolve instead of 404ing.
  Get-ChildItem -Path 'dist' -File | Where-Object { $_.Name -ne 'index.html' } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $DestinationFolder $_.Name) -Force
  }
}

$briefingStage = 'dist-briefing-host'
New-StagingFolder -Path $briefingStage
Copy-StaticAppFiles -SourceHtml 'dist\\index.html' -DestinationFolder $briefingStage

npx --yes "@azure/static-web-apps-cli@$swaCliVersion" deploy ./$briefingStage --deployment-token "$token" --env production
Assert-LastExitCode "swa deploy"

$url = az staticwebapp show -n $StaticWebAppName -g $ResourceGroup --query defaultHostname -o tsv
Assert-LastExitCode "az staticwebapp show"

Write-Host ""
Write-Host "Deployment complete."
Write-Host "URL: https://$url"
