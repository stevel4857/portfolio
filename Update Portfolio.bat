@echo off
title Update Portfolio
cd /d "D:\my-portfolio"
powershell -NoExit -ExecutionPolicy Bypass -File ".\update-portfolio.ps1"
pause