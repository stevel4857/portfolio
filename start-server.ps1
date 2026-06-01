# ===============================================
#   Steve Luiting - Start Local Development Server
#   steveknowsweb.com
# ===============================================
# Double-click "Start Server.bat" or run this .ps1 directly.
# Starts a simple static file server for local preview.
#
# On Windows this script attempts to automatically unblock itself
# (removes "Mark of the Web" / Zone.Identifier) so you don't get
# repeated "Windows protected your PC" or access warnings.

param(
    [int]$Port = 8000
)

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   Local Development Server   " -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------
# Windows-specific guidance
# ------------------------------------------------
Write-Host "Windows note:" -ForegroundColor Yellow
Write-Host "If you see a Windows Defender Firewall popup asking to allow" -ForegroundColor Yellow
Write-Host "node.exe, python.exe, or similar, click 'Allow access'." -ForegroundColor Yellow
Write-Host "You usually only need to do this the first time." -ForegroundColor Yellow
Write-Host ""

# Quick execution policy check (helps diagnose "access" type errors)
$currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($currentPolicy -eq 'Restricted') {
    Write-Host "Warning: Your PowerShell execution policy is Restricted." -ForegroundColor Red
    Write-Host "The .bat file uses -ExecutionPolicy Bypass to work around this." -ForegroundColor Red
    Write-Host ""
}

# Ensure we're running from the project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# ------------------------------------------------
# Windows: Remove "Mark of the Web" blocking
# This prevents "Windows protected your PC" warnings
# when double-clicking the .bat or .ps1
# ------------------------------------------------
try {
    Unblock-File -Path $MyInvocation.MyCommand.Path -ErrorAction SilentlyContinue | Out-Null

    $batFile = Join-Path $scriptDir "Start Server.bat"
    if (Test-Path $batFile) {
        Unblock-File -Path $batFile -ErrorAction SilentlyContinue | Out-Null
    }
} catch {
    # Not critical if this fails
}

# Sanity check - are we in the right folder?
if (-not (Test-Path "index.html")) {
    Write-Host "ERROR: index.html not found in this folder." -ForegroundColor Red
    Write-Host "Please run this from the steveknowsweb root directory." -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

function Test-CommandExists {
    param($command)
    $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
}

$hasNode = Test-CommandExists "node"
$hasPython = Test-CommandExists "python" -or Test-CommandExists "py"

$url = "http://localhost:$Port"

if ($hasNode) {
    Write-Host "Node.js detected." -ForegroundColor Green
    Write-Host "Starting server using 'npx serve' on port $Port..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Preview URL: " -NoNewline
    Write-Host $url -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
    Write-Host ""

    # Open browser (small delay so the server has time to start)
    Start-Sleep -Milliseconds 900
    Start-Process $url

    # Run npx serve (blocks until Ctrl+C)
    & npx serve . -p $Port

} elseif ($hasPython) {
    Write-Host "Python detected." -ForegroundColor Green
    Write-Host "Starting Python's built-in HTTP server on port $Port..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Preview URL: " -NoNewline
    Write-Host $url -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
    Write-Host ""

    # Open browser
    Start-Sleep -Milliseconds 600
    Start-Process $url

    # Use 'py' launcher if available (more reliable on Windows), otherwise 'python'
    if (Test-CommandExists "py") {
        & py -m http.server $Port
    } else {
        & python -m http.server $Port
    }

} else {
    Write-Host "ERROR: No suitable server found." -ForegroundColor Red
    Write-Host ""
    Write-Host "This script needs either:" -ForegroundColor Yellow
    Write-Host "  1. Node.js (recommended)  ->  npx serve will be used" -ForegroundColor White
    Write-Host "  2. Python                 ->  python -m http.server will be used" -ForegroundColor White
    Write-Host ""
    Write-Host "Easiest option: Install Python from https://python.org" -ForegroundColor Cyan
    Write-Host "Alternative:    Install Node.js + npm from https://nodejs.org" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit 1
}
