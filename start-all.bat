@echo off
title Seedha Properties - Start All Servers
echo ===================================================
echo   Starting Seedha Properties Platform
echo ===================================================

echo [1/3] Starting Backend Server on Port 4000...
start "Seedha Backend (Port 4000)" cmd /k "cd /d %~dp0backend && npm run start:dev"

echo [2/3] Starting Admin Dashboard on Port 5173...
start "Seedha Admin Dashboard (Port 5173)" cmd /k "cd /d %~dp0admin-dashboard && npm run dev"

echo [3/3] Starting User App Expo Server...
start "Seedha User App (Expo)" cmd /k "cd /d %~dp0frontend && npx expo start"

echo.
echo ===================================================
echo   All 3 servers launched in separate windows!
echo   - Backend API:     http://localhost:4000/api/docs
echo   - Admin Dashboard: http://localhost:5173
echo   - User App (Expo): Press 'w' for Web, scan QR for Mobile
echo ===================================================
pause
