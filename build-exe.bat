@echo off
echo 🏋️‍♂️ TriStar Fitness - Building Executable...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo 📦 Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo 📦 Building Electron executable...
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
echo 🎯 The EXE file will be located at:
echo    dist-electron\win-unpacked\TriStar Fitness.exe
echo.
pause
