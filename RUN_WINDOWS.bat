@echo off
setlocal
title BharatSahay x402 - Local

echo.
echo ==========================================
echo   BharatSahay x402 - Local Development
echo ==========================================
echo.

if not exist node_modules (
  echo [ERROR] Dependencies are not installed.
  echo Please run INSTALL_WINDOWS.bat first.
  pause
  exit /b 1
)

if not exist server\.env (
  echo [ERROR] server\.env is missing.
  echo Run INSTALL_WINDOWS.bat first.
  pause
  exit /b 1
)

echo Starting backend on http://localhost:4021 ...
start "BharatSahay Backend" cmd /k "npm run server"

timeout /t 2 /nobreak >nul

echo Starting frontend on http://localhost:5173 ...
start "BharatSahay Frontend" cmd /k "npm run dev -- --host 127.0.0.1"

echo.
echo ==========================================
echo   Open: http://localhost:5173
echo   Backend health: http://localhost:4021/api/health
echo ==========================================
echo.
echo Keep both terminal windows open while using the app.
echo Close those windows to stop BharatSahay.
echo.
pause
