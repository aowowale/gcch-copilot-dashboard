<#
.SYNOPSIS
  Single entry point for all deployment targets. Thin dispatcher over the
  existing per-target scripts so there is one command to remember.

.DESCRIPTION
  Consolidates the many deploy-*.ps1 scripts behind one -Target/-Surface pair.
  All extra parameters are forwarded verbatim to the underlying script, e.g.
  -SubscriptionId, -ResourceGroup, -StaticWebAppName, -Location, -SkipBuild.

  The underlying scripts are unchanged; this wrapper only routes to them.

.PARAMETER Target
  swa         -> Azure Static Web Apps
  storage     -> Azure Storage static website
  appservice  -> Azure App Service

.PARAMETER Surface
  combined    -> root multi-entry app (default)
  briefing    -> standalone copilot-briefing app
  hub         -> standalone copilot-onboarding-hub app

.EXAMPLE
  ./deploy.ps1 -Target swa -Surface combined -StaticWebAppName my-site

.EXAMPLE
  ./deploy.ps1 -Target swa -Surface briefing -SkipBuild

.EXAMPLE
  ./deploy.ps1 -Target storage -Surface combined -StorageAccount myacct -ResourceGroup rg
#>
[CmdletBinding()]
param(
  [ValidateSet('swa', 'storage', 'appservice')]
  [string]$Target = 'swa',

  [ValidateSet('combined', 'briefing', 'hub')]
  [string]$Surface = 'combined',

  [Parameter(ValueFromRemainingArguments = $true)]
  [object[]]$Forward
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

# Map (Target, Surface) -> concrete script path.
$script = switch ($Surface) {
  'briefing' {
    if ($Target -ne 'swa') { throw "Surface 'briefing' only supports -Target swa (its deploy.ps1 targets SWA)." }
    Join-Path $root 'copilot-briefing/deploy.ps1'
  }
  'hub' {
    if ($Target -ne 'swa') { throw "Surface 'hub' only supports -Target swa (its deploy.ps1 targets SWA)." }
    Join-Path $root 'copilot-onboarding-hub/deploy.ps1'
  }
  'combined' {
    switch ($Target) {
      'swa'        { Join-Path $root 'deploy-azure-swa.ps1' }
      'storage'    { Join-Path $root 'deploy-azure-static.ps1' }
      'appservice' { Join-Path $root 'deploy-azure-appservice.ps1' }
    }
  }
}

if (-not (Test-Path -LiteralPath $script)) {
  throw "Target script not found: $script"
}

Write-Host "==> Dispatching: Target=$Target Surface=$Surface" -ForegroundColor Cyan
Write-Host "==> Script: $script" -ForegroundColor Cyan
if ($Forward) { Write-Host "==> Forwarding: $($Forward -join ' ')" -ForegroundColor DarkGray }

& $script @Forward
exit $LASTEXITCODE
