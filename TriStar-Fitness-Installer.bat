@echo off
title TriStar Fitness - Installation Wizard
color 0A

echo.
echo ================================================
echo    TriStar Fitness - Installation Wizard
echo ================================================
echo.
echo This wizard will install TriStar Fitness on your computer.
echo Please ensure you have an internet connection.
echo.
pause

echo.
echo [1/6] Checking system requirements...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed on this system.
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and run this installer again.
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed on this system.
    echo.
    echo Please install Git from: https://git-scm.com/
    echo Download and install Git, then run this installer again.
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Git is installed
)

echo.
echo [2/6] Downloading TriStar Fitness from GitHub...
echo.

REM Create installation directory
if not exist "C:\TriStarFitness" mkdir "C:\TriStarFitness"
cd /d "C:\TriStarFitness"

REM Clone or update the repository
if exist "tristar-fitness-clean" (
    echo Updating existing installation...
    cd tristar-fitness-clean
    git pull origin main
) else (
    echo Downloading fresh installation...
    git clone https://github.com/nishchaydev/tristar-fitness-clean.git
    cd tristar-fitness-clean
)

if %errorlevel% neq 0 (
    echo ❌ Failed to download from GitHub.
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo ✅ Successfully downloaded TriStar Fitness

echo.
echo [3/6] Installing dependencies...
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies.
    pause
    exit /b 1
)

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies.
    pause
    exit /b 1
)

cd ..

echo ✅ Dependencies installed successfully

echo.
echo [4/6] Building the application...
echo.

REM Build the application
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build the application.
    pause
    exit /b 1
)

echo ✅ Application built successfully

echo.
echo [5/6] Creating desktop shortcuts...
echo.

REM Create desktop shortcut
set "desktop=%USERPROFILE%\Desktop"
set "startMenu=%APPDATA%\Microsoft\Windows\Start Menu\Programs"

REM Create TriStar Fitness folder in Start Menu
if not exist "%startMenu%\TriStar Fitness" mkdir "%startMenu%\TriStar Fitness"

REM Create batch file to start the application
echo @echo off > "%startMenu%\TriStar Fitness\Start TriStar Fitness.bat"
echo cd /d "C:\TriStarFitness\tristar-fitness-clean" >> "%startMenu%\TriStar Fitness\Start TriStar Fitness.bat"
echo start "" "C:\TriStarFitness\tristar-fitness-clean\run-exe.bat" >> "%startMenu%\TriStar Fitness\Start TriStar Fitness.bat"

REM Copy to desktop
copy "%startMenu%\TriStar Fitness\Start TriStar Fitness.bat" "%desktop%\Start TriStar Fitness.bat"

echo ✅ Desktop shortcuts created

echo.
echo [6/6] Finalizing installation...
echo.

REM Create uninstaller
echo @echo off > "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"
echo echo Uninstalling TriStar Fitness... >> "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"
echo rmdir /s /q "C:\TriStarFitness" >> "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"
echo del "%desktop%\Start TriStar Fitness.bat" >> "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"
echo rmdir /s /q "%startMenu%\TriStar Fitness" >> "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"
echo echo TriStar Fitness has been uninstalled. >> "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"
echo pause >> "%startMenu%\TriStar Fitness\Uninstall TriStar Fitness.bat"

echo.
echo ================================================
echo    Installation Complete! 🎉
echo ================================================
echo.
echo TriStar Fitness has been successfully installed!
echo.
echo 📍 Installation Location: C:\TriStarFitness\tristar-fitness-clean
echo 🖥️  Desktop Shortcut: Start TriStar Fitness.bat
echo 📋 Start Menu: TriStar Fitness folder
echo.
echo Login Credentials:
echo 👤 Owner: nikhil@tristar / nikhilverma@tristar
echo 👤 Manager: manager@tristar / manager@tristarfitness
echo.
echo To start the application:
echo 1. Double-click "Start TriStar Fitness" on your desktop, OR
echo 2. Go to Start Menu → TriStar Fitness → Start TriStar Fitness
echo.
echo To uninstall: Start Menu → TriStar Fitness → Uninstall TriStar Fitness
echo.
echo Press any key to start TriStar Fitness now...
pause >nul

echo.
echo Starting TriStar Fitness...
start "" "C:\TriStarFitness\tristar-fitness-clean\run-exe.bat"

echo.
echo Installation wizard completed!
echo You can close this window now.
pause
