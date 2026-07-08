# Deploy steveknowsweb to Cloudflare Pages (production).
# Stages git-tracked files only — local gitignored videos can exceed Pages' 25 MiB limit.

param(
    [string]$ProjectName = 'steveknows',
    [string]$Branch = 'main'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$staging = Join-Path $env:TEMP 'steveknows-deploy'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error 'git is required.'
}

Push-Location $repoRoot
try {
    if (Test-Path Env:CLOUDFLARE_API_TOKEN) {
        Write-Warning 'Unset CLOUDFLARE_API_TOKEN if wrangler OAuth login should be used instead.'
    }

    Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Path $staging | Out-Null

    $files = git ls-files
    foreach ($f in $files) {
        $dest = Join-Path $staging $f
        $dir = Split-Path $dest -Parent
        if ($dir -and -not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        Copy-Item -LiteralPath $f -Destination $dest -Force
    }

    $oversized = Get-ChildItem -Recurse -File $staging | Where-Object { $_.Length -gt 25MB }
    if ($oversized) {
        Write-Error ("Files over 25 MiB cannot deploy to Pages: " + ($oversized.FullName -join ', '))
    }

    Write-Host "Deploying $((Get-ChildItem -Recurse -File $staging).Count) files to Cloudflare Pages ($ProjectName)..."
    npx --yes wrangler pages deploy $staging --project-name $ProjectName --branch $Branch --commit-dirty=true
}
finally {
    Pop-Location
}