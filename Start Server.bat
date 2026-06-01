@echo off
title Start Local Server - steveknowsweb

cd /d "%~dp0"

echo.
echo Starting local development server...
echo.

:: Run with Bypass to avoid execution policy blocks common on Windows
powershell -ExecutionPolicy Bypass -NoProfile -File "start-server.ps1"

set EXITCODE=%ERRORLEVEL%

if %EXITCODE% NEQ 0 (
    echo.
    echo ----------------------------------------
    echo The script exited with an error (code %EXITCODE%).
    echo Look for red error messages above.
    echo ----------------------------------------
    echo.
)

echo.
echo Press any key to close this window...
pause >nul