# ===============================================
#   Steve Luiting - steveknowsweb.com Update Script
# ===============================================
# Safe, review-first update script for the new professional site.

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   Update steveknowsweb       " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Build Tailwind CSS if Node is available (the built css/tailwind.css is committed)
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node detected — building Tailwind CSS..." -ForegroundColor Cyan
    & npm run build
}

# Check for changes
$changes = git status --porcelain

if (-not $changes) {
    Write-Host "No changes detected." -ForegroundColor Yellow
    Write-Host "Nothing new to publish." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

# Show summary
Write-Host "Changes detected:" -ForegroundColor Green
git status --short
Write-Host ""

# Offer detailed diff
$review = Read-Host "Show detailed changes before continuing? (Y/N)"
if ($review -match '^[Yy]') {
    Write-Host ""
    git diff
    Write-Host ""
}

# Confirm commit
$proceed = Read-Host "Commit and push these changes now? (Y/N)"
if (-not ($proceed -match '^[Yy]')) {
    Write-Host "Update cancelled." -ForegroundColor Yellow
    pause
    exit
}

# Get commit message
$defaultMsg = "Update website content"
$msg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = $defaultMsg }

# Commit and push
git add .
git commit -m $msg
git push

Write-Host ""
Write-Host "Changes pushed successfully." -ForegroundColor Green
Write-Host "If connected to Cloudflare Pages, deployment will start automatically." -ForegroundColor Green
Write-Host ""
pause