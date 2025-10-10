@echo off
title TriStar Fitness
color 0A

echo.
echo ================================================
echo    TriStar Fitness - Starting Application
echo ================================================
echo.
echo Login Credentials:
echo 👤 Owner: nikhil@tristar / nikhilverma@tristar
echo 👤 Manager: manager@tristar / manager@tristarfitness
echo.

echo [1/4] Checking if backend is already running...
netstat -an | find "3000" >nul
if %errorlevel% equ 0 (
    echo ✅ Backend server is already running
    goto :start_frontend
)

echo [2/4] Starting backend server...
cd /d "%~dp0backend"
start "TriStar Backend Server" cmd /k "npm start"
cd /d "%~dp0"

echo [3/4] Waiting for backend to initialize...
echo Please wait while the server starts up...
timeout /t 10 /nobreak >nul

:start_frontend
echo [4/4] Starting TriStar Fitness application...
echo ✅ Opening TriStar Fitness in your browser...
echo.

start "" "http://localhost:3000"
echo ✅ TriStar Fitness launched!
echo.
echo 📝 Note: This is a web application that runs in your browser.
echo 🔧 The backend server runs in a separate window.
echo 🚪 To close the app, close this window and the backend window.
echo.
echo Press any key to exit this launcher...
pause >nul
