@echo off
title Stop Local Server - steveknowsweb

cd /d "%~dp0"

echo.
echo Stopping local development server...
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "stop-server.ps1" -Port 3000

set EXITCODE=%ERRORLEVEL%

if %EXITCODE% NEQ 0 (
    echo.
    echo ----------------------------------------
    echo Could not fully stop the server (code %EXITCODE%).
    echo Look for red error messages above.
    echo ----------------------------------------
    echo.
)

echo.
echo Press any key to close this window...
pause >nul