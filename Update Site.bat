@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "update-site.ps1"
pause