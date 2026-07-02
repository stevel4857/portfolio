# ===============================================
#   Steve Luiting - Start Local Development Server
#   steveknowsweb.com
# ===============================================
# Double-click "Start Server.bat" or run this .ps1 directly.
# Starts a simple static file server over HTTPS for local preview.
#
# On Windows this script attempts to automatically unblock itself
# (removes "Mark of the Web" / Zone.Identifier) so you don't get
# repeated "Windows protected your PC" or access warnings.

param(
    [int]$Port = 3000
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
Write-Host "node.exe, click 'Allow access'." -ForegroundColor Yellow
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

. (Join-Path $scriptDir "stop-server.ps1")

function Ensure-Mkcert {
    if (Test-CommandExists "mkcert") {
        return $true
    }

    if (-not (Test-CommandExists "winget")) {
        return $false
    }

    Write-Host "Installing mkcert (one-time) for trusted local HTTPS..." -ForegroundColor Cyan
    & winget install --id FiloSottile.mkcert -e --accept-package-agreements --accept-source-agreements | Out-Null
    return (Test-CommandExists "mkcert")
}

function Test-MkcertCaInstalled {
    if (-not (Test-CommandExists "mkcert")) {
        return $false
    }

    $caroot = & mkcert -CAROOT 2>$null
    if (-not $caroot) {
        return $false
    }

    $rootCaPath = Join-Path $caroot "rootCA.pem"
    if (-not (Test-Path $rootCaPath)) {
        return $false
    }

    $rootCert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($rootCaPath)
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
    $store.Open("ReadOnly")
    $installed = @($store.Certificates.Find(
        [System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,
        $rootCert.Thumbprint,
        $false
    )).Count -gt 0
    $store.Close()

    return $installed
}

function Ensure-LocalHttpsCerts {
    $certDir = Join-Path $scriptDir ".local-certs"
    $keyPath = Join-Path $certDir "localhost-key.pem"
    $certPath = Join-Path $certDir "localhost-cert.pem"

    if (-not (Ensure-Mkcert)) {
        return $false
    }

    New-Item -ItemType Directory -Force -Path $certDir | Out-Null

    if (-not ((Test-Path $keyPath) -and (Test-Path $certPath))) {
        Write-Host "Creating localhost HTTPS certificates..." -ForegroundColor Cyan
        & mkcert -key-file $keyPath -cert-file $certPath localhost 127.0.0.1 ::1
        if ($LASTEXITCODE -ne 0) {
            return $false
        }
    }

    return (Test-Path $keyPath) -and (Test-Path $certPath)
}

$hasNode = Test-CommandExists "node"
$hasPython = Test-CommandExists "python" -or Test-CommandExists "py"

$url = "https://localhost:$Port"

if ($hasNode) {
    Write-Host "Node.js detected." -ForegroundColor Green
    Write-Host "Building Tailwind CSS (required for production styles)..." -ForegroundColor Cyan
    & npm run build
}

if ($hasNode) {
    if (Test-PortListening -Port $Port) {
        Write-Host "Port $Port is in use. Stopping the previous dev server..." -ForegroundColor Yellow
        if (-not (Stop-DevServerOnPort -Port $Port)) {
            Write-Host ""
            Write-Host "ERROR: Could not free port $Port." -ForegroundColor Red
            Write-Host "Try running 'Stop Server.bat', or use a different port:" -ForegroundColor Yellow
            Write-Host "  .\start-server.ps1 -Port 3001" -ForegroundColor Cyan
            Write-Host ""
            pause
            exit 1
        }
        Write-Host "Port $Port is free." -ForegroundColor Green
        Write-Host ""
    }

    if (-not (Ensure-LocalHttpsCerts)) {
        Write-Host ""
        Write-Host "ERROR: Could not create local HTTPS certificates." -ForegroundColor Red
        Write-Host "Install mkcert manually: winget install FiloSottile.mkcert" -ForegroundColor Cyan
        Write-Host ""
        pause
        exit 1
    }

    if (-not (Test-MkcertCaInstalled)) {
        Write-Host ""
        Write-Host "Chrome trust setup is not complete yet." -ForegroundColor Yellow
        Write-Host "Double-click 'Trust Local HTTPS.bat' once, click Yes on the Windows prompt," -ForegroundColor Yellow
        Write-Host "then restart this server. The site will still load after you click Advanced." -ForegroundColor Yellow
        Write-Host ""
    }

    Write-Host "Starting HTTPS server on port $Port..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Preview URL: " -NoNewline
    Write-Host $url -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
    Write-Host ""

    # Open browser only after the HTTPS server is listening
    & node scripts/https-server.mjs --port $Port --open

} else {
    Write-Host "ERROR: Node.js is required for the local HTTPS server." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Node.js from https://nodejs.org, then run this script again." -ForegroundColor Cyan
    if ($hasPython) {
        Write-Host ""
        Write-Host "Python was detected, but this script no longer falls back to HTTP." -ForegroundColor Yellow
        Write-Host "HTTPS is needed for secure browser APIs (camera, WebXR, etc.)." -ForegroundColor Yellow
    }
    Write-Host ""
    pause
    exit 1
}
