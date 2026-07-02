# ===============================================
#   Steve Luiting - Stop Local Development Server
#   steveknowsweb.com
# ===============================================
# Double-click "Stop Server.bat" or run this .ps1 directly.
# Stops whatever process is listening on the dev server port.

param(
    [int]$Port = 3000,
    [switch]$Quiet
)

function Test-PortListening {
    param([int]$Port)
    $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Get-ListenerProcessIds {
    param([int]$Port)

    @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique |
        Where-Object { $_ -gt 0 })
}

function Stop-DevServerOnPort {
    param(
        [int]$Port,
        [switch]$Quiet
    )

    $processIds = Get-ListenerProcessIds -Port $Port
    if ($processIds.Count -eq 0) {
        if (-not $Quiet) {
            Write-Host "No server is listening on port $Port." -ForegroundColor Gray
        }
        return $true
    }

    foreach ($processId in $processIds) {
        try {
            $process = Get-Process -Id $processId -ErrorAction Stop
            if (-not $Quiet) {
                Write-Host "Stopping $($process.ProcessName) (PID $processId) on port $Port..." -ForegroundColor Yellow
            }
            Stop-Process -Id $processId -Force -ErrorAction Stop
        } catch {
            if (-not $Quiet) {
                Write-Host "Could not stop PID $processId : $($_.Exception.Message)" -ForegroundColor Red
            }
            return $false
        }
    }

    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if (-not (Test-PortListening -Port $Port)) {
            return $true
        }
        Start-Sleep -Milliseconds 150
    }

    return -not (Test-PortListening -Port $Port)
}

if ($MyInvocation.InvocationName -ne '.') {
    Write-Host ""
    Write-Host "Stopping local dev server on port $Port..." -ForegroundColor Cyan
    Write-Host ""

    if (Stop-DevServerOnPort -Port $Port) {
        Write-Host "Port $Port is free." -ForegroundColor Green
        exit 0
    }

    Write-Host "Port $Port is still in use." -ForegroundColor Red
    exit 1
}