@echo off
title Seedha Properties - Start All Servers
echo ===================================================
echo   Starting Seedha Properties (Backend + Frontend)
echo ===================================================

echo [1/2] Starting Backend Server on Port 4000...
start "Seedha Backend (Port 4000)" cmd /k "cd /d %~dp0backend && npm run start:dev"

echo [2/2] Starting Frontend Expo Server (Web + Mobile)...
start "Seedha Frontend (Expo)" cmd /k "cd /d %~dp0frontend && npx expo start"

echo.
echo ===================================================
echo   Both servers launched in separate windows!
echo   - Backend: http://localhost:4000/api/docs
echo   - Frontend: Press 'w' for Web, scan QR for Mobile
echo ===================================================
pause
