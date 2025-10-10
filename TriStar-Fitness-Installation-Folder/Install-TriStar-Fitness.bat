@echo off 
title TriStar Fitness - Installation 
color 0A 
echo. 
echo ================================================ 
echo    TriStar Fitness - Installation 
echo ================================================ 
echo. 
echo This will install TriStar Fitness on your computer. 
echo. 
echo Press ENTER to continue... 
set /p dummy= 
 
echo [1/3] Installing to C:\TriStarFitness... 
if not exist "C:\TriStarFitness" mkdir "C:\TriStarFitness" 
xcopy "D:\Downloads\Fitness Product Design PRD\tristar-fitness-clean\*" "C:\TriStarFitness\" /E /I /Y 
echo ✅ Files copied to C:\TriStarFitness 
 
echo [2/3] Creating desktop shortcut... 
set "desktop=%USERPROFILE%\Desktop" 
copy "C:\TriStarFitness\Start-TriStar-Fitness.bat" "%desktop%\Start TriStar Fitness.bat" 
echo ✅ Desktop shortcut created 
 
echo [3/3] Creating Start Menu shortcut... 
set "startMenu=%APPDATA%\Microsoft\Windows\Start Menu\Programs" 
if not exist "%startMenu%\TriStar Fitness" mkdir "%startMenu%\TriStar Fitness" 
copy "C:\TriStarFitness\Start-TriStar-Fitness.bat" "%startMenu%\TriStar Fitness\Start TriStar Fitness.bat" 
echo ✅ Start Menu shortcut created 
 
echo ================================================ 
echo    Installation Complete! 🎉 
echo ================================================ 
echo. 
echo TriStar Fitness has been successfully installed! 
echo. 
echo Login Credentials: 
echo 👤 Owner: nikhil@tristar / nikhilverma@tristar 
echo 👤 Manager: manager@tristar / manager@tristarfitness 
echo. 
echo To start: Double-click "Start TriStar Fitness" on desktop 
echo. 
echo Press ENTER to start TriStar Fitness now... 
set /p dummy= 
 
echo Starting TriStar Fitness... 
start "" "C:\TriStarFitness\Start-TriStar-Fitness.bat" 
 
echo Installation completed! 
echo Press ENTER to close... 
set /p dummy= 
