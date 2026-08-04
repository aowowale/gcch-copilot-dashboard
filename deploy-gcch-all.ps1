param(
  [Parameter(Mandatory = $true)]
  [string]$TenantId,
  [Parameter(Mandatory = $true)]
  [string]$SubscriptionId,
  [Parameter(Mandatory = $true)]
  [string]$StaticWebAppName,
  [string]$ResourceGroup = "rg-gcch-copilot-briefing",
  [string]$Location = "usgovvirginia",
  [string]$LegacyStandalonePath = "",
  [switch]$SkipLogin
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
  param([string]$Command)
  if ($LASTEXITCODE -ne 0) {
    Fail "Command failed: $Command"
  }
}

Set-Location $PSScriptRoot

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Fail "Azure CLI not found. Install Azure CLI first."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Fail "npm not found. Install Node.js first."
}

az cloud set --name AzureUSGovernment | Out-Null
Assert-LastExitCode "az cloud set --name AzureUSGovernment"

if (-not $SkipLogin) {
  az login --tenant $TenantId --use-device-code | Out-Null
  Assert-LastExitCode "az login"
}

az account set --subscription $SubscriptionId | Out-Null
Assert-LastExitCode "az account set"

npm install
Assert-LastExitCode "npm install"

npm run build
Assert-LastExitCode "npm run build"

./build-standalone-briefing.ps1
Assert-LastExitCode "build-standalone-briefing.ps1"

Copy-Item -Path ".\GCCH_Copilot_Interactive_Briefing.html" -Destination ".\dist\GCCH_Copilot_Interactive_Briefing.html" -Force

if (-not [string]::IsNullOrWhiteSpace($LegacyStandalonePath)) {
  if (-not (Test-Path $LegacyStandalonePath)) {
    Fail "Legacy standalone file not found: $LegacyStandalonePath"
  }
  Copy-Item -LiteralPath $LegacyStandalonePath -Destination ".\dist\GCCH_Copilot_Interactive_Briefing_Legacy.html" -Force
}

./deploy-azure-swa.ps1 -SubscriptionId $SubscriptionId -ResourceGroup $ResourceGroup -StaticWebAppName $StaticWebAppName -Location $Location -SkipBuild
Assert-LastExitCode "deploy-azure-swa.ps1"

Write-Host ""
Write-Host "Deployment complete in GCCH."
Write-Host "Main app: https://$StaticWebAppName.1.azurestaticapps.net/"
Write-Host "Sectioned view: https://$StaticWebAppName.1.azurestaticapps.net/#/concerns"
Write-Host "Standalone: https://$StaticWebAppName.1.azurestaticapps.net/GCCH_Copilot_Interactive_Briefing.html"
Write-Host "Legacy standalone (if provided): https://$StaticWebAppName.1.azurestaticapps.net/GCCH_Copilot_Interactive_Briefing_Legacy.html"
