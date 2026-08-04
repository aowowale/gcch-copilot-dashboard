$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$indexPath = ".\dist\index.html"
if (-not (Test-Path $indexPath)) {
  throw "dist/index.html not found. Run 'npm run build' first."
}

$html = Get-Content $indexPath -Raw
$cssRel = ([regex]::Match($html, 'href="(?<p>\.\/assets\/[^"]+\.css)"')).Groups['p'].Value
$jsRel = ([regex]::Match($html, 'src="(?<p>\.\/assets\/[^"]+\.js)"')).Groups['p'].Value

if ([string]::IsNullOrWhiteSpace($cssRel) -or [string]::IsNullOrWhiteSpace($jsRel)) {
  throw "Could not detect built asset paths in dist/index.html"
}

$cssPath = Join-Path ".\dist" ($cssRel -replace '^\.\/', '')
$jsPath = Join-Path ".\dist" ($jsRel -replace '^\.\/', '')

$css = Get-Content $cssPath -Raw
$js = Get-Content $jsPath -Raw

$cssTag = "<style>`n$css`n</style>"
$jsTag = "<script type='module'>`n$js`n</script>"

$html = [regex]::Replace(
  $html,
  '<link rel="stylesheet" crossorigin href="\.\/assets\/[^"]+\.css">',
  [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $cssTag }
)

$html = [regex]::Replace(
  $html,
  '<script type="module" crossorigin src="\.\/assets\/[^"]+\.js"></script>',
  [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $jsTag }
)

$outFile = ".\GCCH_Copilot_Interactive_Briefing.html"
Set-Content -Path $outFile -Value $html -Encoding UTF8

Write-Host "Created standalone file: $outFile"
Get-Item $outFile | Select-Object Name, Length, LastWriteTime
