@echo off
title Trust Local HTTPS - steveknowsweb

cd /d "%~dp0"

echo.
echo ========================================
echo   Trust Local HTTPS (one-time setup)
echo ========================================
echo.
echo This adds mkcert's local certificate authority so Chrome
echo trusts https://localhost without security warnings.
echo.
echo Windows will ask for administrator approval. Click Yes.
echo.

where mkcert >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo mkcert is not installed yet.
    echo Installing mkcert...
    winget install --id FiloSottile.mkcert -e --accept-package-agreements --accept-source-agreements
    echo.
)

powershell -ExecutionPolicy Bypass -NoProfile -Command "Start-Process -FilePath 'mkcert' -ArgumentList '-install' -Verb RunAs -Wait"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Trust setup may have failed or was cancelled.
    echo Try running this file again and click Yes on the Windows prompt.
    echo.
    pause
    exit /b 1
)

echo.
echo Done. Chrome should now trust https://localhost
echo You can close this window and run Start Server.bat.
echo.
pause