@echo off
setlocal
title BharatSahay - Windows Setup

echo.
echo ==========================================
echo   BharatSahay x402 - Windows Setup
echo ==========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Install Node.js LTS from https://nodejs.org/
  echo Then close and reopen this window and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm was not found.
  echo Reinstall Node.js LTS and make sure npm is added to PATH.
  pause
  exit /b 1
)

echo Node:
node --version
echo npm:
npm --version
echo.

if not exist server\.env (
  echo [INFO] Creating server\.env from server\.env.example
  copy /Y server\.env.example server\.env >nul
)

echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo [ERROR] npm install failed.
  echo Try deleting node_modules and package-lock.json, then run this file again.
  pause
  exit /b 1
)

echo.
echo [2/2] Checking x402 AVM exports...
call npm run check:x402
if errorlevel 1 (
  echo.
  echo [ERROR] x402 check failed.
  pause
  exit /b 1
)

echo.
echo ==========================================
echo   Setup completed successfully!
echo ==========================================
echo.
echo Next: double-click RUN_WINDOWS.bat
echo.
pause
