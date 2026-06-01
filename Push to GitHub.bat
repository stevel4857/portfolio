@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "push-to-github.ps1"
pause