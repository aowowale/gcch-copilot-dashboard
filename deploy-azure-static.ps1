param(
  [string]$ResourceGroup = "rg-gcch-dashboard",
  [string]$Location = "eastus2",
  [string]$StorageAccount = "",
  [string]$SubscriptionId = ""
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

function Assert-LastExitCode {
  param([string]$Command)
  if ($LASTEXITCODE -ne 0) {
    throw "Azure CLI command failed: $Command"
  }
}

if ([string]::IsNullOrWhiteSpace($SubscriptionId)) {
  $SubscriptionId = (az account show --query id -o tsv)
}

if ([string]::IsNullOrWhiteSpace($StorageAccount)) {
  $suffix = -join ((48..57) + (97..122) | Get-Random -Count 8 | ForEach-Object { [char]$_ })
  $StorageAccount = ("gcchdash" + $suffix).ToLower()
}

Write-Host "Using subscription: $SubscriptionId"
Write-Host "Using resource group: $ResourceGroup"
Write-Host "Using location: $Location"
Write-Host "Using storage account: $StorageAccount"

az account set --subscription $SubscriptionId | Out-Null
Assert-LastExitCode "az account set"

az group create --name $ResourceGroup --location $Location --output none
Assert-LastExitCode "az group create"

az storage account create --name $StorageAccount --resource-group $ResourceGroup --location $Location --sku Standard_LRS --kind StorageV2 --output none
Assert-LastExitCode "az storage account create"

az storage blob service-properties update --account-name $StorageAccount --auth-mode login --static-website --index-document index.html --404-document index.html --output none
Assert-LastExitCode "az storage blob service-properties update"

$friendlyHtml = "dist\GCCH_Copilot_Interactive_Briefing.html"
Copy-Item -Path "dist\index.html" -Destination $friendlyHtml -Force

az storage blob upload-batch --account-name $StorageAccount --auth-mode login --destination '$web' --source dist --overwrite --output none
Assert-LastExitCode "az storage blob upload-batch"

$endpoint = az storage account show --name $StorageAccount --resource-group $ResourceGroup --query "primaryEndpoints.web" -o tsv

Write-Host ""
Write-Host "Deployment complete."
Write-Host "URL: $endpoint"
