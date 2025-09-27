@echo off
echo 🏋️‍♂️ TriStar Fitness - Creating Executable...
echo.

echo 📦 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo 📦 Building Electron app...
call npm run electron:dist
if %errorlevel% neq 0 (
    echo ❌ Electron build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Executable created successfully!
echo 📁 Check the 'dist-electron' folder for your EXE file
echo.
pause
