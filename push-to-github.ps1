# ======================================================
#   Steve Luiting - Simple GitHub Push Script
#   steveknowsweb.com
# ======================================================
# Double-click the "Push to GitHub.bat" file to run this easily.

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Push Changes to GitHub             " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Make sure we're in the right folder
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if this is a git repo
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: This folder is not a Git repository." -ForegroundColor Red
    Write-Host "Please run this from inside the steveknowsweb folder." -ForegroundColor Red
    pause
    exit
}

# Check for changes
$changes = git status --porcelain

if (-not $changes) {
    Write-Host "No changes detected in the folder." -ForegroundColor Yellow
    Write-Host "Nothing to push to GitHub." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

# Show what will be committed
Write-Host "The following changes will be committed:" -ForegroundColor Green
Write-Host ""
git status --short
Write-Host ""

# Ask if they want to see the full diff
$showDiff = Read-Host "Show full diff before committing? (Y/N)"
if ($showDiff -match '^[Yy]') {
    Write-Host ""
    git diff
    Write-Host ""
}

# Get commit message
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$defaultMessage = "Update site - $timestamp"

Write-Host ""
Write-Host "Enter a commit message (or press Enter to use default):" -ForegroundColor Cyan
Write-Host "Default: $defaultMessage" -ForegroundColor Gray
$commitMessage = Read-Host "Commit message"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = $defaultMessage
}

# Final confirmation
Write-Host ""
Write-Host "Ready to commit with message:" -ForegroundColor Yellow
Write-Host "   $commitMessage" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Proceed with commit and push to GitHub? (Y/N)"

if (-not ($confirm -match '^[Yy]')) {
    Write-Host "Push cancelled." -ForegroundColor Yellow
    pause
    exit
}

# Do the actual work
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Cyan
git add .

$commitResult = git commit -m $commitMessage 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create commit." -ForegroundColor Red
    Write-Host $commitResult
    pause
    exit
}

Write-Host "Commit created successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan

$pushResult = git push 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "   Successfully pushed to GitHub!     " -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Cloudflare Pages should start deploying the update shortly." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Push failed." -ForegroundColor Red
    Write-Host $pushResult
}

Write-Host ""
pause
