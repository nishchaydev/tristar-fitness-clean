@echo off
echo.
echo ========================================
echo    TriStar Fitness - Installation Wizard
echo ========================================
echo.

echo 🏋️‍♂️ Welcome to TriStar Fitness Gym Management System!
echo.
echo This installer will:
echo   ✅ Install TriStar Fitness on your computer
echo   ✅ Create a desktop shortcut
echo   ✅ Set up the database automatically
echo   ✅ Configure all necessary files
echo.

set /p install="Do you want to continue with the installation? (Y/N): "
if /i "%install%" neq "Y" (
    echo Installation cancelled.
    pause
    exit /b 0
)

echo.
echo 📦 Installing TriStar Fitness...
echo.

REM Check if dist-electron exists
if not exist "dist-electron\TriStar Fitness Setup 1.0.0.exe" (
    echo ❌ Error: Installation file not found!
    echo Please run 'npm run electron:dist' first to build the installer.
    pause
    exit /b 1
)

echo 🚀 Running the installer...
start "" "dist-electron\TriStar Fitness Setup 1.0.0.exe"

echo.
echo ✅ Installation wizard launched!
echo.
echo 📋 After installation:
echo   • TriStar Fitness will be available in your Start Menu
echo   • A desktop shortcut will be created
echo   • The database will be set up automatically
echo   • You can start using the system immediately
echo.
echo 🔑 Default Login Credentials:
echo   • Owner: owner / demo123
echo   • Manager: manager / manager123
echo.
echo 💡 You can change passwords in Settings after login.
echo.
pause
