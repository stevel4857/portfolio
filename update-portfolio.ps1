# ===============================================
#   Steve Luiting Portfolio - Easy Update Script
# ===============================================
# This script helps you review changes and safely
# update your live portfolio website.

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   Update Your Portfolio      " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check for changes
$changes = git status --porcelain

if (-not $changes) {
    Write-Host "No changes detected in your project." -ForegroundColor Yellow
    Write-Host "Nothing new to publish." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Show summary of changes
Write-Host "The following changes were found:" -ForegroundColor Green
git status --short
Write-Host ""

# Ask if they want to review the actual changes
$review = Read-Host "Would you like to see the detailed changes before continuing? (Y/N)"

if ($review -match '^[Yy]') {
    Write-Host ""
    Write-Host "=== Detailed Changes ===" -ForegroundColor Cyan
    git diff
    Write-Host ""
    Write-Host "=== End of Changes ===" -ForegroundColor Cyan
    Write-Host ""
}

# Main confirmation
$proceed = Read-Host "Do you want to commit these changes and update the live website? (Y/N)"

if (-not ($proceed -match '^[Yy]')) {
    Write-Host ""
    Write-Host "Update cancelled. No changes were made." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Ask for commit message
$defaultMessage = "Update portfolio"
Write-Host ""
Write-Host "Enter a short commit message (or press Enter for default)"
Write-Host "Default: $defaultMessage"
$message = Read-Host "Commit message"

if ([string]::IsNullOrWhiteSpace($message)) {
    $message = $defaultMessage
}

Write-Host ""
Write-Host "You are about to commit with this message:" -ForegroundColor Cyan
Write-Host "'$message'" -ForegroundColor White
Write-Host ""

$finalConfirm = Read-Host "Ready to commit and push to GitHub? (Y/N)"

if (-not ($finalConfirm -match '^[Yy]')) {
    Write-Host ""
    Write-Host "Update cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Stage, commit, and push
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Cyan
git add .
git commit -m $message

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "==============================" -ForegroundColor Green
Write-Host "   Update Successful!         " -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

Write-Host "Your changes have been sent to GitHub." -ForegroundColor Green
Write-Host "The live website will update in about 1-2 minutes." -ForegroundColor Green
Write-Host ""
Write-Host "Live site: https://stevel4857.github.io/portfolio" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")