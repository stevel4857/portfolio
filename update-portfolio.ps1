# ===============================================
#   Steve Luiting Portfolio - Easy Update Script
# ===============================================
# Run this script from the D:\my-portfolio folder
# It will commit your changes and push them to GitHub,
# which will automatically update your live website.

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   Updating your Portfolio    " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if there are any changes
$changes = git status --porcelain

if (-not $changes) {
    Write-Host "No changes found in the project." -ForegroundColor Yellow
    Write-Host "Nothing to commit or push." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Show what files changed
Write-Host "Changes detected:" -ForegroundColor Green
git status --short
Write-Host ""

# Ask for commit message
$defaultMessage = "Update portfolio"
Write-Host "Enter a commit message (or press Enter to use default)"
Write-Host "Default: $defaultMessage"
Write-Host ""
$message = Read-Host "Commit message"

if ([string]::IsNullOrWhiteSpace($message)) {
    $message = $defaultMessage
}

Write-Host ""
Write-Host "Committing changes with message: '$message'" -ForegroundColor Cyan

# Stage all changes
git add .

# Commit
git commit -m $message

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "==============================" -ForegroundColor Green
Write-Host "   Update Successful!         " -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

Write-Host "Your portfolio is being deployed." -ForegroundColor Green
Write-Host "It usually takes 1-2 minutes to go live." -ForegroundColor Green
Write-Host ""
Write-Host "Live site: https://stevel4857.github.io/portfolio" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")