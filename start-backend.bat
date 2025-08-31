@echo off
echo Starting TriStar Fitness Backend Server...
echo.

cd backend
echo Installing dependencies...
npm install

echo.
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

npm run dev
