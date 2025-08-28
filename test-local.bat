@echo off
echo ========================================
echo BlueLion Claims Portal - Local Testing
echo ========================================
echo.
echo This script will build and serve your application locally
echo to avoid CORS issues when testing built files.
echo.
echo Press any key to continue...
pause >nul

echo.
echo Building application...
npm run build

if %errorlevel% neq 0 (
    echo.
    echo Build failed! Please check for errors.
    pause
    exit /b 1
)

echo.
echo Build successful! Starting local server...
echo.
echo Your application will be available at:
echo - Local:  http://localhost:4173
echo - Network: http://192.168.15.244:4173
echo.
echo Press Ctrl+C to stop the server
echo.
npm run serve 