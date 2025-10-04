@echo off
title TriStar Fitness
color 0A

echo.
echo ================================================
echo    TriStar Fitness - Starting Application
echo ================================================
echo.

echo [1/3] Starting backend server...
start "TriStar Backend" cmd /k "cd backend && npm start"

echo [2/3] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [3/3] Starting TriStar Fitness application...
echo.
echo ✅ Application is starting...
echo.
echo Login Credentials:
echo 👤 Owner: nikhil@tristar / nikhilverma@tristar
echo 👤 Manager: manager@tristar / manager@tristarfitness
echo.

REM Check if EXE exists, if not build it
if not exist "dist-electron\win-unpacked\TriStar Fitness.exe" (
    echo Building application for first time...
    npm run electron:build
)

start "" "dist-electron\win-unpacked\TriStar Fitness.exe"
echo ✅ TriStar Fitness launched!

echo.
echo Application closed. Press any key to exit...
pause >nul
