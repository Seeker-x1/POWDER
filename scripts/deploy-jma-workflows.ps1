# JMA workflow を .github/workflows/ に配置して push する
# workflow OAuth スコープが必要です。失敗したら scripts/github-workflows/README.md を参照。

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$dst = Join-Path $root ".github\workflows"

if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst -Force | Out-Null }

Copy-Item (Join-Path $PSScriptRoot "github-workflows\update-jma-snow.yml") (Join-Path $dst "update-jma-snow.yml") -Force
Copy-Item (Join-Path $PSScriptRoot "github-workflows\update-jma-prevday-hourly.yml") (Join-Path $dst "update-jma-prevday-hourly.yml") -Force
Write-Host "Copied workflows to $dst"

Push-Location $root
try {
  git add .github/workflows/update-jma-snow.yml .github/workflows/update-jma-prevday-hourly.yml
  git -c user.name="Seeker-x1" -c user.email="Seeker-x1@users.noreply.github.com" commit -m "Add JMA update workflows" 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Host "Nothing new to commit." }
  git push origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Push failed (workflow scope?). Run:"
    Write-Host "  gh auth refresh -h github.com -s workflow,repo"
    Write-Host "Then re-run: .\scripts\deploy-jma-workflows.ps1"
    exit 1
  }
  Write-Host "Workflows pushed successfully."
} finally {
  Pop-Location
}
