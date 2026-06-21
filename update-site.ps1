# ===============================================
# Steve Luiting - steveknowsweb.com Update Script
# ===============================================
# Robust merge-friendly version - June 2026

param([switch]$Auto)

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host " Update steveknowsweb.com " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path .git)) {
    Write-Host "❌ Not a Git repository. Run from project root." -ForegroundColor Red
    pause; exit 1
}

# Pull with merge (more forgiving)
Write-Host "Pulling latest changes from main..." -ForegroundColor Cyan
git pull origin main

# Auto-resolve the common conflict file (keep local version)
if (Test-Path demos/cable-center-vr.html) {
    if ((git ls-files --unmerged | Select-String cable-center-vr.html)) {
        Write-Host "Resolving conflict in demos/cable-center-vr.html (keeping local)..." -ForegroundColor Yellow
        git checkout --theirs demos/cable-center-vr.html
        git add demos/cable-center-vr.html
    }
}

# Tailwind build
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Building Tailwind CSS..." -ForegroundColor Cyan
    try {
        & npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    } catch {
        Write-Host "⚠️ Tailwind build issue - continuing anyway" -ForegroundColor Yellow
    }
}

# Check for changes
if (-not (git status --porcelain)) {
    Write-Host "No changes detected." -ForegroundColor Yellow
    pause; exit 0
}

Write-Host "Changes ready:" -ForegroundColor Green
git status --short

if (-not $Auto) {
    $proceed = Read-Host "Commit and push these changes? (Y/N)"
    if (-not ($proceed -match '^[Yy]')) {
        Write-Host "Cancelled." -ForegroundColor Yellow
        pause; exit 0
    }
}

$msg = Read-Host "Commit message (Enter for default)"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "Update website content - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Keep only MP4 files referenced from HTML pages
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Checking linked MP4 files..." -ForegroundColor Cyan
    $mp4Report = & node scripts/linked-mp4-files.mjs --json | ConvertFrom-Json
    foreach ($file in $mp4Report.unlinked) {
        $tracked = git ls-files -- "$file" 2>$null
        if ($tracked) {
            Write-Host "Removing unlinked MP4 from git: $file" -ForegroundColor Yellow
            git rm --cached -- "$file" 2>$null | Out-Null
        }
    }
}

try {
    git add .
    git commit -m $msg
    
    Write-Host "Pushing to GitHub (this may take time with video files)..." -ForegroundColor Cyan
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Successfully pushed to main!" -ForegroundColor Green
        Write-Host "Cloudflare Pages deployment should start automatically." -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Try running the script again or use: git push --force-with-lease origin main" -ForegroundColor Yellow
}

Write-Host ""
pause
