@echo off
echo 🏋️‍♂️ TriStar Fitness - Quick EXE Build
echo.

echo 🧹 Cleaning old builds...
rmdir /s /q dist-electron 2>nul
echo ✅ Cleaned

echo 🔨 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b %errorlevel%
)
echo ✅ Frontend built

echo 📦 Building EXE...
call npx electron-builder --publish=never
if %errorlevel% neq 0 (
    echo ❌ EXE build failed!
    pause
    exit /b %errorlevel%
)
echo ✅ EXE built successfully!

echo 🚀 Launching EXE...
start "" "dist-electron\win-unpacked\TriStar Fitness.exe"

echo.
echo ✅ Done! Check if the app loads properly now.
pause
