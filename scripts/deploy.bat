@echo off
echo 🚀 Starting TriStar Fitness Deployment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

REM Run the deployment script
echo 📋 Running deployment script...
node scripts/deploy.js

if errorlevel 1 (
    echo.
    echo ❌ Deployment failed!
    echo Check the error messages above for details.
    pause
    exit /b 1
)

echo.
echo ✅ Deployment completed successfully!
pause
