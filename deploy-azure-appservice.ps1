param(
  [string]$ResourceGroup = "rg-gcch-dashboard",
  [string]$Location = "eastus2",
  [string]$AppName = "",
  [string]$SubscriptionId = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($SubscriptionId)) {
  $SubscriptionId = (az account show --query id -o tsv)
}

if ([string]::IsNullOrWhiteSpace($AppName)) {
  $suffix = -join ((48..57) + (97..122) | Get-Random -Count 8 | ForEach-Object { [char]$_ })
  $AppName = ("gcchdashapp" + $suffix).ToLower()
}

Write-Host "Using subscription: $SubscriptionId"
Write-Host "Using resource group: $ResourceGroup"
Write-Host "Using location: $Location"
Write-Host "Using app service name: $AppName"

az account set --subscription $SubscriptionId | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Failed to set subscription" }

az group create --name $ResourceGroup --location $Location --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to create resource group" }

az webapp up --name $AppName --resource-group $ResourceGroup --location $Location --runtime "NODE:22-lts" --sku B1 --track-status false
if ($LASTEXITCODE -ne 0) { throw "Failed to deploy web app" }

az webapp update --name $AppName --resource-group $ResourceGroup --https-only true --set siteConfig.minTlsVersion=1.2 --output none
if ($LASTEXITCODE -ne 0) { throw "Failed to enforce HTTPS/TLS settings" }

$url = "https://$AppName.azurewebsites.net"
Write-Host ""
Write-Host "Deployment complete."
Write-Host "URL: $url"
